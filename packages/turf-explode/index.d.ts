import { AllGeoJSON, FeatureCollection, Point } from '@spatial/helpers'


/**
 * http://turfjs.org/docs/#explode
 */
export default function explode(
    features: AllGeoJSON
): FeatureCollection<Point>;
