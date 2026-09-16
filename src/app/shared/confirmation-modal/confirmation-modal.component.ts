import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fc-modal-overlay" *ngIf="isOpen" (click)="onCancel()">
      <div class="fc-modal-card" (click)="$event.stopPropagation()">
        <div class="fc-modal-icon">
          <span class="material-symbols-outlined">warning</span>
        </div>
        <h3 class="fc-modal-title">{{ title }}</h3>
        <p class="fc-modal-msg">{{ message }}</p>
        <div class="fc-modal-actions">
          <button class="fc-btn fc-btn-outline" (click)="onCancel()">{{ cancelText }}</button>
          <button class="fc-btn fc-btn-danger" (click)="onConfirm()">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fc-modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      animation: fcFadeIn 0.2s ease;
    }
    .fc-modal-card {
      background: #fff;
      border-radius: 20px;
      padding: 2rem 1.75rem;
      width: 90%; max-width: 380px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      animation: fcScaleUp 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
    }
    .fc-modal-icon {
      width: 60px; height: 60px;
      background: #FFF0F0;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.25rem;
      span { font-size: 30px; color: #E53935; }
    }
    .fc-modal-title { font-size: 1.2rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.5rem; }
    .fc-modal-msg { font-size: 0.9rem; color: #666; margin: 0 0 1.75rem; line-height: 1.5; }
    .fc-modal-actions { display: flex; gap: 0.75rem; }
    .fc-btn {
      flex: 1; padding: 0.75rem; border-radius: 10px;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      border: none; font-family: inherit; transition: all 0.2s;
    }
    .fc-btn-outline {
      background: #f5f5f5; color: #444; border: 1px solid #ddd;
      &:hover { background: #ececec; }
    }
    .fc-btn-danger {
      background: #E53935; color: #fff;
      &:hover { background: #C62828; transform: translateY(-1px); }
    }
    @keyframes fcFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fcScaleUp { from { transform: scale(0.88); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() { this.confirm.emit(); }
  onCancel() { this.cancel.emit(); }
}
