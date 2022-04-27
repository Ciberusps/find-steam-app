import mock from "mock-fs";
import path from "path";

export const steamFolder = "c/Program Files (x86)/Steam";

const load = (file: string) =>
  mock.load(path.resolve(__dirname, file), {
    recursive: true,
  });

export const mockDrives = () => {
  mock({
    c: load("../../__data__/c"),
    d: load("../../__data__/d"),
    e: load("../../__data__/e"),
    f: load("../../__data__/f"),
  });
};
