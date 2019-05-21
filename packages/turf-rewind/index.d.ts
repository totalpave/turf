import { AllGeoJSON } from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#rewind
 */
export default function rewind<T extends AllGeoJSON>(
    geojson: T,
    options?: {
        reversed?: boolean,
        mutate?: boolean
    }
): T;
