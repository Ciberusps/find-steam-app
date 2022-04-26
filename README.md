# ciberusps/find-steam-app

> Find location of an installed Steam app

## Usage

```ts
import {
  findSteam,
  findSteamAppById,
  findSteamAppByName,
  findSteamAppManifest,
  findSteamLibraries,
} from "find-steam-app";

await findSteamAppById(570);
// => '/path/to/steam/steamapps/common/dota 2 beta'

await findSteamAppByName("dota 2 beta");
// => '/path/to/steam/steamapps/common/dota 2 beta'

await findSteam();
// => '/path/to/steam'

await findSteamLibrariesPaths();
// => ['/path/to/steam/steamapps', '/path/to/library/steamapps']

await findSteamLibraries();
// => [{ path: '/path/to/library/steamapps', totalsize: 41234, apps: ['570'], ... }, ...]

// TODO:
await findSteamApps();
// => ['/path/to/steam/steamapps', '/path/to/library/steamapps']

await findSteamAppManifest(570);
// => { appid: 570, Universe: 1, name: 'Dota 2', ... }

// utils
// manifest
```

For more information about manifest, see [manifest.ts](src/manifest.ts)
