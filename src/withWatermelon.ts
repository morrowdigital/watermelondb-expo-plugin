import {
  ExportedConfigWithProps,
  withAppBuildGradle,
  withDangerousMod,
  withMainApplication,
} from "@expo/config-plugins";
import {ExpoConfig} from "@expo/config-types";
import filesys from "fs";
import path from "path";
import {insertLinesHelper} from "./insertLinesHelper";
import {withCocoaPods} from "./withCocoaPods";
import {withExcludedSimulatorArchitectures} from "./withExcludedSimulatorArchitectures";
import {withSettingGradle} from "./withSettingGradle";
import {withBuildGradle} from "./withBuildGradle";
import {mainApplication} from "./withMainApplication";
import {proGuardRules} from "./withProGuardRules";

const fs = filesys.promises;

type Options = {
  disableJsi?: boolean;
  databases?: string[];
  excludeSimArch?: boolean;
}

/**
 * Version 50+
 *  */
function setAndroidMainApplication(config: ExportedConfigWithProps) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      // @ts-ignore
      const extension = config.sdkVersion >= '50.0.0' ? 'kt' : 'java';
      const root = config.modRequest.platformProjectRoot;
      const filePath = `${root}/app/src/main/java/${config?.android?.package?.replace(
        /\./g,
        "/"
      )}/MainApplication.${extension}`;

      const contents = await fs.readFile(filePath, "utf-8");

      let updated = insertLinesHelper(
        "import com.nozbe.watermelondb.WatermelonDBPackage;",
        "import java.util.List;",
        contents
      );

      await fs.writeFile(filePath, updated);

      return config;
    },
  ]);
}

const cocoaPods = (config: ExpoConfig): ExpoConfig => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const filePath = path.join(
          config.modRequest.platformProjectRoot,
          "Podfile"
      );

      const contents = await fs.readFile(filePath, "utf-8");
      const newContents=contents.replace(
          'post_install do |installer|',`
          
    # WatermelonDB dependency
    pod 'simdjson', path: '../node_modules/@nozbe/simdjson', modular_headers: true          
    
    post_install do |installer|`
      );
        await fs.writeFile(filePath, newContents);
        return config;
    },
  ]) as ExpoConfig;
};

/**
 * Version 50+ finish
 *  */

/**
 * Platform: Android
 *  */
function addFlipperDb(config: ExpoConfig, databases: string[]) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      // short circuit if no databases specified
      if (!databases?.length) return config;

      const root = config.modRequest.platformProjectRoot;
      const filePath = `${root}/app/src/debug/java/${config?.android?.package?.replace(
        /\./g,
        "/"
      )}/ReactNativeFlipper.java`;

      const contents = await fs.readFile(filePath, "utf-8");

      // Add imports

      let updated = insertLinesHelper(
        `import com.facebook.flipper.plugins.databases.impl.SqliteDatabaseDriver;
import com.facebook.flipper.plugins.databases.impl.SqliteDatabaseProvider;
import java.io.File;
import java.util.List;
import java.util.ArrayList;`,
        "import okhttp3.OkHttpClient;",
        contents
      );

      // Replace DatabasesFlipperPlugin with custom driver

      const addDatabases = databases
        .map(
          (d) =>
            `databaseFiles.add(new File(context.getDatabasePath("${d}").getPath().replace("/databases", "")));`
        )
        .join("\n          ");

      updated = insertLinesHelper(
        `      client.addPlugin(new DatabasesFlipperPlugin(new SqliteDatabaseDriver(context, new SqliteDatabaseProvider() {
        @Override
        public List<File> getDatabaseFiles() {
          List<File> databaseFiles = new ArrayList<>();
          for (String databaseName : context.databaseList()) {
            databaseFiles.add(context.getDatabasePath(databaseName));
          }
          ${addDatabases}
          return databaseFiles;
        }
      })));`,
        "client.addPlugin(new DatabasesFlipperPlugin(context));",
        updated,
        0, // replace original plugin
        1
      );

      await fs.writeFile(filePath, updated);

      return config;
    },
  ]) as ExpoConfig;
}

