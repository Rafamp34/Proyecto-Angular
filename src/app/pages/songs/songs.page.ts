import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest,  debounceTime, distinctUntilChanged, switchMap, takeUntil, of, catchError, startWith} from 'rxjs';
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
  private _searchTermSubject = new BehaviorSubject<string>('');
  private _pageSubject = new BehaviorSubject<number>(1);
  private _refreshSubject = new Subject<void>();
  private _destroy$ = new Subject<void>();

  songs$: Observable<SongWithArtists[]>;
  
  isWeb: boolean = false;
  pageSize: number = 25;
  pages: number = 0;
  loading: boolean = false;

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
    
    this.songs$ = combineLatest([
      this._searchTermSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ),
      this._pageSubject,
      this._refreshSubject.pipe(
        startWith(null)
      )
    ]).pipe(
      switchMap(([searchTerm, page]) => this.fetchSongs(page, searchTerm)),
      takeUntil(this._destroy$)
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onSearchChange(event: any) {
    const searchTerm = event.detail.value?.trim() ?? '';
    this._searchTermSubject.next(searchTerm);
    this._pageSubject.next(1);
  }

  private fetchSongs(page: number, searchTerm: string = ''): Observable<SongWithArtists[]> {
    this.loading = true;
    
    const filters: SearchParams = searchTerm 
      ? { name: searchTerm } 
      : {};

    return this.songsSvc.getAll(page, this.pageSize, filters).pipe(
      switchMap(async (paginatedResponse: Paginated<Song>) => {
        const enrichedSongs = await this.enrichSongWithArtists(paginatedResponse.data);
        
        this.pages = paginatedResponse.pages;
        this.loading = false;
        
        return enrichedSongs;
      }),
      catchError(error => {
        console.error('Error loading songs:', error);
        this.loading = false;
        return of([]);
      })
    );
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

  async onAddSong() {
    const modal = await this.modalCtrl.create({
      component: SongModalComponent,
      componentProps: {},
      cssClass: 'custom-modal spotify-theme'
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'create') {
        this.songsSvc.add(result.data).subscribe({
          next: () => {
            this._refreshSubject.next();
            this._pageSubject.next(1);
          },
          error: (error) => {
            console.error('Error adding song:', error);
          }
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
          next: () => {
            this._refreshSubject.next();
          },
          error: (error) => {
            console.error('Error updating song:', error);
          }
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
              next: () => {
                this._refreshSubject.next();
                this._pageSubject.next(1);
              },
              error: (error) => {
                console.error('Error deleting song:', error);
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  onIonInfinite(ev: any) {
    if (this.loading || this._pageSubject.value >= this.pages) {
      ev.target.complete();
      return;
    }

    this._pageSubject.next(this._pageSubject.value + 1);
    ev.target.complete();
  }
  
  onPlaySong(song: Song) {
    console.log('Playing song:', song);
  }
}