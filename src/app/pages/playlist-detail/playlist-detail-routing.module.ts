import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlaylistDetailPage } from './playlist-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PlaylistDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlaylistDetailPageRoutingModule {}