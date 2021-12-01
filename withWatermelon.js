const {
    withAppBuildGradle,
    withXcodeProject,
    withDangerousMod,
    withSettingsGradle,
    withMainApplication
} = require("@expo/config-plugins")
const fs = require("fs").promises
const path = require("path")
const resolveFrom = require('resolve-from');
const insertLinesHelper = require("./insertLinesHelper");


/**
 * Platform: Android
 *  */
function setAppBuildGradle(config) {
    return withAppBuildGradle(config, config => {
        config.modResults.contents = replace(
            config.modResults.contents,
            /dependencies\s{/,
            `dependencies {
\timplementation project(':watermelondb')`)

        return config
    })
}

function setAppSettingBuildGradle(config) {
    return withSettingsGradle(config, config => {
        config.modResults.contents = config.modResults.contents.replace(
            `include ':app'`,
            `
include ':watermelondb'
project(':watermelondb').projectDir =new File(rootProject.projectDir, '../node_modules/@nozbe/watermelondb/native/android')
            
include ':app'
            `
        );

        return config
    })
}

function setAndroidMainApplication(config) {
    return withDangerousMod(config, [
        "android",
        async config => {
            const root = config.modRequest.platformProjectRoot;
            const filePath = `${root}/app/src/main/java/${config.android.package.replace(/\./g, '/')}/MainApplication.java`

            const contents = await fs.readFile(filePath, "utf-8")

            let updated = insertLinesHelper(
                "import com.nozbe.watermelondb.WatermelonDBPackage;",
                "import java.util.List;",
                contents
            );

            await fs.writeFile(filePath, updated)

            return config
        },
    ])
}




/**
 * Platform: iOS
 *  */
function setAppDelegate(config) {
    return withDangerousMod(config, [
        "ios",
        async config => {
            const filePath = path.join(
                config.modRequest.platformProjectRoot,
                config.name.replace("-", ""),
                "AppDelegate.h"
            )
            const contents = await fs.readFile(filePath, "utf-8")

            let updated = `#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>

// Silence warning
#import "../../node_modules/@nozbe/watermelondb/native/ios/WatermelonDB/SupportingFiles/Bridging.h"\n
            ` + contents


            await fs.writeFile(filePath, updated)

            return config
        },
    ])
}

function setWmelonBridgingHeader(config) {
    return withDangerousMod(config, [
        "ios",
        async config => {
            const filePath = path.join(
                config.modRequest.projectRoot + "/ios",
                config.name.replace("-", ""),
                "wmelon.swift"
            )

            const contents = `
//
//  water.swift
//  watermelonDB
//
//  Created by Watermelon-plugin on ${new Date().toLocaleDateString()}.
//

import Foundation`

            await fs.writeFile(filePath, contents)

            return config
        },
    ])
}

const withCocoaPods = (config) => {
    return withDangerousMod(config, [
        'ios',
        async config => {
            const filePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
            console.error(filePath)
            const contents = await fs.readFile(filePath, 'utf-8');

            const watermelonPath = isWatermelonDBInstalled(config.modRequest.projectRoot);
            console.error('@nozbe/watermelondb path:', watermelonPath);

            if (watermelonPath) {

                await fs.writeFile(filePath, `
pod 'WatermelonDB', :path => '../node_modules/@nozbe/watermelondb'
pod 'React-jsi', :path => '../node_modules/react-native/ReactCommon/jsi', :modular_headers => true
pod 'simdjson', path: '../node_modules/@nozbe/simdjson'\n
                ` + contents);
            } else {
                throw new Error('Please make sure you have watermelondb installed')
            }
            return config;
        },
    ]);
};


/**
 * Exclude building for arm64 on simulator devices in the pbxproj project.
 * Without this, production builds targeting simulators will fail.
 */
function setExcludedArchitectures(project) {
    const configurations = project.pbxFrameworksBuildPhaseObj();
    // configurations.files = []

    return project;
}

const withExcludedSimulatorArchitectures = (c) => {
    return withXcodeProject(c, (config) => {
        config.modResults = setExcludedArchitectures(config.modResults);
        return config;
    });
};

function isWatermelonDBInstalled(projectRoot) {
    const resolved = resolveFrom.silent(projectRoot, '@nozbe/watermelondb/package.json');
    return resolved ? path.dirname(resolved) : null;
}


function replace(contents, match, replace) {
    if (!(match.test ? RegExp(match).test(contents) : contents.includes(match)))
        throw new Error("Invalid text replace in config")

    return contents.replace(match, replace)
}

module.exports = (config,) => {
    config = setAppSettingBuildGradle(config)
    config = setAppBuildGradle(config)
    config = setAndroidMainApplication(config,)
    config = setAppDelegate(config)
    config = setWmelonBridgingHeader(config)
    config = withCocoaPods(config)
    config = withExcludedSimulatorArchitectures(config)
    return config
}