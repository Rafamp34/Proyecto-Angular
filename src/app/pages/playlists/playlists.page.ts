import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { PlaylistsService } from '../../core/services/impl/playlists.service';
import { Playlist } from '../../core/models/playlist.model';
import { Paginated } from '../../core/models/paginated.model';
import { TranslateService } from '@ngx-translate/core';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { PlaylistModalComponent } from 'src/app/shared/components/playlist-modal/playlist-modal.component';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.page.html',
  styleUrls: ['./playlists.page.scss'],
})
export class PlaylistsPage implements OnInit {
  private _playlists: BehaviorSubject<Playlist[]> = new BehaviorSubject<Playlist[]>([]);
  playlists$: Observable<Playlist[]> = this._playlists.asObservable();
  
  isWeb: boolean = false;
  page: number = 1;
  pageSize: number = 25;
  pages: number = 0;

  constructor(
    private playlistsSvc: PlaylistsService,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private platform: Platform,
    private authSvc: BaseAuthenticationService
  ) {
    this.isWeb = this.platform.is('desktop');
  }

  ngOnInit() {
    this.loadPlaylists();
  }

  loadPlaylists() {
    this.page = 1;
    this.playlistsSvc.getAll(this.page, this.pageSize).subscribe({
      next: (response: Paginated<Playlist>) => {
        this._playlists.next([...response.data]);
        this.page++;
        this.pages = response.pages;
      }
    });
  }

  async onAddPlaylist() {
    const user = await this.authSvc.getCurrentUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    const modal = await this.modalCtrl.create({
      component: PlaylistModalComponent,
      componentProps: {}
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'create') {
        const newPlaylist: Playlist = {
          name: result.data.name,
          author: user.username,
          duration: '0:00',
          song_IDS: [],
          users_IDS: [user.id],
          ...(result.data.image && {
            image: {
              url: result.data.image.url,
              thumbnail: result.data.image.url,
              large: result.data.image.url,
              medium: result.data.image.url,
              small: result.data.image.url
            }
          })
        };

        this.playlistsSvc.add(newPlaylist).subscribe({
          next: () => {
            this.loadPlaylists();
              
          },
          error: (err) => {
            console.error('Error creating playlist:', err);
          }
        });
      }
    });

    await modal.present();
  }

  async onUpdatePlaylist(playlist: Playlist) {
    const user = await this.authSvc.getCurrentUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    const modal = await this.modalCtrl.create({
      component: PlaylistModalComponent,
      componentProps: {
        playlist: { ...playlist } 
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'update' && playlist.id) {
        const updatedPlaylist: Playlist = {
          ...playlist, 
          name: result.data.name,
          ...(result.data.image && {
            image: {
              url: result.data.image.url,
              thumbnail: result.data.image.url,
              large: result.data.image.url,
              medium: result.data.image.url,
              small: result.data.image.url
            }
          })
        };

        this.playlistsSvc.update(playlist.id, updatedPlaylist).subscribe({
          next: () => {
            this.loadPlaylists();
          },
          error: (err) => {
            console.error('Error updating playlist:', err);
          }
        });
      }
    });

    await modal.present();
  }

  async onDeletePlaylist(playlist: Playlist) {
    const alert = await this.alertCtrl.create({
      header: await this.translate.get('PLAYLIST.MESSAGES.DELETE_CONFIRM').toPromise(),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.playlistsSvc.delete(playlist.id).subscribe({
              next: () => this.loadPlaylists(),
              error: console.error
            });
          }
        }
      ]
    });

    await alert.present();
  }

  onIonInfinite(ev: any) {
    if (this.page <= this.pages) {
      this.playlistsSvc.getAll(this.page, this.pageSize).subscribe({
        next: (response: Paginated<Playlist>) => {
          this._playlists.next([...this._playlists.value, ...response.data]);
          this.page++;
          ev.target.complete();
        }
      });
    } else {
      ev.target.complete();
    }
  }
}