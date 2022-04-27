import fs from "fs-extra";
import uniqBy from "lodash.uniqby";
import path from "path";
import vdf from "vdf-extra";
import { getLibraryAppsManifestsFolder, joinAndNormalize } from "./utils";

export type SteamLibraryFolder = {
  path: string;
  label: string;
  contentid: number;
  totalsize: number;
  update_clean_bytes_tally: number;
  time_last_update_corruption: number;
  apps: { [id: string]: number };
};

export interface SteamLibraries {
  version: "v1" | "v2";
  libraries?: SteamLibraryFolder[];
  oldLibraries?: string[];
}

interface LibraryFolders {
  [id: string]: SteamLibraryFolder | string;
}

export async function loadSteamLibrariesPaths(steam: string): Promise<string[]> {
  const mainSteamApps = getLibraryAppsManifestsFolder(steam);
  const libraryFoldersPath = path.join(mainSteamApps, "libraryfolders.vdf");
  const libraryFoldersContent = await fs.readFile(libraryFoldersPath, "utf8");
  const libraryFoldersData = vdf.parse<LibraryFolders>(libraryFoldersContent);

  const libraries = Object.entries(libraryFoldersData)
    .filter(([id]) => !isNaN(Number(id)))
    .map(([, libPath]) =>
      joinAndNormalize(typeof libPath === "string" ? libPath : libPath.path)
    );

  return uniqBy([joinAndNormalize(steam), ...libraries], String);
}

export async function loadSteamLibraries(steam: string): Promise<SteamLibraries> {
  const mainSteamApps = path.join(steam, "steamapps");
  const libraryFoldersPath = path.join(mainSteamApps, "libraryfolders.vdf");
  const libraryFoldersContent = await fs.readFile(libraryFoldersPath, "utf8");
  const libraryFoldersData = vdf.parse<LibraryFolders>(libraryFoldersContent);

  const libraries = Object.entries(libraryFoldersData).filter(
    ([id]) => !isNaN(Number(id))
  );
  const isV1 = libraries.some(([_, val]) => typeof val === "string");
  // console.log({ libraries: JSON.stringify(libraries, null, 2), isV1 });

  const oldLibraries = uniqBy(
    libraries.map(([, val]) =>
      joinAndNormalize(typeof val === "string" ? val : val.path)
    ),
    String
  );
  if (isV1) {
    return {
      version: "v1",
      oldLibraries,
    };
  } else {
    let librariesV2 = libraries.map(([_, val]) => val) as SteamLibraryFolder[];
    librariesV2 = librariesV2.map((val) => ({
      ...val,
      path: joinAndNormalize(val.path),
    }));
    librariesV2 = uniqBy(librariesV2, "path");

    return {
      version: "v2",
      libraries: librariesV2 as SteamLibraryFolder[],
      oldLibraries,
    };
  }
}
