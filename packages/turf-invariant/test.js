import test from 'tape';
import { point, lineString, polygon, featureCollection, geometryCollection } from '@spatial/helpers';
import * as invariant from './index';

test('invariant -- containsNumber', t => {
    t.equals(invariant.containsNumber([1, 1]), true);
    t.equals(invariant.containsNumber([[1, 1], [1, 1]]), true);
    t.equals(invariant.containsNumber([[[1, 1], [1, 1]], [1, 1]]), true);

    //# Ensure recursive call handles Max callstack exceeded
    t.throws(() => {
        invariant.containsNumber(['foo', 1]);
    }, /coordinates must only contain numbers/, 'Must only contain numbers');
    t.end();
});

test('invariant -- geojsonType', t => {
    t.throws(() => {
        invariant.geojsonType();
    }, /type and name required/, '.geojsonType() name requirement');

    t.throws(() => {
        invariant.geojsonType({}, undefined, 'myfn');
    }, /type and name required/, 'invalid types');

    t.throws(() => {
        invariant.geojsonType({
            type: 'Point',
            coordinates: [0, 0]
        }, 'Polygon', 'myfn');
    }, /Invalid input to myfn: must be a Polygon, given Point/, 'invalid geometry type');

    t.doesNotThrow(() => {
        invariant.geojsonType({
            type: 'Point',
            coordinates: [0, 0]
        }, 'Point', 'myfn');
    }, 'valid geometry');

    t.end();
});

test('invariant -- featureOf', t => {
    t.throws(() => {
        invariant.featureOf({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [0, 0]
            },
            properties: {}
        }, 'Polygon');
    }, /requires a name/, 'requires a name');

    t.throws(() => {
        invariant.featureOf({}, 'Polygon', 'foo');
    }, /Feature with geometry required/, 'requires a feature');

    t.throws(() => {
        invariant.featureOf({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [0, 0]
            },
            properties: {}
        }, 'Polygon', 'myfn');
    }, /Invalid input to myfn: must be a Polygon, given Point/, 'invalid geometry type');

    t.doesNotThrow(() => {
        invariant.featureOf({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [0, 0]
            },
            properties: {}
        }, 'Point', 'myfn');
    }, 'valid geometry type');

    t.end();
});

test('invariant -- collectionOf', t => {
    t.throws(() => {
        invariant.collectionOf({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 0]
                    },
                    properties: {}
                }
            ]
        }, 'Polygon', 'myfn');
    }, /Invalid input to myfn: must be a Polygon, given Point/, 'invalid geometry type');

    t.throws(() => {
        invariant.collectionOf({}, 'Polygon');
    }, /requires a name/, 'requires a name');

    t.throws(() => {
        invariant.collectionOf({}, 'Polygon', 'foo');
    }, /FeatureCollection required/, 'requires a featurecollection');

    t.doesNotThrow(() => {
        invariant.collectionOf({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 0]
                    },
                    properties: {}
                }
            ]
        }, 'Point', 'myfn');
    }, 'valid geometry type');

    t.end();
});

test('invariant -- getCoord', t => {
    t.throws(() => invariant.getCoord(lineString([[1, 2], [3, 4]])));
    t.throws(() => invariant.getCoord(polygon([[[-75, 40], [-80, 50], [-70, 50], [-75, 40]]])));

    t.deepEqual(invariant.getCoord({
        type: 'Point',
        coordinates: [1, 2]
    }), [1, 2]);

    t.deepEqual(invariant.getCoord(point([1, 2])), [1, 2]);
    t.end();
});

test('invariant -- getCoord', t => {
    t.throws(() => invariant.getCoord({
        type: 'LineString',
        coordinates: [[1, 2], [3, 4]]
    }));

    t.throws(() => invariant.getCoord(false));
    t.throws(() => invariant.getCoord(null));
    t.throws(() => invariant.getCoord(lineString([[1, 2], [3, 4]])));
    t.throws(() => invariant.getCoord(['A', 'B', 'C']));
    t.throws(() => invariant.getCoord([1, 'foo', 'bar']));

    t.deepEqual(invariant.getCoord({
        type: 'Point',
        coordinates: [1, 2]
    }), [1, 2]);

    t.deepEqual(invariant.getCoord(point([1, 2])), [1, 2]);
    t.deepEqual(invariant.getCoord([1, 2]), [1, 2]);
    t.end();
});

test('invariant -- getCoords', t => {
    t.throws(() => invariant.getCoords({
        type: 'LineString',
        coordinates: null
    }));

    t.throws(() => invariant.getCoords(false));
    t.throws(() => invariant.getCoords(null));
    t.throws(() => invariant.getCoords(['A', 'B', 'C']));
    t.throws(() => invariant.getCoords([1, 'foo', 'bar']));

    t.deepEqual(invariant.getCoords({
        type: 'LineString',
        coordinates: [[1, 2], [3, 4]]
    }), [[1, 2], [3, 4]]);

    t.deepEqual(invariant.getCoords(point([1, 2])), [1, 2]);
    t.deepEqual(invariant.getCoords(lineString([[1, 2], [3, 4]])), [[1, 2], [3, 4]]);
    t.deepEqual(invariant.getCoords([1, 2]), [1, 2]);
    t.end();
});

test('invariant -- getGeom', t => {
    const pt = point([1, 1]);
    const line = lineString([[0, 1], [1, 1]]);
    const collection = featureCollection([pt, line]);
    const geomCollection = geometryCollection([pt.geometry, line.geometry]);

    t.deepEqual(invariant.getGeom(pt), pt.geometry, 'Point');
    t.deepEqual(invariant.getGeom(line.geometry), line.geometry, 'LineString');
    t.deepEqual(invariant.getGeom(geomCollection), geomCollection.geometry, 'GeometryCollection');
    t.deepEqual(invariant.getGeom(geomCollection.geometry), geomCollection.geometry, 'GeometryCollection');
    t.throws(() => invariant.getGeom(collection), 'featureCollection not valid');
    t.end();
});

test('invariant -- getType', t => {
    const pt = point([1, 1]);
    const line = lineString([[0, 1], [1, 1]]);
    const collection = featureCollection([pt, line]);
    const geomCollection = geometryCollection([pt.geometry, line.geometry]);

    t.deepEqual(invariant.getType(pt), 'Point');
    t.deepEqual(invariant.getType(line.geometry), 'LineString');
    t.deepEqual(invariant.getType(geomCollection), 'GeometryCollection');
    t.deepEqual(invariant.getType(collection), 'FeatureCollection');
    t.throws(() => invariant.getType(null), /geojson is required/, 'geojson is required');
    t.end();
});

// https://github.com/Turfjs/turf/issues/853
test('null geometries', t => {
    const nullFeature = {
        type: 'Feature',
        properties: {},
        geometry: null
    };
    t.throws(() => invariant.getGeom(null), /geojson is required/, 'getGeom => geojson is required');
    t.throws(() => invariant.getCoords(nullFeature), /No valid coordinates/, 'getCoords => No valid coordinates');
    t.throws(() => invariant.getCoord(nullFeature), /No valid coordinates/, 'getCoord => No valid coordinates');

    t.equal(invariant.getGeom(nullFeature), null, 'getGeom => null');
    t.end();
});
