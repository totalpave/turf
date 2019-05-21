import { Feature, Units, LineString, Point } from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#along
 */
export default function (
    line: Feature<LineString> | LineString,
    distance: number,
    options?: {
        units?: Units;
    }
): Feature<Point>;
