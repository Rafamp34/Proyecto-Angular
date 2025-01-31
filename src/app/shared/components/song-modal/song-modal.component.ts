import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, Platform } from '@ionic/angular';
import { Song } from 'src/app/core/models/song.model';

@Component({
  selector: 'app-song-modal',
  templateUrl: './song-modal.component.html',
  styleUrls: ['./song-modal.component.scss'],
})
export class SongModalComponent {
  formGroup: FormGroup;
  mode: 'new' | 'edit' = 'new';
  isMobile: boolean = false;

  @Input() set song(_song: Song) {
    if (_song && _song.id) {
      this.mode = 'edit';
      this.formGroup.patchValue({
        name: _song.name,
        author: _song.author,
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
    private platform: Platform
  ) {
    this.isMobile = this.platform.is('ios') || this.platform.is('android');
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      author: ['', [Validators.required]],
      album: [''],
      duration: [0, [Validators.required, Validators.min(0)]],
      image: [null],
      playlistId_IDS: [[]]
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

  onSubmit() {
    if (this.formGroup.valid) {
      const role = this.mode === 'new' ? 'create' : 'update';
      const data = this.mode === 'new' ? 
        this.formGroup.value : 
        this.getDirtyValues(this.formGroup);
      
      this.modalCtrl.dismiss(data, role);
    }
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}