# watermelon-db-plugin 🍉
Config plugin to auto configure `@nozbe/watermelondb`

## Install

> Tested against Expo SDK 49 and 50

```
yarn add @morrowdigital/watermelondb-expo-plugin

```

> Please make sure you also install   **[expo-build-properties](https://docs.expo.dev/versions/latest/sdk/build-properties/)**

After installing this npm package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`. Then rebuild your app using a custom development client, as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.

You also need to add the packaging options pick-first for android.

## Example

In your app.json `plugins` array:

```json
{
  "plugins": [
      [
        "@morrowdigital/watermelondb-expo-plugin"
      ],
      [
        "expo-build-properties",
        {
          "android": {
            "kotlinVersion": "1.6.10",
            "packagingOptions": {
              "pickFirst": [
                "**/libc++_shared.so"
              ]
            }
          }
        }
      ]
  ]
}
```

## JSI support for Android

This plugin installs automatically JSI support for Android builds, as per [WatermelonDB for Android instructions](https://watermelondb.dev/docs/Installation#android-react-native).
If you wish to disable JSI support during build you may add the option in config plugin:
```json
  [
    "@morrowdigital/watermelondb-expo-plugin",
    { "disableJSI": true }
  ]
```

## Build errors with M1 architectures for simulators

There have been errors building with M1 architectures for simulators on iOS, with Error:
```
No such module 'ExpoModulesCore' 
```
See these discussions:
* [https://github.com/morrowdigital/watermelondb-expo-plugin/issues/20](https://github.com/morrowdigital/watermelondb-expo-plugin/issues/20)
* [https://github.com/morrowdigital/watermelondb-expo-plugin/issues/34](https://github.com/morrowdigital/watermelondb-expo-plugin/issues/34)
* [https://github.com/facebook/react-native/issues/32704#issuecomment-1174458011](https://github.com/facebook/react-native/issues/32704#issuecomment-1174458011)

This plugin will NOT add the `arm64` in  `Exlcuded_Archs`, in SDK 50 builds:
```
'"EXCLUDED_ARCHS[sdk=iphonesimulator*]"'] = '"arm64"'
```

If you wish to add the above in configuration, you can add it with option:
```json
  [
    "@morrowdigital/watermelondb-expo-plugin",
    { "excludeSimArch": true }
  ]
```
