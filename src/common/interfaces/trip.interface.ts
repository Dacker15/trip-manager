export interface Trip {
  origin: string // IATA code
  destination: string // IATA code
  cost: number
  duration: number
  type: string // Restricted to options
  id: string // UUID v4
  display_name: string
}
