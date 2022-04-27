import mock from "mock-fs";
import path from "path";
// import fs from "fs";

import { findSteamAppById, findSteamLibraries, findSteamLibrariesPaths } from "../index";
import { findSteam } from "../steam";
import { joinAndNormalize } from "../utils";

import { mockLoad, steamFolder } from "./utils";

jest.mock("../steam", () => {
  const originalModule = jest.requireActual("../steam");
  return {
    ...originalModule,
    findSteam: jest.fn().mockImplementation(() => steamFolder),
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

  test("findSteam", async () => {
    const steamPath = await findSteam();

    expect(steamPath).toBeTruthy();
    expect(steamPath).toBe(steamFolder);
  });

  test("findSteamLibrariesPaths", async () => {
    const steamPaths = await findSteamLibrariesPaths();

    expect(steamPaths).toBeTruthy();
    expect(steamPaths).toEqual([
      joinAndNormalize(steamFolder),
      joinAndNormalize("d/SteamLibrary"),
      joinAndNormalize("e/SteamLibrary"),
      joinAndNormalize("f/SteamLibrary"),
    ]);
  });

  test("findSteamLibraries", async () => {
    const steamPaths = await findSteamLibraries();

    expect(steamPaths).toBeTruthy();
    expect(steamPaths).toMatchObject({
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
    const steamAppById = await findSteamAppById(570);
    expect(steamAppById).toBeTruthy();
    expect(steamAppById).toBe(
      path.normalize("f/SteamLibrary/steamapps/common/dota 2 beta")
    );
  });
});
