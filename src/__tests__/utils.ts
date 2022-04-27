import mock from "mock-fs";
import path from "path";

export const steamFolder = "c/Program Files (x86)/Steam";

export const mockLoad = (file: string) =>
  mock.load(path.resolve(__dirname, file), {
    recursive: true,
    lazy: false,
  });
