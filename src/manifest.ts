import fs from "fs-extra";
import vdf from "vdf-extra";

import { getLibraryManifestsFolder, getManifestPath } from "./utils";

export interface IAppManifest {
  appid: number;
  Universe: number;
  name: string;
  StateFlags: number;
  installdir: string;
  LastUpdated: number;
  UpdateResult: 0 | 1;
  SizeOnDisk: number;
  buildid: number;
  LastOwner: string;
  BytesToDownload: number;
  BytesDownloaded: number;
  AutoUpdateBehavior: 0 | 1;
  AllowOtherDownloadsWhileRunning: 0 | 1;
  ScheduledAutoUpdate: number;
  UserConfig: {
    language: string;
    DisabledDLC?: string;
    optionaldlc?: string;
  };
  InstalledDepots: Record<string, { manifest: string; dlcappid?: number }>;
  MountedDepots: Record<string, string>;
  InstallScripts?: Record<string, string>;
  ShaderDepot?: {
    ManifestID: string;
    DepotSize: number;
  };
}

export async function hasManifest(libraryPath: string, appid: number): Promise<boolean> {
  const manifestPath = getManifestPath(libraryPath, appid);
  return fs.pathExists(manifestPath);
}

export async function readManifest(
  libraryPath: string,
  appid: number
): Promise<IAppManifest | null> {
  try {
    const manifestPath = getManifestPath(libraryPath, appid);
    const manifestContent = await fs.readFile(manifestPath, "utf8");
    const manifestData = vdf.parse<IAppManifest>(manifestContent);
    return manifestData;
  } catch (err) {
    console.info(err);
  }
  return null;
}

export async function findManifests(libraryPath: string): Promise<IAppManifest[]> {
  const libraryManifestsFolder = getLibraryManifestsFolder(libraryPath);
  const manifestPaths = await fs.readdir(libraryManifestsFolder);
  const manifests = await Promise.all(
    manifestPaths
      .filter((path) => path.startsWith("appmanifest_") && path.endsWith(".acf"))
      .map((path) => {
        const appId = Number(path.replace("appmanifest_", "").replace(".acf", ""));
        const manifest = readManifest(libraryPath, appId);
        return manifest;
      })
  );
  return manifests.filter(Boolean) as IAppManifest[];
}
