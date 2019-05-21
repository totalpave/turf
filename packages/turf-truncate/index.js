import { coordEach } from '@spatial/meta';
import { isObject } from '@spatial/helpers';

/**
 * Takes a GeoJSON Feature or FeatureCollection and truncates the precision of the geometry.
 *
 * @name truncate
 * @param {GeoJSON} geojson any GeoJSON Feature, FeatureCollection, Geometry or GeometryCollection.
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.precision=6] coordinate decimal precision
 * @param {number} [options.coordinates=3] maximum number of coordinates (primarly used to remove z coordinates)
 * @param {boolean} [options.mutate=false] allows GeoJSON input to be mutated (significant performance increase if true)
 * @returns {GeoJSON} layer with truncated geometry
 * @example
 * var point = turf.point([
 *     70.46923055566859,
 *     58.11088890802906,
 *     1508
 * ]);
 * var options = {precision: 3, coordinates: 2};
 * var truncated = turf.truncate(point, options);
 * //=truncated.geometry.coordinates => [70.469, 58.111]
 *
 * //addToMap
 * var addToMap = [truncated];
 */
function truncate(geojson, options) {
    // Optional parameters
    options = options || {};
    if (!isObject(options)) throw new Error('options is invalid');
    let precision = options.precision;
    let coordinates = options.coordinates;
    const mutate = options.mutate;

    // default params
    precision = (precision === undefined || precision === null || isNaN(precision)) ? 6 : precision;
    coordinates = (coordinates === undefined || coordinates === null || isNaN(coordinates)) ? 3 : coordinates;

    // validation
    if (!geojson) throw new Error('<geojson> is required');
    if (typeof precision !== 'number') throw new Error('<precision> must be a number');
    if (typeof coordinates !== 'number') throw new Error('<coordinates> must be a number');

    // prevent input mutation
    if (mutate === false || mutate === undefined) geojson = JSON.parse(JSON.stringify(geojson));

    const factor = Math.pow(10, precision);

    // Truncate Coordinates
    coordEach(geojson, (coords) => {
        truncateCoords(coords, factor, coordinates);
    });
    return geojson;
}

/**
 * Truncate Coordinates - Mutates coordinates in place
 *
 * @private
 * @param {Array<any>} coords Geometry Coordinates
 * @param {number} factor rounding factor for coordinate decimal precision
 * @param {number} coordinates maximum number of coordinates (primarly used to remove z coordinates)
 * @returns {Array<any>} mutated coordinates
 */
function truncateCoords(coords, factor, coordinates) {
    // Remove extra coordinates (usually elevation coordinates and more)
    if (coords.length > coordinates) coords.splice(coordinates, coords.length);

    // Truncate coordinate decimals
    for (let i = 0; i < coords.length; i++) {
        coords[i] = Math.round(coords[i] * factor) / factor;
    }
    return coords;
}

export default truncate;
