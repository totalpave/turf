import { flattenEach } from '@spatial/meta';
import { getCoords, getType } from '@spatial/invariant';
import { isObject, lineString, multiLineString, lengthToDegrees } from '@spatial/helpers';
import intersection from './lib/intersection';

/**
 * Takes a {@link LineString|line} and returns a {@link LineString|line} at offset by the specified distance.
 *
 * @name lineOffset
 * @param {Geometry|Feature<LineString|MultiLineString>} geojson input GeoJSON
 * @param {number} distance distance to offset the line (can be of negative value)
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] can be degrees, radians, miles, kilometers, inches, yards, meters
 * @returns {Feature<LineString|MultiLineString>} Line offset from the input line
 * @example
 * var line = turf.lineString([[-83, 30], [-84, 36], [-78, 41]], { "stroke": "#F00" });
 *
 * var offsetLine = turf.lineOffset(line, 2, {units: 'miles'});
 *
 * //addToMap
 * var addToMap = [offsetLine, line]
 * offsetLine.properties.stroke = "#00F"
 */
function lineOffset(geojson, distance, options) {
    // Optional parameters
    options = options || {};
    if (!isObject(options)) throw new Error('options is invalid');
    const units = options.units;

    // Valdiation
    if (!geojson) throw new Error('geojson is required');
    if (distance === undefined || distance === null || isNaN(distance)) throw new Error('distance is required');

    const type = getType(geojson);
    const properties = geojson.properties;

    switch (type) {
    case 'LineString':
        return lineOffsetFeature(geojson, distance, units);
    case 'MultiLineString':
        var coords = [];
        flattenEach(geojson, (feature) => {
            coords.push(lineOffsetFeature(feature, distance, units).geometry.coordinates);
        });
        return multiLineString(coords, properties);
    default:
        throw new Error(`geometry ${  type  } is not supported`);
    }
}

/**
 * Line Offset
 *
 * @private
 * @param {Geometry|Feature<LineString>} line input line
 * @param {number} distance distance to offset the line (can be of negative value)
 * @param {string} [units=kilometers] units
 * @returns {Feature<LineString>} Line offset from the input line
 */
function lineOffsetFeature(line, distance, units) {
    const segments = [];
    const offsetDegrees = lengthToDegrees(distance, units);
    const coords = getCoords(line);
    const finalCoords = [];
    coords.forEach((currentCoords, index) => {
        if (index !== coords.length - 1) {
            const segment = processSegment(currentCoords, coords[index + 1], offsetDegrees);
            segments.push(segment);
            if (index > 0) {
                const seg2Coords = segments[index - 1];
                const intersects = intersection(segment, seg2Coords);

                // Handling for line segments that aren't straight
                if (intersects !== false) {
                    seg2Coords[1] = intersects;
                    segment[0] = intersects;
                }

                finalCoords.push(seg2Coords[0]);
                if (index === coords.length - 2) {
                    finalCoords.push(segment[0]);
                    finalCoords.push(segment[1]);
                }
            }
            // Handling for lines that only have 1 segment
            if (coords.length === 2) {
                finalCoords.push(segment[0]);
                finalCoords.push(segment[1]);
            }
        }
    });
    return lineString(finalCoords, line.properties);
}

/**
 * Process Segment
 * Inspiration taken from http://stackoverflow.com/questions/2825412/draw-a-parallel-line
 *
 * @private
 * @param {Array<number>} point1 Point coordinates
 * @param {Array<number>} point2 Point coordinates
 * @param {number} offset Offset
 * @returns {Array<Array<number>>} offset points
 */
function processSegment(point1, point2, offset) {
    const L = Math.sqrt((point1[0] - point2[0]) * (point1[0] - point2[0]) + (point1[1] - point2[1]) * (point1[1] - point2[1]));

    const out1x = point1[0] + offset * (point2[1] - point1[1]) / L;
    const out2x = point2[0] + offset * (point2[1] - point1[1]) / L;
    const out1y = point1[1] + offset * (point1[0] - point2[0]) / L;
    const out2y = point2[1] + offset * (point1[0] - point2[0]) / L;
    return [[out1x, out1y], [out2x, out2y]];
}

export default lineOffset;
