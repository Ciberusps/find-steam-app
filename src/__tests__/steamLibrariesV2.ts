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

import { mockLoad, steamPath } from "./utils";

jest.mock("../steam", () => {
  const originalModule = jest.requireActual("../steam");
  return {
    ...originalModule,
    findSteamPath: jest.fn().mockImplementation(() => steamPath),
  };
});

describe("SteamLibraries v2", () => {
  beforeAll(async () => {
    mock({
      c: mockLoad("../../__data__/c"),
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
    expect(result).toBe(steamPath);
  });

  test("findSteamLibrariesPaths", async () => {
    const result = await findSteamLibrariesPaths();

    expect(result).toBeTruthy();
    expect(result).toEqual([
      joinAndNormalize(steamPath),
      joinAndNormalize("d/SteamLibrary"),
      joinAndNormalize("e/SteamLibrary"),
      joinAndNormalize("f/SteamLibrary"),
    ]);
  });

  test("findSteamLibraries", async () => {
    const result = await findSteamLibraries();

    expect(result).toBeTruthy();
    expect(result).toMatchObject({
      version: "v2",
      libraries: [
        {
          path: joinAndNormalize("c/Program Files (x86)/Steam"),
          apps: {
            "228980": 204600378,
          },
        },
        {
          path: joinAndNormalize("d/SteamLibrary"),
        },
        {
          path: joinAndNormalize("e/SteamLibrary"),
        },
        {
          path: joinAndNormalize("f/SteamLibrary"),
          apps: {
            "570": 38478425675,
          },
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
    const result = await findSteam({ forceV1: false });
    expect(result).toBeTruthy();
    expect(result.version).toBe("v2");
    expect(result.steamPath).toBe(steamPath);
    expect(result.libraries).toHaveLength(4);
    expect(result.librariesVdfFilePath).toBe(
      joinAndNormalize(steamPath, "steamapps", "libraryfolders.vdf")
    );

    expect(result.libraries?.[0].apps).toHaveLength(1);
    expect(result.libraries?.[0].path).toBe(joinAndNormalize(steamPath));
    expect(result.libraries?.[0].apps?.[0]?.appId).toBe(228980);
    expect(result.libraries?.[0].apps?.[0]?.manifestPath).toBeDefined();
    expect(result.libraries?.[0].apps?.[0]?.manifest.Universe).toBeDefined();
    expect(result.libraries?.[0].apps?.[0]?.manifest.StateFlags).toBeDefined();
    expect(result.libraries?.[0].totalsize).toBeDefined();
    expect(result.libraries?.[0].update_clean_bytes_tally).toBeDefined();

    expect(result.libraries?.[1].apps).toHaveLength(2);

    expect(result.libraries?.[2].apps).toHaveLength(9);

    expect(result.libraries?.[3].apps).toHaveLength(1);
    expect(result.libraries?.[3].apps?.[0]?.appId).toBe(570);
  });

  test("findSteam if forceV1 true should return relevant results", async () => {
    const result = await findSteam({ forceV1: true });
    expect(result).toBeTruthy();
    expect(result.version).toBe("v1");
    expect(result.steamPath).toBe(steamPath);
    expect(result.libraries).toHaveLength(4);
    expect(result.librariesVdfFilePath).toBe(
      joinAndNormalize(steamPath, "steamapps", "libraryfolders.vdf")
    );

    expect(result.libraries?.[0].apps).toHaveLength(1);
    expect(result.libraries?.[0].path).toBe(steamPath);
    expect(result.libraries?.[0].apps?.[0]?.appId).toBe(228980);
    expect(result.libraries?.[0].apps?.[0]?.manifestPath).toBeDefined();
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
