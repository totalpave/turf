import { polygon, validateBBox } from '@spatial/helpers';

/**
 * Takes a bbox and returns an equivalent {@link Polygon|polygon}.
 *
 * @name bboxPolygon
 * @param {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @returns {Feature<Polygon>} a Polygon representation of the bounding box
 * @example
 * var bbox = [0, 0, 10, 10];
 *
 * var poly = turf.bboxPolygon(bbox);
 *
 * //addToMap
 * var addToMap = [poly]
 */
function bboxPolygon(bbox) {
    validateBBox(bbox);
    // Convert BBox positions to Numbers
    // No performance loss for including Number()
    // https://github.com/Turfjs/turf/issues/1119
    const west = Number(bbox[0]);
    const south = Number(bbox[1]);
    const east = Number(bbox[2]);
    const north = Number(bbox[3]);

    if (bbox.length === 6) throw new Error('@spatial/bbox-polygon does not support BBox with 6 positions');

    const lowLeft = [west, south];
    const topLeft = [west, north];
    const topRight = [east, north];
    const lowRight = [east, south];

    return polygon([[
        lowLeft,
        lowRight,
        topRight,
        topLeft,
        lowLeft
    ]]);
}

export default bboxPolygon;
