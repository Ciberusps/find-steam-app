import mock from "mock-fs";
import path from "path";

import { joinAndNormalize } from "../utils";

export const steamPath = joinAndNormalize("c/Program Files (x86)/Steam");

export const mockLoad = (file: string) =>
  mock.load(path.resolve(__dirname, file), {
    recursive: true,
    lazy: false,
  });
