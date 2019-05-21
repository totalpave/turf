import { Feature, GeometryObject } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#booleanwithin
 */
export default function (
    feature1: Feature<any> | GeometryObject,
    feature2: Feature<any> | GeometryObject
): boolean;
