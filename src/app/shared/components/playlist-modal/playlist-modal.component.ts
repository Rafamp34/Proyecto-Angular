import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, Platform } from '@ionic/angular';
import { Playlist } from 'src/app/core/models/playlist.model';
import { BaseAuthenticationService } from 'src/app/core/services/impl/base-authentication.service';
import { BaseMediaService } from 'src/app/core/services/impl/base-media.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-playlist-modal',
  templateUrl: './playlist-modal.component.html',
  styleUrls: ['./playlist-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PlaylistModalComponent {
  formGroup: FormGroup;
  mode: 'new' | 'edit' = 'new';
  isMobile: boolean = false;
  previewImage: string | null = null;
  selectedFile: File | null = null;

  @Input() set playlist(_playlist: Playlist) {
    if (_playlist && _playlist.id) {
      this.mode = 'edit';
      this.formGroup.patchValue({
        name: _playlist.name,
        author: _playlist.author,
        duration: _playlist.duration,
        song_IDS: _playlist.song_IDS,
        users_IDS: _playlist.users_IDS
      });
      if (_playlist.image?.url) {
        this.previewImage = _playlist.image.url;
      }
    }
  }

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private platform: Platform,
    private authSvc: BaseAuthenticationService,
    private mediaService: BaseMediaService<number>
  ) {
    this.isMobile = this.platform.is('ios') || this.platform.is('android');
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      song_IDS: [[]],
      users_IDS: [[]]
    });

    this.authSvc.user$.subscribe(user => {
      if (user) {
        this.formGroup.patchValue({
          users_IDS: [user.id]
        });
      }
    });
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      console.log('File selected:', file);
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      try {
        let imageId: number | undefined;
  
        if (this.selectedFile) {
          console.log('Starting file upload');
          try {
            const uploadedIds = await firstValueFrom(this.mediaService.upload(this.selectedFile));
            console.log('Upload response:', uploadedIds);
            imageId = uploadedIds[0];
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
          }
        }
  
        const values = this.mode === 'new' ? 
          this.formGroup.value : 
          this.getDirtyValues(this.formGroup);
  
        const data = {
          ...values,
          image: imageId
        };
  
        console.log('Final data to be sent:', data);
        this.modalCtrl.dismiss(data, this.mode === 'new' ? 'create' : 'update');
  
      } catch (error) {
        console.error('Error in submit:', error);
      }
    }
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

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}