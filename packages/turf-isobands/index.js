import bbox from '@spatial/bbox';
import area from '@spatial/area';
import booleanPointInPolygon from '@spatial/boolean-point-in-polygon';
import explode from '@spatial/explode';
import { collectionOf } from '@spatial/invariant';
import { polygon, multiPolygon, featureCollection, isObject } from '@spatial/helpers';
import gridToMatrix from './lib/grid-to-matrix';
import isoBands from './lib/marchingsquares-isobands';

/**
 * Takes a grid {@link FeatureCollection} of {@link Point} features with z-values and an array of
 * value breaks and generates filled contour isobands.
 *
 * @name isobands
 * @param {FeatureCollection<Point>} pointGrid input points
 * @param {Array<number>} breaks where to draw contours
 * @param {Object} [options={}] options on output
 * @param {string} [options.zProperty='elevation'] the property name in `points` from which z-values will be pulled
 * @param {Object} [options.commonProperties={}] GeoJSON properties passed to ALL isobands
 * @param {Array<Object>} [options.breaksProperties=[]] GeoJSON properties passed, in order, to the correspondent isoband (order defined by breaks)
 * @returns {FeatureCollection<MultiPolygon>} a FeatureCollection of {@link MultiPolygon} features representing isobands
 */
function isobands(pointGrid, breaks, options) {
    // Optional parameters
    options = options || {};
    if (!isObject(options)) throw new Error('options is invalid');
    const zProperty = options.zProperty || 'elevation';
    const commonProperties = options.commonProperties || {};
    const breaksProperties = options.breaksProperties || [];

    // Validation
    collectionOf(pointGrid, 'Point', 'Input must contain Points');
    if (!breaks) throw new Error('breaks is required');
    if (!Array.isArray(breaks)) throw new Error('breaks is not an Array');
    if (!isObject(commonProperties)) throw new Error('commonProperties is not an Object');
    if (!Array.isArray(breaksProperties)) throw new Error('breaksProperties is not an Array');

    // Isoband methods
    const matrix = gridToMatrix(pointGrid, {zProperty, flip: true});
    let contours = createContourLines(matrix, breaks, zProperty);
    contours = rescaleContours(contours, matrix, pointGrid);

    const multipolygons = contours.map((contour, index) => {
        if (breaksProperties[index] && !isObject(breaksProperties[index])) {
            throw new Error('Each mappedProperty is required to be an Object');
        }
        // collect all properties
        const contourProperties = Object.assign(
            {},
            commonProperties,
            breaksProperties[index]
        );
        contourProperties[zProperty] = contour[zProperty];
        const multiP = multiPolygon(contour.groupedRings, contourProperties);
        return multiP;
    });

    return featureCollection(multipolygons);
}

/**
 * Creates the contours lines (featuresCollection of polygon features) from the 2D data grid
 *
 * Marchingsquares process the grid data as a 3D representation of a function on a 2D plane, therefore it
 * assumes the points (x-y coordinates) are one 'unit' distance. The result of the IsoBands function needs to be
 * rescaled, with turfjs, to the original area and proportions on the map
 *
 * @private
 * @param {Array<Array<number>>} matrix Grid Data
 * @param {Array<number>} breaks Breaks
 * @param {string} [property='elevation'] Property
 * @returns {Array<any>} contours
 */
function createContourLines(matrix, breaks, property) {

    const contours = [];
    for (let i = 1; i < breaks.length; i++) {
        const lowerBand = +breaks[i - 1]; // make sure the breaks value is a number
        const upperBand = +breaks[i];

        const isobandsCoords = isoBands(matrix, lowerBand, upperBand - lowerBand);
        // as per GeoJson rules for creating a Polygon, make sure the first element
        // in the array of LinearRings represents the exterior ring (i.e. biggest area),
        // and any subsequent elements represent interior rings (i.e. smaller area);
        // this avoids rendering issues of the MultiPolygons on the map
        const nestedRings = orderByArea(isobandsCoords);
        const groupedRings = groupNestedRings(nestedRings);
        const obj = {};
        obj['groupedRings'] = groupedRings;
        obj[property] = `${lowerBand  }-${  upperBand}`;
        contours.push(obj);
    }
    return contours;
}

/**
 * Transform isobands of 2D grid to polygons for the map
 *
 * @private
 * @param {Array<any>} contours Contours
 * @param {Array<Array<number>>} matrix Grid Data
 * @param {Object} points Points by Latitude
 * @returns {Array<any>} contours
 */
