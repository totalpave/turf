import within from '@spatial/boolean-within';
import distance from '@spatial/distance';
import {getType} from '@spatial/invariant';
import {point, featureCollection, isObject, isNumber} from '@spatial/helpers';

/**
 * Creates a {@link Point} grid from a bounding box, {@link FeatureCollection} or {@link Feature}.
 *
 * @name pointGrid
 * @param {Array<number>} bbox extent in [minX, minY, maxX, maxY] order
 * @param {number} cellSide the distance between points, in units
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] used in calculating cellSide, can be degrees, radians, miles, or kilometers
 * @param {Feature<Polygon|MultiPolygon>} [options.mask] if passed a Polygon or MultiPolygon, the grid Points will be created only inside it
 * @param {Object} [options.properties={}] passed to each point of the grid
 * @returns {FeatureCollection<Point>} grid of points
 * @example
 * var extent = [-70.823364, -33.553984, -70.473175, -33.302986];
 * var cellSide = 3;
 * var options = {units: 'miles'};
 *
 * var grid = turf.pointGrid(extent, cellSide, options);
 *
 * //addToMap
 * var addToMap = [grid];
 */
function pointGrid(bbox, cellSide, options) {
    // Optional parameters
    options = options || {};
    if (!isObject(options)) throw new Error('options is invalid');
    // var units = options.units;
    const mask = options.mask;
    const properties = options.properties;

    // Containers
    const results = [];

    // Input Validation
    if (cellSide === null || cellSide === undefined) throw new Error('cellSide is required');
    if (!isNumber(cellSide)) throw new Error('cellSide is invalid');
    if (!bbox) throw new Error('bbox is required');
    if (!Array.isArray(bbox)) throw new Error('bbox must be array');
    if (bbox.length !== 4) throw new Error('bbox must contain 4 numbers');
    if (mask && ['Polygon', 'MultiPolygon'].indexOf(getType(mask)) === -1) throw new Error('options.mask must be a (Multi)Polygon');

    const west = bbox[0];
    const south = bbox[1];
    const east = bbox[2];
    const north = bbox[3];

    const xFraction = cellSide / (distance([west, south], [east, south], options));
    const cellWidth = xFraction * (east - west);
    const yFraction = cellSide / (distance([west, south], [west, north], options));
    const cellHeight = yFraction * (north - south);

    const bboxWidth = (east - west);
    const bboxHeight = (north - south);
    const columns = Math.floor(bboxWidth / cellWidth);
    const rows = Math.floor(bboxHeight / cellHeight);
    // adjust origin of the grid
    const deltaX = (bboxWidth - columns * cellWidth) / 2;
    const deltaY = (bboxHeight - rows * cellHeight) / 2;

    let currentX = west + deltaX;
    while (currentX <= east) {
        let currentY = south + deltaY;
        while (currentY <= north) {
            const cellPt = point([currentX, currentY], properties);
            if (mask) {
                if (within(cellPt, mask)) results.push(cellPt);
            } else {
                results.push(cellPt);
            }
            currentY += cellHeight;
        }
        currentX += cellWidth;
    }

    return featureCollection(results);
}

export default pointGrid;
