"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBuildGradle = exports.withBuildGradle = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const replaceValue = `
dependencies {
     implementation project(':watermelondb-jsi') 
`;
function withBuildGradle(config) {
    return (0, config_plugins_1.withAppBuildGradle)(config, (mod) => {
        mod.modResults.contents = updateBuildGradle(mod.modResults.contents);
        return mod;
    });
}
exports.withBuildGradle = withBuildGradle;
function updateBuildGradle(content) {
    let newContent = content;
    if (!content.includes("implementation project(':watermelondb-jsi')")) {
        newContent = content.replace('dependencies {', replaceValue);
    }
    return newContent;
}
exports.updateBuildGradle = updateBuildGradle;
