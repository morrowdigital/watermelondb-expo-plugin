import {
  withXcodeProject,
  withDangerousMod,
  withSettingsGradle,
  withAppBuildGradle,
  withMainApplication,
  ExportedConfigWithProps,
} from "@expo/config-plugins";
import { ExpoConfig } from "@expo/config-types";
import filesys from "fs";
import path from "path";
import resolveFrom from "resolve-from";
import { insertLinesHelper } from "./insertLinesHelper";

const fs = filesys.promises;

type Options = {
  disableJsi?: boolean;
  databases?: string[];
}

/**
 * Platform: Android
 *  */
function setAndroidMainApplication(config: ExportedConfigWithProps) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const root = config.modRequest.platformProjectRoot;
      const filePath = `${root}/app/src/main/java/${config?.android?.package?.replace(
        /\./g,
        "/"
      )}/MainApplication.java`;

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

/**
 * Platform: Android
 *  */
function addFlipperDb(config: ExportedConfigWithProps, databases: string[]) {
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
  ]);
}

function setWmelonBridgingHeader(config: ExportedConfigWithProps) {
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
  ]);
}

const withCocoaPods = (config: ExportedConfigWithProps) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );

      const contents = await fs.readFile(filePath, "utf-8");

      const watermelonPath = isWatermelonDBInstalled(
        config.modRequest.projectRoot
      );

      if (watermelonPath) {
        const patchKey = "post_install";
        const slicedContent = contents.split(patchKey);
        slicedContent[0] += `\n
  pod 'WatermelonDB', :path => '../node_modules/@nozbe/watermelondb'
  pod 'React-jsi', :path => '../node_modules/react-native/ReactCommon/jsi', :modular_headers => true
  pod 'simdjson', path: '../node_modules/@nozbe/simdjson', :modular_headers => true\n\n  `;
        await fs.writeFile(filePath, slicedContent.join(patchKey));
      } else {
        throw new Error("Please make sure you have watermelondb installed");
      }
      return config;
    },
  ]);
};

/**
 * Exclude building for arm64 on simulator devices in the pbxproj project.
 * Without this, production builds targeting simulators will fail.
 */
// @ts-ignore
function setExcludedArchitectures(project) {
  const configurations = project.pbxXCBuildConfigurationSection();
  // @ts-ignore
  for (const { buildSettings } of Object.values(configurations || {})) {
    // Guessing that this is the best way to emulate Xcode.
    // Using `project.addToBuildSettings` modifies too many targets.
    if (
      typeof (buildSettings === null || buildSettings === void 0
        ? void 0
        : buildSettings.PRODUCT_NAME) !== "undefined"
    ) {
      buildSettings['"EXCLUDED_ARCHS[sdk=iphonesimulator*]"'] = '"arm64"';
    }
  }

  return project;
}

const withExcludedSimulatorArchitectures = (c: ExportedConfigWithProps) => {
  return withXcodeProject(c, (config) => {
    config.modResults = setExcludedArchitectures(config.modResults);
    return config;
  });
};

function isWatermelonDBInstalled(projectRoot: string) {
  const resolved = resolveFrom.silent(
    projectRoot,
    "@nozbe/watermelondb/package.json"
  );
  return resolved ? path.dirname(resolved) : null;
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

  function settingGradle(gradleConfig: ExpoConfig) {
    return withSettingsGradle(gradleConfig, (mod) => {
      if (!mod.modResults.contents.includes(':watermelondb-jsi')) {
        mod.modResults.contents += `
          include ':watermelondb-jsi'
          project(':watermelondb-jsi').projectDir =
            new File(rootProject.projectDir, '../node_modules/@nozbe/watermelondb/native/android-jsi')
        `;
      }
      return mod;
    });
  }

  function buildGradle(gradleConfig: ExpoConfig) {
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
    });
  }

  function mainApplication(mainAppConfig: ExpoConfig) {
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
    });
  }

  return mainApplication(settingGradle(buildGradle(config)));
};

// @ts-ignore
export default (config, options) => {
  config = setAndroidMainApplication(config);
  config = addFlipperDb(config, options?.databases ?? []);
  config = withWatermelonDBAndroidJSI(setWmelonBridgingHeader(config),options);
  config = withCocoaPods(config);

  config = withExcludedSimulatorArchitectures(config);

  return config;
};
