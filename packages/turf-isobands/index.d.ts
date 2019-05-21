import { Point, MultiPolygon, FeatureCollection, Feature, Properties } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#isobands
 */
export default function isobands(
    points: FeatureCollection<Point>,
    breaks: number[],
    options?: {
        zProperty?: string;
        commonProperties?: Properties;
        breaksProperties?: Properties[];
    }
): FeatureCollection<MultiPolygon>;
