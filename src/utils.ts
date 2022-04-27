import path from "path";
import { SteamLibraryFolder } from "./libraries";

export const joinAndNormalize = (...paths: string[]) =>
  path.normalize(path.join(...paths));

export const getLibraryAppsInstallFolder = (library: string) => {
  return joinAndNormalize(library, "steamapps", "common");
};

export const getLibraryAppsManifestsFolder = (library: string) => {
  return joinAndNormalize(library, "steamapps");
};

export const getAppInstallFolder = (library: string, name: string) => {
  return joinAndNormalize(getLibraryAppsInstallFolder(library), name);
};

export const findAppLibraryInV2Libraries = (
  appId: number,
  librariesV2: SteamLibraryFolder[]
): SteamLibraryFolder | undefined => {
  return librariesV2?.find((lib) => Object.keys(lib.apps).includes(appId.toString()));
};
