"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const withSettingGradle_1 = require("../withSettingGradle");
const withBuildGradle_1 = require("../withBuildGradle");
const withMainApplication_1 = require("../withMainApplication");
const withProGuardRules_1 = require("../withProGuardRules");
describe('Android plugin', () => {
    let settingsGradle;
    let buildGradle;
    let mainApplication;
    let proguardRules;
    beforeAll(async () => {
        settingsGradle = await promises_1.default.readFile(path_1.default.resolve(__dirname, './fixtures/settings.gradle'), 'utf-8');
        buildGradle = await promises_1.default.readFile(path_1.default.resolve(__dirname, './fixtures/app.build.gradle'), 'utf-8');
        mainApplication = await promises_1.default.readFile(path_1.default.resolve(__dirname, './fixtures/MainApplication.kt'), 'utf-8');
        proguardRules = await promises_1.default.readFile(path_1.default.resolve(__dirname, './fixtures/proguard-rules.pro'), 'utf-8');
    });
    it('should update the SettingsGradle once', async () => {
        let newSettingsGradle = (0, withSettingGradle_1.updateSettingsGradle)(settingsGradle);
        newSettingsGradle = (0, withSettingGradle_1.updateSettingsGradle)(newSettingsGradle);
        expect(newSettingsGradle).toMatchSnapshot();
    });
    it('should update the BuildGradle once', async () => {
        let newBuildGradle = (0, withBuildGradle_1.updateBuildGradle)(buildGradle);
        newBuildGradle = (0, withBuildGradle_1.updateBuildGradle)(newBuildGradle);
        expect(newBuildGradle).toMatchSnapshot();
    });
    it('should update the MainApplication once', async () => {
        let newMainApp = (0, withMainApplication_1.updateMainApplication)(mainApplication);
        newMainApp = (0, withBuildGradle_1.updateBuildGradle)(newMainApp);
        expect(newMainApp).toMatchSnapshot();
    });
    it('should update Proguard rules once', async () => {
        let newContent = (0, withProGuardRules_1.updateProGuardRules)(proguardRules);
        newContent = (0, withProGuardRules_1.updateProGuardRules)(newContent);
        expect(newContent).toMatchSnapshot();
    });
});
