import bbox from '@spatial/bbox';
import hexGrid from '@spatial/hex-grid';
import pointGrid from '@spatial/point-grid';
import distance from '@spatial/distance';
import centroid from '@spatial/centroid';
import squareGrid from '@spatial/square-grid';
import triangleGrid from '@spatial/triangle-grid';
import clone from '@spatial/clone';
import { featureCollection } from '@spatial/helpers';
import { featureEach } from '@spatial/meta';
import { collectionOf } from '@spatial/invariant';

/**
 * Takes a set of points and estimates their 'property' values on a grid using the [Inverse Distance Weighting (IDW) method](https://en.wikipedia.org/wiki/Inverse_distance_weighting).
 *
 * @name interpolate
 * @param {FeatureCollection<Point>} points with known value
 * @param {number} cellSize the distance across each grid point
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.gridType='square'] defines the output format based on a Grid Type (options: 'square' | 'point' | 'hex' | 'triangle')
 * @param {string} [options.property='elevation'] the property name in `points` from which z-values will be pulled, zValue fallbacks to 3rd coordinate if no property exists.
 * @param {string} [options.units='kilometers'] used in calculating cellSize, can be degrees, radians, miles, or kilometers
 * @param {number} [options.weight=1] exponent regulating the distance-decay weighting
 * @returns {FeatureCollection<Point|Polygon>} grid of points or polygons with interpolated 'property'
 * @example
 * var points = turf.randomPoint(30, {bbox: [50, 30, 70, 50]});
 *
 * // add a random property to each point
 * turf.featureEach(points, function(point) {
 *     point.properties.solRad = Math.random() * 50;
 * });
 * var options = {gridType: 'points', property: 'solRad', units: 'miles'};
 * var grid = turf.interpolate(points, 100, options);
 *
 * //addToMap
 * var addToMap = [grid];
 */
function interpolate(points, cellSize, options) {
    // Optional parameters
    options = options || {};
    if (typeof options !== 'object') throw new Error('options is invalid');
    let gridType = options.gridType;
    let property = options.property;
    let weight = options.weight;

    // validation
    if (!points) throw new Error('points is required');
    collectionOf(points, 'Point', 'input must contain Points');
    if (!cellSize) throw new Error('cellSize is required');
    if (weight !== undefined && typeof weight !== 'number') throw new Error('weight must be a number');

    // default values
    property = property || 'elevation';
    gridType = gridType || 'square';
    weight = weight || 1;

    const box = bbox(points);
    let grid;
    switch (gridType) {
    case 'point':
    case 'points':
        grid = pointGrid(box, cellSize, options);
        break;
    case 'square':
    case 'squares':
        grid = squareGrid(box, cellSize, options);
        break;
    case 'hex':
    case 'hexes':
        grid = hexGrid(box, cellSize, options);
        break;
    case 'triangle':
    case 'triangles':
        grid = triangleGrid(box, cellSize, options);
        break;
    default:
        throw new Error('invalid gridType');
    }
    const results = [];
    featureEach(grid, (gridFeature) => {
        let zw = 0;
        let sw = 0;
        // calculate the distance from each input point to the grid points
        featureEach(points, (point) => {
            const gridPoint = (gridType === 'point') ? gridFeature : centroid(gridFeature);
            const d = distance(gridPoint, point, options);
            let zValue;
            // property has priority for zValue, fallbacks to 3rd coordinate from geometry
            if (property !== undefined) zValue = point.properties[property];
            if (zValue === undefined) zValue = point.geometry.coordinates[2];
            if (zValue === undefined) throw new Error('zValue is missing');
            if (d === 0) zw = zValue;
            const w = 1.0 / Math.pow(d, weight);
            sw += w;
            zw += w * zValue;
        });
        // write interpolated value for each grid point
        const newFeature = clone(gridFeature);
        newFeature.properties[property] = zw / sw;
        results.push(newFeature);
    });
    return featureCollection(results);
}

export default interpolate;
