"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withSDK50 = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const insertLinesHelper_1 = require("./insertLinesHelper");
const withCocoaPods_1 = require("./withCocoaPods");
const withExcludedSimulatorArchitectures_1 = require("./withExcludedSimulatorArchitectures");
const withSettingGradle_1 = require("./withSettingGradle");
const withBuildGradle_1 = require("./withBuildGradle");
const withMainApplication_1 = require("./withMainApplication");
const withProGuardRules_1 = require("./withProGuardRules");
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
    return mainApplication((0, withSettingGradle_1.withSettingGradle)(buildGradle(config)));
};
// @ts-ignore
function withSDK50(options) {
    return (config) => {
        let currentConfig = config;
        // Android
        if (options?.disableJsi !== true) {
            currentConfig = (0, withSettingGradle_1.withSettingGradle)(config);
            currentConfig = (0, withBuildGradle_1.withBuildGradle)(currentConfig);
            currentConfig = (0, withProGuardRules_1.proGuardRules)(currentConfig);
            currentConfig = (0, withMainApplication_1.mainApplication)(currentConfig);
        }
        // iOS
        currentConfig = (0, withCocoaPods_1.withCocoaPods)(currentConfig);
        if (options?.excludeSimArch === true) {
            currentConfig = (0, withExcludedSimulatorArchitectures_1.withExcludedSimulatorArchitectures)(currentConfig);
        }
        return currentConfig;
    };
}
exports.withSDK50 = withSDK50;
// @ts-ignore
exports.default = (config, options) => {
    if (config.sdkVersion >= '50.0.0') {
        return withSDK50(options)(config);
    }
    ;
    if (config.sdkVersion < '50.0.0') {
        config = setAndroidMainApplication(config);
        config = addFlipperDb(config, options?.databases ?? []);
        config = withWatermelonDBAndroidJSI(setWmelonBridgingHeader(config), options);
        config = (0, withCocoaPods_1.withCocoaPods)(config);
        config = (0, withExcludedSimulatorArchitectures_1.withExcludedSimulatorArchitectures)(config);
    }
    return config;
};
