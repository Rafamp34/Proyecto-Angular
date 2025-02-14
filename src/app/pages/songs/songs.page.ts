import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { SongsService } from '../../core/services/impl/songs.service';
import { Song } from '../../core/models/song.model';
import { Paginated } from '../../core/models/paginated.model';
import { TranslateService } from '@ngx-translate/core';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { SongModalComponent } from 'src/app/shared/components/song-modal/song-modal.component';
import { SearchParams } from '../../core/repositories/intefaces/base-repository.interface';
import { ArtistsService } from 'src/app/core/services/impl/artists.service';

interface SongWithArtists extends Song {
  artistNames?: string[];
}

@Component({
  selector: 'app-songs',
  templateUrl: './songs.page.html',
  styleUrls: ['./songs.page.scss'],
})
export class SongsPage implements OnInit, OnDestroy {
  private _songs: BehaviorSubject<SongWithArtists[]> = new BehaviorSubject<SongWithArtists[]>([]);
  songs$: Observable<SongWithArtists[]> = this._songs.asObservable();
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  isWeb: boolean = false;
  page: number = 1;
  pageSize: number = 25;
  pages: number = 0;
  currentSearchTerm: string = '';

  constructor(
    private songsSvc: SongsService,
    private artistsSvc: ArtistsService,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private platform: Platform,
    private authSvc: BaseAuthenticationService
  ) {
    this.isWeb = this.platform.is('desktop');
    
  }

  ngOnInit() {
    this.loadSongs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(event: any) {
    const searchTerm = event.detail.value?.trim() ?? '';
    this.searchSubject.next(searchTerm);
  }

  private createSearchFilters(): SearchParams {
    const filters: SearchParams = {};
    if (this.currentSearchTerm) {
      filters['name'] = this.currentSearchTerm;
    }
    return filters;
  }

  private async enrichSongWithArtists(songs: Song[]): Promise<SongWithArtists[]> {
    const enrichedSongs: SongWithArtists[] = [];
    
    for (const song of songs) {
      if (song.artists_IDS && song.artists_IDS.length > 0) {
        try {
          const artists = await this.artistsSvc.getByIds(song.artists_IDS).toPromise();
          if (artists) {
            const enrichedSong: SongWithArtists = {
              ...song,
              artistNames: artists.map(artist => artist.name)
            };
            enrichedSongs.push(enrichedSong);
          }
        } catch (error) {
          console.error('Error loading artists for song:', song.id, error);
          enrichedSongs.push({ ...song, artistNames: [] });
        }
      } else {
        enrichedSongs.push({ ...song, artistNames: [] });
      }
    }
    
    return enrichedSongs;
  }

  loadSongs(isSearch: boolean = false) {
    if (isSearch) {
      this.page = 1;
      this._songs.next([]); 
    }

    const filters = this.createSearchFilters();

    this.songsSvc.getAll(this.page, this.pageSize, filters).pipe(
      switchMap(async (paginatedResponse: Paginated<Song>) => {
        const enrichedSongs = await this.enrichSongWithArtists(paginatedResponse.data);
        return {
          data: enrichedSongs,
          pages: paginatedResponse.pages
        };
      })
    ).subscribe({
      next: (result) => {
        if (isSearch || this.page === 1) {
          this._songs.next([...result.data]);
        } else {
          this._songs.next([...this._songs.value, ...result.data]);
        }
        this.page++;
        this.pages = result.pages;
      },
      error: (error) => {
        console.error('Error loading songs:', error);
      }
    });
  }

  async onAddSong() {
    const modal = await this.modalCtrl.create({
      component: SongModalComponent,
      componentProps: {},
      cssClass: 'custom-modal spotify-theme'
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'create') {
        this.songsSvc.add(result.data).subscribe({
          next: () => this.loadSongs(true),
          error: console.error
        });
      }
    });

    await modal.present();
  }

  async onUpdateSong(song: Song) {
    const modal = await this.modalCtrl.create({
      component: SongModalComponent,
      componentProps: {
        song: song
      },
      cssClass: 'custom-modal spotify-theme'
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'update') {
        this.songsSvc.update(song.id, result.data).subscribe({
          next: () => this.loadSongs(true),
          error: console.error
        });
      }
    });

    await modal.present();
  }

  async onDeleteSong(song: Song) {
    const alert = await this.alertCtrl.create({
      header: await this.translate.get('SONG.MESSAGES.DELETE_CONFIRM').toPromise(),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.songsSvc.delete(song.id).subscribe({
              next: () => this.loadSongs(true),
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

      this.songsSvc.getAll(this.page, this.pageSize).subscribe({
        next: (response: Paginated<Song>) => {
          this._songs.next([...this._songs.value, ...response.data]);
          this.page++;
          ev.target.complete();
        },
        error: (error) => {
          console.error('Error loading more songs:', error);
          ev.target.complete();
        }
      });
    } else {
      ev.target.complete();
    }
  }

  onPlaySong(song: Song) {
    console.log('Playing song:', song);
  }
}