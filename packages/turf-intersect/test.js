import path from 'path';
import fs from 'fs';
import test from 'tape';
import load from 'load-json-file';
import write from 'write-json-file';
import { feature } from '@spatial/helpers';
import intersect from '.';

const directories = {
    in: path.join(__dirname, 'test', 'in') + path.sep,
    out: path.join(__dirname, 'test', 'out') + path.sep
};

const fixtures = fs.readdirSync(directories.in).map(filename => {
    return {
        filename,
        name: path.parse(filename).name,
        geojson: load.sync(directories.in + filename)
    };
});

test('intersect', t => {
    for (const {name, geojson, filename} of fixtures) {
        const features = geojson.features;
        let result = intersect(features[0], features[1]);
        if (!result) result = feature(null);

        if (process.env.REGEN) write.sync(directories.out + filename, result);
        t.deepEqual(result, load.sync(directories.out + filename), name);
    }
    t.end();
});
