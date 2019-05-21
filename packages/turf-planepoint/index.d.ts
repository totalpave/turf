import { Feature, Coord, Polygon } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#planepoint
 */
export default function planepoint(
    point: Coord,
    triangle: Feature<Polygon> | Polygon
): number;
