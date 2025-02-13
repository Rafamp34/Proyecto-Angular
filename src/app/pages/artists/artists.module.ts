// artists.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ArtistsPageRoutingModule } from './artists-routing.module';
import { ArtistsPage } from './artists.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ArtistModalComponent } from 'src/app/shared/components/artist-modal.component/artist-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ArtistsPageRoutingModule,
    TranslateModule.forChild(),
    SharedModule
  ],
  declarations: [
    ArtistsPage,
    ArtistModalComponent
  ]
})
export class ArtistsPageModule {}