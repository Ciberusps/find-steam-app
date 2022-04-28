import fs from "fs-extra";
import uniqBy from "lodash.uniqby";
import path from "path";
import vdf from "vdf-extra";

import { getAppsManifestsFolder, joinAndNormalize } from "./utils";

export type SteamLibraryRaw = {
  path: string;
  label?: string;
  contentid?: number;
  totalsize?: number;
  update_clean_bytes_tally?: number;
  time_last_update_corruption?: number;
  apps?: { [id: string]: number };
};

export interface SteamLibrariesRaw {
  version: "v1" | "v2";
  libraries: SteamLibraryRaw[];
}

interface LibraryFolders {
  [id: string]: SteamLibraryRaw | string;
}

export async function loadSteamLibrariesPaths(steam: string): Promise<string[]> {
  const mainSteamApps = getAppsManifestsFolder(steam);
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

export async function loadSteamLibraries(steam: string): Promise<SteamLibrariesRaw> {
  const mainSteamApps = path.join(steam, "steamapps");
  const libraryFoldersPath = path.join(mainSteamApps, "libraryfolders.vdf");
  const libraryFoldersContent = await fs.readFile(libraryFoldersPath, "utf8");
  const libraryFoldersData = vdf.parse<LibraryFolders>(libraryFoldersContent);

  const steamLibs = Object.entries(libraryFoldersData).filter(
    ([id]) => !isNaN(Number(id))
  );
  const isV1 = steamLibs.some(([_, val]) => typeof val === "string");

  if (isV1) {
    let libs = steamLibs.map(([, val]) => ({
      path: joinAndNormalize(typeof val === "string" ? val : val.path),
    }));
    libs = uniqBy(libs, "path");

    return {
      version: "v1",
      libraries: libs as SteamLibraryRaw[],
    };
  } else {
    let libs = steamLibs.map(([_, val]) => val) as SteamLibraryRaw[];
    libs = libs.map((val) => ({
      ...val,
      path: joinAndNormalize(val.path),
    }));
    libs = uniqBy(libs, "path");

    return {
      version: "v2",
      libraries: libs as SteamLibraryRaw[],
    };
  }
}
