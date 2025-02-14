import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { SongModalComponent } from './components/song-modal/song-modal.component';
import { PictureSelectableComponent } from './components/picture-selectable/picture-selectable.component';
import { ChangePasswordModalComponent } from './components/change-password-modal/change-password-modal.component';
import { PlaylistModalComponent } from './components/playlist-modal/playlist-modal.component';
import { EditProfileModalComponent } from './components/edit-profile-modal/edit-profile-modal.component';
import { SongDetailModalComponent } from './components/song-detail-modal/song-detail-modal.component';
import { PasswordVisibilityPipe } from './pipe/password-visibility.pipe';
import { PlaylistDurationPipe } from './pipe/playlist-duration.pipte';
import { SongGridCardComponent } from './components/song-grid-card/song-grid-card.component';
import { DurationPipe } from './pipe/duration.pipe';
import { ArtistGridCardComponent } from './components/artist-grid-card/artist-grid-card.component';

@NgModule({
  declarations: [
    // Components y Modals
    SongModalComponent,
    PictureSelectableComponent,
    ChangePasswordModalComponent,
    PlaylistModalComponent,
    EditProfileModalComponent,
    SongDetailModalComponent,
    SongGridCardComponent,
    ArtistGridCardComponent,
    // Pipes
    PasswordVisibilityPipe,
    PlaylistDurationPipe,
    DurationPipe
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule.forChild()
  ],
  exports: [
    // Components y Modals
    SongModalComponent,
    PictureSelectableComponent,
    ChangePasswordModalComponent,
    PlaylistModalComponent,
    EditProfileModalComponent,
    SongDetailModalComponent,
    SongGridCardComponent,
    ArtistGridCardComponent,
    // Pipes
    PasswordVisibilityPipe,
    PlaylistDurationPipe,
    DurationPipe

  ]
})
export class SharedModule { }