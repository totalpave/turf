import { Coord, Feature, LineString, Units } from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#linearc
 */
export default function lineArc(
    center: Coord,
    radius: number,
    bearing1: number,
    bearing2: number,
    options?: {
        steps?: number,
        units?: Units
    }
): Feature<LineString>;
