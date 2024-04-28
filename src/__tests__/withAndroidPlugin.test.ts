import fs from 'fs/promises';
import path from 'path';
import {updatePodfile} from "../withCocoaPods";
import {setExcludedArchitectures} from "../withExcludedSimulatorArchitectures";
import {updateSettingsGradle} from "../withSettingGradle";
import {updateBuildGradle} from "../withBuildGradle";
import {updateMainApplication} from "../withMainApplication";
import {updateProGuardRules} from "../withProGuardRules";

describe('Android plugin', () => {
    let settingsGradle: string;
    let buildGradle: string;
    let mainApplication: string;
    let proguardRules: string;

    beforeAll(async () => {
        settingsGradle = await fs.readFile(
            path.resolve(__dirname, './fixtures/settings.gradle'),
            'utf-8');

        buildGradle = await fs.readFile(
            path.resolve(__dirname, './fixtures/app.build.gradle'),
            'utf-8');

        mainApplication = await fs.readFile(
            path.resolve(__dirname, './fixtures/MainApplication.kt'),
            'utf-8');

        proguardRules = await fs.readFile(
            path.resolve(__dirname, './fixtures/proguard-rules.pro'),
            'utf-8');

    })

    it('should update the SettingsGradle once', async () => {
        let newSettingsGradle = updateSettingsGradle(settingsGradle);
        newSettingsGradle = updateSettingsGradle(newSettingsGradle);

        expect(newSettingsGradle).toMatchSnapshot();
    })

    it('should update the BuildGradle once', async () => {
        let newBuildGradle = updateBuildGradle(buildGradle);
        newBuildGradle = updateBuildGradle(newBuildGradle);

        expect(newBuildGradle).toMatchSnapshot();
    })

    it('should update the MainApplication once', async () => {
        let newMainApp = updateMainApplication(mainApplication);
        newMainApp = updateBuildGradle(newMainApp);

        expect(newMainApp).toMatchSnapshot();
    })

    it('should update Proguard rules once', async () => {
        let newContent = updateProGuardRules(proguardRules);
        newContent = updateProGuardRules(newContent);

        expect(newContent).toMatchSnapshot();
    })
})
