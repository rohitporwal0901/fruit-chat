import { Component, inject, signal, computed, OnInit, OnDestroy, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';

declare const L: any;

interface TrackStep {
  id: string;
  label: string;
  time: string;
  desc: string;
  icon: string;
  done: boolean;
}

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="track-page">

      <!-- HEADER -->
      <div class="track-header">
        <button class="back-btn" (click)="router.navigate(['/'])" aria-label="Back to Home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2 class="track-title">Track Order</h2>
        <div class="header-spacer"></div>
      </div>

      <!-- SKELETON LOADER -->
      @if (isPageLoading()) {
        <div class="skeleton-page">
          <div class="skel-map-block">
            <div class="skel-shimmer skel-map"></div>
            <div class="skel-eta-badge">
              <div class="skel-shimmer skel-eta-line"></div>
              <div class="skel-shimmer skel-eta-time"></div>
            </div>
          </div>
          <div class="sk-container">
            <div class="skel-card">
              <div class="skel-card-row">
                <div class="skel-shimmer skel-id-line"></div>
                <div class="skel-shimmer skel-badge-pill"></div>
              </div>
              <div class="skel-shimmer skel-items-line"></div>
              <div class="skel-divider-line"></div>
              <div class="skel-card-row">
                <div class="skel-shimmer skel-addr-line"></div>
                <div class="skel-shimmer skel-price-line"></div>
              </div>
            </div>
            <div class="skel-card skel-steps-card">
              <div class="skel-shimmer skel-title"></div>
              <div class="skel-step-row-h">
                @for (i of [1,2,3,4]; track i) {
                  <div class="skel-step-col">
                    <div class="skel-shimmer skel-dot"></div>
                    <div class="skel-shimmer skel-step-lbl"></div>
                  </div>
                }
              </div>
            </div>
            <div class="skel-card">
              <div class="skel-shimmer skel-title"></div>
              @for (i of [1,2,3,4]; track i) {
                <div class="skel-step-row">
                  <div class="skel-step-left">
                    <div class="skel-shimmer skel-dot-sm"></div>
                    @if (i < 4) { <div class="skel-shimmer skel-line-v"></div> }
                  </div>
                  <div class="skel-step-content">
                    <div class="skel-shimmer skel-step-label"></div>
                    <div class="skel-shimmer skel-step-desc"></div>
                  </div>
                  <div class="skel-shimmer skel-step-time"></div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- MAIN CONTENT -->
      @if (!isPageLoading()) {
        <!-- MAP / ILLUSTRATION -->
        <div class="map-section">
          <div #mapContainer class="leaflet-map-container" [class.hidden]="!showMap()"></div>
          @if (!showMap()) {
            <div class="map-illustration">
              <div class="map-bg-circles">
                <div class="bg-circle c1"></div>
                <div class="bg-circle c2"></div>
                <div class="bg-circle c3"></div>
              </div>
              <div class="road-track"><div class="road-dashes"></div></div>
              <div class="rider-wrap" [style.left.%]="getProgressPercent(currentOrder()?.status || 'confirmed')">
                <svg width="52" height="52" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="rider-svg">
                  <rect x="6" y="24" width="18" height="18" rx="2" fill="#2E7D32"/>
                  <path d="M6 30 L24 30" stroke="#1B5E20" stroke-width="1.5"/>
                  <circle cx="15" cy="33" r="3" fill="#4CAF50"/>
                  <path d="M12 48 L28 48 L32 38 L48 38 L54 48 L60 48 A3 3 0 0 1 60 54 L12 54 A3 3 0 0 1 12 48 Z" fill="#4CAF50"/>
                  <path d="M46 38 L52 24 L56 24" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
                  <ellipse cx="58" cy="42" rx="3" ry="4" fill="#FFC107"/>
                  <path d="M26 38 C26 24 38 24 40 24 L48 24 L52 32 L40 32 L36 38 Z" fill="#FF9800"/>
                  <path d="M42 26 L48 34 L54 34" fill="none" stroke="#F57C00" stroke-width="2.5" stroke-linecap="round"/>
                  <circle cx="44" cy="16" r="6" fill="#FFCC80"/>
                  <path d="M36 16 A8 8 0 0 1 52 16 Z" fill="#1B5E20"/>
                  <circle cx="20" cy="54" r="7" fill="#424242"/>
                  <circle cx="20" cy="54" r="3" fill="#BDBDBD"/>
                  <circle cx="52" cy="54" r="7" fill="#424242"/>
                  <circle cx="52" cy="54" r="3" fill="#BDBDBD"/>
                  <path d="M2 42 L8 42 M0 48 L6 48" stroke="#CFD8DC" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          }
          <!-- ETA Floating Card -->
          <div class="eta-float-card">
            <div class="eta-pulse-ring"></div>
            <div class="eta-inner">
              <div class="eta-icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="eta-text-block">
                <span class="eta-heading">Arriving by</span>
                <span class="eta-value">{{ estimatedDeliveryTime() }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="container">
          <!-- STATUS HEADLINE CARD -->
          <div class="status-headline-card" [ngClass]="'s-' + (currentOrder()?.status || 'confirmed')">
            <div class="status-hl-left">
              <div class="status-hl-emoji">{{ getStatusEmoji() }}</div>
              <div>
                <p class="status-hl-title">{{ currentStatusLabel() }}</p>
                <p class="status-hl-sub">Order #{{ displayOrderId() }}</p>
              </div>
            </div>
            <div class="status-hl-badge" [ngClass]="currentStatusBadgeClass()">
              <span class="badge-dot"></span>{{ getBadgeShortText() }}
            </div>
          </div>

          <!-- BLINKIT HORIZONTAL PROGRESS STEPS -->
          <div class="blinkit-steps-card">
            <div class="blinkit-steps">
              @for (step of trackSteps(); track step.id; let i = $index; let last = $last) {
                <div class="bk-step" [class.done]="step.done" [class.current]="isCurrentStep(step)">
                  <div class="bk-step-top">
                    <div class="bk-icon-circle">
                      @if (step.done) {
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      } @else {
                        <span class="bk-num">{{ i + 1 }}</span>
                      }
                    </div>
                    @if (!last) { <div class="bk-connector" [class.done]="step.done"></div> }
                  </div>
                  <div class="bk-step-bottom">
                    <span class="bk-step-emoji">{{ step.icon }}</span>
                    <span class="bk-step-label">{{ step.label }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- ORDER DETAIL CARD -->
          <div class="order-detail-card">
            <div class="odc-header">
              <h3 class="odc-title">Order Details</h3>
              <span class="odc-amount">₹{{ getOrderTotal() }}</span>
            </div>
            <div class="odc-items-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              <span class="odc-items-text">{{ getItemsSummary() }}</span>
            </div>
            <div class="odc-sep"></div>
            <div class="odc-addr-row">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span class="odc-addr">{{ getAddressSummary() }}</span>
            </div>
          </div>

          <!-- TIMELINE -->
          <div class="timeline-card">
            <h3 class="tl-card-title">Order Timeline</h3>
            <div class="bk-timeline">
              @for (step of trackSteps(); track step.id; let last = $last) {
                <div class="bkt-item" [class.done]="step.done" [class.current]="isCurrentStep(step)">
                  <div class="bkt-left">
                    <div class="bkt-dot">
                      @if (step.done) {
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      } @else if (isCurrentStep(step)) {
                        <div class="bkt-inner-pulse"></div>
                      }
                    </div>
                    @if (!last) { <div class="bkt-line" [class.done]="step.done"></div> }
                  </div>
                  <div class="bkt-content">
                    <div class="bkt-top-row">
                      <div class="bkt-label-grp">
                        <span class="bkt-emoji">{{ step.icon }}</span>
                        <span class="bkt-label">{{ step.label }}</span>
                      </div>
                      <span class="bkt-time">{{ step.time }}</span>
                    </div>
                    <p class="bkt-desc">{{ step.desc }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- HELP -->
          <div class="help-section">
            <a [href]="'https://wa.me/919876543210?text=Hi%20FruitChat,%20I%20need%20help%20with%20Order%20%23' + displayOrderId()" target="_blank" class="help-btn">
              <span class="help-icon">💬</span>
              <span class="help-txt">Need help with your order?</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

    .track-page {
      background: #F4F6F8;
      min-height: 100vh;
      font-family: 'Outfit', sans-serif;
    }

    /* ── HEADER ── */
    .track-header {
      background: #fff;
      padding: 14px 16px;
      display: grid;
      grid-template-columns: 50px 1fr 50px;
      align-items: center;
      box-shadow: 0 1px 0 #EBEBEB;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    @media (min-width: 768px) { .track-header { top: 72px; } }
    .track-title { font-size: 17px; font-weight: 800; text-align: center; color: #1A1A1A; margin: 0; letter-spacing: -0.3px; }
    .back-btn {
      background: #F4F4F5; border: none; width: 36px; height: 36px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; color: #1A1A1A; transition: all 0.18s; justify-self: start;
    }
    .back-btn:active { background: #E4E4E7; transform: scale(0.92); }
    .header-spacer { width: 50px; }

    /* ── MAP SECTION ── */
    .map-section {
      height: 220px;
      background: linear-gradient(160deg, #E8F5E9 0%, #C8E6C9 55%, #A5D6A7 100%);
      position: relative;
      overflow: hidden;
    }
    .leaflet-map-container { width: 100%; height: 100%; z-index: 1; }
    .leaflet-map-container.hidden { display: none; }

    .map-illustration { width: 100%; height: 100%; position: relative; overflow: hidden; }
    .map-bg-circles { position: absolute; inset: 0; pointer-events: none; }
    .bg-circle { position: absolute; border-radius: 50%; opacity: 0.12; }
    .c1 { width: 200px; height: 200px; background: #2E7D32; top: -70px; left: -50px; }
    .c2 { width: 130px; height: 130px; background: #4CAF50; top: 10px; right: -20px; }
    .c3 { width: 90px; height: 90px; background: #1B5E20; bottom: 10px; left: 35%; }

    .road-track {
      position: absolute; bottom: 38px; left: 20px; right: 20px;
      height: 10px; background: rgba(255,255,255,0.5); border-radius: 5px; overflow: hidden;
    }
    .road-dashes {
      position: absolute; inset: 0;
      background: repeating-linear-gradient(90deg, transparent 0 16px, rgba(255,255,255,0.65) 16px 28px);
      animation: roadAnim 1s linear infinite;
    }
    @keyframes roadAnim { to { background-position: 44px 0; } }

    .rider-wrap {
      position: absolute; bottom: 44px;
      transform: translateX(-50%);
      transition: left 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
      filter: drop-shadow(0 6px 10px rgba(0,0,0,0.18));
      animation: riderBounce 1.1s infinite alternate;
      z-index: 5;
    }
    @keyframes riderBounce {
      from { transform: translateX(-50%) translateY(0); }
      to { transform: translateX(-50%) translateY(-6px); }
    }

    /* ETA Card */
    .eta-float-card {
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      background: #fff; border-radius: 18px; padding: 10px 18px;
      box-shadow: 0 8px 28px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08);
      display: flex; align-items: center; gap: 10px; z-index: 10;
      min-width: 185px; white-space: nowrap; border: 1.5px solid rgba(255,255,255,0.9);
    }
    .eta-pulse-ring {
      position: absolute; inset: -2px; border-radius: 20px;
      border: 2px solid #4CAF50; opacity: 0;
      animation: etaPulse 2.2s infinite;
      pointer-events: none;
    }
    @keyframes etaPulse {
      0% { opacity: 0.7; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.07); }
    }
    .eta-inner { display: flex; align-items: center; gap: 10px; }
    .eta-icon-wrap {
      width: 34px; height: 34px;
      background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
      border-radius: 10px; display: flex; align-items: center;
      justify-content: center; color: #2E7D32; flex-shrink: 0;
    }
    .eta-text-block { display: flex; flex-direction: column; }
    .eta-heading { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .eta-value { font-size: 19px; font-weight: 900; color: #1A1A1A; letter-spacing: -0.5px; line-height: 1.1; }

    /* ── CONTAINER ── */
    .container { padding: 0 14px 100px; }

    /* ── STATUS HEADLINE ── */
    .status-headline-card {
      background: #fff; border-radius: 18px; padding: 16px;
      margin-top: 14px; display: flex; align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 14px rgba(0,0,0,0.06);
      border-left: 4px solid #4CAF50;
      transition: border-color 0.3s;
    }
    .s-confirmed  { border-left-color: #2196F3; }
    .s-preparing  { border-left-color: #FF9800; }
    .s-out-for-delivery { border-left-color: #9C27B0; }
    .s-delivered  { border-left-color: #4CAF50; }
    .s-cancelled  { border-left-color: #F44336; }
    .s-pending    { border-left-color: #FF9800; }

    .status-hl-left { display: flex; align-items: center; gap: 12px; }
    .status-hl-emoji { font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12)); }
    .status-hl-title { font-size: 16px; font-weight: 800; color: #1A1A1A; margin: 0 0 3px; }
    .status-hl-sub { font-size: 12px; color: #999; margin: 0; font-weight: 600; }

    .status-hl-badge {
      display: flex; align-items: center; gap: 5px;
      font-size: 11px; font-weight: 800; padding: 6px 12px;
      border-radius: 999px; text-transform: uppercase; letter-spacing: 0.3px; flex-shrink: 0;
    }
    .badge-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: currentColor; flex-shrink: 0;
      animation: bdPulse 1.5s infinite;
    }
    @keyframes bdPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

    .badge-pending   { background: #FFF3E0; color: #E65100; }
    .badge-confirmed { background: #E3F2FD; color: #1565C0; }
    .badge-preparing { background: #FFF3E0; color: #E65100; }
    .badge-delivery  { background: #F3E5F5; color: #6A1B9A; }
    .badge-delivered { background: #E8F5E9; color: #2E7D32; }
    .badge-cancelled { background: #FFEBEE; color: #C62828; }

    /* ── BLINKIT STEPS ── */
    .blinkit-steps-card {
      background: #fff; border-radius: 18px;
      padding: 18px 12px 14px; margin-top: 12px;
      box-shadow: 0 2px 14px rgba(0,0,0,0.06);
    }
    .blinkit-steps { display: flex; align-items: flex-start; justify-content: space-between; }
    .bk-step { display: flex; flex-direction: column; align-items: center; flex: 1; }
    .bk-step-top { display: flex; align-items: center; width: 100%; margin-bottom: 8px; }
    .bk-icon-circle {
      width: 30px; height: 30px; border-radius: 50%;
      background: #EBEBEB; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0;
      color: #ccc; transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative; z-index: 2;
    }
    .bk-num { font-size: 11px; font-weight: 800; color: #bbb; }
    .bk-connector {
      flex: 1; height: 3px; background: #EBEBEB; border-radius: 2px;
      transition: background 0.4s ease;
    }
    .bk-connector.done { background: linear-gradient(90deg, #2E7D32, #4CAF50); }
    .bk-step.done .bk-icon-circle {
      background: linear-gradient(135deg, #2E7D32, #4CAF50);
      color: #fff; box-shadow: 0 4px 12px rgba(46,125,50,0.35);
    }
    .bk-step.current .bk-icon-circle {
      background: #fff; border: 2.5px solid #2E7D32; color: #2E7D32;
      animation: bkCirclePulse 1.5s infinite;
    }
    @keyframes bkCirclePulse {
      0%,100% { box-shadow: 0 0 0 3px rgba(46,125,50,0.15); }
      50% { box-shadow: 0 0 0 7px rgba(46,125,50,0.06); }
    }
    .bk-step-bottom { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .bk-step-emoji { font-size: 15px; }
    .bk-step-label { font-size: 9px; font-weight: 700; color: #ccc; text-align: center; line-height: 1.2; }
    .bk-step.done .bk-step-label { color: #2E7D32; }
    .bk-step.current .bk-step-label { color: #1A1A1A; font-weight: 800; }

    /* ── ORDER DETAIL CARD ── */
    .order-detail-card {
      background: #fff; border-radius: 18px; padding: 16px;
      margin-top: 12px; box-shadow: 0 2px 14px rgba(0,0,0,0.06);
    }
    .odc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .odc-title { font-size: 15px; font-weight: 800; color: #1A1A1A; margin: 0; }
    .odc-amount { font-size: 17px; font-weight: 900; color: #2E7D32; }
    .odc-items-row { display: flex; align-items: flex-start; gap: 8px; }
    .odc-items-text { font-size: 13px; color: #555; font-weight: 500; line-height: 1.45; flex: 1; }
    .odc-sep { height: 1px; background: #F2F2F2; margin: 12px 0; }
    .odc-addr-row { display: flex; align-items: flex-start; gap: 8px; }
    .odc-addr { font-size: 12px; color: #888; font-weight: 500; flex: 1; line-height: 1.4; }

    /* ── TIMELINE CARD ── */
    .timeline-card {
      background: #fff; border-radius: 18px; padding: 16px;
      margin-top: 12px; box-shadow: 0 2px 14px rgba(0,0,0,0.06);
    }
    .tl-card-title { font-size: 15px; font-weight: 800; color: #1A1A1A; margin: 0 0 16px; }

    .bk-timeline { display: flex; flex-direction: column; }
    .bkt-item { display: flex; gap: 12px; }
    .bkt-left { display: flex; flex-direction: column; align-items: center; width: 28px; flex-shrink: 0; }
    .bkt-dot {
      width: 28px; height: 28px; border-radius: 50%;
      background: #F0F0F0; border: 2px solid #E0E0E0;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: #ccc; transition: all 0.3s; position: relative; z-index: 2;
    }
    .bkt-item.done .bkt-dot {
      background: #2E7D32; border-color: #2E7D32;
      color: #fff; box-shadow: 0 3px 10px rgba(46,125,50,0.3);
    }
    .bkt-item.current .bkt-dot {
      background: #fff; border-color: #2E7D32; border-width: 2.5px;
      animation: bktDotPulse 1.5s infinite;
    }
    @keyframes bktDotPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(46,125,50,0.3); }
      50% { box-shadow: 0 0 0 6px rgba(46,125,50,0); }
    }
    .bkt-inner-pulse {
      width: 8px; height: 8px; border-radius: 50%; background: #2E7D32;
      animation: innerPulse 1.1s infinite alternate;
    }
    @keyframes innerPulse { from { transform: scale(1); } to { transform: scale(1.45); } }
    .bkt-line {
      width: 2px; flex: 1; background: #E8E8E8; border-radius: 1px;
      margin: 2px 0; min-height: 28px; transition: background 0.3s;
    }
    .bkt-line.done { background: linear-gradient(180deg, #2E7D32, #4CAF50); }

    .bkt-content { flex: 1; padding-bottom: 20px; }
    .bkt-item:last-child .bkt-content { padding-bottom: 4px; }
    .bkt-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
    .bkt-label-grp { display: flex; align-items: center; gap: 6px; }
    .bkt-emoji { font-size: 16px; }
    .bkt-label { font-size: 14px; font-weight: 700; color: #C0C0C0; transition: color 0.3s; }
    .bkt-item.done .bkt-label { color: #1A1A1A; }
    .bkt-item.current .bkt-label { color: #1A1A1A; font-weight: 800; }
    .bkt-time { font-size: 11px; font-weight: 700; color: #C0C0C0; white-space: nowrap; }
    .bkt-item.done .bkt-time { color: #2E7D32; }
    .bkt-item.current .bkt-time { color: #2E7D32; font-weight: 800; }
    .bkt-desc { font-size: 12px; color: #CCCCCC; margin: 0; line-height: 1.4; font-weight: 500; }
    .bkt-item.done .bkt-desc { color: #999; }
    .bkt-item.current .bkt-desc { color: #777; }

    /* ── HELP ── */
    .help-section { margin-top: 12px; }
    .help-btn {
      display: flex; align-items: center; gap: 10px;
      background: #fff; border-radius: 16px; padding: 16px;
      text-decoration: none; font-size: 14px; font-weight: 700;
      color: #1A1A1A; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: all 0.2s;
    }
    .help-btn:hover { background: #F1F8E9; color: #2E7D32; }
    .help-icon { font-size: 20px; }
    .help-txt { flex: 1; }

    /* ── SKELETON LOADER ── */
    @keyframes skelShimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .skel-shimmer {
      background: linear-gradient(90deg, #EFEFEF 25%, #F9F9F9 50%, #EFEFEF 75%);
      background-size: 800px 100%;
      animation: skelShimmer 1.6s infinite linear;
      border-radius: 8px;
    }
    .skeleton-page { padding-bottom: 80px; }
    .sk-container { padding: 0 14px; }

    .skel-map-block { position: relative; }
    .skel-map { width: 100%; height: 220px; border-radius: 0; }
    .skel-eta-badge {
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      background: #fff; border-radius: 18px; padding: 10px 18px;
      display: flex; flex-direction: column; gap: 6px; align-items: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1); min-width: 185px;
    }
    .skel-eta-line { width: 80px; height: 10px; }
    .skel-eta-time { width: 120px; height: 22px; border-radius: 6px; }

    .skel-card { background: #fff; border-radius: 18px; padding: 16px; margin: 14px 0 0; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
    .skel-steps-card { padding-bottom: 18px; }
    .skel-card-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .skel-id-line { width: 130px; height: 14px; }
    .skel-badge-pill { width: 80px; height: 26px; border-radius: 999px; }
    .skel-items-line { width: 75%; height: 12px; margin-bottom: 10px; }
    .skel-divider-line { height: 1px; background: #F2F2F2; margin: 10px 0; }
    .skel-addr-line { width: 62%; height: 12px; }
    .skel-price-line { width: 50px; height: 14px; }
    .skel-title { width: 110px; height: 15px; margin-bottom: 16px; }

    .skel-step-row-h { display: flex; justify-content: space-between; }
    .skel-step-col { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
    .skel-dot { width: 30px; height: 30px; border-radius: 50%; }
    .skel-step-lbl { width: 40px; height: 9px; }

    .skel-step-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 4px; }
    .skel-step-left { display: flex; flex-direction: column; align-items: center; width: 28px; flex-shrink: 0; }
    .skel-dot-sm { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; }
    .skel-line-v { width: 2px; height: 30px; border-radius: 1px; margin: 3px auto; }
    .skel-step-content { flex: 1; padding-top: 4px; display: flex; flex-direction: column; gap: 7px; padding-bottom: 20px; }
    .skel-step-label { width: 70%; height: 13px; }
    .skel-step-desc { width: 88%; height: 11px; }
    .skel-step-time { width: 50px; height: 11px; flex-shrink: 0; margin-top: 6px; }
  `]
})
export class TrackOrderComponent implements OnInit, OnDestroy {
  router = inject(Router);
  route = inject(ActivatedRoute);
  dataService = inject(DataService);
  authService = inject(AuthService);

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  orderId = signal('FC12345');
  isPageLoading = signal(true);

  private map: any = null;
  private deliveryMarker: any = null;
  private homeMarker: any = null;
  private unsubscribeLive: (() => void) | null = null;

  showMap = computed(() => {
    // Always show map (not just out-for-delivery)
    return true;
  });

  currentOrder = computed(() => {
    const id = this.orderId();
    const orders = this.dataService.orders();
    if (!orders || orders.length === 0) return null;

    let found = orders.find(o => o.id === id);
    if (found) return found;

    found = orders.find(o => o.id.slice(-6).toUpperCase() === id.toUpperCase());
    if (found) return found;

    const user = this.authService.currentUser();
    if (user) {
      const userOrder = orders.find(o =>
        (o.userId && o.userId === user.uid) ||
        (user.phone && o.customerPhone && o.customerPhone.includes(user.phone))
      );
      if (userOrder) return userOrder;
    }

    return orders[0];
  });

  displayOrderId = computed(() => {
    const o = this.currentOrder();
    if (o) return o.id.length > 8 ? o.id.slice(-6).toUpperCase() : o.id;
    return this.orderId();
  });

  orderDate = computed<Date>(() => {
    const o = this.currentOrder();
    if (o?.placedAt) {
      const d = new Date(o.placedAt);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(Date.now() - 10 * 60 * 1000);
  });

  private formatTime(d: Date): string {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  estimatedDeliveryTime = computed(() => {
    const base = this.orderDate();
    return this.formatTime(new Date(base.getTime() + 30 * 60 * 1000));
  });

  currentStatusLabel = computed(() => {
    const st = this.currentOrder()?.status || 'confirmed';
    switch (st) {
      case 'pending': return 'Order Placed';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Kitchen Preparing';
      case 'out-for-delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered Fresh 🎉';
      case 'cancelled': return 'Order Cancelled';
      default: return 'Order Confirmed';
    }
  });

  getStatusEmoji(): string {
    const st = this.currentOrder()?.status || 'confirmed';
    switch (st) {
      case 'pending': return '📋';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'out-for-delivery': return '🛵';
      case 'delivered': return '🎉';
      case 'cancelled': return '❌';
      default: return '✅';
    }
  }

  getBadgeShortText(): string {
    const st = this.currentOrder()?.status || 'confirmed';
    switch (st) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Cooking';
      case 'out-for-delivery': return 'On Way';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Confirmed';
    }
  }

  currentStatusBadgeClass = computed(() => {
    const st = this.currentOrder()?.status || 'confirmed';
    switch (st) {
      case 'pending': return 'badge-pending';
      case 'confirmed': return 'badge-confirmed';
      case 'preparing': return 'badge-preparing';
      case 'out-for-delivery': return 'badge-delivery';
      case 'delivered': return 'badge-delivered';
      case 'cancelled': return 'badge-cancelled';
      default: return 'badge-confirmed';
    }
  });

  getProgressPercent(status: string): number {
    switch (status) {
      case 'pending': return 5;
      case 'confirmed': return 25;
      case 'preparing': return 55;
      case 'out-for-delivery': return 80;
      case 'delivered': return 100;
      default: return 25;
    }
  }

  trackSteps = computed<TrackStep[]>(() => {
    const o = this.currentOrder();
    const st = o?.status || 'confirmed';
    const base = this.orderDate();

    const placedTime  = this.formatTime(base);
    const prepTime    = this.formatTime(new Date(base.getTime() + 8 * 60 * 1000));
    const outTime     = this.formatTime(new Date(base.getTime() + 18 * 60 * 1000));
    const delTime     = this.formatTime(new Date(base.getTime() + 30 * 60 * 1000));

    return [
      {
        id: 'placed', label: 'Order Confirmed', time: placedTime, icon: '📋',
        desc: st === 'pending' ? 'Waiting for restaurant confirmation' : 'Your healthy order is confirmed',
        done: st !== 'pending' && st !== 'cancelled'
      },
      {
        id: 'preparing', label: 'Kitchen Preparing', icon: '👨‍🍳',
        time: st === 'pending' ? 'Upcoming' : st === 'confirmed' ? 'Starting soon' : st === 'preparing' ? 'Just now' : prepTime,
        desc: 'Fresh fruits and herbs being prepped',
        done: st === 'out-for-delivery' || st === 'delivered'
      },
      {
        id: 'out', label: 'Out for Delivery', icon: '🛵',
        time: (st === 'pending' || st === 'confirmed') ? 'Upcoming' : st === 'preparing' ? 'Est. 15 mins' : st === 'out-for-delivery' ? 'On the way' : outTime,
        desc: 'Delivery hero is on the way to your door',
        done: st === 'delivered'
      },
      {
        id: 'delivered', label: 'Delivered Fresh', icon: '✅',
        time: st === 'delivered' ? 'Delivered' : `Est. ${delTime}`,
        desc: st === 'delivered' ? 'Enjoy your delicious fruit meal!' : 'Your fresh fruit meal arrives soon',
        done: st === 'delivered'
      }
    ];
  });

  getItemsSummary(): string {
    const o = this.currentOrder();
    if (o?.items && o.items.length > 0) return o.items.map(i => `${i.productName} × ${i.quantity}`).join(' • ');
    return 'Mix Fruit Chaat • Masala Sprouts';
  }

  getAddressSummary(): string {
    const o = this.currentOrder();
    const addr = o?.deliveryAddress;
    if (addr?.addressLine1) return addr.addressLine2 ? `${addr.addressLine1}, ${addr.addressLine2}` : addr.addressLine1;
    return 'Flat 402, Green Valley Apartments, Sector 15';
  }

  getOrderTotal(): number {
    return this.currentOrder()?.grandTotal ?? 180;
  }

  constructor() {
    effect(() => {
      const o = this.currentOrder();
      const loading = this.isPageLoading();
      if (!loading && o && !this.map) {
        setTimeout(() => this.initMap(), 150);
      }
    });

    // Resolve skeleton once orders data is available
    effect(() => {
      const orders = this.dataService.orders();
      if (orders !== null && orders !== undefined) {
        setTimeout(() => {
          this.isPageLoading.set(false);
          setTimeout(() => this.initMap(), 150);
        }, 300);
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isPageLoading.set(false);
      setTimeout(() => this.initMap(), 150);
    }, 1500);

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.orderId.set(id);
    });
    this.route.queryParamMap.subscribe(params => {
      const qId = params.get('orderId');
      if (qId && !this.route.snapshot.paramMap.get('id')) this.orderId.set(qId);
    });
  }

  ngOnDestroy(): void {
    if (this.unsubscribeLive) this.unsubscribeLive();
    if (this.map) this.map.remove();
  }

  private initMap(): void {
    if (this.map) return;
    if (!this.mapContainer?.nativeElement) {
      setTimeout(() => this.initMap(), 150);
      return;
    }

    if (typeof L === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => this.initMap();
      document.head.appendChild(script);
      return;
    }

    const o = this.currentOrder();
    if (!o) {
      setTimeout(() => this.initMap(), 250);
      return;
    }

    const homeLat = (o.deliveryAddress as any)?.lat || 22.7196;
    const homeLng = (o.deliveryAddress as any)?.lng || 75.8577;

    // Fixed Pickup: Atal Dwar, LIG, Indore
    const PICKUP_LAT = 22.7378;
    const PICKUP_LNG = 75.8867;

    try {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [PICKUP_LAT, PICKUP_LNG], zoom: 13,
        zoomControl: false
      });
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(this.map);

      // Pickup marker (green dot)
      const pickupIcon = L.divIcon({
        html: `<div style="background:#2E7D32;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
        className: '', iconSize: [20, 20], iconAnchor: [10, 10]
      });
      L.marker([PICKUP_LAT, PICKUP_LNG], { icon: pickupIcon })
        .addTo(this.map)
        .bindPopup('🟢 Atal Dwar, LIG — Pickup');

      // Home/Drop marker
      const homeIcon = L.divIcon({
        html: '<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">🏠</div>',
        className: 'custom-div-icon', iconSize: [30, 30], iconAnchor: [15, 30]
      });
      this.homeMarker = L.marker([homeLat, homeLng], { icon: homeIcon })
        .addTo(this.map)
        .bindPopup('🔴 Your Delivery Location');

      // Fit map to show both markers
      this.map.fitBounds([[PICKUP_LAT, PICKUP_LNG], [homeLat, homeLng]], { padding: [40, 40] });

      // Draw route line (OSRM)
      this.drawRouteAndAnimate(PICKUP_LAT, PICKUP_LNG, homeLat, homeLng, o);
    } catch (e) {
      console.warn('Map initialization failed, will retry:', e);
      setTimeout(() => this.initMap(), 300);
    }
  }

  private async drawRouteAndAnimate(
    fromLat: number, fromLng: number,
    toLat: number, toLng: number,
    order: any
  ): Promise<void> {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code !== 'Ok' || !data.routes?.length) return;

      const coords: [number, number][] = data.routes[0].geometry.coordinates
        .map((c: any) => [c[1], c[0]] as [number, number]);

      // Draw route polyline
      const isDelivering = order?.status === 'out-for-delivery';
      L.polyline(coords, {
        color: '#2E7D32',
        weight: 4,
        opacity: 0.7,
        dashArray: isDelivering ? '' : '8, 6'
      }).addTo(this.map);

      // Add rider icon if out-for-delivery — animate along route
      if (isDelivering) {
        const bikeIcon = L.divIcon({
          html: '<div style="font-size:30px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4))">🛵</div>',
          className: 'custom-div-icon', iconSize: [34, 34], iconAnchor: [17, 34]
        });
        this.deliveryMarker = L.marker(coords[0], { icon: bikeIcon }).addTo(this.map);
        this.animateRider(coords);
      }

      // Also listen for real Firestore live location
      this.unsubscribeLive = this.dataService.listenToLiveDelivery(order.id, (liveData) => {
        if (liveData) {
          if (!this.deliveryMarker) {
            const bikeIcon = L.divIcon({
              html: '<div style="font-size:30px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4))">🛵</div>',
              className: 'custom-div-icon', iconSize: [34, 34], iconAnchor: [17, 34]
            });
            this.deliveryMarker = L.marker([liveData.lat, liveData.lng], { icon: bikeIcon }).addTo(this.map);
          } else {
            this.deliveryMarker.setLatLng([liveData.lat, liveData.lng]);
          }
          this.map.panTo([liveData.lat, liveData.lng]);
        }
      });
    } catch (e) {
      // Fallback: no route line
      console.warn('Route draw failed', e);
    }
  }

  private animateRider(coords: [number, number][]): void {
    let idx = 0;
    const totalSteps = coords.length;
    const interval = Math.max(1500, 45000 / totalSteps); // ~45s total animation

    const move = () => {
      if (!this.deliveryMarker || !this.map) return;
      if (idx >= totalSteps) {
        idx = 0; // loop
      }
      this.deliveryMarker.setLatLng(coords[idx]);
      idx++;
      setTimeout(move, interval);
    };
    setTimeout(move, 500);
  }

  isCurrentStep(step: TrackStep): boolean {
    const st = this.currentOrder()?.status || 'confirmed';
    if (st === 'cancelled') return false;
    if (st === 'delivered') return step.id === 'delivered';
    if (st === 'out-for-delivery') return step.id === 'out';
    if (st === 'preparing') return step.id === 'preparing';
    if (st === 'pending') return step.id === 'placed';
    if (st === 'confirmed') return step.id === 'preparing';
    return false;
  }
}
