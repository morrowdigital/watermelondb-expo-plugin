"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withSDK50 = withSDK50;
const config_plugins_1 = require("@expo/config-plugins");
const fs_1 = __importDefault(require("fs"));
const fs = fs_1.default.promises;
function settingGradle(gradleConfig) {
    return (0, config_plugins_1.withSettingsGradle)(gradleConfig, (mod) => {
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
    });
}
function buildGradle(config) {
    return (0, config_plugins_1.withAppBuildGradle)(config, (mod) => {
        if (!mod.modResults.contents.includes("implementation project(':watermelondb-jsi')")) {
            const newContents = mod.modResults.contents.replace('dependencies {', `dependencies {
          implementation project(':watermelondb-jsi')
          `);
            mod.modResults.contents = newContents;
        }
        return mod;
    });
}
function mainApplication(config) {
    return (0, config_plugins_1.withMainApplication)(config, (mod) => {
        if (!mod.modResults.contents.includes("import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage")) {
            mod.modResults['contents'] = mod.modResults.contents.replace('import android.app.Application', `
import android.app.Application
import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage;
`);
        }
        if (!mod.modResults.contents.includes("add(WatermelonDBJSIPackage())")) {
            const newContents2 = mod.modResults.contents.replace('// add(MyReactNativePackage())', `// add(MyReactNativePackage())
               add(WatermelonDBJSIPackage())
              `);
            mod.modResults.contents = newContents2;
        }
        return mod;
    });
}
function mainApplicationSDK52(config) {
    return (0, config_plugins_1.withMainApplication)(config, (mod) => {
        if (!mod.modResults.contents.includes("import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage")) {
            mod.modResults['contents'] = mod.modResults.contents.replace('import android.app.Application', `
import android.app.Application
import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage;        
`);
        }
        if (!mod.modResults.contents.includes("packages.add(WatermelonDBJSIPackage())")) {
            const newContents2 = mod.modResults.contents.replace('return packages', `
            packages.add(WatermelonDBJSIPackage())
        return packages`);
            mod.modResults.contents = newContents2;
        }
        return mod;
    });
}
function proGuardRules(config) {
    return (0, config_plugins_1.withDangerousMod)(config, ['android', async (config) => {
            const contents = await fs.readFile(`${config.modRequest.platformProjectRoot}/app/proguard-rules.pro`, 'utf-8');
            if (!contents.includes("-keep class com.nozbe.watermelondb.** { *; }")) {
                const newContents = `
      ${contents}
      -keep class com.nozbe.watermelondb.** { *; }
      `;
                await fs.writeFile(`${config.modRequest.platformProjectRoot}/app/proguard-rules.pro`, newContents);
            }
            return config;
        }]);
}
// const withCocoaPods = (config: ExpoConfig): ExpoConfig => {
//   return withDangerousMod(config, [
//     "ios",
//     async (config) => {
//       const filePath = path.join(
//         config.modRequest.platformProjectRoot,
//         "Podfile"
//       );
//
//       const contents = await fs.readFile(filePath, "utf-8");
//
//       const watermelonPath = isWatermelonDBInstalled(
//         config.modRequest.projectRoot
//       );
//
//       if (watermelonPath) {
//         if (!contents.includes("pod 'simdjson'")) {
//           const patchKey = "post_install";
//           const slicedContent = contents.split(patchKey);
//           slicedContent[0] += `\n
//   pod 'simdjson', path: File.join(File.dirname(\`node --print "require.resolve('@nozbe/simdjson/package.json')"\`)), :modular_headers => true \n\n  `;
//           await fs.writeFile(filePath, slicedContent.join(patchKey));
//         }
//       } else {
//         throw new Error("Please make sure you have watermelondb installed");
//       }
//       return config;
//     },
//   ]) as ExpoConfig;
// };
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
        if (typeof (buildSettings === null || buildSettings === void 0
            ? void 0
            : buildSettings.PRODUCT_NAME) !== "undefined") {
            buildSettings['"EXCLUDED_ARCHS[sdk=iphonesimulator*]"'] = '"arm64"';
        }
    }
    return project;
}
const withExcludedSimulatorArchitectures = (c) => {
    return (0, config_plugins_1.withXcodeProject)(c, (config) => {
        config.modResults = setExcludedArchitectures(config.modResults);
        return config;
    });
};
// function isWatermelonDBInstalled(projectRoot: string) {
//   const resolved = resolveFrom.silent(
//     projectRoot,
//     "@nozbe/watermelondb/package.json"
//   );
//   return resolved ? path.dirname(resolved) : null;
// }
// function getPlatformProjectFilePath(
//   config: ExportedConfigWithProps,
//   fileName: string
// ) {
//   const projectName =
//     config.modRequest.projectName || config.name.replace(/[- ]/g, "");
//   return path.join(
//     config.modRequest.platformProjectRoot,
//     projectName,
//     fileName
//   );
// }
// @ts-ignore
function withSDK50(options) {
    return (config) => {
        let currentConfig = config;
        // Android
        if (options?.disableJsi !== true) {
            currentConfig = settingGradle(config);
            currentConfig = buildGradle(currentConfig);
            currentConfig = proGuardRules(currentConfig);
            // Only manual link package on sdk 52+ as descripted here:
            // https://github.com/Nozbe/WatermelonDB/issues/1769#issuecomment-2600274652
            currentConfig = config.sdkVersion && config.sdkVersion >= '52.0.0' ?
                mainApplicationSDK52(currentConfig) : mainApplication(currentConfig);
        }
        // iOS
        // currentConfig = withCocoaPods(currentConfig);
        if (options?.excludeSimArch === true) {
            currentConfig = withExcludedSimulatorArchitectures(currentConfig);
        }
        return currentConfig;
    };
}
// @ts-ignore
exports.default = (config, options) => {
    return withSDK50(options)(config);
};
