# watermelon-db-plugin 🍉
Config plugin to auto configure `@nozbe/watermelondb`

## Install

> Tested against Expo SDK 48 and 49

```
yarn add @morrowdigital/watermelondb-expo-plugin

```

> Please make sure you also install   **[expo-build-properties](https://docs.expo.dev/versions/latest/sdk/build-properties/)**

After installing this npm package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`. Then rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.

If you are using Proguard (and you DON'T disable JSI), add the rule to `-keep class com.nozbe.watermelondb.** { *; }` in `expo-build-properties` 

## Example

In your app.json `plugins` array:

```json
{
  "plugins": [
      [
        "@morrowdigital/watermelondb-expo-plugin",
        {
          "databases": ["morrow.db"]
        }
      ],
      [
        "expo-build-properties",
        {
          "android": {
            "kotlinVersion": "1.6.10",
            "extraProguardRules":  "-keep class com.nozbe.watermelondb.** { *; }"
          }
        }
      ]
  ]
}
```

### Example with disabled JSI

you can use the `disableJsi: true` options, to disable JSI support if you need to (not recommended).

```json
{
  "plugins": [
      [
        "@morrowdigital/watermelondb-expo-plugin",
        {
          "databases": ["morrow.db"],
          "disableJsi": true
        }
      ],
      [
        "expo-build-properties",
        {
          "android": {
            "kotlinVersion": "1.6.10",
          }
        }
      ]
  ]
}
```

## Guide

We've written a more detailed guide on how to use this plugin within your project: https://www.themorrow.digital/blog/how-to-use-watermelondb-with-react-native-expo
