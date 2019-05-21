import { AllGeoJSON, Feature, Point, Properties } from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#centerofmass
 */
export default function (
    features: AllGeoJSON,
    properties?: Properties
): Feature<Point>;
