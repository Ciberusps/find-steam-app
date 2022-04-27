// @ts-ignore
// import { fs as memfs, vol } from "memfs";
import mock from "mock-fs";
import path from "path";
// import fs from "fs";

import { findSteamLibrariesPaths } from "../src/index";
import { findSteam } from "../src/steam";
import { getLibraryFolder } from "../src/utils";

const steamFolder = "c/Program Files (x86)/Steam";

jest.mock("../src/steam", () => {
  const originalModule = jest.requireActual("../src/steam");
  return {
    ...originalModule,
    findSteam: () => steamFolder,
  };
});

describe("all tests", () => {
  beforeAll(async () => {
    mock({
      // C: {
      //   "Program Files (x86)/Steam": {
      //     steamapps: {
      //       "libraryfolders.vdf": mock.load(
      //         path.resolve(__dirname, "data/special-file.txt"),
      //         { recursive: true, lazy: false }
      //       ),
      //     },
      //   },
      // },
      c: mock.load(path.resolve(__dirname, "../data/c"), {
        recursive: true,
        lazy: false,
      }),
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

  test("findSteamLibrariesPaths v1", async () => {
    console.log({ platform: process.platform });
    const steamPaths = await findSteamLibrariesPaths();
    console.log({ steamPaths });

    expect(steamPaths).toBeTruthy();
    expect(steamPaths).toEqual([
      getLibraryFolder("c/Program Files (x86)/Steam"),
      getLibraryFolder("d/SteamLibrary"),
      getLibraryFolder("e/SteamLibrary"),
      getLibraryFolder("f/SteamLibrary"),
    ]);
  });

  test("another thing", async () => {
    // console.log({
    //   test: fs.readFileSync(
    //     "c/Program Files (x86)/Steam/steamapps/libraryfolders.vdf",
    //     "utf8"
    //   ),
    // });
  });
});
