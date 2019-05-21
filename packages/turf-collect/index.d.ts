import { FeatureCollection, Polygon, Feature, Point } from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#collect
 */
export default function (
    polygons: FeatureCollection<Polygon>,
    points: FeatureCollection<Point>,
    inProperty: string,
    outProperty: string
): FeatureCollection<Polygon>;
