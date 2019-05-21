import { Feature, FeatureCollection, Polygon } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#tesselate
 */
export default function (polygon: Feature<Polygon>): FeatureCollection<Polygon>;
