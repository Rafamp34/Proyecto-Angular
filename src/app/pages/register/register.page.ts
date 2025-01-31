import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { BaseAuthenticationService } from 'src/app/core/services/impl/base-authentication.service';
import { passwordsMatchValidator, passwordValidator } from 'src/app/core/utils/validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  registerForm: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authSvc: BaseAuthenticationService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordValidator]],
      confirmPassword: ['', [Validators.required]],
      image: ['']
    },
    { validators: passwordsMatchValidator });
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Creando cuenta...',
        cssClass: 'custom-loading'
      });
      await loading.present();

      try {
        await firstValueFrom(this.authSvc.signUp({
          name: this.registerForm.value.name,
          surname: this.registerForm.value.surname,
          email: this.registerForm.value.email,
          password: this.registerForm.value.password,
          image: this.registerForm.value.image
        }));
        
        await loading.dismiss();
        await this.presentSuccessToast('¡Cuenta creada con éxito!');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);

      } catch (error: any) {
        await loading.dismiss();
        let errorMessage = 'Error al crear la cuenta';

        if (error.status === 409) {
          errorMessage = 'El email ya está registrado';
        } else if (error.status === 400) {
          errorMessage = 'Datos de registro inválidos';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión. Comprueba tu internet';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        await this.presentErrorToast(errorMessage);
      }
    }
  }

  async presentErrorToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top',
      cssClass: 'error-toast',
      buttons: [
        {
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  async presentSuccessToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top',
      cssClass: 'success-toast',
      buttons: [
        {
          icon: 'checkmark-outline',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  onLogin() {
    this.registerForm.reset();
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: returnUrl },
      replaceUrl: true
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get image() {
    return this.registerForm.controls['image'];
  }

  get name() {
    return this.registerForm.controls['name'];
  }

  get surname() {
    return this.registerForm.controls['surname'];
  }

  get email() {
    return this.registerForm.controls['email'];
  }

  get password() {
    return this.registerForm.controls['password'];
  }

  get confirmPassword() {
    return this.registerForm.controls['confirmPassword'];
  }
}