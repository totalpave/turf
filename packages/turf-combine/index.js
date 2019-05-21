import { feature, featureCollection } from '@spatial/helpers';
import { featureEach } from '@spatial/meta';

/**
 * Combines a {@link FeatureCollection} of {@link Point}, {@link LineString}, or {@link Polygon} features
 * into {@link MultiPoint}, {@link MultiLineString}, or {@link MultiPolygon} features.
 *
 * @name combine
 * @param {FeatureCollection<Point|LineString|Polygon>} fc a FeatureCollection of any type
 * @returns {FeatureCollection<MultiPoint|MultiLineString|MultiPolygon>} a FeatureCollection of corresponding type to input
 * @example
 * var fc = turf.featureCollection([
 *   turf.point([19.026432, 47.49134]),
 *   turf.point([19.074497, 47.509548])
 * ]);
 *
 * var combined = turf.combine(fc);
 *
 * //addToMap
 * var addToMap = [combined]
 */
function combine(fc) {
    const groups = {
        MultiPoint: {coordinates: [], properties: []},
        MultiLineString: {coordinates: [], properties: []},
        MultiPolygon: {coordinates: [], properties: []}
    };

    const multiMapping = Object.keys(groups).reduce((memo, item) => {
        memo[item.replace('Multi', '')] = item;
        return memo;
    }, {});

    function addToGroup(feature, key, multi) {
        if (!multi) {
            groups[key].coordinates.push(feature.geometry.coordinates);
        } else {
            groups[key].coordinates = groups[key].coordinates.concat(feature.geometry.coordinates);
        }
        groups[key].properties.push(feature.properties);
    }

    featureEach(fc, (feature) => {
        if (!feature.geometry) return;
        if (groups[feature.geometry.type]) {
            addToGroup(feature, feature.geometry.type, true);
        } else if (multiMapping[feature.geometry.type]) {
            addToGroup(feature, multiMapping[feature.geometry.type], false);
        }
    });

    return featureCollection(Object.keys(groups)
        .filter(key => groups[key].coordinates.length)
        .sort()
        .map((key) => {
            const geometry = { type: key, coordinates: groups[key].coordinates };
            const properties = { collectedProperties: groups[key].properties };
            return feature(geometry, properties);
        }));
}

export default combine;
