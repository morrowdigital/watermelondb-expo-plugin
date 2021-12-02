"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const resolve_from_1 = __importDefault(require("resolve-from"));
const insertLinesHelper_1 = require("./insertLinesHelper");
const fs = fs_1.default.promises;
/**
 * Platform: Android
 *  */
function setAppBuildGradle(config) {
    return (0, config_plugins_1.withAppBuildGradle)(config, (config) => {
        config.modResults.contents = replace(config.modResults.contents, 
        // @ts-ignore
        /dependencies\s{/, `dependencies {
\timplementation project(':watermelondb')`);
        return config;
    });
}
function setAppSettingBuildGradle(config) {
    return (0, config_plugins_1.withSettingsGradle)(config, (config) => {
        config.modResults.contents = config.modResults.contents.replace(`include ':app'`, `
include ':watermelondb'
project(':watermelondb').projectDir =new File(rootProject.projectDir, '../node_modules/@nozbe/watermelondb/native/android')
            
include ':app'
            `);
        return config;
    });
}
function setAndroidMainApplication(config) {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "android",
        async (config) => {
            var _a, _b;
            const root = config.modRequest.platformProjectRoot;
            const filePath = `${root}/app/src/main/java/${(_b = (_a = config === null || config === void 0 ? void 0 : config.android) === null || _a === void 0 ? void 0 : _a.package) === null || _b === void 0 ? void 0 : _b.replace(/\./g, "/")}/MainApplication.java`;
            const contents = await fs.readFile(filePath, "utf-8");
            let updated = (0, insertLinesHelper_1.insertLinesHelper)("import com.nozbe.watermelondb.WatermelonDBPackage;", "import java.util.List;", contents);
            await fs.writeFile(filePath, updated);
            return config;
        },
    ]);
}
/**
 * Platform: iOS
 *  */
function setAppDelegate(config) {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            const filePath = path_1.default.join(config.modRequest.platformProjectRoot, config.name.replace("-", ""), "AppDelegate.h");
            const contents = await fs.readFile(filePath, "utf-8");
            let updated = `#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>

// Silence warning
#import "../../node_modules/@nozbe/watermelondb/native/ios/WatermelonDB/SupportingFiles/Bridging.h"\n
            ` + contents;
            await fs.writeFile(filePath, updated);
            return config;
        },
    ]);
}
function setWmelonBridgingHeader(config) {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            const filePath = path_1.default.join(config.modRequest.projectRoot + "/ios", config.name.replace("-", ""), "wmelon.swift");
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
                await fs.writeFile(filePath, `
pod 'WatermelonDB', :path => '../node_modules/@nozbe/watermelondb'
pod 'React-jsi', :path => '../node_modules/react-native/ReactCommon/jsi', :modular_headers => true
pod 'simdjson', path: '../node_modules/@nozbe/simdjson'\n
                ` + contents);
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
function replace(contents, match, replace) {
    // @ts-ignore
    if (!(match.test ? RegExp(match).test(contents) : contents.includes(match)))
        throw new Error("Invalid text replace in config");
    return contents.replace(match, replace);
}
// @ts-ignore
exports.default = (config) => {
    config = setAppSettingBuildGradle(config);
    config = setAppBuildGradle(config);
    config = setAndroidMainApplication(config);
    config = setAppDelegate(config);
    config = setWmelonBridgingHeader(config);
    config = withCocoaPods(config);
    config = withExcludedSimulatorArchitectures(config);
    return config;
};
