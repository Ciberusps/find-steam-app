import fs from "fs-extra";
import path from "path";
import vdf from "vdf-extra";

export interface AppManifest {
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

export const findLibrariesManifests = async (libs: string[]) => {
  const libPromises = libs.map(findLibraryManifests);
  const res = await Promise.all(libPromises);
  return res;
};

export const findLibraryManifests = async (libraryPath: string) => {
  return fs.readdir(libraryPath);
};

export async function hasManifest(libraryPath: string, appid: number) {
  return fs.pathExists(path.join(libraryPath, `appmanifest_${appid}.acf`));
}

export async function readManifest(
  libraryPath: string,
  appid: number
): Promise<AppManifest | null> {
  const manifestPath = path.join(libraryPath, `appmanifest_${appid}.acf`);

  try {
    const manifestContent = await fs.readFile(manifestPath, "utf8");
    const manifestData = vdf.parse<AppManifest>(manifestContent);
    return manifestData;
  } catch (err) {
    console.warn(err);
  }
  return null;
}
