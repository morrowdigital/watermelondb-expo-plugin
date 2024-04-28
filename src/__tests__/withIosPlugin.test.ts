import fs from 'fs/promises';
import path from 'path';
import {updatePodfile} from "../withCocoaPods";
import {setExcludedArchitectures} from "../withExcludedSimulatorArchitectures";

describe('iOS plugin', () => {
    let PodfileContents: string;
    let XCodeProject: { pbxXCBuildConfigurationSection: () => any};
    let XCodeProjectConfigurations: string;

    beforeAll(async () => {
        PodfileContents = await fs.readFile(
            path.resolve(__dirname, './fixtures/Podfile'),
            'utf-8');
    })

    beforeEach(async () => {
        XCodeProject = {
            pbxXCBuildConfigurationSection(){
                return JSON.parse(XCodeProjectConfigurations);
            }
        }

        XCodeProjectConfigurations = await fs.readFile(
            path.resolve(__dirname, './fixtures/xcodeproject.config.json'),
            'utf-8');

    })

    it('should update the Podfile with simdjson', async () => {
        const updatedPodfile = updatePodfile(PodfileContents);
        expect(updatedPodfile).toMatchSnapshot();
    })

    it('should update the Podfile with simdjson only once on multiple prebuilds', async () => {
        let updatedPodfile = updatePodfile(PodfileContents);
        updatePodfile(PodfileContents)
        expect(updatedPodfile).toMatchSnapshot();
    })

    it('should be able to update the XCode project with excluded architectures', async () => {
        setExcludedArchitectures(XCodeProject);

        expect(XCodeProject.pbxXCBuildConfigurationSection()).toMatchSnapshot();
    })

})
