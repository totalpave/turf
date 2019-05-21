import { Feature, LineString, Units, Coord } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#pointtolinedistance
 */
export default function pointToLineDistance(
    pt: Coord,
    line: Feature<LineString> | LineString,
    options?: {
        units?: Units,
        mercator?: boolean
    }
): number;
