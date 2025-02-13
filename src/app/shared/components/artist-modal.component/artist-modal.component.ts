// artist-modal.component.ts
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Artist } from 'src/app/core/models/artist.model';
import { Song } from 'src/app/core/models/song.model';
import { BaseMediaService } from 'src/app/core/services/impl/base-media.service';
import { SongsService } from 'src/app/core/services/impl/songs.service';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { SongDetailModalComponent } from '../song-detail-modal/song-detail-modal.component';

@Component({
  selector: 'app-artist-modal',
  templateUrl: './artist-modal.component.html',
  styleUrls: ['./artist-modal.component.scss']
})
export class ArtistModalComponent  {
  formGroup: FormGroup;
  mode: 'new' | 'edit' = 'new';
  private _selectedSongs = new BehaviorSubject<Song[]>([]);
  selectedSongs$ = this._selectedSongs.asObservable();

  @Input() set artist(_artist: Artist) {
    if (_artist && _artist.id) {
      this.mode = 'edit';
      this.formGroup.patchValue({
        name: _artist.name,
        listiners: _artist.listiners || 0,
        image: _artist.image?.url,
        songs_IDS: _artist.songs_IDS || []
      });
      
      // Cargar las canciones seleccionadas
      if (_artist.songs_IDS?.length) {
        this.loadSelectedSongs(_artist.songs_IDS);
      }
    }
  }

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private mediaService: BaseMediaService,
    private songsService: SongsService
  ) {
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      listiners: [0],
      image: [null],
      songs_IDS: [[]]
    });
  }

  private async loadSelectedSongs(songIds: string[]) {
    const songs = await Promise.all(
      songIds.map(id => lastValueFrom(this.songsService.getById(id)))
    );
    this._selectedSongs.next(songs.filter((song): song is Song => song !== null));
  }

  async openSongSelector() {
    const modal = await this.modalCtrl.create({
      component: SongDetailModalComponent,
      componentProps: {
        excludeSongIds: this.formGroup.get('songs_IDS')?.value || []
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'select' && result.data) {
        const currentSongs = this._selectedSongs.value;
        const newSong = result.data as Song;
        
        if (!currentSongs.find(s => s.id === newSong.id)) {
          this._selectedSongs.next([...currentSongs, newSong]);
          const currentIds = this.formGroup.get('songs_IDS')?.value || [];
          this.formGroup.patchValue({
            songs_IDS: [...currentIds, newSong.id]
          });
          this.formGroup.markAsDirty();
        }
      }
    });

    await modal.present();
  }

  removeSong(song: Song) {
    const currentSongs = this._selectedSongs.value;
    this._selectedSongs.next(currentSongs.filter(s => s.id !== song.id));
    
    const currentIds = this.formGroup.get('songs_IDS')?.value || [];
    this.formGroup.patchValue({
      songs_IDS: currentIds.filter((id: string) => id !== song.id)
    });
    this.formGroup.markAsDirty();
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