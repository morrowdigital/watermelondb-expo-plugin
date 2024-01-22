"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withSDK50 = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const resolve_from_1 = __importDefault(require("resolve-from"));
const insertLinesHelper_1 = require("./insertLinesHelper");
const fs = fs_1.default.promises;
/**
 * Version 50+
 *  */
function setAndroidMainApplication(config) {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "android",
        async (config) => {
            // @ts-ignore
            const extension = config.sdkVersion >= '50.0.0' ? 'kt' : 'java';
            const root = config.modRequest.platformProjectRoot;
            const filePath = `${root}/app/src/main/java/${config?.android?.package?.replace(/\./g, "/")}/MainApplication.${extension}`;
            const contents = await fs.readFile(filePath, "utf-8");
            let updated = (0, insertLinesHelper_1.insertLinesHelper)("import com.nozbe.watermelondb.WatermelonDBPackage;", "import java.util.List;", contents);
            await fs.writeFile(filePath, updated);
            return config;
        },
    ]);
}
function settingGradle(gradleConfig) {
    return (0, config_plugins_1.withSettingsGradle)(gradleConfig, (mod) => {
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
function buildGradle(config) {
    return (0, config_plugins_1.withAppBuildGradle)(config, (mod) => {
        const newContents = mod.modResults.contents.replace('dependencies {', `dependencies {
        implementation project(':watermelondb-jsi')
        `);
        mod.modResults.contents = newContents;
        return mod;
    });
}
const cocoaPods = (config) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            const filePath = path_1.default.join(config.modRequest.platformProjectRoot, "Podfile");
            const contents = await fs.readFile(filePath, "utf-8");
            const newContents = contents.replace('post_install do |installer|', `
          
    # WatermelonDB dependency
    pod 'simdjson', path: '../node_modules/@nozbe/simdjson', modular_headers: true          
    
    post_install do |installer|`);
            await fs.writeFile(filePath, newContents);
            return config;
        },
    ]);
};
function mainApplication(config) {
    return (0, config_plugins_1.withMainApplication)(config, (mod) => {
        mod.modResults['contents'] = mod.modResults.contents.replace('import android.app.Application', `
import android.app.Application
import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage;
import com.facebook.react.bridge.JSIModulePackage;        
`);
        const newContents2 = mod.modResults.contents.replace('override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED', `
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        override fun getJSIModulePackage(): JSIModulePackage {
        return WatermelonDBJSIPackage()
        }`);
        mod.modResults.contents = newContents2;
        return mod;
    });
}
function proGuardRules(config) {
    return (0, config_plugins_1.withDangerousMod)(config, ['android', async (config) => {
            const contents = await fs.readFile(`${config.modRequest.platformProjectRoot}/app/proguard-rules.pro`, 'utf-8');
            const newContents = `
    ${contents}
    -keep class com.nozbe.watermelondb.** { *; }
    `;
            await fs.writeFile(`${config.modRequest.platformProjectRoot}/app/proguard-rules.pro`, newContents);
            return config;
        }]);
}
/**
 * Version 50+ finish
 *  */
/**
 * Platform: Android
 *  */
