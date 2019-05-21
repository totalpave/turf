import { AllGeoJSON, Coord } from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#transformrotate
 */
export default function transformRotate<T extends AllGeoJSON>(
    geojson: T,
    angle: number,
    options?: {
        pivot?: Coord,
        mutate?: boolean
    }
): T;