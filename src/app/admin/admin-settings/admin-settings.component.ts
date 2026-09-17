import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { OfferCard } from '../../core/models/admin.model';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent {
  dataService = inject(DataService);
  snackbar = inject(SnackbarService);

  offerCard = this.dataService.offerCard;

  // Offer Card editing
  editingOffer = signal(false);
  isSavingOffer = signal(false);
  offerDraft: OfferCard = { ...this.offerCard() };

  // Quick Presets
  presets = [
    { label: '₹50 OFF (Min ₹99)', amount: 50, minOrder: 99, code: 'FRUIT50' },
    { label: '₹100 OFF (Min ₹249)', amount: 100, minOrder: 249, code: 'FRUIT100' },
    { label: '₹150 OFF (Min ₹399)', amount: 150, minOrder: 399, code: 'FRUIT150' },
    { label: '₹200 OFF (Min ₹499)', amount: 200, minOrder: 499, code: 'BIGFRUIT' }
  ];

  startEditOffer() {
    this.offerDraft = { ...this.offerCard() };
    this.editingOffer.set(true);
  }

  cancelEditOffer() {
    this.editingOffer.set(false);
  }

  applyPreset(preset: { label: string; amount: number; minOrder: number; code: string }) {
    this.offerDraft.amount = preset.amount;
    this.offerDraft.minOrderAmount = preset.minOrder;
    this.offerDraft.code = preset.code;
    this.offerDraft.heading = `Hurry, ₹${preset.amount} Free Cash expiring soon!`;
    this.offerDraft.subtext = `Valid on orders above ₹${preset.minOrder}`;
    this.offerDraft.validText = `Valid on orders above ₹${preset.minOrder}`;
  }

  async quickToggleActive() {
    const current = this.offerCard();
    const newStatus = !current.isActive;
    try {
      await this.dataService.updateOfferCard({ isActive: newStatus });
      this.snackbar.show(`Offer card ${newStatus ? 'activated' : 'deactivated'}`, 'success');
    } catch {
      this.snackbar.show('Failed to update status', 'error');
    }
  }

  async saveOfferCard() {
    this.isSavingOffer.set(true);
    try {
      const payload: OfferCard = {
        ...this.offerDraft,
        code: (this.offerDraft.code || 'FRUIT50').trim().toUpperCase(),
        amount: Number(this.offerDraft.amount) || 0,
        minOrderAmount: Number(this.offerDraft.minOrderAmount) || 0,
        validText: this.offerDraft.validText || `Valid on orders above ₹${this.offerDraft.minOrderAmount || 0}`
      };
      await this.dataService.updateOfferCard(payload);
      this.snackbar.show('Offer card updated successfully!', 'success');
      this.editingOffer.set(false);
    } catch {
      this.snackbar.show('Failed to save offer card', 'error');
    } finally {
      this.isSavingOffer.set(false);
    }
  }

  copyCouponCode(code: string) {
    if (!code) return;
    navigator.clipboard.writeText(code);
    this.snackbar.show(`Coupon code "${code}" copied!`, 'info');
  }
}
