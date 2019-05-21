import {
    FeatureCollection,
    Feature,
    Point,
    LineString,
    MultiLineString,
    Polygon,
    MultiPolygon
} from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#lineintersect
 */
export default function lineIntersect<T extends LineString, MultiLineString, Polygon, MultiPolygon>(
    line1: Feature<T> | FeatureCollection<T> | T,
    line2: Feature<T> | FeatureCollection<T> | T,
): FeatureCollection<Point>;
