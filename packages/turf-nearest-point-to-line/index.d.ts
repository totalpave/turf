import {
  Units,
  LineString,
  Feature,
  FeatureCollection,
  GeometryCollection,
  Properties,
  Coord,
  Point,
  geometryCollection
} from '@spatial/helpers'

export interface NearestPointToLineProperties {
  dist: number
  [key: string]: any
}

/**
 * http://turfjs.org/docs/#nearestpointtoline
 */
export default function nearestPointToLine<P = NearestPointToLineProperties> (
    points: FeatureCollection<Point> | Feature<GeometryCollection> | GeometryCollection,
    line: Feature<LineString> | LineString,
    options?: {
      units?: Units,
      properties?: P
    }
): Feature<Point, P>;
