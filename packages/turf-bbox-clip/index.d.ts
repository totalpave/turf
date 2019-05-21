import { BBox, LineString, MultiLineString, Polygon, MultiPolygon, Feature } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#bboxclip
 */
export default function <T extends Polygon|MultiPolygon|LineString|MultiLineString>(
    feature: Feature<T> | T,
    bbox: BBox
): Feature<T>;
