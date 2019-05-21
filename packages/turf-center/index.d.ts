import { AllGeoJSON, Feature, Point, Properties } from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#center
 */
export default function (
    features: AllGeoJSON,
    options?: {
        properties?: Properties
    }
): Feature<Point>;
