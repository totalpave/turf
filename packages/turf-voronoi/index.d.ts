import { FeatureCollection, BBox, Point, Polygon } from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#voronoi
 */
export default function voronoi(
    points: FeatureCollection<Point>,
    bbox: BBox
): FeatureCollection<Polygon>;
