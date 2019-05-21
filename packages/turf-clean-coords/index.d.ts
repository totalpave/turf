import { Feature, GeometryObject } from '@spatial/helpers'

/**
 * http://turfjs.org/docs/#cleancoords
 */
export default function <T extends GeometryObject | Feature<any>>(
    feature: T,
    options?: {
      mutate?: boolean
    }
): T;
