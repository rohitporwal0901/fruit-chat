import { Injectable } from '@angular/core';
import { AddressOption } from '../models/user.model';

export interface GeocodeResult {
  detail: string;
  fullAddress: string;
  lat: number;
  lng: number;
  city?: string;
  pincode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private defaultCoords = { lat: 22.7196, lng: 75.8577 }; // Central default

  /**
   * Fetch current GPS location from browser navigator
   */
  async getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        resolve(this.defaultCoords);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.warn('Geolocation error or permission denied:', err.message);
          resolve(this.defaultCoords);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  /**
   * Reverse geocoding via OpenStreetMap Nominatim
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en'
        }
      });

      if (!res.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await res.json();
      const addr = data.address || {};

      const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.quarter || 'Location';
      const city = addr.city || addr.town || addr.village || addr.county || 'City';
      const pincode = addr.postcode || '';

      const detail = `${area}, ${city}`;
      const fullAddress = data.display_name || `${detail} ${pincode}`.trim();

      return {
        detail,
        fullAddress,
        lat,
        lng,
        city,
        pincode
      };
    } catch (e) {
      console.warn('Reverse geocode fallback:', e);
      return {
        detail: 'Selected Location',
        fullAddress: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        lat,
        lng
      };
    }
  }

  /**
   * Search locations by query string
   */
  async searchLocation(query: string): Promise<GeocodeResult[]> {
    if (!query || query.trim().length < 3) return [];
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      if (!res.ok) return [];
      const items = await res.json();
      return items.map((item: any) => {
        const addr = item.address || {};
        const area = addr.suburb || addr.neighbourhood || item.name || 'Location';
        const city = addr.city || addr.town || '';
        return {
          detail: city ? `${area}, ${city}` : area,
          fullAddress: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        };
      });
    } catch {
      return [];
    }
  }
}
