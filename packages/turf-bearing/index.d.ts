import { Coord } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#bearing
 */
export default function bearing(
    start: Coord,
    end: Coord,
    options?: {
        final?: boolean
    }
): number;
