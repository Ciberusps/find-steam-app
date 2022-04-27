import mock from "mock-fs";
import path from "path";

export const steamFolder = "c/Program Files (x86)/Steam";

export const mockDrives = () => {
  mock({
    c: mock.load(path.resolve(__dirname, "../../__data__/c"), {
      recursive: true,
    }),
  });
};
