import { FeatureCollection, Polygon } from '@spatial/helpers'

/**
 * http://turfjs.org/docs.html#dissolve
 */
export default function dissolve(
    featureCollection: FeatureCollection<Polygon>,
    options?: {
      propertyName?: string
    }
): FeatureCollection<Polygon>;
