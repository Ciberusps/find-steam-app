import mock from "mock-fs";
import path from "path";
// import fs from "fs";

import { findSteamLibraries, findSteamLibrariesPaths } from "../index";
import { findSteam } from "../steam";
import { getLibraryFolder } from "../utils";

import { mockDrives, steamFolder } from "./utils";

jest.mock("../steam", () => {
  const originalModule = jest.requireActual("../steam");
  return {
    ...originalModule,
    findSteam: jest.fn().mockImplementation(() => steamFolder),
  };
});

describe("SteamLibraries v1", () => {
  beforeAll(async () => {
    mockDrives();

    mock({
      "c/Program Files (x86)/Steam/steamapps/libraryfolders.vdf": mock.load(
        path.resolve(__dirname, "../../__data__/v1/libraryfolders.vdf")
      ),
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

  test("findSteamLibraries", async () => {
    const steamPaths = await findSteamLibraries();

    expect(steamPaths).toBeTruthy();
    expect(steamPaths).toEqual({
      version: "v1",
      oldLibraries: [
        getLibraryFolder("c/Program Files (x86)/Steam"),
        getLibraryFolder("d/SteamLibrary"),
        getLibraryFolder("e/SteamLibrary"),
        getLibraryFolder("f/SteamLibrary"),
      ],
    });
  });

  test("findSteamLibrariesPaths", async () => {
    const steamPaths = await findSteamLibrariesPaths();

    expect(steamPaths).toBeTruthy();
    expect(steamPaths).toEqual([
      getLibraryFolder(steamFolder),
      getLibraryFolder("d/SteamLibrary"),
      getLibraryFolder("e/SteamLibrary"),
      getLibraryFolder("f/SteamLibrary"),
    ]);
  });
});
