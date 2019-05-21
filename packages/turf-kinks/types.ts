import {polygon} from '@spatial/helpers'
import kinks from './'

const hourglass = polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
kinks(hourglass)
