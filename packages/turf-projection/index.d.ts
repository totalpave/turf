import { AllGeoJSON, Position} from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#toMercator
 */
export function toMercator<T extends AllGeoJSON | Position>(
    geojson: T,
    options?: {
        mutate?: boolean
    }
): T;

/**
 * http://turfjs.org/docs/#toWgs84
 */
export function toWgs84<T extends AllGeoJSON | Position>(
    geojson: T,
    options?: {
        mutate?: boolean
    }
): T;
