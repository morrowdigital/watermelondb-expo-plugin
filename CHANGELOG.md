# CHANGELOG

## [2.4.0]
### Added
- Overhauled example app: Example application has now moved from its own [watermelondb-plugin-example repo](https://github.com/morrowdigital/watermelondb-plugin-example) under the `example/` directory.

### Removed
- Legacy support code for Expo SDK < 50.
- Plugin has been tested with Expo SDK 54 only.

### Deprecated
- Automatic CocoaPods `simdjson` patching now disabled.

### Breaking Changes
- Dropped conditional branches for `config.sdkVersion < '50.0.0'`; projects targeting SDK < 50 must stay on <= 2.3.3.

## [2.3.3] - 26/5/2024
### Bugfixes
* Fix `yarn install` typescript issues. Bump "@expo/config-plugins", "expo-module-scripts": "^3.5.1" to latest versions.
* Fix duplication of changes when `npx expo prebuild` is re-run. The code now check if changes are already in place.
* Fix documentation: The correct option for disabling JSI is `{ "disableJsi": true }` and not `disableJSI`

## [2.3.2] - 27/4/2024
### Added
- Monorepo support
- Documentation for Maintainers and Contributors
- Github actions for Publishing Beta and Release


## [2.3.1] - 21/3/2024
