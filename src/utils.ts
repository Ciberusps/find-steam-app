import path from "path";

import { ISteamLibraryRaw } from "./libraries";

export const joinAndNormalize = (...paths: string[]) =>
  path.normalize(path.join(...paths));

export const getAppsInstallFolder = (library: string) => {
  return joinAndNormalize(library, "steamapps", "common");
};

export const getAppsManifestsFolder = (library: string) => {
  return joinAndNormalize(library, "steamapps");
};

export const getAppInstallFolder = (library: string, name: string) => {
  return joinAndNormalize(getAppsInstallFolder(library), name);
};

export const findAppLibraryInV2Libraries = (
  appId: number,
  librariesV2: ISteamLibraryRaw[]
): ISteamLibraryRaw | undefined => {
  return librariesV2?.find(
    (lib) => lib.apps && Object.keys(lib.apps).includes(appId.toString())
  );
};
