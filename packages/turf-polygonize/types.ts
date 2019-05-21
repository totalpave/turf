import { lineString } from '@spatial/helpers'
import polygonize from './'

const line = lineString([[10, 10], [0, 0], [3, -5], [10, 10]])
polygonize(line)
