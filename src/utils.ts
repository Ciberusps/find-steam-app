import path from "path";

export const getAppInstallFolder = (library: string, name: string) => {
  return path.join(library, "common", name);
};