function setWmelonBridgingHeader(config: ExpoConfig): ExpoConfig {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const filePath = getPlatformProjectFilePath(config, "wmelon.swift");
      const contents = `
//
//  water.swift
//  watermelonDB
//
//  Created by Watermelon-plugin on ${new Date().toLocaleDateString()}.
//

import Foundation`;

      await fs.writeFile(filePath, contents);

      return config;
    },
  ]) as ExpoConfig;
}

function getPlatformProjectFilePath(
  config: ExportedConfigWithProps,
  fileName: string
) {
  const projectName =
    config.modRequest.projectName || config.name.replace(/[- ]/g, "");
  return path.join(
    config.modRequest.platformProjectRoot,
    projectName,
    fileName
  );
}

const withWatermelonDBAndroidJSI = (config: ExpoConfig, options: Options) => {
  if (options?.disableJsi === true) {
    return config;
  };

  function buildGradle(gradleConfig: ExpoConfig): ExpoConfig {
    return withAppBuildGradle(gradleConfig, (mod) => {
      if (
          !mod.modResults.contents.includes("pickFirst '**/libc++_shared.so'")
      ) {
        mod.modResults.contents = mod.modResults.contents.replace(
            'android {',
            `
          android {
            packagingOptions {
               pickFirst '**/libc++_shared.so' 
            }
          `
        );
      }
      if (
          !mod.modResults.contents.includes(
              "implementation project(':watermelondb-jsi')"
          )
      ) {
        mod.modResults.contents = mod.modResults.contents.replace(
            'dependencies {',
            `
          dependencies {
            implementation project(':watermelondb-jsi')
          `
        );
      }
      return mod;
    }) as ExpoConfig;
  }

  function mainApplication(mainAppConfig: ExpoConfig): ExpoConfig {
    return withMainApplication(mainAppConfig, (mod) => {
      if (
          !mod.modResults.contents.includes(
              'import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage;'
          )
      ) {
        mod.modResults.contents = mod.modResults.contents.replace(
            'import com.nozbe.watermelondb.WatermelonDBPackage;',
            `
          import com.nozbe.watermelondb.WatermelonDBPackage;
          import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage;
          import com.facebook.react.bridge.JSIModulePackage;
        `
        );
      }
      if (
          !mod.modResults.contents.includes('return new WatermelonDBJSIPackage()')
      ) {
        mod.modResults.contents = mod.modResults.contents.replace(
            'new ReactNativeHostWrapper(this, new DefaultReactNativeHost(this) {',
            `
          new ReactNativeHostWrapper(this, new DefaultReactNativeHost(this) {
            @Override
             protected JSIModulePackage getJSIModulePackage() {
               return new WatermelonDBJSIPackage(); 
             }
          `
        );
      }
      return mod;
    }) as ExpoConfig;
  }

  return mainApplication(withSettingGradle(buildGradle(config)));
};


// @ts-ignore
export function withSDK50(options: Options) {
  return (config: ExpoConfig): ExpoConfig => {
    let currentConfig: ExpoConfig = config;
    // Android
    if (options?.disableJsi !== true) {
      currentConfig = withSettingGradle(config);
      currentConfig = withBuildGradle(currentConfig);
      currentConfig = proGuardRules(currentConfig);
      currentConfig = mainApplication(currentConfig);
    }

    // iOS
    currentConfig = withCocoaPods(currentConfig);
    if (options?.excludeSimArch === true) {
      currentConfig = withExcludedSimulatorArchitectures(currentConfig);
    }

    return currentConfig as ExpoConfig;
  }
}

// @ts-ignore
export default (config, options) => {
  if (config.sdkVersion >= '50.0.0') {
    return withSDK50(options)(config);
  };

  if (config.sdkVersion < '50.0.0') {
    config = setAndroidMainApplication(config);
    config = addFlipperDb(config, options?.databases ?? []);
    config = withWatermelonDBAndroidJSI(setWmelonBridgingHeader(config), options);
    config = withCocoaPods(config);
    config = withExcludedSimulatorArchitectures(config);
  }

  return config;
};
