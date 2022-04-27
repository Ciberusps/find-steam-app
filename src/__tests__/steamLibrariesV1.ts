/**
 * __data__ contain the files that will be used to mock the filesystem.
 * __data__  mimic the filesystem of the computer.
 * so if u know any edge cases, u can try to add those files and see if it works.
 */
import mock from "mock-fs";
import path from "path";
import fs from "fs";

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
    expect(steamPaths).toEqual({
      version: "v1",
      oldLibraries: [
        joinAndNormalize("c/Program Files (x86)/Steam"),
        joinAndNormalize("d/SteamLibrary"),
        joinAndNormalize("e/SteamLibrary"),
        joinAndNormalize("f/SteamLibrary"),
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
