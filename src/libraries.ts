import fs from "fs-extra";
import uniqBy from "lodash.uniqby";
import path from "path";
import vdf from "vdf-extra";

export interface SteamLibraryFolder {
  path: string;
  label: string;
  contentid: number;
  totalsize: number;
  update_clean_bytes_tally: number;
  time_last_update_corruption: number;
  apps: { [id: string]: number };
}

export interface SteamLibraries {
  version: "v1" | "v2";
  libraries?: SteamLibraryFolder[];
  oldLibraries?: string[];
}

interface LibraryFolders {
  [id: string]: SteamLibraryFolder | string;
}

export async function loadSteamLibrariesPaths(steam: string): Promise<string[]> {
  const mainSteamApps = path.join(steam, "steamapps");
  const libraryFoldersPath = path.join(mainSteamApps, "libraryfolders.vdf");
  const libraryFoldersContent = await fs.readFile(libraryFoldersPath, "utf8");
  const libraryFoldersData = vdf.parse<LibraryFolders>(libraryFoldersContent);

  const libraries = Object.entries(libraryFoldersData)
    .filter(([id]) => !isNaN(Number(id)))
    .map(([, libPath]) =>
      path.join(typeof libPath === "string" ? libPath : libPath.path, "steamapps")
    );

  return uniqBy([mainSteamApps, ...libraries], String);
}

export async function loadSteamLibraries(steam: string): Promise<SteamLibraries> {
  const mainSteamApps = path.join(steam, "steamapps");
  const libraryFoldersPath = path.join(mainSteamApps, "libraryfolders.vdf");
  const libraryFoldersContent = await fs.readFile(libraryFoldersPath, "utf8");
  const libraryFoldersData = vdf.parse<LibraryFolders>(libraryFoldersContent);

  const libraries = Object.entries(libraryFoldersData).filter(
    ([id]) => !isNaN(Number(id))
  );
  // libraries[0][1] = "fklajdfk";
  const isV1 = libraries.some(([_, val]) => typeof val === "string");
  console.log({ libraries: JSON.stringify(libraries, null, 2), isV1 });

  if (isV1) {
    const oldLibraries = uniqBy(
      libraries.map(([, val]) => (typeof val === "string" ? val : val.path)),
      String
    );
    return {
      version: "v1",
      oldLibraries,
    };
  } else {
    return {
      version: "v2",
      libraries: uniqBy(libraries, "path").map(([, val]) => val) as SteamLibraryFolder[],
    };
  }
}
