import { LineString, Feature, Coord } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#booleanpointonline
 */
export default function (
    point: Coord,
    linestring: Feature<LineString> | LineString,
    options?: {
        ignoreEndVertices?: boolean
    }
): boolean;
