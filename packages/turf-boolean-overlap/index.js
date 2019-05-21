import { coordAll, segmentEach } from '@spatial/meta';
import { getType } from '@spatial/invariant';
import lineOverlap from '@spatial/line-overlap';
import lineIntersect from '@spatial/line-intersect';
import GeojsonEquality from 'geojson-equality';

/**
 * Compares two geometries of the same dimension and returns true if their intersection set results in a geometry
 * different from both but of the same dimension. It applies to Polygon/Polygon, LineString/LineString,
 * Multipoint/Multipoint, MultiLineString/MultiLineString and MultiPolygon/MultiPolygon.
 *
 * @name booleanOverlap
 * @param  {Geometry|Feature<LineString|MultiLineString|Polygon|MultiPolygon>} feature1 input
 * @param  {Geometry|Feature<LineString|MultiLineString|Polygon|MultiPolygon>} feature2 input
 * @returns {boolean} true/false
 * @example
 * var poly1 = turf.polygon([[[0,0],[0,5],[5,5],[5,0],[0,0]]]);
 * var poly2 = turf.polygon([[[1,1],[1,6],[6,6],[6,1],[1,1]]]);
 * var poly3 = turf.polygon([[[10,10],[10,15],[15,15],[15,10],[10,10]]]);
 *
 * turf.booleanOverlap(poly1, poly2)
 * //=true
 * turf.booleanOverlap(poly2, poly3)
 * //=false
 */
function booleanOverlap(feature1, feature2) {
    // validation
    if (!feature1) throw new Error('feature1 is required');
    if (!feature2) throw new Error('feature2 is required');
    const type1 = getType(feature1);
    const type2 = getType(feature2);
    if (type1 !== type2) throw new Error('features must be of the same type');
    if (type1 === 'Point') throw new Error('Point geometry not supported');

    // features must be not equal
    const equality = new GeojsonEquality({precision: 6});
    if (equality.compare(feature1, feature2)) return false;

    let overlap = 0;

    switch (type1) {
    case 'MultiPoint':
        var coords1 = coordAll(feature1);
        var coords2 = coordAll(feature2);
        coords1.forEach((coord1) => {
            coords2.forEach((coord2) => {
                if (coord1[0] === coord2[0] && coord1[1] === coord2[1]) overlap++;
            });
        });
        break;

    case 'LineString':
    case 'MultiLineString':
        segmentEach(feature1, (segment1) => {
            segmentEach(feature2, (segment2) => {
                if (lineOverlap(segment1, segment2).features.length) overlap++;
            });
        });
        break;

    case 'Polygon':
    case 'MultiPolygon':
        segmentEach(feature1, (segment1) => {
            segmentEach(feature2, (segment2) => {
                if (lineIntersect(segment1, segment2).features.length) overlap++;
            });
        });
        break;
    }

    return overlap > 0;
}

export default booleanOverlap;
