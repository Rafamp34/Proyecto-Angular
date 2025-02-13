import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, Platform } from '@ionic/angular';
import { Song } from 'src/app/core/models/song.model';
import { Artist } from 'src/app/core/models/artist.model';
import { ArtistsService } from 'src/app/core/services/impl/artists.service';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Paginated } from 'src/app/core/models/paginated.model';
import { BaseMediaService } from 'src/app/core/services/impl/base-media.service';

@Component({
  selector: 'app-song-modal',
  templateUrl: './song-modal.component.html',
  styleUrls: ['./song-modal.component.scss'],
})
export class SongModalComponent implements OnInit {
  formGroup: FormGroup;
  mode: 'new' | 'edit' = 'new';
  isMobile: boolean = false;

  private _availableArtists = new BehaviorSubject<Artist[]>([]);
  availableArtists$ = this._availableArtists.asObservable();

  @Input() set song(_song: Song) {
    if (_song && _song.id) {
      this.mode = 'edit';
      this.formGroup.patchValue({
        name: _song.name,
        artists_IDS: _song.artists_IDS || [],
        album: _song.album,
        duration: _song.duration,
        image: _song.image?.url,
        playlistId_IDS: _song.playlistId_IDS
      });
    }
  }

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private platform: Platform,
    private artistsSvc: ArtistsService,
    private mediaService: BaseMediaService,
    
  ) {
    this.isMobile = this.platform.is('ios') || this.platform.is('android');
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      artists_IDS: [[], [Validators.required, Validators.minLength(1)]],
      album: [''],
      duration: ['', [Validators.required]],
      image: [null],
      playlistId_IDS: [[]]
    });
  }

  ngOnInit() {
    this.loadArtists();
  }

  loadArtists() {
    this.artistsSvc.getAll(1, 100).subscribe({
      next: (response: Paginated<Artist>) => {
        this._availableArtists.next(response.data);
      },
      error: (error) => {
        console.error('Error loading artists:', error);
        this._availableArtists.next([]);
      }
    });
  }

  compareWith(currentValue: string, compareValue: string) {
    return currentValue === compareValue;
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