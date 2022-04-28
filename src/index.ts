import fs from "fs-extra";
import pFilter from "p-filter";
import util from "util";
// @ts-ignore
import getFolderSize from "get-folder-size";
const getFolderSizeAsync = util.promisify(getFolderSize);

import {
  loadSteamLibraries,
  loadSteamLibrariesPaths,
  ISteamLibrariesRaw,
  ISteamLibraryRaw,
} from "./libraries";
import { IAppManifest, findManifests, hasManifest, readManifest } from "./manifest";
import { findSteamPath, SteamNotFoundError } from "./steam";

import {
  findAppLibraryInV2Libraries,
  getAppInstallFolder,
  getAppsInstallFolder,
  getAppsManifestsFolder,
} from "./utils";

/**
 * Searches for all local Steam libraries.
 *
 * @returns Array of paths to library folders.
 */
export async function findSteamLibrariesPaths(): Promise<string[]> {
  return loadSteamLibrariesPaths();
}

/**
 * Searches for all local Steam libraries.
 *
 * @returns Array of paths to library folders.
 */
export async function findSteamLibraries(): Promise<ISteamLibrariesRaw> {
  return loadSteamLibraries();
}

/**
 * Searches for app in local Steam libraries.
 *
 * @returns Information about installed application.
 */
export async function findSteamAppManifest(appId: number): Promise<IAppManifest | null> {
  const libs = await findSteamLibrariesPaths();
  const [library] = await pFilter(libs, (lib) => hasManifest(lib, appId));
  if (library == null) return null;

  return readManifest(library, appId);
}

/**
 * Searches for app in local Steam libraries.
 *
 * @returns Path to installed app.
 */
export async function findSteamAppByName(name: string): Promise<string> {
  const libsPaths = await findSteamLibrariesPaths();
  const appsPaths = libsPaths.map((lib) => getAppInstallFolder(lib, name));
  if (!appsPaths.length) throw new Error("App not found");

  let appsWithSize = await Promise.all(
    appsPaths.map(async (appPath) => {
      const appInstallFolder = appPath;
      const isExists = await fs.pathExists(appInstallFolder);
      const size = isExists ? await getFolderSizeAsync(appInstallFolder) : 0;
      return { appInstallFolder: appPath, size };
    })
  );
  appsWithSize = appsWithSize.filter(Boolean);

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

  if (steamLibs.version === "v1") {
    const appLibs = await pFilter(steamLibs.libraries, async (lib) =>
      hasManifest(lib.path, appId)
    );
    if (!appLibs.length) throw new Error("App not found");

    let appsWithSize = await Promise.all(
      appLibs.map(async (lib) => {
        const manifest = await readManifest(lib.path, appId);
        if (!manifest) return undefined;
        const appInstallFolder = getAppInstallFolder(lib.path, manifest.installdir);
        const isExist = await fs.pathExists(appInstallFolder);
        const size = isExist ? await getFolderSizeAsync(appInstallFolder) : -1;
        return { lib, appInstallFolder, size };
      })
    );
    appsWithSize = appsWithSize.filter(Boolean);

    const resultLib = appsWithSize?.sort((a, b) => b?.size - a?.size)[0];
    if (!resultLib) throw new Error("App not found");
    return resultLib.appInstallFolder;
  }

  throw new Error("App not found");
}

interface ISteamApp {
  appId: number;
  path: string;
  manifest: IAppManifest;
}

type ISteamLibrary = {
  path: string;
  apps: ISteamApp[];
  label?: string;
  contentid?: number;
  totalsize?: number;
  update_clean_bytes_tally?: number;
  time_last_update_corruption?: number;
};

type ISteamInfo = {
  version: "v1" | "v2";
  libraries: ISteamLibrary[];
};

/**
 * Searches for apps in local Steam libraries.
 *
 * @returns Path to installed app.
 */
export async function findSteam(): Promise<ISteamInfo> {
  const steamLibs = await findSteamLibraries();
  if (steamLibs.version === "v2" && steamLibs.libraries) {
    const appsPromises = steamLibs.libraries.map(
      (lib) =>
        lib.apps &&
        Object.keys(lib.apps).map((appId) => readManifest(lib.path, Number(appId)))
    );
    const apps = await Promise.all(appsPromises.flat());
    const appsManifests = apps.filter(Boolean) as IAppManifest[];

    const steamLibsWithApps: ISteamLibrary[] = [];
    steamLibs.libraries.forEach((lib) => {
      const steamApps: ISteamApp[] = [];
      lib.apps &&
        Object.keys(lib.apps).forEach((appId) => {
          const manifest = appsManifests.find((app) => app.appid === Number(appId));
          if (manifest) {
            steamApps.push({
              appId: Number(appId),
              path: getAppInstallFolder(lib.path, manifest.installdir),
              manifest,
            });
          }
        });
      steamLibsWithApps.push({ ...lib, apps: steamApps });
    });

    return { version: steamLibs.version, libraries: steamLibsWithApps };
  }

  if (steamLibs.version === "v1" && steamLibs.libraries) {
    const steamLibsWithApps: ISteamLibrary[] = [];
    for (const lib of steamLibs.libraries) {
      const apps = await findManifests(lib.path);
      steamLibsWithApps.push({
        path: lib.path,
        apps: apps.map((app) => ({
          appId: app.appid,
          manifest: app,
          path: getAppInstallFolder(lib.path, app.installdir),
        })),
      });
    }
    return {
      version: steamLibs.version,
      libraries: steamLibsWithApps,
    };
  }

  throw new Error("Apps not found");
}

export {
  IAppManifest as AppManifest,
  ISteamInfo as SteamInfo,
  ISteamLibraryRaw as SteamLibraryRaw,
  ISteamLibrary as SteamLibrary,
  SteamNotFoundError,
  ISteamApp as SteamApp,
  findSteamPath,
  getAppsInstallFolder,
  getAppsManifestsFolder,
};
