import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { BaseAuthenticationService } from 'src/app/core/services/impl/base-authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;
  showPassword: boolean = false; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authSvc: BaseAuthenticationService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Iniciando sesión...',
        cssClass: 'custom-loading'
      });
      await loading.present();

      try {
        await this.authSvc.signIn(this.loginForm.value).subscribe({
          next: async (resp) => {
            await loading.dismiss();
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
            this.router.navigateByUrl(returnUrl);
          },
          error: async (err) => {
            await loading.dismiss();
            let errorMessage = 'Error al iniciar sesión';

            if (err.status === 401) {
              errorMessage = 'Email o contraseña incorrectos';
            } else if (err.status === 404) {
              errorMessage = 'Usuario no encontrado';
            } else if (err.status === 0) {
              errorMessage = 'Error de conexión. Comprueba tu internet';
            } else if (err.error?.message) {
              errorMessage = err.error.message;
            }

            await this.presentErrorToast(errorMessage);
          }
        });
      } catch (error) {
        await loading.dismiss();
        await this.presentErrorToast('Error inesperado. Inténtalo de nuevo');
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

  onRegister() {
    this.loginForm.reset();
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    this.router.navigate(['/register'], {
      queryParams: { returnUrl: returnUrl },
      replaceUrl: true
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get email() {
    return this.loginForm.controls['email'];
  }

  get password() {
    return this.loginForm.controls['password'];
  }
}