import { Feature, Point, Units, Coord, Properties } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#destination
 */
export default function destination<P = Properties>(
    origin: Coord,
    distance: number,
    bearing: number,
    options?: {
        units?: Units,
        properties?: P
    }
): Feature<Point, P>;
