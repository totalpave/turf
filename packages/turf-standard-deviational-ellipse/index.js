import { coordAll, featureEach } from '@spatial/meta';
import { getCoords } from '@spatial/invariant';
import { featureCollection, isObject, isNumber } from '@spatial/helpers';
import centerMean from '@spatial/center-mean';
import pointsWithinPolygon from '@spatial/points-within-polygon';
import ellipse from '@spatial/ellipse';

/**
 * Takes a {@link FeatureCollection} and returns a standard deviational ellipse,
 * also known as a “directional distribution.” The standard deviational ellipse
 * aims to show the direction and the distribution of a dataset by drawing
 * an ellipse that contains about one standard deviation’s worth (~ 70%) of the
 * data.
 *
 * This module mirrors the functionality of [Directional Distribution](http://desktop.arcgis.com/en/arcmap/10.3/tools/spatial-statistics-toolbox/directional-distribution.htm)
 * in ArcGIS and the [QGIS Standard Deviational Ellipse Plugin](http://arken.nmbu.no/~havatv/gis/qgisplugins/SDEllipse/)
 *
 * **Bibliography**
 *
 * • Robert S. Yuill, “The Standard Deviational Ellipse; An Updated Tool for
 * Spatial Description,” _Geografiska Annaler_ 53, no. 1 (1971): 28–39,
 * doi:{@link https://doi.org/10.2307/490885|10.2307/490885}.
 *
 * • Paul Hanly Furfey, “A Note on Lefever’s “Standard Deviational Ellipse,”
 * _American Journal of Sociology_ 33, no. 1 (1927): 94—98,
 * doi:{@link https://doi.org/10.1086/214336|10.1086/214336}.
 *
 *
 * @name standardDeviationalEllipse
 * @param {FeatureCollection<Point>} points GeoJSON points
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.weight] the property name used to weight the center
 * @param {number} [options.steps=64] number of steps for the polygon
 * @param {Object} [options.properties={}] properties to pass to the resulting ellipse
 * @returns {Feature<Polygon>} an elliptical Polygon that includes approximately 1 SD of the dataset within it.
 * @example
 *
 * var bbox = [-74, 40.72, -73.98, 40.74];
 * var points = turf.randomPoint(400, {bbox: bbox});
 * var sdEllipse = turf.standardDeviationalEllipse(points);
 *
 * //addToMap
 * var addToMap = [points, sdEllipse];
 *
 */
function standardDeviationalEllipse(points, options) {
    // Optional params
    options = options || {};
    if (!isObject(options)) throw new Error('options is invalid');
    const steps = options.steps || 64;
    const weightTerm = options.weight;
    const properties = options.properties || {};

    // Validation:
    if (!isNumber(steps)) throw new Error('steps must be a number');
    if (!isObject(properties)) throw new Error('properties must be a number');

    // Calculate mean center & number of features:
    const numberOfFeatures = coordAll(points).length;
    const meanCenter = centerMean(points, {weight: weightTerm});

    // Calculate angle of rotation:
    // [X, Y] = mean center of all [x, y].
    // theta = arctan( (A + B) / C )
    // A = sum((x - X)^2) - sum((y - Y)^2)
    // B = sqrt(A^2 + 4(sum((x - X)(y - Y))^2))
    // C = 2(sum((x - X)(y - Y)))

    let xDeviationSquaredSum = 0;
    let yDeviationSquaredSum = 0;
    let xyDeviationSum = 0;

    featureEach(points, (point) => {
        const weight = point.properties[weightTerm] || 1;
        const deviation = getDeviations(getCoords(point), getCoords(meanCenter));
        xDeviationSquaredSum += Math.pow(deviation.x, 2) * weight;
        yDeviationSquaredSum += Math.pow(deviation.y, 2) * weight;
        xyDeviationSum += deviation.x * deviation.y * weight;
    });

    const bigA = xDeviationSquaredSum - yDeviationSquaredSum;
    const bigB = Math.sqrt(Math.pow(bigA, 2) + 4 * Math.pow(xyDeviationSum, 2));
    const bigC = 2 * xyDeviationSum;
    const theta = Math.atan((bigA + bigB) / bigC);
    const thetaDeg = theta * 180 / Math.PI;

    // Calculate axes:
    // sigmaX = sqrt((1 / n - 2) * sum((((x - X) * cos(theta)) - ((y - Y) * sin(theta)))^2))
    // sigmaY = sqrt((1 / n - 2) * sum((((x - X) * sin(theta)) - ((y - Y) * cos(theta)))^2))
    let sigmaXsum = 0;
    let sigmaYsum = 0;
    let weightsum = 0;
    featureEach(points, (point) => {
        const weight = point.properties[weightTerm] || 1;
        const deviation = getDeviations(getCoords(point), getCoords(meanCenter));
        sigmaXsum += Math.pow((deviation.x * Math.cos(theta)) - (deviation.y * Math.sin(theta)), 2) * weight;
        sigmaYsum += Math.pow((deviation.x * Math.sin(theta)) + (deviation.y * Math.cos(theta)), 2) * weight;
        weightsum += weight;
    });

    const sigmaX = Math.sqrt(2 * sigmaXsum / weightsum);
    const sigmaY = Math.sqrt(2 * sigmaYsum / weightsum);

    const theEllipse = ellipse(meanCenter, sigmaX, sigmaY, {units: 'degrees', angle: thetaDeg, steps, properties});
    const pointsWithinEllipse = pointsWithinPolygon(points, featureCollection([theEllipse]));
    const standardDeviationalEllipseProperties = {
        meanCenterCoordinates: getCoords(meanCenter),
        semiMajorAxis: sigmaX,
        semiMinorAxis: sigmaY,
        numberOfFeatures,
        angle: thetaDeg,
        percentageWithinEllipse: 100 * coordAll(pointsWithinEllipse).length / numberOfFeatures
    };
    theEllipse.properties.standardDeviationalEllipse = standardDeviationalEllipseProperties;

    return theEllipse;
}

/**
 * Get x_i - X and y_i - Y
 *
 * @private
 * @param {Array} coordinates Array of [x_i, y_i]
 * @param {Array} center Array of [X, Y]
 * @returns {Object} { x: n, y: m }
 */
function getDeviations(coordinates, center) {
    return {
        x: coordinates[0] - center[0],
        y: coordinates[1] - center[1]
    };
}


export default standardDeviationalEllipse;
