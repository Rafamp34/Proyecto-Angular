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
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      image: ['']
    });
  }

  ngOnInit() {
    if (this.user) {
      this.formGroup.patchValue({
        username: this.user.username || '',
        email: this.user.email || '',
        image: this.user.image?.url || ''
      });
    }
  }

  async onSubmit() {
    if (!this.formGroup.valid || !this.formGroup.dirty || !this.user) return;
  
    const loading = await this.loadingController.create();
    await loading.present();
  
    try {
      const changes: Partial<User> = {};

      if (this.formGroup.get('username')?.dirty) {
        changes.username = this.formGroup.get('username')?.value;
      }
      
      if (this.formGroup.get('email')?.dirty) {
        changes.email = this.formGroup.get('email')?.value;
      }
  
      if (this.formGroup.get('image')?.dirty) {
        const imageValue = this.formGroup.get('image')?.value;
        if (imageValue) {
          const blob = await (await fetch(imageValue)).blob();
          const uploadResult = await lastValueFrom(this.mediaService.upload(blob));
          changes.image = { 
            url: uploadResult[0].toString(),
            large: undefined,
            medium: undefined,
            small: undefined,
            thumbnail: undefined
          };
        }
      }
  
      const result = await lastValueFrom(this.userSvc.updateProfile(this.user.id, changes));
      
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: await lastValueFrom(this.translateService.get('COMMON.SUCCESS.SAVE')),
        duration: 3000,
        position: 'bottom'
      });
      await toast.present();
      this.modalCtrl.dismiss(result, 'updated');
    } catch (error) {
      console.error('Update error:', error);
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: await lastValueFrom(this.translateService.get('COMMON.ERROR.SAVE')),
        duration: 3000,
        position: 'bottom'
      });
      await toast.present();
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
      const toast = await this.toastController.create({
        message: await lastValueFrom(this.translateService.get('CHANGE_PASSWORD.SUCCESS')),
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    }
  }

  get username() {
    return this.formGroup.controls['username'];
  }

  get email() {
    return this.formGroup.controls['email'];
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
