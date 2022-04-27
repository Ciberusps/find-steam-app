import mock from "mock-fs";
// import path from "path";
// import fs from "fs";

import { findSteamAppById, findSteamLibraries, findSteamLibrariesPaths } from "../index";
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

describe("SteamLibraries v2", () => {
  beforeAll(async () => {
    mockDrives();
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
      getLibraryFolder(steamFolder),
      getLibraryFolder("d/SteamLibrary"),
      getLibraryFolder("e/SteamLibrary"),
      getLibraryFolder("f/SteamLibrary"),
    ]);
  });

  test("findSteamLibraries", async () => {
    const steamPaths = await findSteamLibraries();

    expect(steamPaths).toBeTruthy();
    expect(steamPaths).toMatchObject({
      version: "v2",
      libraries: [
        {
          path: getLibraryFolder("c/Program Files (x86)/Steam"),
        },
        {
          path: getLibraryFolder("d/SteamLibrary"),
        },
        {
          path: getLibraryFolder("e/SteamLibrary"),
        },
        {
          path: getLibraryFolder("f/SteamLibrary"),
        },
      ],
    });
  });

  test("findSteamAppById", async () => {
    const steamAppById = await findSteamAppById(570);
    console.log({ steamAppById });
  });
});
