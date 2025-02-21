// edit-profile-modal.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/impl/user.service';
import { BaseMediaService } from 'src/app/core/services/impl/base-media.service';
import { ChangePasswordModalComponent } from '../change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
})
export class EditProfileModalComponent implements OnInit {
  @Input() user?: User;
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userSvc: UserService,
    private mediaService: BaseMediaService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private translateService: TranslateService,
    private modalCtrl: ModalController
  ) {
    this.formGroup = this.formBuilder.group({
      displayName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      image: ['']
    });
  }

  ngOnInit() {
    console.log('User received in modal:', this.user);
    if (this.user) {
      this.formGroup.patchValue({
        displayName: this.user.displayName || '',
        email: this.user.email || '',
        image: this.user.image?.url || ''
      }, { emitEvent: false });
    } else {
      console.error('No user data provided to modal');
    }
  }

  async onSubmit() {
    if (!this.formGroup.valid || !this.formGroup.dirty) {
      console.warn('Form is invalid or not dirty');
      return;
    }

    if (!this.user?.id) {
      console.error('No user ID available');
      await this.showToast('COMMON.ERROR.INVALID_USER', 'danger');
      return;
    }

    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const changes: Partial<User> = {};

      if (this.formGroup.get('displayName')?.dirty) {
        changes.displayName = this.formGroup.get('displayName')?.value;
      }

      if (this.formGroup.get('email')?.dirty) {
        changes.email = this.formGroup.get('email')?.value;
      }

      if (this.formGroup.get('image')?.dirty) {
        const imageValue = this.formGroup.get('image')?.value;
        if (imageValue) {
          changes.image = {
            url: imageValue,
            large: imageValue,
            medium: imageValue,
            small: imageValue,
            thumbnail: imageValue
          };
        }
      }

      console.log('Updating user with ID:', this.user.id);
      console.log('Changes to apply:', changes);

      const updatedUser = await lastValueFrom(this.userSvc.updateProfile(this.user.id, changes));
      await this.showToast('COMMON.SUCCESS.SAVE', 'success');
      this.modalCtrl.dismiss(updatedUser, 'updated');
    } catch (error) {
      console.error('Update error:', error);
      await this.showToast('COMMON.ERROR.SAVE', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async openChangePasswordModal() {
    const modal = await this.modalCtrl.create({
      component: ChangePasswordModalComponent,
      cssClass: 'custom-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      await this.showToast('CHANGE_PASSWORD.SUCCESS', 'success');
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: await lastValueFrom(this.translateService.get(message)),
      duration: 3000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  get displayName() {
    return this.formGroup.controls['displayName'];
  }

  get email() {
    return this.formGroup.controls['email'];
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}