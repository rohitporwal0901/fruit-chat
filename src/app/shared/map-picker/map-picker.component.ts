import { Component, inject, signal, output, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService, GeocodeResult } from '../../core/services/location.service';
import { AddressOption } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

declare const L: any;

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="map-modal-backdrop" (click)="close()">
      <div class="map-modal-card" (click)="$event.stopPropagation()">
        
        <!-- HEADER -->
        <div class="map-header">
          <div class="header-info">
            <h3 class="header-title">Select Delivery Location</h3>
            <p class="header-sub">Move map to place pin accurately</p>
          </div>
          <button class="close-btn" (click)="close()" type="button" aria-label="Close">✕</button>
        </div>

        <!-- SEARCH BAR OVER MAP -->
        <div class="search-overlay">
          <div class="search-input-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search area, apartment or landmark..." 
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
            />
            @if (searchQuery) {
              <button class="clear-btn" (click)="searchQuery = ''; searchResults.set([])">✕</button>
            }
          </div>

          <!-- SEARCH SUGGESTIONS -->
          @if (searchResults().length > 0) {
            <div class="search-results-list">
              @for (item of searchResults(); track item.fullAddress) {
                <div class="search-item" (click)="selectSearchResult(item)">
                  <span class="item-icon">📍</span>
                  <div class="item-text">
                    <strong class="item-main">{{ item.detail }}</strong>
                    <span class="item-sub">{{ item.fullAddress }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- MAP CONTAINER -->
        <div class="map-wrapper">
          <div #mapContainer class="leaflet-map"></div>
          
          <!-- FIXED CENTER PIN (SWIGGY/ZOMATO STYLE) -->
          <div class="center-pin-container" [class.bouncing]="isDragging()">
            <div class="pin-pulse"></div>
            <div class="pin-icon">
              <svg viewBox="0 0 24 24" width="38" height="38" fill="#2E7D32">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>

          <!-- CURRENT GPS BUTTON -->
          <button class="gps-float-btn" (click)="locateCurrentPosition()" [disabled]="isLocating()" type="button">
            @if (isLocating()) {
              <div class="spinner"></div>
            } @else {
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2E7D32" stroke-width="2.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
              </svg>
            }
            <span>Use Current Location</span>
          </button>
        </div>

        <!-- BOTTOM ADDRESS DETAILS SHEET -->
        <div class="location-details-sheet">
          <div class="address-preview">
            <div class="addr-badge">DELIVERING TO</div>
            <h4 class="addr-heading">{{ currentDetail() || 'Detecting location...' }}</h4>
            <p class="addr-full">{{ currentFullAddress() }}</p>
          </div>

          <!-- FLAT / HOUSE NO INPUT -->
          <div class="form-row">
            <input 
              type="text" 
              class="flat-input" 
              placeholder="House / Flat / Floor No. (Optional)" 
              [(ngModel)]="flatNumber"
            />
          </div>

          <!-- ADDRESS TAG SELECTOR -->
          <div class="tag-selector">
            <span class="tag-title">Save as:</span>
            <div class="tag-pills">
              <button 
                type="button" 
                class="tag-pill" 
                [class.active]="selectedTag() === 'Home'" 
                (click)="selectedTag.set('Home')"
              >
                🏠 Home
              </button>
              <button 
                type="button" 
                class="tag-pill" 
                [class.active]="selectedTag() === 'Work'" 
                (click)="selectedTag.set('Work')"
              >
                🏢 Work
              </button>
              <button 
                type="button" 
                class="tag-pill" 
                [class.active]="selectedTag() === 'Other'" 
                (click)="selectedTag.set('Other')"
              >
                📍 Other
              </button>
            </div>
          </div>

          <!-- CONFIRM BUTTON -->
          <button 
            type="button" 
            class="confirm-btn" 
            [disabled]="isGeocoding()"
            (click)="confirmLocation()"
          >
            @if (isGeocoding()) {
              <span>Detecting Address...</span>
            } @else {
              <span>Confirm Location & Proceed</span>
            }
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .map-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      z-index: 3000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    }

    @media (min-width: 768px) {
      .map-modal-backdrop {
        align-items: center;
        padding: 20px;
      }
    }

    .map-modal-card {
      width: 100%;
      max-width: 520px;
      background: #ffffff;
      border-radius: 24px 24px 0 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      max-height: 92vh;
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @media (min-width: 768px) {
      .map-modal-card {
        border-radius: 24px;
        height: 85vh;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .map-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      background: #ffffff;
      border-bottom: 1px solid #F0F0F0;
      z-index: 10;
    }

    .header-title {
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 800;
      color: #111827;
      margin: 0;
    }

    .header-sub {
      font-size: 11.5px;
      color: #6B7280;
      margin: 2px 0 0;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: #F3F4F6;
      color: #374151;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      &:active { background: #E5E7EB; }
    }

    /* SEARCH OVERLAY */
    .search-overlay {
      position: absolute;
      top: 68px;
      left: 14px;
      right: 14px;
      z-index: 1000;
    }

    .search-input-box {
      display: flex;
      align-items: center;
      background: #ffffff;
      border-radius: 12px;
      padding: 9px 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
      border: 1px solid #E5E7EB;
    }

    .search-icon {
      width: 16px;
      height: 16px;
      color: #2E7D32;
      flex-shrink: 0;
      margin-right: 8px;
    }

    .search-input-box input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 13px;
      color: #111827;
      font-family: inherit;
      &::placeholder { color: #9CA3AF; }
    }

    .clear-btn {
      border: none;
      background: transparent;
      color: #9CA3AF;
      font-size: 13px;
      cursor: pointer;
    }

    .search-results-list {
      margin-top: 6px;
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      max-height: 190px;
      overflow-y: auto;
      border: 1px solid #E5E7EB;
    }

    .search-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 14px;
      cursor: pointer;
      border-bottom: 1px solid #F3F4F6;
      &:last-child { border-bottom: none; }
      &:active, &:hover { background: #F9FAFB; }
    }

    .item-icon { font-size: 16px; flex-shrink: 0; margin-top: 2px; }
    .item-text { display: flex; flex-direction: column; min-width: 0; }
    .item-main { font-size: 13px; color: #111827; font-weight: 700; }
    .item-sub { font-size: 11px; color: #6B7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 380px; }

    /* MAP WRAPPER */
    .map-wrapper {
      position: relative;
      height: 250px;
      width: 100%;
      background: #e5e3df;
      overflow: hidden;
    }

    @media (min-width: 768px) {
      .map-wrapper {
        height: 320px;
      }
    }

    .leaflet-map {
      width: 100%;
      height: 100%;
    }

    /* CENTER PIN */
    .center-pin-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -100%);
      pointer-events: none;
      z-index: 999;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.15s ease-out;
      &.bouncing {
        transform: translate(-50%, -120%);
      }
    }

    .pin-pulse {
      position: absolute;
      bottom: 0;
      width: 12px;
      height: 6px;
      background: rgba(0, 0, 0, 0.25);
      border-radius: 50%;
      filter: blur(1px);
    }

    .pin-icon {
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
    }

    /* GPS BUTTON */
    .gps-float-btn {
      position: absolute;
      bottom: 14px;
      right: 14px;
      background: #ffffff;
      border: 1.5px solid #2E7D32;
      border-radius: 999px;
      padding: 7px 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #2E7D32;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
      z-index: 999;
      &:active { transform: scale(0.96); }
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #2E7D32;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* DETAILS SHEET */
    .location-details-sheet {
      padding: 16px 18px 22px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .addr-badge {
      font-size: 9.5px;
      font-weight: 800;
      color: #2E7D32;
      letter-spacing: 0.6px;
    }

    .addr-heading {
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 800;
      color: #111827;
      margin: 3px 0 2px;
    }

    .addr-full {
      font-size: 11.5px;
      color: #6B7280;
      line-height: 1.4;
      margin: 0;
      max-height: 34px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .flat-input {
      width: 100%;
      border: 1.5px solid #E5E7EB;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
      font-family: inherit;
      &:focus {
        border-color: #2E7D32;
        box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
      }
    }

    .tag-selector {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .tag-title {
      font-size: 12px;
      font-weight: 700;
      color: #374151;
    }

    .tag-pills {
      display: flex;
      gap: 8px;
    }

    .tag-pill {
      border: 1.5px solid #E5E7EB;
      background: #F9FAFB;
      border-radius: 999px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 700;
      color: #4B5563;
      cursor: pointer;
      transition: all 0.15s ease;
      &.active {
        border-color: #2E7D32;
        background: #E8F5E9;
        color: #1B5E20;
      }
    }

    .confirm-btn {
      width: 100%;
      background: #2E7D32;
      color: #ffffff;
      border: none;
      border-radius: 14px;
      padding: 13px;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(46, 125, 50, 0.3);
      transition: all 0.2s ease;
      &:active {
        transform: scale(0.98);
        background: #1B5E20;
      }
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  `]
})
export class MapPickerComponent implements AfterViewInit, OnDestroy {
  private locationService = inject(LocationService);
  private authService = inject(AuthService);

  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;

  readonly onSelect = output<AddressOption>();
  readonly onClose = output<void>();

  // Map state
  private map: any = null;
  readonly isDragging = signal<boolean>(false);
  readonly isLocating = signal<boolean>(false);
  readonly isGeocoding = signal<boolean>(false);

  // Address details state
  readonly currentDetail = signal<string>('Detecting location...');
  readonly currentFullAddress = signal<string>('Please wait while we resolve your address.');
  private currentCoords = { lat: 22.7196, lng: 75.8577 };

  flatNumber = '';
  readonly selectedTag = signal<'Home' | 'Work' | 'Other'>('Home');

  // Search state
  searchQuery = '';
  readonly searchResults = signal<GeocodeResult[]>([]);
  private searchDebounce: any = null;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    if (typeof L === 'undefined') {
      console.warn('Leaflet not loaded from CDN yet');
      return;
    }

    const active = this.authService.activeAddress();
    const initLat = active.lat || 22.7196;
    const initLng = active.lng || 75.8577;
    this.currentCoords = { lat: initLat, lng: initLng };

    this.map = L.map(this.mapContainerRef.nativeElement, {
      center: [initLat, initLng],
      zoom: 16,
      zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(this.map);

    this.map.on('movestart', () => {
      this.isDragging.set(true);
    });

    this.map.on('moveend', () => {
      this.isDragging.set(false);
      const center = this.map.getCenter();
      this.currentCoords = { lat: center.lat, lng: center.lng };
      this.updateAddressFromCoords(center.lat, center.lng);
    });

    // Initial reverse geocode
    this.updateAddressFromCoords(initLat, initLng);
  }

  async locateCurrentPosition(): Promise<void> {
    this.isLocating.set(true);
    try {
      const coords = await this.locationService.getCurrentPosition();
      this.currentCoords = coords;
      if (this.map) {
        this.map.setView([coords.lat, coords.lng], 16, { animate: true });
      }
      await this.updateAddressFromCoords(coords.lat, coords.lng);
    } finally {
      this.isLocating.set(false);
    }
  }

  private async updateAddressFromCoords(lat: number, lng: number): Promise<void> {
    this.isGeocoding.set(true);
    try {
      const res = await this.locationService.reverseGeocode(lat, lng);
      this.currentDetail.set(res.detail);
      this.currentFullAddress.set(res.fullAddress);
    } catch {
      this.currentDetail.set('Selected Area');
      this.currentFullAddress.set(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      this.isGeocoding.set(false);
    }
  }

  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    if (!this.searchQuery || this.searchQuery.trim().length < 3) {
      this.searchResults.set([]);
      return;
    }
    this.searchDebounce = setTimeout(async () => {
      const results = await this.locationService.searchLocation(this.searchQuery);
      this.searchResults.set(results);
    }, 400);
  }

  selectSearchResult(item: GeocodeResult): void {
    this.searchResults.set([]);
    this.searchQuery = '';
    this.currentCoords = { lat: item.lat, lng: item.lng };
    if (this.map) {
      this.map.setView([item.lat, item.lng], 16, { animate: true });
    }
    this.currentDetail.set(item.detail);
    this.currentFullAddress.set(item.fullAddress);
  }

  confirmLocation(): void {
    const full = this.flatNumber.trim() 
      ? `${this.flatNumber.trim()}, ${this.currentFullAddress()}`
      : this.currentFullAddress();

    const tagIcons: Record<string, string> = {
      Home: '🏠',
      Work: '🏢',
      Other: '📍'
    };

    const address: AddressOption = {
      id: 'addr_' + Date.now(),
      label: this.selectedTag(),
      icon: tagIcons[this.selectedTag()] || '📍',
      detail: this.currentDetail(),
      fullAddress: full,
      lat: this.currentCoords.lat,
      lng: this.currentCoords.lng,
      isDefault: true
    };

    // Update in AuthService
    this.authService.setActiveAddress(address);
    this.onSelect.emit(address);
    this.close();
  }

  close(): void {
    this.authService.closeMapPicker();
    this.onClose.emit();
  }
}
