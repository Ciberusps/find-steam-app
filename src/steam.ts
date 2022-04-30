import execa from "execa";
import fs from "fs-extra";
import path from "path";

import { joinAndNormalize } from "./utils";

const REG_TREE_PATH = "HKCU\\Software\\Valve\\Steam";
const REG_KEY_NOT_FOUND =
  "The system was unable to find the specified registry key or value";

export class SteamNotFoundError extends Error {
  public constructor() {
    super("Steam installation directory not found");
    this.name = "SteamNotFoundError";
  }
}

const pathIfExists = async (name: string) =>
  (await fs.pathExists(name)) ? name : undefined;

const getRegExePath = () =>
  process.platform === "win32" && process.env.windir != null
    ? path.join(process.env.windir, "System32", "reg.exe")
    : "REG";

async function windows() {
  let programFiles = process.env["ProgramFiles(x86)"];
  if (programFiles == null) programFiles = process.env.ProgramFiles;
  if (programFiles != null && (await fs.pathExists(`${programFiles}/Steam/Steam.exe`))) {
    return `${programFiles}/Steam`;
  }

  try {
    const output = await execa.stdout(
      getRegExePath(),
      ["QUERY", REG_TREE_PATH, "/v", "SteamPath"],
      { cwd: undefined }
    );
    const matches = output.match(/SteamPath\s+[A-Z_]+\s+(.+)/);
    if (!matches || matches[1] === "")
      throw new Error(`Unexpected output:\n${output.trim()}`);

    return pathIfExists(matches[1]);
  } catch (err) {
    // @ts-ignore
    if (!err?.message?.includes(REG_KEY_NOT_FOUND)) {
      throw err;
    }
  }
  throw new Error(`Unable to find Steam installation directory`);
}

/**
 * Searches for Steam.
 *
 * @returns Location of Steam. `undefined` if Steam wasn't found.
 */
export async function findSteamPath(): Promise<string | undefined> {
  let result: string | undefined;

  switch (process.platform) {
    case "win32":
      result = await windows();
      break;
    case "linux":
      result = await pathIfExists(`${process.env.HOME}/.local/share/Steam`);
      break;
    case "darwin":
      result = await pathIfExists(
        `${process.env.HOME}/Library/Application Support/Steam`
      );
      break;
    default:
      throw new Error(`Steam finding isn't implemented for ${process.platform}`);
  }

  if (result) {
    result = joinAndNormalize(result);
  }
  return result;
}
