import { Units, Coord } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#distance
 */
export default function distance(
    from: Coord,
    to: Coord,
    options?: {
        units?: Units
    }
): number;
