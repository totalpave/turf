import { Point, Polygon, Units, FeatureCollection, Grid } from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#interpolate
 */
export default function interpolate(
    points: FeatureCollection<Point>,
    cellSize: number,
    options?: {
        gridType?: 'point',
        property?: string,
        units?: Units,
        weight?: number
    }
): FeatureCollection<Point>;
export default function interpolate(
    points: FeatureCollection<Point>,
    cellSize: number,
    options?: {
        gridType?: Grid,
        property?: string,
        units?: Units,
        weight?: number
    }
): FeatureCollection<Polygon>;
