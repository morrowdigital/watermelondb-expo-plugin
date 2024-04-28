import fs from 'fs/promises';
import path from 'path';
import {updatePodfile} from "../withCocoaPods";
import {setExcludedArchitectures} from "../withExcludedSimulatorArchitectures";

describe('iOS plugin', () => {
    let PodfileContents: string;

    // TODO: Can this be typed better?
    let XCodeProject: {
        pbxXCBuildConfigurationSection: () => any
    };
    // TODO: Can this be typed better?
    let XCodeProjectConfigurations: object;
    let XCodeProjectConfigurationsFixture: string;

    beforeAll(async () => {
        PodfileContents = await fs.readFile(
            path.resolve(__dirname, './fixtures/Podfile'),
            'utf-8');

        XCodeProjectConfigurationsFixture = await fs.readFile(
            // Contents of this json file were obtained from a vanilla expo project
            path.resolve(__dirname, './fixtures/xcodeproject.config.json'),
            'utf-8');

    })

    beforeEach(async () => {
        XCodeProjectConfigurations = JSON.parse(XCodeProjectConfigurationsFixture);
        XCodeProject = {
            pbxXCBuildConfigurationSection(){
                return XCodeProjectConfigurations;
            }
        }


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

    it('should be able to update the XCode project even if run twice', async () => {
        setExcludedArchitectures(XCodeProject);
        setExcludedArchitectures(XCodeProject);
        expect(XCodeProject.pbxXCBuildConfigurationSection()).toMatchSnapshot();
    })


})
