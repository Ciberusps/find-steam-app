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
  console.log({ res1 });

  const res2 = await findSteamAppByName("dota 2 beta");
  console.log({ res2 });

  const res3 = await findSteamPath();
  console.log({ res3 });

  const res4 = await findSteamLibrariesPaths();
  console.log({ res4 });

  const res5 = await findSteamLibraries();
  console.log({ res5: JSON.stringify(res5, null, 4) });

  const res6 = await findSteam();
  console.log({ res6 });

  const res7 = await findSteamAppManifest(570);
  console.log({ res7 });
};

test();
