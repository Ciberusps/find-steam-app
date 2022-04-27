import path from "path";
import { SteamLibraryFolder } from "./libraries";

export const getAppInstallFolder = (library: string, name: string) => {
  return path.join(library, "common", name);
};

export const getLibraryFolder = (library: string) => {
  return path.normalize(path.join(library, "steamapps"));
};

export const findAppLibraryInV2Libraries = (
  appId: number,
  librariesV2: SteamLibraryFolder[]
): SteamLibraryFolder | undefined => {
  return librariesV2?.find((lib) => Object.keys(lib.apps).includes(appId.toString()));
};
