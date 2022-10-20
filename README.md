# ciberus/find-steam-app

Find steam location on disk, installed steam apps and [libraries](#How-it-works)

Rewrite of original [find-steam-app](https://github.com/ark120202/find-steam-app) with improved types, written tests, new functions like `findSteam` and fixed edge cases with multiple "steam libraries". If you find it helpful please star it on github

### How it works

Steam has "Libraries" - locations on disks there games installed, "Libraries" has 2 versions, most users use v2, but this package support v1 also

- v1 - [recommended] contain only path to library, we can identify where app installed only indirectly by searching apps manifests `appmanifest_%appId%.acf` in Steam Libraries folders
- v2 - [not recommended] contains complete info about library and apps inside it, that gives opportunity to detect where app installed exactly. But syncs poorly only on steam start, returned results might be irrelevant from `v4.0.0` library forced to use "v1" by default, previously "v2" was default

### Install

```bash
npm i @ciberus/find-steam-app -S
```

### Support

- windows ✅
- osx - ✅
- linux - ✅

### Usage

```ts
import {
  IAppManifest,
  ISteamLibraries,
  ISteamLibrariesRaw,
  findSteamPath,
  findSteamAppById,
  findSteamAppByName,
  findSteamAppManifest,
  findSteamLibraries,
  getLibraryManifestsFolder,
  getLibraryInstallsFolder,
} from "find-steam-app";

const steamLibs: ISteamLibraries = await findSteam();
// => {
//      version: "v1",
//      steamPath: "C:/Program Files (x86)/Steam",
//      librariesVdfFilePath: "C:/Program Files (x86)/Steam/steamapps/libraryfolders.vdf"
//      libraries: [{
//           path: "F:/SteamLibrary",
//           apps: [{
//             appId: 570,
//             path: "F:/SteamLibrary/steamapps/common/dota 2 beta",
//             manifestPath: "F:/SteamLibrary/steamapps/appmanifest_570.acf"
//             manifest: {
//                appid: 570,
//                installdir: "dota 2 beta"
//                buildid: 8651789
//                ...
//             }
//          }]
//      }]
//    }

// Disable forceV1 to search apps by `libraryfolders.vdf` not by `appmanifests` not recommended
// `libraryfolders.vdf` syncs only on start and can return irrelevant results
const steamLibs: ISteamLibraries = await findSteam({ forceV1: false });

await findSteamPath();
// => 'C:/Program Files (x86)/Steam'

await findSteamAppById(570);
// => 'F:/SteamLibrary/steamapps/common/dota 2 beta'
await findSteamAppById(570, forceV1: false); // to turn on search using "v2" check out "How it works"

await findSteamAppByName("dota 2 beta");
// => 'F:/SteamLibrary/steamapps/common/dota 2 beta'

const res: IAppManifest = await findSteamAppManifest(570);
// => { appid: 570, Universe: 1, name: 'Dota 2', ... }

const libs: string[] = await findSteamLibrariesPaths();
// => ['C:/Program Files (x86)/Steam', 'F:/SteamLibrary', ...]

// can be transformed like this
libs.map(getLibraryManifestsFolder);
// => ['C:/Program Files (x86)/Steam/steamapps', 'F:/SteamLibrary/steamapps']
libs.map(getLibraryInstallsFolder);
// => ['C:/Program Files (x86)/Steam/steamapps/common', 'F:/SteamLibrary/steamapps/common', ...]

const steamLibsRaw: ISteamLibrariesRaw = await findSteamLibraries();
// => [{ path: 'F:/SteamLibrary', totalsize: 41234, apps: ['570'], ... }, ...]
```

AppManifest - [manifest.ts](src/manifest.ts)

## Tests

- `__data__` contain the files that will be used to mock the filesystem.
- `__data__` mimic the filesystem of the computer.
- so if u know any edge cases, u can try to add those files and see tests are pass if not pls open issue

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

4. manifest exists but game folder - not
5. manifest exists but game moved in another library and cant read manifest
6. manifest exists but game moved in another library, we can only compare size of games and choose heavier one

## TODO

- jsdoc/tsdoc
- better edge cases description


