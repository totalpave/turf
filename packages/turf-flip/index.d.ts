import { AllGeoJSON } from '@spatial/helpers'

export default function flip<T extends AllGeoJSON>(
    geojson: T,
    options?: {
        mutate?: boolean
    }
): T
