import fs from 'fs/promises';
import path from 'path';
import {updatePodfile} from "../withCocoaPods";

describe('iOS plugin', () => {
    let PodfileContents: string;

    beforeAll(async () => {
        PodfileContents = await fs.readFile(
            path.resolve(__dirname, './fixtures/Podfile'),
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

})
