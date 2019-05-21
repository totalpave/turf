import { FeatureCollection, GeometryObject } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#sample
 */
export default function sample<T extends GeometryObject>(
    features: FeatureCollection<T>,
    num: number
): FeatureCollection<T>;
