import { AllGeoJSON, Feature, Point, Properties } from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#centermean
 */
export default function (
    features: AllGeoJSON,
    options?: {
        properties?: Properties
        weight?: string
    }
): Feature<Point>;
