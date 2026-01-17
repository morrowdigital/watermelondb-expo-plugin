import {
  withXcodeProject,
  withDangerousMod,
  withSettingsGradle,
  withAppBuildGradle,
  withMainApplication,
  ExportedConfigWithProps, withGradleProperties,
} from "@expo/config-plugins";
import { ExpoConfig } from "@expo/config-types";
import filesys from "fs";
import path from "path";
import resolveFrom from "resolve-from";
import { insertLinesHelper } from "./insertLinesHelper";
import {PropertiesItem} from "@expo/config-plugins/build/android/Properties";

const fs = filesys.promises;

type Options = {
  disableJsi?: boolean;
  databases?: string[];
  excludeSimArch?: boolean;
}

function settingGradle(gradleConfig: ExpoConfig): ExpoConfig {
  return withSettingsGradle(gradleConfig, (mod) => {
    if (!mod.modResults.contents.includes(':watermelondb-jsi')) {
      mod.modResults.contents += `
          include ':watermelondb-jsi'
          project(':watermelondb-jsi').projectDir = new File([
              "node", "--print", 
              "require.resolve('@nozbe/watermelondb/package.json')"
          ].execute(null, rootProject.projectDir).text.trim(), "../native/android-jsi")
        `;
    }
    return mod;
  }) as ExpoConfig;
}

function buildGradle(config: ExpoConfig): ExpoConfig {
  return withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes("implementation project(':watermelondb-jsi')")) {
      const newContents = mod.modResults.contents.replace(
          'dependencies {',
          `dependencies {
          implementation project(':watermelondb-jsi')
          `
      )
      mod.modResults.contents = newContents;
    }

    return mod;
  }) as ExpoConfig;
}

function mainApplication(config: ExpoConfig): ExpoConfig {
  return withMainApplication(config, (mod) => {
    if (!mod.modResults.contents.includes("import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage")) {
      mod.modResults['contents'] = mod.modResults.contents.replace('import android.app.Application', `
import android.app.Application
import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage;
`);
    }

      if (!mod.modResults.contents.includes("add(WatermelonDBJSIPackage())")) {
          const newContents2 = mod.modResults.contents.replace(
              '// add(MyReactNativePackage())',
              `// add(MyReactNativePackage())
               add(WatermelonDBJSIPackage())
              `
          )
          mod.modResults.contents = newContents2;
      }

      return mod;
  }) as ExpoConfig;
}

function proGuardRules(config: ExpoConfig): ExpoConfig {
  return withDangerousMod(config, ['android', async (config) => {
    const contents = await fs.readFile(`${config.modRequest.platformProjectRoot}/app/proguard-rules.pro`, 'utf-8');
    if (!contents.includes("-keep class com.nozbe.watermelondb.** { *; }")) {
      const newContents = `
      ${contents}
      -keep class com.nozbe.watermelondb.** { *; }
      `

      await fs.writeFile(`${config.modRequest.platformProjectRoot}/app/proguard-rules.pro`, newContents);
    }

    return config;
  }]) as ExpoConfig;
}

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

const withExcludedSimulatorArchitectures = (c: ExpoConfig) : ExpoConfig=> {
  return withXcodeProject(c, (config) => {
    config.modResults = setExcludedArchitectures(config.modResults);
    return config;
  }) as ExpoConfig;
};

// @ts-ignore
export function withSDK50(options: Options) {
  return (config: ExpoConfig): ExpoConfig => {
    let currentConfig: ExpoConfig = config;
    // Android
    if (options?.disableJsi !== true) {
      currentConfig = settingGradle(config);
      currentConfig = buildGradle(currentConfig);
      currentConfig = proGuardRules(currentConfig);
      currentConfig = mainApplication(currentConfig);
    }

    // iOS
    // currentConfig = withCocoaPods(currentConfig);
    if (options?.excludeSimArch === true) {
      currentConfig = withExcludedSimulatorArchitectures(currentConfig);
    }

    return currentConfig as ExpoConfig;
  }
}

// @ts-ignore
export default (config, options) => {
    return withSDK50(options)(config);
};
