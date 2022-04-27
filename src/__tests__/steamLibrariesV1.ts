import mock from "mock-fs";

import {
  findSteam,
  findSteamAppById,
  findSteamAppByName,
  findSteamLibraries,
  findSteamLibrariesPaths,
} from "../index";
import { findSteamPath } from "../steam";
import { joinAndNormalize } from "../utils";

import { mockLoad, steamFolder } from "./utils";

jest.mock("../steam", () => {
  const originalModule = jest.requireActual("../steam");
  return {
    ...originalModule,
    findSteamPath: jest.fn().mockImplementation(() => steamFolder),
  };
});

describe("SteamLibraries v1", () => {
  beforeAll(async () => {
    mock({
      c: {
        "Program Files (x86)": {
          Steam: {
            steamapps: {
              common: mockLoad(
                "../../__data__/c/Program Files (x86)/Steam/steamapps/common"
              ),
              "appmanifest_228980.acf": mockLoad(
                "../../__data__/c/Program Files (x86)/Steam/steamapps/appmanifest_228980.acf"
              ),
              "libraryfolders.vdf": mockLoad("../../__data__/v1/libraryfolders.vdf"),
            },
          },
        },
      },
      d: mockLoad("../../__data__/d"),
      e: mockLoad("../../__data__/e"),
      f: mockLoad("../../__data__/f"),
    });
  });

  afterAll(() => {
    mock.restore();
  });

  test("findSteamPath", async () => {
    const result = await findSteamPath();

    expect(result).toBeTruthy();
    expect(result).toBe(steamFolder);
  });

  test("findSteamLibrariesPaths", async () => {
    const result = await findSteamLibrariesPaths();

    expect(result).toBeTruthy();
    expect(result).toEqual([
      joinAndNormalize(steamFolder),
      joinAndNormalize("d/SteamLibrary"),
      joinAndNormalize("e/SteamLibrary"),
      joinAndNormalize("f/SteamLibrary"),
    ]);
  });

  test("findSteamLibraries", async () => {
    const result = await findSteamLibraries();

    expect(result).toBeTruthy();
    expect(result).toEqual({
      version: "v1",
      libraries: [
        {
          path: joinAndNormalize("c/Program Files (x86)/Steam"),
        },
        {
          path: joinAndNormalize("d/SteamLibrary"),
        },
        {
          path: joinAndNormalize("e/SteamLibrary"),
        },
        {
          path: joinAndNormalize("f/SteamLibrary"),
        },
      ],
    });
  });

  test("findSteamAppById", async () => {
    // edge case search, described in README.md
    const result = await findSteamAppById(570);
    expect(result).toBeTruthy();
    expect(result).toBe(joinAndNormalize("f/SteamLibrary/steamapps/common/dota 2 beta"));
  });

  test("findSteamAppByName", async () => {
    // edge case search, described in README.md
    const result = await findSteamAppByName("dota 2 beta");
    expect(result).toBeTruthy();
    expect(result).toBe(joinAndNormalize("f/SteamLibrary/steamapps/common/dota 2 beta"));
  });

  test("findSteam", async () => {
    const result = await findSteam();
    expect(result).toBeTruthy();
    expect(result.version).toBe("v1");

    expect(result.libraries).toHaveLength(4);

    expect(result.libraries?.[0].apps).toHaveLength(1);
    expect(result.libraries?.[0].path).toBe(joinAndNormalize(steamFolder));
    expect(result.libraries?.[0].apps?.[0]?.appId).toBe(228980);
    expect(result.libraries?.[0].apps?.[0]?.manifest.Universe).toBeDefined();
    expect(result.libraries?.[0].apps?.[0]?.manifest.StateFlags).toBeDefined();
    expect(result.libraries?.[0].totalsize).toBeUndefined();
    expect(result.libraries?.[0].update_clean_bytes_tally).toBeUndefined();

    expect(result.libraries?.[1].apps).toHaveLength(2);

    expect(result.libraries?.[2].apps).toHaveLength(9);

    expect(result.libraries?.[3].apps).toHaveLength(1);
    expect(result.libraries?.[3].apps?.[0]?.appId).toBe(570);
  });
});
