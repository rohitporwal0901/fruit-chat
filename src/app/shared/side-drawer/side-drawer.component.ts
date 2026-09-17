import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fc-overlay" [class.active]="isOpen" (click)="onClose()"></div>
    <div class="fc-drawer" [class.open]="isOpen" [style.width]="width" [style.max-width]="'100vw'">
      <div class="fc-drawer-header">
        <h3>{{ title }}</h3>
        <button class="fc-close-btn" (click)="onClose()" type="button">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="fc-drawer-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .fc-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(3px);
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .fc-overlay.active { opacity: 1; pointer-events: auto; }

    .fc-drawer {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      background: #fff;
      z-index: 1001;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
      box-shadow: -8px 0 40px rgba(0,0,0,0.18);
    }
    .fc-drawer.open { transform: translateX(0); }

    .fc-drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f0f0f0;
      background: #fff;
      flex-shrink: 0;
    }
    .fc-drawer-header h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
    }
    .fc-close-btn {
      background: #f5f5f5;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
      color: #555;
    }
    .fc-close-btn:hover { background: #e8e8e8; color: #222; }
    .fc-close-btn span { font-size: 18px; }

    .fc-drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      -webkit-overflow-scrolling: touch;
    }

    @media (max-width: 600px) {
      .fc-drawer {
        width: 100% !important;
        max-width: 100vw !important;
        height: 100dvh;
      }
      .fc-drawer-header {
        padding: 1rem 1.25rem;
      }
      .fc-drawer-body {
        padding: 1.25rem 1rem;
      }
    }
  `]
})
export class SideDrawerComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() width = '440px';
  @Output() close = new EventEmitter<void>();

  onClose() { this.close.emit(); }
}
