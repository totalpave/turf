import { feature } from '@spatial/helpers';
import { getCoords, getType } from '@spatial/invariant';

/**
 * Removes redundant coordinates from any GeoJSON Geometry.
 *
 * @name cleanCoords
 * @param {Geometry|Feature} geojson Feature or Geometry
 * @param {Object} [options={}] Optional parameters
 * @param {boolean} [options.mutate=false] allows GeoJSON input to be mutated
 * @returns {Geometry|Feature} the cleaned input Feature/Geometry
 * @example
 * var line = turf.lineString([[0, 0], [0, 2], [0, 5], [0, 8], [0, 8], [0, 10]]);
 * var multiPoint = turf.multiPoint([[0, 0], [0, 0], [2, 2]]);
 *
 * turf.cleanCoords(line).geometry.coordinates;
 * //= [[0, 0], [0, 10]]
 *
 * turf.cleanCoords(multiPoint).geometry.coordinates;
 * //= [[0, 0], [2, 2]]
 */
function cleanCoords(geojson, options) {
    // Backwards compatible with v4.0
    const mutate = (typeof options === 'object') ? options.mutate : options;
    if (!geojson) throw new Error('geojson is required');
    const type = getType(geojson);

    // Store new "clean" points in this Array
    let newCoords = [];

    switch (type) {
    case 'LineString':
        newCoords = cleanLine(geojson);
        break;
    case 'MultiLineString':
    case 'Polygon':
        getCoords(geojson).forEach((line) => {
            newCoords.push(cleanLine(line));
        });
        break;
    case 'MultiPolygon':
        getCoords(geojson).forEach((polygons) => {
            const polyPoints = [];
            polygons.forEach((ring) => {
                polyPoints.push(cleanLine(ring));
            });
            newCoords.push(polyPoints);
        });
        break;
    case 'Point':
        return geojson;
    case 'MultiPoint':
        var existing = {};
        getCoords(geojson).forEach((coord) => {
            const key = coord.join('-');
            if (!existing.hasOwnProperty(key)) {
                newCoords.push(coord);
                existing[key] = true;
            }
        });
        break;
    default:
        throw new Error(`${type  } geometry not supported`);
    }

    // Support input mutation
    if (geojson.coordinates) {
        if (mutate === true) {
            geojson.coordinates = newCoords;
            return geojson;
        }
        return {type, coordinates: newCoords};
    } else {
        if (mutate === true) {
            geojson.geometry.coordinates = newCoords;
            return geojson;
        }
        return feature({type, coordinates: newCoords}, geojson.properties, geojson.bbox, geojson.id);
    }
}

/**
 * Clean Coords
 *
 * @private
 * @param {Array<number>|LineString} line Line
 * @returns {Array<number>} Cleaned coordinates
 */
function cleanLine(line) {
    const points = getCoords(line);
    // handle "clean" segment
    if (points.length === 2 && !equals(points[0], points[1])) return points;

    let prevPoint, point, nextPoint;
    const newPoints = [];
    const secondToLast = points.length - 1;

    newPoints.push(points[0]);
    for (let i = 1; i < secondToLast; i++) {
        prevPoint = points[i - 1];
        point = points[i];
        nextPoint = points[i + 1];

        if (!isPointOnLineSegment(prevPoint, nextPoint, point)) {
            newPoints.push(point);
        }
    }
    newPoints.push(nextPoint);
    return newPoints;
}

/**
 * Compares two points and returns if they are equals
 *
 * @private
 * @param {Position} pt1 point
 * @param {Position} pt2 point
 * @returns {boolean} true if they are equals
 */
function equals(pt1, pt2) {
    return pt1[0] === pt2[0] && pt1[1] === pt2[1];
}

/**
 * Returns if `point` is on the segment between `start` and `end`.
 * Borrowed from `@spatial/boolean-point-on-line` to speed up the evaluation (instead of using the module as dependency)
 *
 * @private
 * @param {Position} start coord pair of start of line
 * @param {Position} end coord pair of end of line
 * @param {Position} point coord pair of point to check
 * @returns {boolean} true/false
 */
function isPointOnLineSegment(start, end, point) {
    const x = point[0], y = point[1];
    const startX = start[0], startY = start[1];
    const endX = end[0], endY = end[1];

    const dxc = x - startX;
    const dyc = y - startY;
    const dxl = endX - startX;
    const dyl = endY - startY;
    const cross = dxc * dyl - dyc * dxl;

    if (cross !== 0) return false;
    else if (Math.abs(dxl) >= Math.abs(dyl)) return dxl > 0 ? startX <= x && x <= endX : endX <= x && x <= startX;
    else return dyl > 0 ? startY <= y && y <= endY : endY <= y && y <= startY;
}

export default cleanCoords;
