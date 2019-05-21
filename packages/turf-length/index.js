import distance from '@spatial/distance';
import { segmentReduce } from '@spatial/meta';
import { isObject } from '@spatial/helpers';

/**
 * Takes a {@link GeoJSON} and measures its length in the specified units, {@link (Multi)Point}'s distance are ignored.
 *
 * @name length
 * @param {GeoJSON} geojson GeoJSON to measure
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units=kilometers] can be degrees, radians, miles, or kilometers
 * @returns {number} length of GeoJSON
 * @example
 * var line = turf.lineString([[115, -32], [131, -22], [143, -25], [150, -34]]);
 * var length = turf.length(line, {units: 'miles'});
 *
 * //addToMap
 * var addToMap = [line];
 * line.properties.distance = length;
 */
function length(geojson, options) {
    // Optional parameters
    options = options || {};
    if (!isObject(options)) throw new Error('options is invalid');

    // Input Validation
    if (!geojson) throw new Error('geojson is required');

    // Calculate distance from 2-vertex line segements
    return segmentReduce(geojson, (previousValue, segment) => {
        const coords = segment.geometry.coordinates;
        return previousValue + distance(coords[0], coords[1], options);
    }, 0);
}

export default length;
