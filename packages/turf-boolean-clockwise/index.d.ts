import { Feature, LineString } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#booleanclockwise
 */
export default function (
    line: Feature<LineString> | LineString | number[][]
): boolean;
