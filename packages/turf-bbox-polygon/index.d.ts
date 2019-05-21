import { BBox, Feature, Polygon } from '@spatial/helpers';

/**
 * http://turfjs.org/docs/#bboxpolygon
 */
export default function (bbox: BBox): Feature<Polygon>;
