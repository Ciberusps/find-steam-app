import path from "path";
import { AppManifest } from "./manifest";

export const getAppInstallFolder = (library: string, manifest: AppManifest) => {
  return path.join(library, "common", manifest.installdir);
};
