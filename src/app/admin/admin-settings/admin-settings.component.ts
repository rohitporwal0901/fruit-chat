import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { HomeSlide, OfferCard } from '../../core/models/admin.model';
import { SideDrawerComponent } from '../../shared/side-drawer/side-drawer.component';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { SnackbarService } from '../../core/services/snackbar.service';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SideDrawerComponent, ConfirmationModalComponent],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent {
  dataService = inject(DataService);
  storage = inject(Storage);
  snackbar = inject(SnackbarService);

  slides = this.dataService.homeSlides;
  offerCard = this.dataService.offerCard;

  // Offer Card editing
  editingOffer = signal(false);
  isSavingOffer = signal(false);
  offerDraft: OfferCard = { ...this.offerCard() };

  startEditOffer() {
    this.offerDraft = { ...this.offerCard() };
    this.editingOffer.set(true);
  }
  cancelEditOffer() { this.editingOffer.set(false); }

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
      this.snackbar.show('Offer card updated!', 'success');
      this.editingOffer.set(false);
    } catch { this.snackbar.show('Failed to save', 'error'); }
    finally { this.isSavingOffer.set(false); }
  }

  // Hero Slides
  isSlideDrawerOpen = signal(false);
  isEditingSlide = signal(false);
  isDeleteModal = signal(false);
  slideToDelete = signal<string | null>(null);
  isSavingSlide = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);

  currentSlide: Partial<HomeSlide> & { img: string } = this.getEmptySlide();

  getEmptySlide() {
    return { title:'', subtitle:'', tag:'', bg:'linear-gradient(135deg,#1B5E20,#2E7D32)', img:'', link:'/menu', btnText:'Order Now', status:'active' as const, order:1 };
  }

  openAddSlide() {
    this.isEditingSlide.set(false);
    this.currentSlide = this.getEmptySlide();
    this.currentSlide.order = this.slides().length + 1;
    this.isSlideDrawerOpen.set(true);
  }

  openEditSlide(slide: HomeSlide) {
    this.isEditingSlide.set(true);
    this.currentSlide = { ...slide };
    this.isSlideDrawerOpen.set(true);
  }

  closeSlideDrawer() { this.isSlideDrawerOpen.set(false); }

  async onSlideImgSelected(event: any) {
    const file = event.target.files[0]; if (!file) return;
    this.isUploading.set(true); this.uploadProgress.set(0);
    const storRef = ref(this.storage, `fc_slides/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storRef, file);
    await new Promise<void>((res, rej) => {
      task.on('state_changed',
        snap => this.uploadProgress.set(Math.round((snap.bytesTransferred/snap.totalBytes)*100)),
        rej,
        async () => { this.currentSlide.img = await getDownloadURL(task.snapshot.ref); res(); }
      );
    });
    this.isUploading.set(false);
    event.target.value = '';
  }

  async saveSlide(form: any) {
    if (form.invalid || !this.currentSlide.img) {
      this.snackbar.show(form.invalid ? 'Fill required fields' : 'Upload an image', 'error'); return;
    }
    this.isSavingSlide.set(true);
    try {
      if (this.isEditingSlide() && 'id' in this.currentSlide) {
        await this.dataService.updateHomeSlide((this.currentSlide as any).id, this.currentSlide);
        this.snackbar.show('Slide updated!', 'success');
      } else {
        await this.dataService.addHomeSlide(this.currentSlide as any);
        this.snackbar.show('Slide added!', 'success');
      }
      this.closeSlideDrawer();
    } catch { this.snackbar.show('Failed to save', 'error'); }
    finally { this.isSavingSlide.set(false); }
  }

  promptDeleteSlide(id: string) { this.slideToDelete.set(id); this.isDeleteModal.set(true); }
  cancelDelete() { this.isDeleteModal.set(false); this.slideToDelete.set(null); }
  async confirmDelete() {
    const id = this.slideToDelete();
    if (id) { await this.dataService.deleteHomeSlide(id); this.snackbar.show('Slide deleted', 'success'); }
    this.isDeleteModal.set(false); this.slideToDelete.set(null);
  }
}
