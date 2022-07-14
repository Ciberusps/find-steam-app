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
  getLibrariesVdfFilePath,
  getLibraryInstallsFolder,
  getLibraryManifestsFolder,
  getManifestPath,
} from "./utils";

export async function findSteamLibrariesPaths(): Promise<string[]> {
  return loadSteamLibrariesPaths();
}

export async function findSteamLibraries(): Promise<ISteamLibrariesRaw> {
  return loadSteamLibraries();
}

export async function findSteamAppManifest(appId: number): Promise<IAppManifest | null> {
  const libs = await findSteamLibrariesPaths();
  const [library] = await pFilter(libs, (lib) => hasManifest(lib, appId));
  if (library == null) return null;

  return readManifest(library, appId);
}

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

export async function findSteamAppById(appId: number, forceV1 = true): Promise<string> {
  const steamLibs = await findSteamLibraries();
  if (!steamLibs) throw new Error("Steam libraries not found");

  if (steamLibs.version === "v2" && !forceV1) {
    const appLibrary = findAppLibraryInV2Libraries(appId, steamLibs.libraries);
    if (!appLibrary) throw new Error("App not found");
    const manifest = await readManifest(appLibrary.path, appId);
    if (!manifest) throw new Error("App manifest not found");
    return getAppInstallFolder(appLibrary.path, manifest.installdir);
  }

  if (steamLibs.version === "v1" || forceV1) {
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
  manifestPath: string;
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

type ISteamLibraries = {
  version: "v1" | "v2";
  steamPath: string;
  librariesVdfFilePath: string;
  libraries: ISteamLibrary[];
};

type ISteamOptions = {
  forceV1?: boolean;
};

export async function findSteam(
  options: ISteamOptions = { forceV1: true }
): Promise<ISteamLibraries> {
  const steamPath = await findSteamPath();
  if (!steamPath) throw new SteamNotFoundError();

  const librariesVdfFilePath = getLibrariesVdfFilePath(steamPath);
  const steamLibs = await findSteamLibraries();
  if (steamLibs.version === "v2" && steamLibs.libraries && !options?.forceV1) {
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
          const appIdNumber = Number(appId);
          const manifest = appsManifests.find((app) => app.appid === appIdNumber);
          if (manifest) {
            steamApps.push({
              appId: appIdNumber,
              path: getAppInstallFolder(lib.path, manifest.installdir),
              manifestPath: getManifestPath(lib.path, appIdNumber),
              manifest,
            });
          }
        });
      steamLibsWithApps.push({ ...lib, apps: steamApps });
    });

    return {
      version: steamLibs.version,
      steamPath,
      librariesVdfFilePath,
      libraries: steamLibsWithApps,
    };
  }

  if ((steamLibs.version === "v1" || options?.forceV1) && steamLibs.libraries) {
    const steamLibsWithApps: ISteamLibrary[] = [];
    for (const lib of steamLibs.libraries) {
      const apps = await findManifests(lib.path);
      steamLibsWithApps.push({
        path: lib.path,
        apps: apps.map((app) => ({
          appId: app.appid,
          path: getAppInstallFolder(lib.path, app.installdir),
          manifestPath: getManifestPath(lib.path, app.appid),
          manifest: app,
        })),
      });
    }
    return {
      version: options?.forceV1 ? "v1" : steamLibs.version,
      steamPath,
      librariesVdfFilePath,
      libraries: steamLibsWithApps,
    };
  }

  throw new Error("Apps not found");
}

export {
  IAppManifest,
  ISteamApp,
  ISteamLibraries,
  ISteamLibraryRaw,
  ISteamLibrary,
  SteamNotFoundError,
  findSteamPath,
  getLibraryInstallsFolder,
  getLibraryManifestsFolder,
};