function rescaleContours(contours, matrix, points) {

    // get dimensions (on the map) of the original grid
    const gridBbox = bbox(points); // [ minX, minY, maxX, maxY ]
    const originalWidth = gridBbox[2] - gridBbox[0];
    const originalHeigth = gridBbox[3] - gridBbox[1];

    // get origin, which is the first point of the last row on the rectangular data on the map
    const x0 = gridBbox[0];
    const y0 = gridBbox[1];
    // get number of cells per side
    const matrixWidth = matrix[0].length - 1;
    const matrixHeight = matrix.length - 1;
    // calculate the scaling factor between matrix and rectangular grid on the map
    const scaleX = originalWidth / matrixWidth;
    const scaleY = originalHeigth / matrixHeight;

    const resize = function (point) {
        point[0] = point[0] * scaleX + x0;
        point[1] = point[1] * scaleY + y0;
    };

    // resize and shift each point/line of the isobands
    contours.forEach((contour) => {
        contour.groupedRings.forEach((lineRingSet) => {
            lineRingSet.forEach((lineRing) => {
                lineRing.forEach(resize);
            });
        });
    });
    return contours;
}


/*  utility functions */


/**
 * Returns an array of coordinates (of LinearRings) in descending order by area
 *
 * @private
 * @param {Array<LineString>} ringsCoords array of closed LineString
 * @returns {Array} array of the input LineString ordered by area
 */
function orderByArea(ringsCoords) {
    const ringsWithArea = [];
    const areas = [];
    ringsCoords.forEach((coords) => {
        // var poly = polygon([points]);
        const ringArea = area(polygon([coords]));
        // create an array of areas value
        areas.push(ringArea);
        // associate each lineRing with its area
        ringsWithArea.push({ring: coords, area: ringArea});
    });
    areas.sort((a, b) => b - a);
    // create a new array of linearRings coordinates ordered by their area
    const orderedByArea = [];
    areas.forEach((area) => {
        for (let lr = 0; lr < ringsWithArea.length; lr++) {
            if (ringsWithArea[lr].area === area) {
                orderedByArea.push(ringsWithArea[lr].ring);
                ringsWithArea.splice(lr, 1);
                break;
            }
        }
    });
    return orderedByArea;
}

/**
 * Returns an array of arrays of coordinates, each representing
 * a set of (coordinates of) nested LinearRings,
 * i.e. the first ring contains all the others
 *
 * @private
 * @param {Array} orderedLinearRings array of coordinates (of LinearRings) in descending order by area
 * @returns {Array<Array>} Array of coordinates of nested LinearRings
 */
function groupNestedRings(orderedLinearRings) {
    // create a list of the (coordinates of) LinearRings
    const lrList = orderedLinearRings.map(lr => ({lrCoordinates: lr, grouped: false}));
    const groupedLinearRingsCoords = [];
    while (!allGrouped(lrList)) {
        for (let i = 0; i < lrList.length; i++) {
            if (!lrList[i].grouped) {
                // create new group starting with the larger not already grouped ring
                const group = [];
                group.push(lrList[i].lrCoordinates);
                lrList[i].grouped = true;
                const outerMostPoly = polygon([lrList[i].lrCoordinates]);
                // group all the rings contained by the outermost ring
                for (let j = i + 1; j < lrList.length; j++) {
                    if (!lrList[j].grouped) {
                        const lrPoly = polygon([lrList[j].lrCoordinates]);
                        if (isInside(lrPoly, outerMostPoly)) {
                            group.push(lrList[j].lrCoordinates);
                            lrList[j].grouped = true;
                        }
                    }
                }
                // insert the new group
                groupedLinearRingsCoords.push(group);
            }
        }
    }
    return groupedLinearRingsCoords;
}

/**
 * @private
 * @param {Polygon} testPolygon polygon of interest
 * @param {Polygon} targetPolygon polygon you want to compare with
 * @returns {boolean} true if test-Polygon is inside target-Polygon
 */
function isInside(testPolygon, targetPolygon) {
    const points = explode(testPolygon);
    for (let i = 0; i < points.features.length; i++) {
        if (!booleanPointInPolygon(points.features[i], targetPolygon)) {
            return false;
        }
    }
    return true;
}

/**
 * @private
 * @param {Array<Object>} list list of objects which might contain the 'group' attribute
 * @returns {boolean} true if all the objects in the list are marked as grouped
 */
function allGrouped(list) {
    for (let i = 0; i < list.length; i++) {
        if (list[i].grouped === false) {
            return false;
        }
    }
    return true;
}

export default isobands;
