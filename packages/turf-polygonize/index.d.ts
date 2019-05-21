import { Feature, FeatureCollection, Coord, Polygon, LineString, MultiLineString } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#polygonize
 */
export default function <T extends LineString | MultiLineString>(
    geojson: Feature<T> | FeatureCollection<T> | T
): FeatureCollection<Polygon>;
