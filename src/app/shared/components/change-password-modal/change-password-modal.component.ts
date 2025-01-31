import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { BaseAuthenticationService } from 'src/app/core/services/impl/base-authentication.service';
import { passwordValidator } from 'src/app/core/utils/validators';
import { StrapiAuthenticationService } from 'src/app/core/services/impl/strapi-authentication.service';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss']
})
export class ChangePasswordModalComponent {
  formGroup: FormGroup;
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private translateService: TranslateService,
    private authService: BaseAuthenticationService,
    private strapiSvc: StrapiAuthenticationService
  ) {
    this.formGroup = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    });
    
    this.formGroup.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.validatePasswordMatch();
    });
    this.formGroup.get('newPassword')?.valueChanges.subscribe(() => {
      this.validatePasswordMatch();
    });
  }

  private validatePasswordMatch() {
    const newPassword = this.formGroup.get('newPassword')?.value;
    const confirmPassword = this.formGroup.get('confirmPassword')?.value;

    if (confirmPassword) {
      const passwordsMatch = newPassword === confirmPassword;
      this.formGroup.get('confirmPassword')?.setErrors(
        passwordsMatch ? null : { passwordsMismatch: true }
      );
    }
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      const loading = await this.loadingCtrl.create();
      await loading.present();

      try {
        const user = await this.authService.getCurrentUser();
        if (!user) {
          throw new Error('No user logged in');
        }

        const changePasswordData = {
          oldPassword: this.formGroup.value.oldPassword,
          newPassword: this.formGroup.value.newPassword
        };

        await this.strapiSvc.changePassword(changePasswordData);

        const successMessage = await lastValueFrom(
          this.translateService.get('CHANGE_PASSWORD.SUCCESS')
        );
        const toast = await this.toastController.create({
          message: successMessage,
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.modalCtrl.dismiss(true);
      } catch (error: any) {
        console.error('Error changing password:', error);
        let errorMessage = await lastValueFrom(
          this.translateService.get('CHANGE_PASSWORD.ERROR')
        );

        if (error.message?.includes('wrong-password') || error.message?.includes('incorrect')) {
          errorMessage = await lastValueFrom(
            this.translateService.get('CHANGE_PASSWORD.ERRORS.OLD_PASSWORD_WRONG')
          );
        }

        const toast = await this.toastController.create({
          message: errorMessage,
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        loading.dismiss();
      }
    }
  }

  togglePasswordVisibility(field: string) {
    switch (field) {
      case 'old':
        this.showOldPassword = !this.showOldPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  get oldPassword() {
    return this.formGroup.get('oldPassword');
  }

  get newPassword() {
    return this.formGroup.get('newPassword');
  }

  get confirmPassword() {
    return this.formGroup.get('confirmPassword');
  }

  passwordsDoNotMatch(): boolean {
    const newPassword = this.formGroup.get('newPassword')?.value;
    const confirmPassword = this.formGroup.get('confirmPassword')?.value;
    return confirmPassword && newPassword !== confirmPassword;
  }
}