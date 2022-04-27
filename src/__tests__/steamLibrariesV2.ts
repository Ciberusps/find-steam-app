import mock from "mock-fs";
import path from "path";
// import fs from "fs";

import {
  findSteamAppById,
  findSteamAppByName,
  findSteam,
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
    expect(result).toMatchObject({
      version: "v2",
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
    expect(result).toBe(path.normalize("f/SteamLibrary/steamapps/common/dota 2 beta"));
  });

  test("findSteamAppName", async () => {
    // edge case search, described in README.md
    const result = await findSteamAppByName("dota 2 beta");
    expect(result).toBeTruthy();
    expect(result).toBe(path.normalize("f/SteamLibrary/steamapps/common/dota 2 beta"));
  });

  test("findSteam", async () => {
    const steamAppById = await findSteam();
    expect(steamAppById).toBeTruthy();
    // TODO:
    // expect(steamAppById).toBe(
    //   path.normalize("f/SteamLibrary/steamapps/common/dota 2 beta")
    // );
  });
});
