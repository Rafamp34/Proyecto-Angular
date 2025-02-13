import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, Platform } from '@ionic/angular';
import { lastValueFrom } from 'rxjs';
import { Playlist } from 'src/app/core/models/playlist.model';
import { BaseAuthenticationService } from 'src/app/core/services/impl/base-authentication.service';
import { BaseMediaService } from 'src/app/core/services/impl/base-media.service';

@Component({
  selector: 'app-playlist-modal',
  templateUrl: './playlist-modal.component.html',
  styleUrls: ['./playlist-modal.component.scss'],
})
export class PlaylistModalComponent {
  formGroup: FormGroup;
  mode: 'new' | 'edit' = 'new';
  isMobile: boolean = false;

  @Input() set playlist(_playlist: Playlist) {
    if (_playlist && _playlist.id) {
      this.mode = 'edit';
      this.formGroup.patchValue({
        name: _playlist.name,
        author: _playlist.author,
        duration: _playlist.duration,
        image: _playlist.image?.url,
        song_IDS: _playlist.song_IDS,
        users_IDS: _playlist.users_IDS
      });
    }
  }

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private platform: Platform,
    private authSvc: BaseAuthenticationService,
    private mediaService: BaseMediaService,
  ) {
    this.isMobile = this.platform.is('ios') || this.platform.is('android');
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      duration: ['', [Validators.required]],
      image: [null],
      song_IDS: [[]],
      users_IDS: [[]]
    });

    // Añadir el ID del usuario actual a users_IDS
    this.authSvc.user$.subscribe(user => {
      if (user) {
        this.formGroup.patchValue({
          users_IDS: [user.id]
        });
      }
    });
  }

  getDirtyValues(formGroup: FormGroup): any {
    const dirtyValues: any = {};
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control?.dirty) {
        dirtyValues[key] = control.value;
      }
    });
    return dirtyValues;
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      try {
        const formData = { ...this.formGroup.value };
        
        // Manejar la imagen si ha sido modificada
        if (this.formGroup.get('image')?.dirty && formData.image) {
          try {
            const response = await fetch(formData.image);
            const blob = await response.blob();
            
            const uploadResult = await lastValueFrom(this.mediaService.upload(blob));
            formData.image = {
              url: uploadResult[0],
              large: uploadResult[0],
              medium: uploadResult[0],
              small: uploadResult[0],
              thumbnail: uploadResult[0]
            };
          } catch (error) {
            console.error('Error uploading image:', error);
            delete formData.image;
          }
        }

        const role = this.mode === 'new' ? 'create' : 'update';
        const data = this.mode === 'new' ? 
          formData : 
          this.getDirtyValues(this.formGroup);
        
        this.modalCtrl.dismiss(data, role);
      } catch (error) {
        console.error('Error in submit:', error);
      }
    }
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}