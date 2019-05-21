import { Coord } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#rhumbbearing
 */
export default function rhumbBearing(
    start: Coord,
    end: Coord,
    options?: {
        final?: boolean;
    }
): number;
