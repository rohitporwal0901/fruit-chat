import { Injectable, signal } from '@angular/core';

export interface GeoLocation {
  lat: number;
  lng: number;
  displayName: string;
}

export interface RouteInfo {
  distanceKm: number;
  durationMinutes: number;
  route: [number, number][]; // array of [lat, lng] waypoints
}

export interface SearchResult {
  lat: number;
  lng: number;
  displayName: string;
  shortName: string;
  icon?: string;
  distanceKm?: number;
  distanceText?: string;
  type?: string;
}

export interface IndoreHotspot {
  name: string;
  aliases: string[];
  area: string;
  address: string;
  lat: number;
  lng: number;
  icon: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class MapService {

  // ── Fixed Pickup: Atal Dwar, LIG Colony, Indore ───────────
  // Real coordinates for Atal Dwar entrance at LIG/MIG Colony on AB Road
  readonly PICKUP: GeoLocation = {
    lat: 22.7378,
    lng: 75.8867,
    displayName: 'Atal Dwar, LIG, Indore, Madhya Pradesh'
  };

  // ── State ─────────────────────────────────────────────────
  dropLocation = signal<GeoLocation | null>(null);
  routeInfo    = signal<RouteInfo | null>(null);

  // ── Curated Top Indore Hotspots & Landmarks ───────────────
  // Instant 0ms response for popular search destinations in Indore
  readonly INDORE_PLACES: IndoreHotspot[] = [
    // Store Pickup
    {
      name: 'Atal Dwar (LIG Colony)',
      aliases: ['atal dwar', 'atal dwar lig', 'lig gate', 'lig entrance', 'atal'],
      area: 'LIG Colony',
      address: 'Atal Dwar, LIG Colony, AB Road, Indore, MP 452011',
      lat: 22.7378,
      lng: 75.8867,
      icon: '🏪',
      type: 'store'
    },
    // Malls & Shopping
    {
      name: 'Treasure Island (TI Mall)',
      aliases: ['ti', 'ti mall', 'treasure island', 'ti mg road'],
      area: 'MG Road',
      address: 'Treasure Island Mall, 11 MG Road, South Tukoganj, Indore, MP 452001',
      lat: 22.7216,
      lng: 75.8786,
      icon: '🛍️',
      type: 'mall'
    },
    {
      name: 'Phoenix Citadel Mall',
      aliases: ['phoenix', 'phoenix mall', 'citadel', 'phoenix citadel'],
      area: 'Bypass Road',
      address: 'Phoenix Citadel, MR 10 Junction, Bypass Road, Indore, MP 452016',
      lat: 22.7480,
      lng: 75.9430,
      icon: '🛍️',
      type: 'mall'
    },
    {
      name: 'C21 Mall',
      aliases: ['c21', 'c21 mall', 'c 21'],
      area: 'AB Road',
      address: 'C21 Mall, Plot 262, AB Road, Scheme 54, Indore, MP 452010',
      lat: 22.7505,
      lng: 75.8948,
      icon: '🛍️',
      type: 'mall'
    },
    {
      name: 'Malhar Mega Mall',
      aliases: ['malhar', 'malhar mall', 'malhar mega mall'],
      area: 'AB Road',
      address: 'Malhar Mega Mall, Scheme 54 PU-4, AB Road, Indore, MP 452010',
      lat: 22.7516,
      lng: 75.8955,
      icon: '🛍️',
      type: 'mall'
    },
    {
      name: 'Mangal City Mall',
      aliases: ['mangal city', 'mangal mall'],
      area: 'Vijay Nagar',
      address: 'Mangal City Mall, Vijay Nagar Square, AB Road, Indore, MP 452010',
      lat: 22.7520,
      lng: 75.8925,
      icon: '🛍️',
      type: 'mall'
    },
    // Food Hubs & Major Street Food
    {
      name: '56 Dukan (Chhappan Dukan)',
      aliases: ['56', '56 dukan', 'chhappan', 'chhappan dukan', 'chappan'],
      area: 'New Palasia',
      address: '56 Dukan Street, New Palasia, Indore, MP 452001',
      lat: 22.7244,
      lng: 75.8839,
      icon: '🍴',
      type: 'food'
    },
    {
      name: 'Sarafa Night Food Market',
      aliases: ['sarafa', 'sarafa bazaar', 'sarafa chaupati'],
      area: 'Rajwada',
      address: 'Sarafa Bazaar, Near Rajwada Palace, Indore, MP 452002',
      lat: 22.7195,
      lng: 75.8540,
      icon: '🍴',
      type: 'food'
    },
    {
      name: 'Anand Bazar Food Hub',
      aliases: ['anand bazar', 'anand bazaar'],
      area: 'Old Palasia',
      address: 'Anand Bazar Road, Old Palasia, Indore, MP 452001',
      lat: 22.7215,
      lng: 75.8910,
      icon: '🍴',
      type: 'food'
    },
    // Key Colonies & Residential / Commercial Hubs
    {
      name: 'Vijay Nagar Square',
      aliases: ['vijay nagar', 'vijay nagar sq', 'vijay nagar chowk'],
      area: 'Vijay Nagar',
      address: 'Vijay Nagar Square, AB Road, Indore, MP 452010',
      lat: 22.7533,
      lng: 75.8937,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'LIG Square / LIG Colony',
      aliases: ['lig', 'lig square', 'lig circle', 'lig colony'],
      area: 'LIG',
      address: 'LIG Colony Square, AB Road, Indore, MP 452011',
      lat: 22.7380,
      lng: 75.8860,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'MIG Colony / Patnipura',
      aliases: ['mig', 'mig colony', 'patnipura', 'patnipura square'],
      area: 'MIG',
      address: 'Patnipura Square, MIG Colony, Indore, MP 452011',
      lat: 22.7368,
      lng: 75.8855,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'New Palasia',
      aliases: ['new palasia', 'palasia', 'palasia square'],
      area: 'Palasia',
      address: 'New Palasia, Near Industry House, Indore, MP 452001',
      lat: 22.7262,
      lng: 75.8830,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Old Palasia',
      aliases: ['old palasia'],
      area: 'Palasia',
      address: 'Old Palasia, Near Saket Square, Indore, MP 452018',
      lat: 22.7210,
      lng: 75.8885,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Geeta Bhawan Square',
      aliases: ['geeta bhawan', 'gita bhawan', 'geeta bhawan chowk'],
      area: 'Manoramaganj',
      address: 'Geeta Bhawan Square, AB Road, Indore, MP 452001',
      lat: 22.7160,
      lng: 75.8825,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Rajwada Palace',
      aliases: ['rajwada', 'rajwada square', 'rajwada chowk'],
      area: 'Rajwada',
      address: 'Rajwada Palace, MG Road, Indore, MP 452002',
      lat: 22.7186,
      lng: 75.8557,
      icon: '🏰',
      type: 'landmark'
    },
    {
      name: 'Bhawarkua Square (Bhanwarkuan)',
      aliases: ['bhawarkua', 'bhanwarkuan', 'bhawar kuan', 'bhanwarkua'],
      area: 'Bhawarkua',
      address: 'Bhanwarkuan Square, AB Road, Indore, MP 452001',
      lat: 22.6933,
      lng: 75.8672,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Sapna Sangeeta Road',
      aliases: ['sapna sangeeta', 'sapna sangita', 'tower square'],
      area: 'Tower Square',
      address: 'Sapna Sangeeta Road, Near Tower Chauraha, Indore, MP 452001',
      lat: 22.7045,
      lng: 75.8670,
      icon: '🛍️',
      type: 'area'
    },
    {
      name: 'Annapurna Road / Temple',
      aliases: ['annapurna', 'annapurna temple', 'annapurna square'],
      area: 'Annapurna',
      address: 'Annapurna Road, Near Annapurna Temple, Indore, MP 452009',
      lat: 22.6980,
      lng: 75.8360,
      icon: '🛕',
      type: 'landmark'
    },
    {
      name: 'Sudama Nagar',
      aliases: ['sudama nagar'],
      area: 'Sudama Nagar',
      address: 'Sudama Nagar, Near Narendra Tiwari Marg, Indore, MP 452009',
      lat: 22.6990,
      lng: 75.8280,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Scheme 54 (PU-4)',
      aliases: ['scheme 54', 'pu4', 'pu-4'],
      area: 'Vijay Nagar',
      address: 'Scheme No. 54, Near Meghdoot Garden, Indore, MP 452010',
      lat: 22.7540,
      lng: 75.8920,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Scheme 78 (Aranya Nagar)',
      aliases: ['scheme 78', 'scheme no 78', 'aranya'],
      area: 'Vijay Nagar',
      address: 'Scheme No. 78, Aranya Nagar, Indore, MP 452010',
      lat: 22.7680,
      lng: 75.8940,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Scheme 140 (Pipliyahana)',
      aliases: ['scheme 140', 'pipliyahana', 'pipliyahana square'],
      area: 'Pipliyahana',
      address: 'Scheme No. 140, Near World Cup Square, Indore, MP 452016',
      lat: 22.7130,
      lng: 75.9080,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Bengali Square',
      aliases: ['bengali square', 'bengali chowk', 'bengali'],
      area: 'Ring Road',
      address: 'Bengali Square, Ring Road, Indore, MP 452016',
      lat: 22.7155,
      lng: 75.9125,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Khajrana Ganesh Temple',
      aliases: ['khajrana', 'khajrana mandir', 'khajrana temple'],
      area: 'Khajrana',
      address: 'Khajrana Ganesh Mandir Road, Khajrana, Indore, MP 452016',
      lat: 22.7305,
      lng: 75.9055,
      icon: '🛕',
      type: 'landmark'
    },
    {
      name: 'Mahalaxmi Nagar',
      aliases: ['mahalaxmi nagar', 'mahalaxmi'],
      area: 'Near Bombay Hospital',
      address: 'Mahalaxmi Nagar, Ring Road, Indore, MP 452010',
      lat: 22.7610,
      lng: 75.9030,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Tilak Nagar',
      aliases: ['tilak nagar'],
      area: 'Tilak Nagar',
      address: 'Tilak Nagar, Kanadia Road, Indore, MP 452018',
      lat: 22.7180,
      lng: 75.8990,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'South Tukoganj',
      aliases: ['south tukoganj', 'tukoganj'],
      area: 'Tukoganj',
      address: 'South Tukoganj, Near Nath Mandir, Indore, MP 452001',
      lat: 22.7190,
      lng: 75.8740,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Bombay Hospital Indore',
      aliases: ['bombay hospital', 'bombay hospital square'],
      area: 'Ring Road',
      address: 'Bombay Hospital, Ring Road, Scheme 94C, Indore, MP 452010',
      lat: 22.7580,
      lng: 75.8985,
      icon: '🏥',
      type: 'hospital'
    },
    {
      name: 'Medanta Hospital Indore',
      aliases: ['medanta', 'medanta hospital'],
      area: 'Vijay Nagar',
      address: 'Medanta Super Specialty Hospital, Scheme 54, Indore, MP 452010',
      lat: 22.7595,
      lng: 75.8940,
      icon: '🏥',
      type: 'hospital'
    },
    {
      name: 'Indore Railway Station (Junction)',
      aliases: ['indore junction', 'railway station', 'station'],
      area: 'Chhoti Gwaltoli',
      address: 'Indore Junction Railway Station, Chhoti Gwaltoli, Indore, MP 452001',
      lat: 22.7170,
      lng: 75.8675,
      icon: '🚉',
      type: 'station'
    },
    {
      name: 'Devi Ahilya Bai Holkar Airport',
      aliases: ['airport', 'indore airport', 'dabha'],
      area: 'Depalpur Road',
      address: 'Devi Ahilyabai Holkar Airport, Depalpur Road, Indore, MP 452005',
      lat: 22.7250,
      lng: 75.8030,
      icon: '✈️',
      type: 'station'
    },
    {
      name: 'MR 10 Square',
      aliases: ['mr 10', 'mr10', 'mr 10 square'],
      area: 'MR 10',
      address: 'MR 10 Square, AB Road Junction, Indore, MP 452010',
      lat: 22.7660,
      lng: 75.8850,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Super Corridor (TCS / Infosys)',
      aliases: ['super corridor', 'tcs square', 'infosys square'],
      area: 'Super Corridor',
      address: 'Super Corridor Road, Tigaria Badshah, Indore, MP 452005',
      lat: 22.7550,
      lng: 75.8200,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Rau Circle',
      aliases: ['rau', 'rau circle', 'rau bypass'],
      area: 'Rau',
      address: 'Rau Circle, AB Road Bypass, Indore, MP 453331',
      lat: 22.6370,
      lng: 75.8060,
      icon: '📍',
      type: 'area'
    },
    {
      name: 'Silicon City',
      aliases: ['silicon city', 'silicon'],
      area: 'Rau',
      address: 'Silicon City, AB Road, Rau, Indore, MP 452012',
      lat: 22.6480,
      lng: 75.8200,
      icon: '📍',
      type: 'area'
    }
  ];

  // ── Delivery Charge Formula ───────────────────────────────
  // 0-2 km   → ₹15 flat
  // 2-5 km   → ₹15 + (dist-2) × ₹5
  // 5-10 km  → ₹30 + (dist-5) × ₹8
  // >10 km   → not serviceable
  getDeliveryCharge(distanceKm: number): number {
    if (distanceKm <= 0) return 15;
    if (distanceKm <= 2) return 15;
    if (distanceKm <= 5) return Math.round(15 + (distanceKm - 2) * 5);
    if (distanceKm <= 10) return Math.round(30 + (distanceKm - 5) * 8);
    return -1; // not serviceable
  }

  isServiceable(distanceKm: number): boolean {
    return distanceKm > 0 && distanceKm <= 10;
  }

  getEtaMinutes(distanceKm: number, drivingDurationMin?: number): number {
    if (drivingDurationMin && drivingDurationMin > 0) {
      // 8 mins prep time + driving duration
      return Math.max(12, Math.round(8 + drivingDurationMin));
    }
    // Fallback: 8 min prep + ~2.8 min per km (Indore city average)
    return Math.max(12, Math.round(8 + distanceKm * 2.8));
  }

  // ── Haversine Distance (km) ───────────────────────────────
  getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  // ── Google Maps-like Autocomplete Search ───────────────────
  // Combines curated instant Indore database + Photon Komoot API with Indore bias
  async searchAddress(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) return [];
    const qClean = query.trim().toLowerCase();
    const results: SearchResult[] = [];
    const seenCoordinates = new Set<string>();

    const coordKey = (lat: number, lng: number) =>
      `${lat.toFixed(3)},${lng.toFixed(3)}`;

    // 1. Instant Curated Local Search (0ms response)
    const localMatches = this.INDORE_PLACES.filter(place => {
      if (place.name.toLowerCase().includes(qClean)) return true;
      if (place.area.toLowerCase().includes(qClean)) return true;
      if (place.aliases.some(alias => alias.includes(qClean) || qClean.includes(alias))) return true;
      return false;
    });

    for (const p of localMatches) {
      const key = coordKey(p.lat, p.lng);
      if (!seenCoordinates.has(key)) {
        seenCoordinates.add(key);
        const dist = this.getHaversineDistanceKm(this.PICKUP.lat, this.PICKUP.lng, p.lat, p.lng);
        results.push({
          lat: p.lat,
          lng: p.lng,
          shortName: p.name,
          displayName: p.address,
          icon: p.icon,
          distanceKm: dist,
          distanceText: `${dist} km away`,
          type: p.type
        });
      }
    }

    // If query is short and we already found local matches, return early
    if (qClean.length < 2 && results.length > 0) {
      return results.slice(0, 6);
    }

    // 2. Query Photon API (Komoot - OpenStreetMap, free, fast, fuzzy autocomplete biased to Indore)
    try {
      const photonUrl = `https://photon.komoot.io/api/?` +
        `q=${encodeURIComponent(query)}&` +
        `lat=${this.PICKUP.lat}&lon=${this.PICKUP.lng}&` +
        `limit=10`;

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2500); // 2.5s timeout

      const res = await fetch(photonUrl, { signal: ctrl.signal });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const features = data.features || [];

        for (const f of features) {
          const p = f.properties || {};
          const [lng, lat] = f.geometry?.coordinates || [0, 0];
          if (!lat || !lng) continue;

          // Filter within Indore metro area (~45km radius of Indore) or India
          const distToIndore = Math.hypot(lat - this.PICKUP.lat, lng - this.PICKUP.lng);
          const country = (p.country || '').toLowerCase();
          const isIndia = country === 'india' || p.countrycode === 'IN';
          if (!isIndia && distToIndore > 0.45) continue;

          const key = coordKey(lat, lng);
          if (seenCoordinates.has(key)) continue;
          seenCoordinates.add(key);

          const name = p.name || p.street || p.district || 'Location';
          const parts = [
            p.street,
            p.district || p.suburb,
            p.city || 'Indore',
            p.state || 'Madhya Pradesh',
            p.postcode
          ].filter(Boolean);
          const fullAddress = parts.length > 0 ? parts.join(', ') : `${name}, Indore`;

          const dist = this.getHaversineDistanceKm(this.PICKUP.lat, this.PICKUP.lng, lat, lng);
          const icon = p.osm_value === 'shop' || p.osm_key === 'shop' ? '🛍️'
            : p.osm_value === 'restaurant' || p.osm_value === 'fast_food' ? '🍴'
            : p.osm_value === 'hospital' ? '🏥'
            : '📍';

          results.push({
            lat,
            lng,
            shortName: name,
            displayName: fullAddress,
            icon,
            distanceKm: dist,
            distanceText: `${dist} km away`,
            type: p.osm_value || 'area'
          });

          if (results.length >= 8) break;
        }
      }
    } catch {
      // Photon fallback silent ignore
    }

    // 3. Fallback: If still few results, try Nominatim India
    if (results.length < 2 && qClean.length >= 3) {
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query + ', Indore')}&` +
          `format=json&limit=5&addressdetails=1&countrycodes=in`;

        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 2000);
        const res = await fetch(nomUrl, {
          signal: ctrl.signal,
          headers: { 'Accept-Language': 'en', 'User-Agent': 'FruitChatApp/1.0' }
        });
        clearTimeout(timer);

        if (res.ok) {
          const items = await res.json();
          for (const item of items) {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            const key = coordKey(lat, lng);
            if (seenCoordinates.has(key)) continue;
            seenCoordinates.add(key);

            const dist = this.getHaversineDistanceKm(this.PICKUP.lat, this.PICKUP.lng, lat, lng);
            results.push({
              lat,
              lng,
              shortName: this.shortenAddress(item.display_name),
              displayName: item.display_name,
              icon: '📍',
              distanceKm: dist,
              distanceText: `${dist} km away`
            });
          }
        }
      } catch {
        // Fallback silent ignore
      }
    }

    return results.slice(0, 8);
  }

  // ── Reverse Geocode (lat/lng → readable address) ───────────
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    // 1. Check if point is very close to our curated hotspots (< 250m)
    for (const p of this.INDORE_PLACES) {
      const d = this.getHaversineDistanceKm(lat, lng, p.lat, p.lng);
      if (d < 0.25) {
        return p.address;
      }
    }

    // 2. Query Nominatim reverse geocode
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'Accept-Language': 'en', 'User-Agent': 'FruitChatApp/1.0' }
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          // Format cleanly
          const addr = data.address || {};
          const main = addr.road || addr.suburb || addr.neighbourhood || addr.amenity || data.name;
          const colony = addr.suburb || addr.city_district || addr.quarter;
          const city = addr.city || addr.town || 'Indore';

          if (main && colony && main !== colony) {
            return `${main}, ${colony}, ${city}`;
          }
          return this.cleanReverseAddress(data.display_name);
        }
      }
    } catch {
      // Ignore
    }

    return `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}, Indore`;
  }

  // ── OSRM: Road Route + Distance with Reliable Fallback ────
  async getRoute(
    fromLat: number, fromLng: number,
    toLat: number, toLng: number
  ): Promise<RouteInfo | null> {
    const url = `https://router.project-osrm.org/route/v1/driving/` +
      `${fromLng},${fromLat};${toLng},${toLat}?` +
      `overview=full&geometries=geojson`;

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000); // 4s timeout

      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.length > 0) {
          const route = data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates
            .map((c: [number, number]) => [c[1], c[0]] as [number, number]);

          const distanceKm = parseFloat((route.distance / 1000).toFixed(2));
          const durationMinutes = Math.round(route.duration / 60);

          return {
            distanceKm,
            durationMinutes,
            route: coords
          };
        }
      }
    } catch (err) {
      console.warn('OSRM routing fetch failed or timed out, applying intelligent road fallback:', err);
    }

    // High reliability fallback: Haversine distance with 1.30 road winding factor for Indore
    const straightKm = this.getHaversineDistanceKm(fromLat, fromLng, toLat, toLng);
    const estRoadDist = parseFloat((straightKm * 1.30).toFixed(2));
    const estDuration = Math.max(5, Math.round(estRoadDist * 2.8));

    // Generate intermediate waypoints for smooth polyline
    const steps = 6;
    const fallbackCoords: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      fallbackCoords.push([
        fromLat + (toLat - fromLat) * f,
        fromLng + (toLng - fromLng) * f
      ]);
    }

    return {
      distanceKm: estRoadDist,
      durationMinutes: estDuration,
      route: fallbackCoords
    };
  }

  // ── Address Cleaning Helpers ──────────────────────────────
  private shortenAddress(fullAddress: string): string {
    const parts = fullAddress.split(',');
    if (parts.length >= 2) {
      return parts.slice(0, 2).join(',').trim();
    }
    return fullAddress.slice(0, 50);
  }

  private cleanReverseAddress(fullAddress: string): string {
    const parts = fullAddress.split(',').map(s => s.trim());
    if (parts.length > 4) {
      // Pick first 3-4 meaningful parts (e.g. Landmark, Area, Indore)
      return parts.slice(0, 4).join(', ');
    }
    return fullAddress;
  }

  clearDrop(): void {
    this.dropLocation.set(null);
    this.routeInfo.set(null);
  }
}
