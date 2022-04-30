import path from "path";

import { ISteamLibraryRaw } from "./libraries";

export const joinAndNormalize = (...paths: string[]) =>
  path.normalize(path.join(...paths));

export const getLibraryInstallsFolder = (libraryPath: string) => {
  return joinAndNormalize(libraryPath, "steamapps", "common");
};

export const getLibraryManifestsFolder = (libraryPath: string) => {
  return joinAndNormalize(libraryPath, "steamapps");
};

export const getAppInstallFolder = (libraryPath: string, name: string) => {
  return joinAndNormalize(getLibraryInstallsFolder(libraryPath), name);
};

export const getLibrariesVdfFilePath = (steamPath: string) => {
  return joinAndNormalize(getLibraryManifestsFolder(steamPath), "libraryfolders.vdf");
};

export const getManifestPath = (libraryPath: string, appId: number) => {
  return joinAndNormalize(
    getLibraryManifestsFolder(libraryPath),
    `appmanifest_${appId}.acf`
  );
};

export const findAppLibraryInV2Libraries = (
  appId: number,
  librariesV2: ISteamLibraryRaw[]
): ISteamLibraryRaw | undefined => {
  return librariesV2?.find(
    (lib) => lib.apps && Object.keys(lib.apps).includes(appId.toString())
  );
};
