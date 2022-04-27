import fs from "fs-extra";
import pFilter from "p-filter";
// import globby from "globby";
import util from "util";
// @ts-ignore
import getFolderSize from "get-folder-size";
const getFolderSizeAsync = util.promisify(getFolderSize);

import {
  loadSteamLibraries,
  loadSteamLibrariesPaths,
  SteamLibraries,
  SteamLibraryFolder,
} from "./libraries";
import { AppManifest, hasManifest, readManifest } from "./manifest";
import { findSteamPath } from "./steam";
import { findAppLibraryInV2Libraries, getAppInstallFolder } from "./utils";

class SteamNotFoundError extends Error {
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
  const steam = await findSteamPath();
  if (steam == null) throw new SteamNotFoundError();

  return loadSteamLibrariesPaths(steam);
}

/**
 * Searches for all local Steam libraries.
 *
 * @returns Array of paths to library folders.
 */
export async function findSteamLibraries(): Promise<SteamLibraries> {
  const steam = await findSteamPath();
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
  if (!appsPaths.length) throw new Error("App not found");

  const appsWithSize = await Promise.all(
    appsPaths.map(async (appPath) => {
      const appInstallFolder = appPath;
      const isExists = await fs.pathExists(appInstallFolder);
      const size = isExists ? await getFolderSizeAsync(appInstallFolder) : 0;
      return { appInstallFolder: appPath, size };
    })
  );

  // TODO: v2 using findSteamApps

  const resultLib = appsWithSize.sort((a, b) => b.size - a.size)[0];
  return resultLib.appInstallFolder;
}

/**
 * Searches for app in local Steam libraries.
 *
 * @returns Path to installed app.
 */
export async function findSteamAppById(appId: number): Promise<string> {
  const steamLibs = await findSteamLibraries();
  if (!steamLibs) throw new Error("Steam libraries not found");

  if (steamLibs.version === "v2" && steamLibs.libraries) {
    const appLibrary = findAppLibraryInV2Libraries(appId, steamLibs.libraries);
    if (!appLibrary) throw new Error("App not found");
    const manifest = await readManifest(appLibrary.path, appId);
    if (!manifest) throw new Error("App manifest not found");
    return getAppInstallFolder(appLibrary.path, manifest.installdir);
  }

  if (steamLibs.version === "v1" && steamLibs.oldLibraries) {
    const appLibs = await pFilter(steamLibs.oldLibraries, async (lib) =>
      hasManifest(lib, appId)
    );
    if (!appLibs.length) throw new Error("App not found");

    const appsWithSize = await Promise.all(
      appLibs.map(async (lib) => {
        const manifest = await readManifest(lib, appId);
        if (!manifest) return undefined;
        const appInstallFolder = getAppInstallFolder(lib, manifest.installdir);
        const isExist = await fs.pathExists(appInstallFolder);
        const size = isExist ? await getFolderSizeAsync(appInstallFolder) : -1;
        return { lib, appInstallFolder, size };
      })
    );

    const resultLib = appsWithSize?.sort((a, b) => b?.size - a?.size)[0];
    if (!resultLib) throw new Error("App not found");
    return resultLib.appInstallFolder;
  }

  throw new Error("App not found");
}

interface SteamApp {
  appId: number;
  path: string;
  // library?: SteamLibraryFolder | string;
  manifest: AppManifest;
  // exePath?: string;
}

type SteamLibrary = {
  apps: SteamApp[];
  // SteamLibraryFolder props
  path: string;
  label: string;
  contentid: number;
  totalsize: number;
  update_clean_bytes_tally: number;
  time_last_update_corruption: number;
};

type SteamLibraryOld = {
  path: string;
  apps: SteamApp[];
};

type SteamInfo = {
  version: "v1" | "v2";
  libraries?: SteamLibrary[];
  oldLibraries?: SteamLibraryOld[];
};

/**
 * Searches for apps in local Steam libraries.
 *
 * @returns Path to installed app.
 */
export async function findSteam(): Promise<SteamInfo> {
  const steamLibs = await findSteamLibraries();
  if (steamLibs.version === "v2" && steamLibs.libraries) {
    const appsPromises = steamLibs.libraries.map((lib) =>
      Object.keys(lib.apps).map((appId) => readManifest(lib.path, Number(appId)))
    );
    const apps = await Promise.all(appsPromises.flat());
    const appsManifests = apps.filter(Boolean) as AppManifest[];

    const steamLibsWithApps: SteamLibrary[] = [];
    steamLibs.libraries.forEach((lib) => {
      const steamApps: SteamApp[] = [];
      Object.keys(lib.apps).forEach((appId) => {
        const manifest = appsManifests.find((app) => app.appid === Number(appId));
        if (manifest) {
          steamApps.push({
            appId: Number(appId),
            path: getAppInstallFolder(lib.path, manifest.installdir),
            manifest,
            // library: lib,
          });
        }
      });
      steamLibsWithApps.push({ ...lib, apps: steamApps });
    });

    console.log(steamLibsWithApps);
    return { version: steamLibs.version, ...steamLibsWithApps };
  }

  throw new Error("Apps not found");
}

export {
  AppManifest,
  SteamLibraryFolder,
  SteamLibrary,
  SteamNotFoundError,
  SteamApp,
  findSteamPath,
};
