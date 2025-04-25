import type { Address, GeoCoordinates } from "../models/Request"

export interface GeolocationService {
  geocodeAddress(address: Address): Promise<GeoCoordinates>
  calculateDistance(origin: GeoCoordinates, destination: GeoCoordinates): Promise<number>
}
