import { Feature, Point, AllGeoJSON } from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#pointonfeature
 */
export default function pointOnFeature(
    geojson: AllGeoJSON
): Feature<Point>;
