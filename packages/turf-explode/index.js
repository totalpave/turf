import { coordEach, featureEach } from '@spatial/meta';
import { point, featureCollection } from '@spatial/helpers';

/**
 * Takes a feature or set of features and returns all positions as {@link Point|points}.
 *
 * @name explode
 * @param {GeoJSON} geojson input features
 * @returns {FeatureCollection<point>} points representing the exploded input features
 * @throws {Error} if it encounters an unknown geometry type
 * @example
 * var polygon = turf.polygon([[[-81, 41], [-88, 36], [-84, 31], [-80, 33], [-77, 39], [-81, 41]]]);
 *
 * var explode = turf.explode(polygon);
 *
 * //addToMap
 * var addToMap = [polygon, explode]
 */
function explode(geojson) {
    const points = [];
    if (geojson.type === 'FeatureCollection') {
        featureEach(geojson, (feature) => {
            coordEach(feature, (coord) => {
                points.push(point(coord, feature.properties));
            });
        });
    } else {
        coordEach(geojson, (coord) => {
            points.push(point(coord, geojson.properties));
        });
    }
    return featureCollection(points);
}

export default explode;
