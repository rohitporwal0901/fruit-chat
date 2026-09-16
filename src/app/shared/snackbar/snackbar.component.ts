import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fc-snackbar-wrap" [class.show]="snackbar.isOpen()">
      <div class="fc-snackbar" [class]="'fc-snackbar--' + snackbar.type()">
        <span class="material-symbols-outlined fc-snack-icon">{{ getIcon() }}</span>
        <span class="fc-snack-msg">{{ snackbar.message() }}</span>
        <button class="fc-snack-close" (click)="snackbar.close()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .fc-snackbar-wrap {
      position: fixed;
      bottom: 2rem; left: 50%;
      transform: translateX(-50%) translateY(120px);
      z-index: 99999;
      opacity: 0; visibility: hidden;
      transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
      &.show { transform: translateX(-50%) translateY(0); opacity: 1; visibility: visible; }
    }
    .fc-snackbar {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.85rem 1.25rem;
      border-radius: 50px;
      min-width: 300px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      color: #fff;
      background: #2E7D32;
    }
    .fc-snackbar--success { background: linear-gradient(135deg, #1B5E20, #2E7D32); }
    .fc-snackbar--error   { background: linear-gradient(135deg, #B71C1C, #E53935); }
    .fc-snackbar--info    { background: linear-gradient(135deg, #0D47A1, #1565C0); }
    .fc-snack-icon { font-size: 22px; flex-shrink: 0; }
    .fc-snack-msg { flex: 1; font-size: 0.9rem; font-weight: 500; font-family: 'Inter', sans-serif; }
    .fc-snack-close {
      background: rgba(255,255,255,0.15); border: none;
      width: 26px; height: 26px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: rgba(255,255,255,0.85); transition: background 0.2s;
      span { font-size: 16px; }
      &:hover { background: rgba(255,255,255,0.25); }
    }
  `]
})
export class SnackbarComponent {
  snackbar = inject(SnackbarService);

  getIcon(): string {
    switch (this.snackbar.type()) {
      case 'success': return 'check_circle';
      case 'error':   return 'error';
      default:        return 'info';
    }
  }
}
