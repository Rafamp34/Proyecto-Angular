import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { BaseAuthenticationService } from 'src/app/core/services/impl/base-authentication.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { LottieComponent } from 'ngx-lottie';
import type { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, LottieComponent]
})
export class SplashPage implements OnInit {
  options = {
    path: '/assets/lotties/splash.json'
  };

  animationCreated(animationItem: AnimationItem): void {
    console.log('Animation created');
  }

  constructor(
    private router: Router,
    private authSvc: BaseAuthenticationService
  ) {}

  ngOnInit() {
    timer(3000).subscribe(() => {
      this.router.navigate(['/home']);
    });
  }
}