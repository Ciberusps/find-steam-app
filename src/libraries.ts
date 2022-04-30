import fs from "fs-extra";
import uniqBy from "lodash.uniqby";
import vdf from "vdf-extra";
import { findSteamPath, SteamNotFoundError } from "./steam";

import { getLibrariesVdfFilePath, joinAndNormalize } from "./utils";

export interface ISteamLibraryRaw {
  path: string;
  label?: string;
  contentid?: number;
  totalsize?: number;
  update_clean_bytes_tally?: number;
  time_last_update_corruption?: number;
  apps?: { [id: string]: number };
}

export interface ISteamLibrariesRaw {
  version: "v1" | "v2";
  libraries: ISteamLibraryRaw[];
}

interface ILibraryFolders {
  [id: string]: ISteamLibraryRaw | string;
}

export async function loadSteamLibrariesPaths(): Promise<string[]> {
  const steamPath = await findSteamPath();
  if (!steamPath) throw new SteamNotFoundError();

  const libraryFoldersPath = getLibrariesVdfFilePath(steamPath);
  const libraryFoldersContent = await fs.readFile(libraryFoldersPath, "utf8");
  const libraryFoldersData = vdf.parse<ILibraryFolders>(libraryFoldersContent);

  const libraries = Object.entries(libraryFoldersData)
    .filter(([id]) => !isNaN(Number(id)))
    .map(([, libPath]) =>
      joinAndNormalize(typeof libPath === "string" ? libPath : libPath.path)
    );

  return uniqBy([joinAndNormalize(steamPath), ...libraries], String);
}

export async function loadSteamLibraries(): Promise<ISteamLibrariesRaw> {
  const steamPath = await findSteamPath();
  if (!steamPath) throw new SteamNotFoundError();

  const libraryFoldersPath = getLibrariesVdfFilePath(steamPath);
  const libraryFoldersContent = await fs.readFile(libraryFoldersPath, "utf8");
  const libraryFoldersData = vdf.parse<ILibraryFolders>(libraryFoldersContent);

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
      libraries: libs as ISteamLibraryRaw[],
    };
  } else {
    let libs = steamLibs.map(([_, val]) => val) as ISteamLibraryRaw[];
    libs = libs.map((val) => ({
      ...val,
      path: joinAndNormalize(val.path),
    }));
    libs = uniqBy(libs, "path");

    return {
      version: "v2",
      libraries: libs as ISteamLibraryRaw[],
    };
  }
}
