import type { GeolocationService } from "../domain/services/GeolocationService"
import type { Address, GeoCoordinates } from "../domain/models/Request"
import { logger } from "../utils/logger"

export class GeolocationServiceImpl implements GeolocationService {
  async geocodeAddress(address: Address): Promise<GeoCoordinates> {
    try {
      // In a real implementation, this would call a geocoding API
      // For now, we'll return mock coordinates
      logger.debug("Geocoding address", { address })

      // Mock implementation - in production, integrate with a geocoding service
      // This simulates a geocoding service by generating coordinates based on the address
      const hash = this.simpleHash(`${address.street}${address.city}${address.postalCode}${address.country}`)

      // Generate latitude between -90 and 90
      const latitude = (hash % 180) - 90

      // Generate longitude between -180 and 180
      const longitude = (hash % 360) - 180

      return {
        latitude,
        longitude,
      }
    } catch (error) {
      logger.error("Error geocoding address", {
        error: error instanceof Error ? error.message : "Unknown error",
        address,
      })
      throw error
    }
  }

  async calculateDistance(origin: GeoCoordinates, destination: GeoCoordinates): Promise<number> {
    try {
      // Haversine formula to calculate distance between two points on Earth
      const R = 6371 // Earth's radius in km
      const dLat = this.toRadians(destination.latitude - origin.latitude)
      const dLon = this.toRadians(destination.longitude - origin.longitude)

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRadians(origin.latitude)) *
          Math.cos(this.toRadians(destination.latitude)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      return distance
    } catch (error) {
      logger.error("Error calculating distance", {
        error: error instanceof Error ? error.message : "Unknown error",
        origin,
        destination,
      })
      throw error
    }
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
}
