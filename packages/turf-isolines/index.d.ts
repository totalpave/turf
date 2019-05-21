import { Point, MultiLineString, FeatureCollection, Properties } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#isolines
 */
export default function isolines(
    points: FeatureCollection<Point>,
    breaks: number[],
    options?: {
        zProperty?: string,
        commonProperties?: Properties,
        breaksProperties?: Properties[]
    }
): FeatureCollection<MultiLineString>;
