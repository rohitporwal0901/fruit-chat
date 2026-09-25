import {
  Component, inject, signal, Output, EventEmitter,
  OnInit, OnDestroy, ViewChild, ElementRef, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapService, SearchResult } from '../../core/services/map.service';
import { CartService } from '../../core/services/cart.service';

declare const L: any;

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- BOTTOM SHEET OVERLAY -->
    <div class="mp-overlay" (click)="onOverlayClick($event)">
      <div class="mp-sheet" [class.mp-sheet-open]="isOpen()">

        <!-- SHEET HANDLE -->
        <div class="mp-handle-wrap" (click)="close()">
          <div class="mp-handle"></div>
        </div>

        <!-- HEADER -->
        <div class="mp-header">
          <div class="mp-header-text">
            <h3 class="mp-title">📍 Select Delivery Location</h3>
            <p class="mp-sub">Drag pin on map or search Indore locations</p>
          </div>
          <button class="mp-close-btn" (click)="close()" aria-label="Close">✕</button>
        </div>

        <!-- SEARCH CONTAINER -->
        <div class="mp-search-container">
          <div class="mp-search-box">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              class="mp-search-input"
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              (focus)="onSearchFocus()"
              (click)="onSearchFocus()"
              placeholder="Search colony, mall, area in Indore..."
              id="map-search-input"
              autocomplete="off"
            />
            @if (isSearching()) {
              <div class="search-spin"></div>
            }
            @if (searchQuery) {
              <button class="mp-clear-btn" (click)="clearSearch()" title="Clear">✕</button>
            }
            <button class="mp-gps-pill" (click)="useCurrentLocation()" [disabled]="gpsLoading()" title="Detect My Current GPS Location">
              @if (gpsLoading()) {
                <div class="gps-spin"></div>
              } @else {
                <span>🎯 GPS</span>
              }
            </button>
          </div>

          <!-- GOOGLE MAPS STYLE AUTOCOMPLETE SUGGESTIONS -->
          @if (suggestions().length > 0) {
            <div class="mp-suggestions-dropdown">
              <div class="sug-header">
                <span>Indore Locations & Suggestions</span>
                <button class="sug-close-btn" (click)="suggestions.set([])">✕</button>
              </div>
              <div class="sug-list">
                @for (s of suggestions(); track s.lat + '-' + s.lng + '-' + s.shortName) {
                  <div
                    class="mp-sug-item"
                    (mousedown)="$event.preventDefault(); selectSuggestion(s)"
                    (click)="selectSuggestion(s)"
                  >
                    <div class="sug-icon-bubble">{{ s.icon || '📍' }}</div>
                    <div class="sug-text-area">
                      <div class="sug-title-row">
                        <span class="sug-title">{{ s.shortName }}</span>
                        @if (s.distanceText) {
                          <span class="sug-dist-chip">{{ s.distanceText }}</span>
                        }
                      </div>
                      <p class="sug-desc">{{ s.displayName }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- SCROLLABLE BODY (Map + Route Details) -->
        <div class="mp-scroll-body">
          
          <!-- MAP CONTAINER -->
          <div class="mp-map-container">
            <div #mapEl class="mp-map"></div>
            <div class="map-floating-badge">
              <span>👆 Tap map or drag red pin to adjust</span>
            </div>
          </div>

          <!-- ROUTE INFO CARD -->
          <div class="mp-route-card">
            
            <!-- PICKUP POINT -->
            <div class="route-item pickup-item">
              <div class="route-node green"></div>
              <div class="route-content">
                <div class="route-tag green-tag">STORE PICKUP</div>
                <p class="route-main">Atal Dwar, LIG, Indore</p>
                <span class="route-sub">Fresh Fruit & Chaat Kitchen</span>
              </div>
            </div>

            <!-- CONNECTOR WITH LIVE ROUTE STATS -->
            <div class="route-connector-row">
              <div class="route-vert-line"></div>
              <div class="route-stats-pill">
                @if (routeLoading()) {
                  <div class="calc-loading">
                    <div class="route-spin"></div>
                    <span>Calculating real road distance...</span>
                  </div>
                } @else if (distanceKm() > 0) {
                  <div class="chips-flex">
                    <span class="stat-badge dist-badge">📏 {{ distanceKm() }} km</span>
                    <span class="stat-badge eta-badge">⏱️ {{ etaMin() }} mins</span>
                    <span class="stat-badge" [class.charge-ok]="!outOfRange()" [class.charge-err]="outOfRange()">
                      {{ outOfRange() ? '❌ Out of range (>10km)' : '💰 Delivery: ₹' + deliveryCharge() }}
                    </span>
                  </div>
                } @else {
                  <span class="calc-idle">Tap map or search above to select drop point</span>
                }
              </div>
            </div>

            <!-- DROP POINT -->
            <div class="route-item drop-item">
              <div class="route-node red"></div>
              <div class="route-content">
                <div class="route-tag red-tag">DELIVERY DROP</div>
                <p class="route-main">{{ dropAddress() || 'Drag red pin on map or search above' }}</p>
                @if (dropAddress()) {
                  <span class="route-sub verified">✓ Location Selected</span>
                }
              </div>
            </div>

          </div>

          @if (gpsError()) {
            <div class="mp-gps-error">
              ⚠️ {{ gpsError() }}
            </div>
          }

        </div>

        <!-- FIXED STICKY FOOTER -->
        <div class="mp-footer">
          @if (outOfRange()) {
            <div class="mp-out-range-banner">
              ⚠️ Delivery not available beyond 10 km from Atal Dwar, LIG. Please choose a nearby location.
            </div>
          }
          <button
            class="mp-confirm-btn"
            id="confirm-location-btn"
            [disabled]="!dropAddress() || outOfRange() || routeLoading()"
            (click)="confirmLocation()"
          >
            @if (routeLoading()) {
              <div class="btn-spin"></div>
              <span>Calculating Route...</span>
            } @else if (!dropAddress()) {
              <span>Select Location on Map</span>
            } @else if (outOfRange()) {
              <span>Location Out of Range (>10km)</span>
            } @else {
              <span>Confirm Delivery Location (₹{{ deliveryCharge() }})</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            }
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* OVERLAY - GUARANTEED HIGHEST Z-INDEX (99999) */
    .mp-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      z-index: 99999;
      display: flex;
      align-items: flex-end;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }

    /* BOTTOM SHEET */
    .mp-sheet {
      width: 100%;
      height: 90vh;
      max-height: 90vh;
      background: #FFFFFF;
      border-radius: 24px 24px 0 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateY(100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 -12px 48px rgba(0, 0, 0, 0.28);
      position: relative;
    }

    .mp-sheet.mp-sheet-open {
      transform: translateY(0);
    }

    /* HANDLE */
    .mp-handle-wrap {
      display: flex;
      justify-content: center;
      padding: 10px 0 4px;
      cursor: pointer;
      flex-shrink: 0;
    }
    .mp-handle {
      width: 44px;
      height: 5px;
      background: #E0E0E0;
      border-radius: 99px;
    }

    /* HEADER */
    .mp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 18px 8px;
      flex-shrink: 0;
    }
    .mp-header-text { flex: 1; }
    .mp-title {
      font-size: 16.5px;
      font-weight: 800;
      color: #1A1A1A;
      margin: 0;
      letter-spacing: -0.2px;
    }
    .mp-sub {
      font-size: 11.5px;
      color: #71717A;
      margin: 2px 0 0;
    }
    .mp-close-btn {
      background: #F4F4F5;
      border: none;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      font-size: 13px;
      font-weight: 700;
      color: #52525B;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;
      &:hover { background: #E4E4E7; color: #18181B; }
      &:active { transform: scale(0.92); }
    }

    /* SEARCH CONTAINER */
    .mp-search-container {
      padding: 0 16px 10px;
      position: relative;
      flex-shrink: 0;
      z-index: 1000;
      box-sizing: border-box;
      width: 100%;
    }
    .mp-search-box {
      width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      background: #F4F5F7;
      border: 1.5px solid #E5E7EB;
      border-radius: 14px;
      padding: 4px 8px 4px 12px;
      gap: 8px;
      transition: all 0.2s;
      &:focus-within {
        border-color: #2E7D32;
        background: #FFFFFF;
        box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.12);
      }
    }
    .search-icon {
      color: #71717A;
      flex-shrink: 0;
    }
    .mp-search-input {
      flex: 1;
      min-width: 0;
      border: none;
      background: transparent;
      padding: 8px 0;
      font-size: 13.5px;
      font-family: inherit;
      color: #1A1A1A;
      outline: none;
      &::placeholder { color: #9CA3AF; }
    }
    .search-spin {
      width: 14px;
      height: 14px;
      border: 2px solid #D1D5DB;
      border-top-color: #2E7D32;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }
    .mp-clear-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 12px;
      color: #9CA3AF;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      &:hover { color: #374151; }
    }
    .mp-gps-pill {
      background: #E8F5E9;
      border: 1px solid #C8E6C9;
      color: #2E7D32;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 11.5px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
      transition: all 0.15s;
      &:hover:not(:disabled) {
        background: #C8E6C9;
      }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .gps-spin {
      width: 12px;
      height: 12px;
      border: 2px solid #A5D6A7;
      border-top-color: #2E7D32;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* GOOGLE MAPS STYLE AUTOCOMPLETE DROPDOWN */
    .mp-suggestions-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 16px;
      right: 16px;
      background: #FFFFFF;
      border-radius: 14px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0, 0, 0, 0.08);
      max-height: 270px;
      display: flex;
      flex-direction: column;
      z-index: 100000;
      overflow: hidden;
      animation: popIn 0.2s ease-out;
    }
    .sug-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      background: #F9FAFB;
      border-bottom: 1px solid #F3F4F6;
      font-size: 10.5px;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sug-close-btn {
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      font-size: 11px;
      padding: 2px;
      &:hover { color: #374151; }
    }
    .sug-list {
      overflow-y: auto;
      flex: 1;
      -webkit-overflow-scrolling: touch;
    }
    .mp-sug-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 11px 14px;
      cursor: pointer;
      border-bottom: 1px solid #F3F4F6;
      transition: background 0.15s;
      &:last-child { border-bottom: none; }
      &:hover { background: #F0FDF4; }
      &:active { background: #DCFCE7; }
    }
    .sug-icon-bubble {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #F3F4F6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .sug-text-area { flex: 1; min-width: 0; }
    .sug-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .sug-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sug-dist-chip {
      font-size: 10px;
      font-weight: 700;
      color: #15803D;
      background: #DCFCE7;
      padding: 2px 7px;
      border-radius: 999px;
      flex-shrink: 0;
    }
    .sug-desc {
      font-size: 11.5px;
      color: #6B7280;
      margin: 2px 0 0;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* SCROLLABLE BODY */
    .mp-scroll-body {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      display: flex;
      flex-direction: column;
      padding: 0 16px 14px;
      gap: 12px;
    }

    /* MAP CONTAINER */
    .mp-map-container {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      border: 1px solid #E5E7EB;
      flex-shrink: 0;
    }
    .mp-map {
      height: 230px;
      width: 100%;
      z-index: 1;
      background: #E8ECEF;
    }
    .map-floating-badge {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      color: #374151;
      pointer-events: none;
      z-index: 10;
      white-space: nowrap;
    }

    /* ROUTE CARD */
    .mp-route-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      padding: 14px 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .route-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .route-node {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 3px;
      &.green {
        background: #2E7D32;
        box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.18);
      }
      &.red {
        background: #E53935;
        box-shadow: 0 0 0 4px rgba(229, 57, 53, 0.18);
      }
    }
    .route-content { flex: 1; min-width: 0; }
    .route-tag {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 2px;
      &.green-tag { color: #2E7D32; }
      &.red-tag { color: #E53935; }
    }
    .route-main {
      font-size: 13.5px;
      font-weight: 700;
      color: #1F2937;
      margin: 0;
      line-height: 1.35;
      word-break: break-word;
    }
    .route-sub {
      font-size: 11px;
      color: #9CA3AF;
      margin-top: 2px;
      display: block;
      &.verified { color: #16A34A; font-weight: 600; }
    }

    /* CONNECTOR */
    .route-connector-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 6px 0;
      padding-left: 6px;
    }
    .route-vert-line {
      width: 2px;
      height: 42px;
      background: #D1D5DB;
      border-radius: 99px;
    }
    .route-stats-pill { flex: 1; min-width: 0; }
    .calc-loading {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11.5px;
      font-weight: 600;
      color: #2E7D32;
    }
    .route-spin {
      width: 14px;
      height: 14px;
      border: 2px solid #A7F3D0;
      border-top-color: #059669;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .calc-idle {
      font-size: 11.5px;
      color: #9CA3AF;
      font-style: italic;
    }

    .chips-flex {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
    }
    .stat-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 9px;
      border-radius: 999px;
      white-space: nowrap;
      &.dist-badge {
        background: #EFF6FF;
        color: #1D4ED8;
      }
      &.eta-badge {
        background: #FEF3C7;
        color: #B45309;
      }
      &.charge-ok {
        background: #DCFCE7;
        color: #15803D;
      }
      &.charge-err {
        background: #FEE2E2;
        color: #B91C1C;
      }
    }

    .mp-gps-error {
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 11.5px;
      color: #DC2626;
      font-weight: 600;
    }

    /* FOOTER (FIXED PINNED AT BOTTOM) */
    .mp-footer {
      flex-shrink: 0;
      background: #FFFFFF;
      border-top: 1px solid #F3F4F6;
      padding: 12px 18px max(20px, env(safe-area-inset-bottom));
      box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.08);
      z-index: 50;
      position: relative;
    }
    .mp-out-range-banner {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 10px;
      padding: 9px 12px;
      font-size: 11.5px;
      color: #DC2626;
      font-weight: 600;
      margin-bottom: 10px;
      text-align: center;
      line-height: 1.35;
    }
    .mp-confirm-btn {
      width: 100%;
      height: 50px;
      background: linear-gradient(135deg, #2E7D32, #1B5E20);
      color: #FFFFFF;
      border: none;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 6px 20px rgba(46, 125, 50, 0.35);
      transition: all 0.2s;
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 26px rgba(46, 125, 50, 0.45);
      }
      &:active:not(:disabled) {
        transform: translateY(0);
      }
      &:disabled {
        background: #E5E7EB;
        color: #9CA3AF;
        box-shadow: none;
        cursor: not-allowed;
      }
    }
    .btn-spin {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes popIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MapPickerComponent implements OnInit, OnDestroy {
  @Output() locationConfirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @ViewChild('mapEl') mapElRef!: ElementRef<HTMLDivElement>;

  mapService  = inject(MapService);
  cartService = inject(CartService);
  ngZone      = inject(NgZone);

  isOpen         = signal(false);
  searchQuery    = '';
  suggestions    = signal<SearchResult[]>([]);
  dropAddress    = signal('');
  distanceKm     = signal(0);
  etaMin         = signal(0);
  deliveryCharge = signal(0);
  outOfRange     = signal(false);
  routeLoading   = signal(false);
  isSearching    = signal(false);
  gpsLoading     = signal(false);
  gpsError       = signal('');

  private map: any = null;
  private pickupMarker: any = null;
  private dropMarker: any = null;
  private routeLayer: any = null;
  private routeCasingLayer: any = null;
  private searchTimer: any = null;

  ngOnInit(): void {
    setTimeout(() => this.isOpen.set(true), 30);
    setTimeout(() => this.initMap(), 120);
  }

  private initMap(): void {
    if (!this.mapElRef?.nativeElement) return;

    if (typeof L === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => this.buildMap();
      document.head.appendChild(script);
    } else {
      this.buildMap();
    }
  }

  private buildMap(): void {
    const el = this.mapElRef.nativeElement;
    const pickup = this.mapService.PICKUP;

    this.map = L.map(el, {
      zoomControl: true,
      attributionControl: false
    }).setView([pickup.lat, pickup.lng], 14);

    // ESRI World Street Map: Clean, high-res, Google Maps aesthetic, 100% free with NO "KEY REQUIRED" watermark!
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(this.map);

    // Pickup marker: Atal Dwar, LIG (Green with pulsing ring)
    const greenIcon = L.divIcon({
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px">
          <div style="position:absolute;width:30px;height:30px;background:rgba(46,125,50,0.3);border-radius:50%"></div>
          <div style="width:18px;height:18px;background:#2E7D32;border:3px solid #FFFFFF;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);z-index:2"></div>
        </div>
      `,
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    this.pickupMarker = L.marker([pickup.lat, pickup.lng], { icon: greenIcon, draggable: false })
      .addTo(this.map)
      .bindPopup('<b>🟢 Store Pickup</b><br>Atal Dwar, LIG Colony, Indore');

    // Drop marker: Red pin (Draggable)
    const redIcon = L.divIcon({
      html: `
        <div style="filter:drop-shadow(0 4px 6px rgba(0,0,0,0.35));cursor:grab">
          <svg width="34" height="42" viewBox="0 0 24 30" fill="none">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18c0-6.63-5.37-12-12-12z" fill="#E53935"/>
            <circle cx="12" cy="11" r="4.5" fill="#FFFFFF"/>
          </svg>
        </div>
      `,
      className: '',
      iconSize: [34, 42],
      iconAnchor: [17, 40]
    });

    const savedLat = this.cartService.dropLat();
    const savedLng = this.cartService.dropLng();
    const dropStart = (savedLat && savedLng)
      ? [savedLat, savedLng]
      : [pickup.lat - 0.012, pickup.lng - 0.008];

    this.dropMarker = L.marker(dropStart, { icon: redIcon, draggable: true })
      .addTo(this.map)
      .bindTooltip('📍 Drag me to delivery spot', { permanent: false, direction: 'top' });

    this.dropMarker.on('dragend', () => {
      const pos = this.dropMarker.getLatLng();
      this.ngZone.run(() => this.onDropMoved(pos.lat, pos.lng));
    });

    this.map.on('click', (e: any) => {
      this.dropMarker.setLatLng([e.latlng.lat, e.latlng.lng]);
      this.ngZone.run(() => this.onDropMoved(e.latlng.lat, e.latlng.lng));
    });

    this.onDropMoved(dropStart[0], dropStart[1]);
  }

  async onDropMoved(lat: number, lng: number): Promise<void> {
    this.routeLoading.set(true);

    const addr = await this.mapService.reverseGeocode(lat, lng);
    this.dropAddress.set(addr);

    const pickup = this.mapService.PICKUP;
    const route = await this.mapService.getRoute(pickup.lat, pickup.lng, lat, lng);

    if (route) {
      const charge = this.mapService.getDeliveryCharge(route.distanceKm);
      const serviceable = this.mapService.isServiceable(route.distanceKm);

      this.distanceKm.set(route.distanceKm);
      this.etaMin.set(this.mapService.getEtaMinutes(route.distanceKm, route.durationMinutes));
      this.deliveryCharge.set(charge > 0 ? charge : 15);
      this.outOfRange.set(!serviceable);

      if (this.routeCasingLayer) {
        this.map.removeLayer(this.routeCasingLayer);
        this.routeCasingLayer = null;
      }
      if (this.routeLayer) {
        this.map.removeLayer(this.routeLayer);
        this.routeLayer = null;
      }

      if (serviceable) {
        this.routeCasingLayer = L.polyline(route.route, {
          color: '#155724',
          weight: 7,
          opacity: 0.35,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(this.map);

        this.routeLayer = L.polyline(route.route, {
          color: '#2E7D32',
          weight: 4.5,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(this.map);
      } else {
        this.routeLayer = L.polyline(route.route, {
          color: '#E53935',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8'
        }).addTo(this.map);
      }

      this.map.fitBounds([[pickup.lat, pickup.lng], [lat, lng]], {
        padding: [35, 35],
        maxZoom: 16
      });
    }

    this.routeLoading.set(false);
  }

  onSearchFocus(): void {
    // Show top Indore hotspots immediately on focus / click
    const popular = this.mapService.INDORE_PLACES.slice(0, 8).map(p => {
      const dist = this.mapService.getHaversineDistanceKm(
        this.mapService.PICKUP.lat, this.mapService.PICKUP.lng, p.lat, p.lng
      );
      return {
        lat: p.lat,
        lng: p.lng,
        shortName: p.name,
        displayName: p.address,
        icon: p.icon,
        distanceKm: dist,
        distanceText: `${dist} km away`
      };
    });
    this.suggestions.set(popular);
  }

  async onSearchInput(): Promise<void> {
    clearTimeout(this.searchTimer);
    const q = this.searchQuery.trim();

    if (!q) {
      this.onSearchFocus();
      this.isSearching.set(false);
      return;
    }

    this.isSearching.set(true);

    const instantResults = await this.mapService.searchAddress(q);
    if (instantResults.length > 0) {
      this.suggestions.set(instantResults);
    }

    this.searchTimer = setTimeout(async () => {
      const fullResults = await this.mapService.searchAddress(q);
      this.ngZone.run(() => {
        this.suggestions.set(fullResults);
        this.isSearching.set(false);
      });
    }, 280);
  }

  selectSuggestion(s: SearchResult): void {
    this.searchQuery = s.shortName;
    this.suggestions.set([]);
    if (this.dropMarker) {
      this.dropMarker.setLatLng([s.lat, s.lng]);
    }
    this.onDropMoved(s.lat, s.lng);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchFocus();
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.gpsError.set('Geolocation is not supported by your browser.');
      return;
    }

    this.gpsLoading.set(true);
    this.gpsError.set('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.ngZone.run(() => {
          this.gpsLoading.set(false);
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          if (this.dropMarker) {
            this.dropMarker.setLatLng([lat, lng]);
          }
          this.onDropMoved(lat, lng);
        });
      },
      (err) => {
        this.ngZone.run(() => {
          this.gpsLoading.set(false);
          this.gpsError.set('Could not fetch GPS location. Please tap on map or search.');
          setTimeout(() => this.gpsError.set(''), 4000);
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  confirmLocation(): void {
    if (!this.dropAddress() || this.outOfRange()) return;

    const pos = this.dropMarker.getLatLng();

    this.cartService.dropDisplayName.set(this.dropAddress());
    this.cartService.dropLat.set(pos.lat);
    this.cartService.dropLng.set(pos.lng);
    this.cartService.deliveryDistanceKm.set(this.distanceKm());

    this.mapService.dropLocation.set({
      lat: pos.lat,
      lng: pos.lng,
      displayName: this.dropAddress()
    });

    this.locationConfirmed.emit();
    this.close();
  }

  close(): void {
    this.isOpen.set(false);
    setTimeout(() => this.closed.emit(), 360);
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('mp-overlay')) {
      this.close();
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
