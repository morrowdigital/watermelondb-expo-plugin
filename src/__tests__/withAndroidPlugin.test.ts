import fs from 'fs/promises';
import path from 'path';
import {updatePodfile} from "../withCocoaPods";
import {setExcludedArchitectures} from "../withExcludedSimulatorArchitectures";
import {updateSettingsGradle} from "../withSettingGradle";

describe('Android plugin', () => {
    let settingsGradle: string;

    beforeAll(async () => {
        settingsGradle = await fs.readFile(
            path.resolve(__dirname, './fixtures/settings.gradle'),
            'utf-8');
    })

    it('should update the SettingsGradle once', async () => {
        let newSettingsGradle = updateSettingsGradle(settingsGradle);
        newSettingsGradle = updateSettingsGradle(newSettingsGradle);

        expect(newSettingsGradle).toMatchSnapshot();
    })
})
