import fs from "fs-extra";
import uniqBy from "lodash.uniqby";
import path from "path";
import vdf from "vdf-extra";

export interface LibraryFolderNew {
  path: string;
  label?: string;
  contentid?: number;
  totalsize?: number;
  update_clean_bytes_tally?: number;
  time_last_update_corruption?: number;
  apps?: { [id: string]: number };
}

interface LibraryFolders {
  [id: string]: LibraryFolderNew | string;
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

export async function loadSteamLibraries(steam: string): Promise<LibraryFolderNew[]> {
  const mainSteamApps = path.join(steam, "steamapps");
  const libraryFoldersPath = path.join(mainSteamApps, "libraryfolders.vdf");
  const libraryFoldersContent = await fs.readFile(libraryFoldersPath, "utf8");
  const libraryFoldersData = vdf.parse<LibraryFolders>(libraryFoldersContent);

  console.log("libraryFoldersData", libraryFoldersData);

  const libraries: LibraryFolderNew[] = Object.entries(libraryFoldersData)
    .filter(([id]) => !isNaN(Number(id)))
    .map(([, libPath]) => {
      const exactLibPath = path.join(
        typeof libPath === "string" ? libPath : libPath.path,
        "steamapps"
      );
      if (typeof libPath === "string") {
        return { path: exactLibPath };
      }
      return {
        ...libPath,
        path: exactLibPath,
      };
    });

  return uniqBy([...libraries, { path: mainSteamApps }], "path");
}