function addFlipperDb(config, databases) {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "android",
        async (config) => {
            // short circuit if no databases specified
            if (!databases?.length)
                return config;
            const root = config.modRequest.platformProjectRoot;
            const filePath = `${root}/app/src/debug/java/${config?.android?.package?.replace(/\./g, "/")}/ReactNativeFlipper.java`;
            const contents = await fs.readFile(filePath, "utf-8");
            // Add imports
            let updated = (0, insertLinesHelper_1.insertLinesHelper)(`import com.facebook.flipper.plugins.databases.impl.SqliteDatabaseDriver;
import com.facebook.flipper.plugins.databases.impl.SqliteDatabaseProvider;
import java.io.File;
import java.util.List;
import java.util.ArrayList;`, "import okhttp3.OkHttpClient;", contents);
            // Replace DatabasesFlipperPlugin with custom driver
            const addDatabases = databases
                .map((d) => `databaseFiles.add(new File(context.getDatabasePath("${d}").getPath().replace("/databases", "")));`)
                .join("\n          ");
            updated = (0, insertLinesHelper_1.insertLinesHelper)(`      client.addPlugin(new DatabasesFlipperPlugin(new SqliteDatabaseDriver(context, new SqliteDatabaseProvider() {
        @Override
        public List<File> getDatabaseFiles() {
          List<File> databaseFiles = new ArrayList<>();
          for (String databaseName : context.databaseList()) {
            databaseFiles.add(context.getDatabasePath(databaseName));
          }
          ${addDatabases}
          return databaseFiles;
        }
      })));`, "client.addPlugin(new DatabasesFlipperPlugin(context));", updated, 0, // replace original plugin
            1);
            await fs.writeFile(filePath, updated);
            return config;
        },
    ]);
}
function setWmelonBridgingHeader(config) {
    return (0, config_plugins_1.withDangerousMod)(config, [
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
const withCocoaPods = (config) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            const filePath = path_1.default.join(config.modRequest.platformProjectRoot, "Podfile");
            const contents = await fs.readFile(filePath, "utf-8");
            const watermelonPath = isWatermelonDBInstalled(config.modRequest.projectRoot);
            if (watermelonPath) {
                const patchKey = "post_install";
                const slicedContent = contents.split(patchKey);
                slicedContent[0] += `\n
  pod 'WatermelonDB', :path => '../node_modules/@nozbe/watermelondb'
  pod 'React-jsi', :path => '../node_modules/react-native/ReactCommon/jsi', :modular_headers => true
  pod 'simdjson', path: '../node_modules/@nozbe/simdjson', :modular_headers => true\n\n  `;
                await fs.writeFile(filePath, slicedContent.join(patchKey));
            }
            else {
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
function isWatermelonDBInstalled(projectRoot) {
    const resolved = resolve_from_1.default.silent(projectRoot, "@nozbe/watermelondb/package.json");
    return resolved ? path_1.default.dirname(resolved) : null;
}
function getPlatformProjectFilePath(config, fileName) {
    const projectName = config.modRequest.projectName || config.name.replace(/[- ]/g, "");
    return path_1.default.join(config.modRequest.platformProjectRoot, projectName, fileName);
}
const withWatermelonDBAndroidJSI = (config, options) => {
    if (options?.disableJsi === true) {
        return config;
    }
    ;
    function buildGradle(gradleConfig) {
        return (0, config_plugins_1.withAppBuildGradle)(gradleConfig, (mod) => {
            if (!mod.modResults.contents.includes("pickFirst '**/libc++_shared.so'")) {
                mod.modResults.contents = mod.modResults.contents.replace('android {', `
          android {
            packagingOptions {
               pickFirst '**/libc++_shared.so' 
            }
          `);
            }
            if (!mod.modResults.contents.includes("implementation project(':watermelondb-jsi')")) {
                mod.modResults.contents = mod.modResults.contents.replace('dependencies {', `
          dependencies {
            implementation project(':watermelondb-jsi')
          `);
            }
            return mod;
        });
    }
    function mainApplication(mainAppConfig) {
        return (0, config_plugins_1.withMainApplication)(mainAppConfig, (mod) => {
            if (!mod.modResults.contents.includes('import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage;')) {
                mod.modResults.contents = mod.modResults.contents.replace('import com.nozbe.watermelondb.WatermelonDBPackage;', `
          import com.nozbe.watermelondb.WatermelonDBPackage;
          import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage;
          import com.facebook.react.bridge.JSIModulePackage;
        `);
            }
            if (!mod.modResults.contents.includes('return new WatermelonDBJSIPackage()')) {
                mod.modResults.contents = mod.modResults.contents.replace('new ReactNativeHostWrapper(this, new DefaultReactNativeHost(this) {', `
          new ReactNativeHostWrapper(this, new DefaultReactNativeHost(this) {
            @Override
             protected JSIModulePackage getJSIModulePackage() {
               return new WatermelonDBJSIPackage(); 
             }
          `);
            }
            return mod;
        });
    }
    return mainApplication(settingGradle(buildGradle(config)));
};
// @ts-ignore
function withSDK50(config) {
    // Android
    let currentConfig = settingGradle(config);
    currentConfig = buildGradle(currentConfig);
    currentConfig = proGuardRules(currentConfig);
    currentConfig = mainApplication(currentConfig);
    // iOS
    currentConfig = setWmelonBridgingHeader(currentConfig);
    currentConfig = withCocoaPods(currentConfig);
    currentConfig = withExcludedSimulatorArchitectures(currentConfig);
    return currentConfig;
}
exports.withSDK50 = withSDK50;
// @ts-ignore
exports.default = (config, options) => {
    if (config.sdkVersion >= '50.0.0') {
        return withSDK50(config);
    }
    ;
    if (config.sdkVersion < '50.0.0') {
        config = setAndroidMainApplication(config);
        config = addFlipperDb(config, options?.databases ?? []);
        config = withWatermelonDBAndroidJSI(setWmelonBridgingHeader(config), options);
        config = withCocoaPods(config);
        config = withExcludedSimulatorArchitectures(config);
    }
    return config;
};
