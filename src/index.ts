import fs from "fs-extra";
import pFilter from "p-filter";
// import globby from "globby";
import util from "util";
// @ts-ignore
import getFolderSize from "get-folder-size";

import {
  loadSteamLibraries,
  loadSteamLibrariesPaths,
  SteamLibraryFolder,
} from "./libraries";
import {
  AppManifest,
  findLibrariesManifests,
  // findLibraryManifests,
  hasManifest,
  readManifest,
} from "./manifest";
import { findSteam } from "./steam";
import { getAppInstallFolder } from "./utils";

export { AppManifest, findSteam, SteamLibraryFolder as LibraryFolderNew };

const getFolderSizeAsync = util.promisify(getFolderSize);

export class SteamNotFoundError extends Error {
  public constructor() {
    super("Steam installation directory not found");
    this.name = "SteamNotFoundError";
  }
}

/**
 * Searches for all local Steam libraries.
 *
 * @returns Array of paths to library folders.
 */
export async function findSteamLibrariesPaths() {
  const steam = await findSteam();
  if (steam == null) throw new SteamNotFoundError();

  return loadSteamLibrariesPaths(steam);
}

/**
 * Searches for all local Steam libraries.
 *
 * @returns Array of paths to library folders.
 */
export async function findSteamLibraries() {
  const steam = await findSteam();
  if (steam == null) throw new SteamNotFoundError();

  return loadSteamLibraries(steam);
}

/**
 * Searches for app in local Steam libraries.
 *
 * @returns Information about installed application.
 */
export async function findSteamAppManifest(appId: number) {
  const libs = await findSteamLibrariesPaths();
  const [library] = await pFilter(libs, (lib) => hasManifest(lib, appId));
  if (library == null) return;

  return readManifest(library, appId);
}

/**
 * Searches for app in local Steam libraries.
 *
 * @returns Path to installed app.
 */
// TODO: dont work, example dota2 installed on D moved on F,
// but also was in E, result path is E should be F
export async function findSteamAppByName(name: string) {
  const libsPaths = await findSteamLibrariesPaths();
  const appsPaths = libsPaths.map((lib) => getAppInstallFolder(lib, name));
  if (!appsPaths) return;

  const appsWithSize = await Promise.all(
    appsPaths.map(async (appPath) => {
      const appInstallFolder = appPath;
      const isExists = await fs.pathExists(appInstallFolder);
      const size = isExists ? await getFolderSizeAsync(appInstallFolder) : 0;
      return { appInstallFolder: appPath, size };
    })
  );

  const resultLib = appsWithSize.sort((a, b) => b.size - a.size)[0];
  return resultLib.appInstallFolder;
}

/**
 * Searches for app in local Steam libraries.
 *
 * @returns Path to installed app.
 */
export async function findSteamAppById(appId: number) {
  const libsPaths = await findSteamLibrariesPaths();
  const libs = await pFilter(libsPaths, (lib) => hasManifest(lib, appId));
  if (!libs) return;

  const appsWithSize = await Promise.all(
    libs.map(async (lib) => {
      const manifest = await readManifest(lib, appId);
      const appInstallFolder = getAppInstallFolder(lib, manifest.installdir);
      const isExist = await fs.pathExists(appInstallFolder);
      const size = isExist ? await getFolderSizeAsync(appInstallFolder) : 0;
      return { lib, appInstallFolder, size };
    })
  );

  const resultLib = appsWithSize.sort((a, b) => b.size - a.size)[0];
  return resultLib.appInstallFolder;
}

/**
 * Searches for app in local Steam libraries.
 *
 * @returns Path to installed app.
 */
export async function findSteamApps() {
  console.log("_______findSteamApps_______");

  const libs = await findSteamLibrariesPaths();
  console.log(libs);

  // let appsManifests: AppManifest[] = [];
  // const libPromises = libs.map((lib) => {
  //   return globby("*.acf", {
  //     cwd: lib,
  //     // absolute: true,
  //     globstar: false,
  //   });
  //   // appsManifests
  // });

  // const res = await Promise.all(libPromises);
  console.log(await findLibrariesManifests(libs));

  // const [library] = await pFilter(libs, (lib) => hasManifest(lib, appId));
  // if (library == null) return;

  // const manifest = await readManifest(library, appId);
  // return path.join(library, "common", manifest.installdir);
}
