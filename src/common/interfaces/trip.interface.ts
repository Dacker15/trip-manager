import { TripTypology } from '@common/enums/trip-typology.enum'
import { Airport } from '@common/types/airport'

export interface Trip {
  origin: Airport
  destination: Airport
  cost: number
  duration: number
  type: TripTypology
  id: string // UUID v4
  display_name: string
}
