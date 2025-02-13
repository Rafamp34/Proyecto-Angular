import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlaylistDetailPageRoutingModule } from './playlist-detail-routing.module';
import { PlaylistDetailPage } from './playlist-detail.page';
import { SharedModule } from '../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PlaylistDetailPageRoutingModule,
    SharedModule,
    TranslateModule.forChild()
  ],
  declarations: [
    PlaylistDetailPage
  ]
})
export class PlaylistDetailPageModule {}