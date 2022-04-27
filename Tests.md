# Tests

Cases:

1. dota 2 was installed on disk D, moved on disk F, and somehow in library on disk E in `/common` folder `dota 2 beta` folder exist

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
