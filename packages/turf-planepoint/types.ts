import { point, polygon } from '@spatial/helpers';
import planepoint from './';

const pt = point([1, 1]);
const triangle = polygon([[[0, 0, 0], [2, 0, 0], [1, 2, 2], [0, 0, 0]]]);

planepoint(pt, triangle);
planepoint(pt.geometry.coordinates, triangle);
planepoint(pt.geometry, triangle.geometry);
