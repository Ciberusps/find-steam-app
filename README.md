# ciberus/find-steam-app

> Find location of an installed Steam app

Steam has "Libraries" - locations on disks there games installed
Steam "Libraries" has 2 versions, most users use v2, but this package support v1 also

- v1 - contain only path to library, we can identify where app installed only indirectly by searching apps manifests `appmanifest_%appId%.acf` in Steam Libraries
- v2 - contains complete info about library and apps inside it, that gives opportunity to detect where app installed exactly

## Support

- windows ✅
- osx - ✅
- linux - ⚠️not tested

## Install

> npm i @ciberus/find-steam-app -S

## Usage

```ts
import {
  findSteamPath,
  findSteamAppById,
  findSteamAppByName,
  findSteamAppManifest,
  findSteamLibraries,
  getLibraryAppsManifestsFolder,
  getLibraryAppsInstallFolder,
} from "find-steam-app";

await findSteamPath();
// => '/path/to/steam'

await findSteamAppById(570);
// => '/path/to/steam/steamapps/common/dota 2 beta'

await findSteamAppByName("dota 2 beta");
// => '/path/to/steam/steamapps/common/dota 2 beta'

await findSteamAppManifest(570);
// => { appid: 570, Universe: 1, name: 'Dota 2', ... }
// returns `AppManifest` more below

const libs = await findSteamLibrariesPaths();
// => ['/path/to/steam', '/path/to/library']

// can be transformed like this
libs.map(getLibraryAppsManifestsFolder);
// => ['/path/to/steam/steamapps', '/path/to/library/steamapps']
libs.map(getLibraryAppsInstallFolder);
// => ['/path/to/steam/steamapps/common', '/path/to/library/steamapps/common']

await findSteamLibraries();
// => [{ path: '/path/to/library/steamapps', totalsize: 41234, apps: ['570'], ... }, ...]

await findSteam({ enableBullshetFilter: true });

// => ['/path/to/steam/steamapps', '/path/to/library/steamapps']
```

AppManifest - [manifest.ts](src/manifest.ts)

## Tests

- `__data__` contain the files that will be used to mock the filesystem.
- `__data__` mimic the filesystem of the computer.
- so if u know any edge cases, u can try to add those files and see if it works

## Edge cases

1. after uninstall app folder like "dota 2 beta" in "common" still exist
2. after moving app folder in another library `manifest` still exists in old library but became encrypted and `*.acf.tmp.save` manifest created near
3. dota 2 was installed on disk D, moved on disk F, and somehow in library on disk E in `/common` folder `dota 2 beta` folder exist

- disk D
  - has appmanifest_570.acf
  - has appmanifest_570.acf.tmp.save
  - no folder `dota 2 beta` in `/common`
- disk E
  - no manifest
  - has folder `dota 2 beta` in `/common`
- disk F - right disk

  - has appmanifest_570.acf
  - dont have appmanifest \*.acf.tmp.save
  - has folder `dota 2 beta` in `/common`

## TODO

- filter non-game apps, `findSteamApps` - filter some appIds like `228980` its "Steamworks Common Redistributables" https://steamdb.info/app/228980/ not app in
- jsdoc/tsdoc
