import { Point, FeatureCollection, Polygon } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#tin
 */
export default function tin(
    points: FeatureCollection<Point>,
    z?: string
): FeatureCollection<Polygon>;
