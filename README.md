# ciberusps/find-steam-app

> Find location of an installed Steam app

Steam Libraries has 2 versions

- v1 - only path to library, we can identify where app installed only by manifest
- v2 - object with info about library and apps array that gives us exactly where app installed

## Support

- Windows ✅
- osx - ⚠️not tested
- linux - ⚠️not tested

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

await findSteamPath();
// => '/path/to/steam'

const libs = await findSteamLibrariesPaths();
// => ['/path/to/steam', '/path/to/library']
libs.map(getLibraryAppsManifestsFolder);
// => ['/path/to/steam/steamapps', '/path/to/library/steamapps']
libs.map(getLibraryAppsInstallFolder);
// => ['/path/to/steam/steamapps/common', '/path/to/library/steamapps/common']

await findSteamLibraries();
// => [{ path: '/path/to/library/steamapps', totalsize: 41234, apps: ['570'], ... }, ...]

// TODO:
await findSteam({ enableBullshetFilter: true });
// => ['/path/to/steam/steamapps', '/path/to/library/steamapps']

await findSteamAppManifest(570);
// => { appid: 570, Universe: 1, name: 'Dota 2', ... }

// utils
// manifest
```

For more information about manifest, see [manifest.ts](src/manifest.ts)

##

- при переносе игры manifest остается в старой папке и становится нечитаемым, добавляется файл `*.acf.tmp.save` и

- library v1 и v2 отличаются только методом опеределения какое из приложений реально установленно
  - в v1 мы находим manifest'ы и если приложение в нескольких libraries, то сравниваем вес этих папок, та что весит тяжелее побеждает
  - в v2 источником правды является `libraryfolders.vdf`, что указано в library.apps, то и установлено

## Edge cases

1. after uninstall app folder in "common" still exist
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

- `__data__` contain the files that will be used to mock the filesystem.
- `__data__` mimic the filesystem of the computer.
- so if u know any edge cases, u can try to add those files and see if it works

## TODO

- filter non-game apps, `findSteamApps` - filter some appIds like `228980` its "Steamworks Common Redistributables" https://steamdb.info/app/228980/ not app in
- jsdoc/tsdoc
