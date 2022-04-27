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

export const findLibraryManifests = async (library: string) => {
  return fs.readdir(library);
};

export async function hasManifest(library: string, appid: number) {
  return fs.pathExists(path.join(library, `appmanifest_${appid}.acf`));
}

export async function readManifest(library: string, appid: number) {
  const manifestPath = path.join(library, `appmanifest_${appid}.acf`);
  const manifestTempPath = path.join(library, `appmanifest_${appid}.acf.tmp.save`);

  try {
    // if manifest parse error try open temporary manifest(.acf.tmp.save)
    const manifestContent = await fs.readFile(manifestPath, "utf8");
    const manifestData = vdf.parse<AppManifest>(manifestContent);
    return manifestData;
  } catch (err) {
    const manifestContent = await fs.readFile(manifestTempPath, "utf8");
    const manifestData = vdf.parse<AppManifest>(manifestContent);
    return manifestData;
  }
}
