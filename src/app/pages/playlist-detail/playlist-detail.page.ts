import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, of, switchMap } from 'rxjs';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Playlist } from 'src/app/core/models/playlist.model';
import { Song } from 'src/app/core/models/song.model';
import { PlaylistsService } from 'src/app/core/services/impl/playlists.service';
import { SongsService } from 'src/app/core/services/impl/songs.service';
import { BaseAuthenticationService } from 'src/app/core/services/impl/base-authentication.service';
import { SongModalComponent } from 'src/app/shared/components/song-modal/song-modal.component';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { SongDetailModalComponent } from 'src/app/shared/components/song-detail-modal/song-detail-modal.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-playlist-detail',
  templateUrl: './playlist-detail.page.html',
  styleUrls: ['./playlist-detail.page.scss'],
})
export class PlaylistDetailPage implements OnInit {
  private _playlist = new BehaviorSubject<Playlist | null>(null);
  playlist$ = this._playlist.asObservable();
  
  private _songs = new BehaviorSubject<Song[]>([]);
  songs$ = this._songs.asObservable();

  private _isPlaying = new BehaviorSubject<boolean>(false);
  isPlaying$ = this._isPlaying.asObservable();

  isOwner = false;
  currentPlayingIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playlistsSvc: PlaylistsService,
    private songsSvc: SongsService,
    private authSvc: BaseAuthenticationService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    this.route.params.pipe(
      switchMap(params => this.playlistsSvc.getById(params['id'])),
      catchError(error => {
        console.error('Error loading playlist:', error);
        this.showToast('PLAYLIST.ERRORS.LOAD');
        return of(null);
      })
    ).subscribe(async playlist => {
      if (playlist) {
        this._playlist.next(playlist);
        this.loadSongs(playlist);
        const user = await this.authSvc.getCurrentUser();
        this.isOwner = user?.id === playlist.users_IDS[0];
      } else {
        this.router.navigate(['/home']);
      }
    });
  }

  private loadSongs(playlist: Playlist) {
    if (!playlist.song_IDS?.length) {
      this._songs.next([]);
      return;
    }
  
    const songRequests = playlist.song_IDS.map(id => 
      this.songsSvc.getById(id).pipe(
        catchError(err => {
          console.error(`Error loading song ${id}:`, err);
          return of(null);
        })
      )
    );
  
    forkJoin(songRequests)
      .pipe(
        map(songs => songs.filter((song): song is Song => song !== null))
      )
      .subscribe(songs => {
        this._songs.next(songs);
      });
  }

  async addSong() {
    const modal = await this.modalCtrl.create({
      component: SongDetailModalComponent,
      componentProps: {
        excludeSongIds: this._songs.value.map(s => s.id)
      }
    });
  
    modal.onDidDismiss().then(async (result) => {
      if (result.role === 'select' && result.data) {
        const playlist = this._playlist.value;
        if (playlist) {
          const updatedPlaylist = {
            ...playlist,
            song_IDS: [...(playlist.song_IDS || []), result.data.id]
          };
  
          this.playlistsSvc.update(playlist.id, updatedPlaylist).subscribe({
            next: () => {
              this.loadSongs(updatedPlaylist);
              this.showToast('PLAYLIST.SUCCESS.SONG_ADDED');
            },
            error: () => this.showToast('PLAYLIST.ERRORS.SONG_ADD')
          });
        }
      }
    });
  
    await modal.present();
  }

  async editSong(song: Song, event: Event) {
    event.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: SongDetailModalComponent,
      componentProps: {
        song: song,
        mode: 'edit'
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'saved') {
        this.loadSongs(this._playlist.value!);
        this.showToast('PLAYLIST.SUCCESS.SONG_UPDATED');
      }
    });

    await modal.present();
  }

  async removeSong(song: Song, event: Event) {
    event.stopPropagation();
    
    const alert = await this.alertCtrl.create({
      header: await this.translate.get('PLAYLIST.REMOVE_SONG.HEADER').toPromise(),
      message: await this.translate.get('PLAYLIST.REMOVE_SONG.MESSAGE').toPromise(),
      buttons: [
        {
          text: await this.translate.get('COMMON.CANCEL').toPromise(),
          role: 'cancel'
        },
        {
          text: await this.translate.get('COMMON.DELETE').toPromise(),
          role: 'destructive',
          handler: () => {
            const playlist = this._playlist.value;
            if (playlist) {
              const updatedPlaylist = {
                ...playlist,
                song_IDS: playlist.song_IDS?.filter(id => id !== song.id) || []
              };

              this.playlistsSvc.update(playlist.id, updatedPlaylist).subscribe({
                next: () => {
                  this.loadSongs(updatedPlaylist);
                  this.showToast('PLAYLIST.SUCCESS.SONG_REMOVED');
                },
                error: () => this.showToast('PLAYLIST.ERRORS.SONG_REMOVE')
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  playSong(song: Song, index: number) {
    if (this.currentPlayingIndex === index) {
      this._isPlaying.next(!this._isPlaying.value);
    } else {
      this.currentPlayingIndex = index;
      this._isPlaying.next(true);
    }
  }

  onShuffle() {
    const songs = [...this._songs.value];
    for (let i = songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    this._songs.next(songs);
    if (songs.length > 0) {
      this.playSong(songs[0], 0);
    }
  }

  onPlay() {
    if (this._songs.value.length > 0) {
      if (this.currentPlayingIndex === null) {
        this.playSong(this._songs.value[0], 0);
      } else {
        this._isPlaying.next(!this._isPlaying.value);
      }
    }
  }

  onBack() {
    this.router.navigate(['/home']);
  }


  private async showToast(translationKey: string) {
    const message = await this.translate.get(translationKey).toPromise();
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  async sharePlaylist() {
    const alert = await this.alertCtrl.create({
      header: await this.translate.get('PLAYLIST.SHARE.HEADER').toPromise(),
      message: await this.translate.get('PLAYLIST.SHARE.MESSAGE').toPromise(),
      inputs: [
        {
          name: 'link',
          type: 'text',
          value: window.location.href,
        }
      ],
      buttons: [
        {
          text: await this.translate.get('PLAYLIST.SHARE.COPY').toPromise(),
          handler: () => {
            navigator.clipboard.writeText(window.location.href);
            this.showToast('PLAYLIST.SUCCESS.LINK_COPIED');
          }
        },
        {
          text: await this.translate.get('COMMON.CLOSE').toPromise(),
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }
}