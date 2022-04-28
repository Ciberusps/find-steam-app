import {
  findSteamPath,
  findSteam,
  findSteamAppById,
  findSteamAppByName,
  findSteamLibraries,
  findSteamAppManifest,
  findSteamLibrariesPaths,
} from "../index";

const test = async () => {
  const res1 = await findSteamAppById(570);
  console.dir({ res1 }, { depth: null });

  const res2 = await findSteamAppByName("dota 2 beta");
  console.dir({ res2 }, { depth: null });

  const res3 = await findSteamPath();
  console.dir({ res3 }, { depth: null });

  const res4 = await findSteamLibrariesPaths();
  console.dir({ res4 }, { depth: null });

  const res5 = await findSteamLibraries();
  console.dir({ res5 }, { depth: null });

  const res6 = await findSteam();
  console.dir({ res6 }, { depth: null });

  const res7 = await findSteamAppManifest(570);
  console.dir({ res7 }, { depth: null });
};

test();
