import { Feature, Polygon } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#intersect
 */
export default function <T extends Polygon>(
    poly1: Feature<T> | T,
    poly2: Feature<T> | T
): Feature<any> | null;
