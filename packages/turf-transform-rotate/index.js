import centroid from '@spatial/centroid';
import rhumbBearing from '@spatial/rhumb-bearing';
import rhumbDistance from '@spatial/rhumb-distance';
import rhumbDestination from '@spatial/rhumb-destination';
import clone from '@spatial/clone';
import { coordEach } from '@spatial/meta';
import { getCoords } from '@spatial/invariant';
import { isObject } from '@spatial/helpers';

/**
 * Rotates any geojson Feature or Geometry of a specified angle, around its `centroid` or a given `pivot` point;
 * all rotations follow the right-hand rule: https://en.wikipedia.org/wiki/Right-hand_rule
 *
 * @name transformRotate
 * @param {GeoJSON} geojson object to be rotated
 * @param {number} angle of rotation (along the vertical axis), from North in decimal degrees, negative clockwise
 * @param {Object} [options={}] Optional parameters
 * @param {Coord} [options.pivot='centroid'] point around which the rotation will be performed
 * @param {boolean} [options.mutate=false] allows GeoJSON input to be mutated (significant performance increase if true)
 * @returns {GeoJSON} the rotated GeoJSON feature
 * @example
 * var poly = turf.polygon([[[0,29],[3.5,29],[2.5,32],[0,29]]]);
 * var options = {pivot: [0, 25]};
 * var rotatedPoly = turf.transformRotate(poly, 10, options);
 *
 * //addToMap
 * var addToMap = [poly, rotatedPoly];
 * rotatedPoly.properties = {stroke: '#F00', 'stroke-width': 4};
 */
function transformRotate(geojson, angle, options) {
    // Optional parameters
    options = options || {};
    if (!isObject(options)) throw new Error('options is invalid');
    let pivot = options.pivot;
    const mutate = options.mutate;

    // Input validation
    if (!geojson) throw new Error('geojson is required');
    if (angle === undefined || angle === null || isNaN(angle)) throw new Error('angle is required');

    // Shortcut no-rotation
    if (angle === 0) return geojson;

    // Use centroid of GeoJSON if pivot is not provided
    if (!pivot) pivot = centroid(geojson);

    // Clone geojson to avoid side effects
    if (mutate === false || mutate === undefined) geojson = clone(geojson);

    // Rotate each coordinate
    coordEach(geojson, (pointCoords) => {
        const initialAngle = rhumbBearing(pivot, pointCoords);
        const finalAngle = initialAngle + angle;
        const distance = rhumbDistance(pivot, pointCoords);
        const newCoords = getCoords(rhumbDestination(pivot, distance, finalAngle));
        pointCoords[0] = newCoords[0];
        pointCoords[1] = newCoords[1];
    });
    return geojson;
}

export default transformRotate;
