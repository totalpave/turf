import {
    LineString,
    MultiLineString,
    GeometryCollection,
    Units,
    Feature,
    FeatureCollection,
} from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#linechunk
 */
export default function lineChunk<T extends LineString | MultiLineString>(
    geojson: Feature<T> | FeatureCollection<T> | T | GeometryCollection| Feature<GeometryCollection>,
    segmentLength: number,
    options?: {
        units?: Units,
        reverse?: boolean
    }
): FeatureCollection<LineString>;
