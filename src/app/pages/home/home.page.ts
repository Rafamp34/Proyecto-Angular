import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, of, throwError} from 'rxjs';
import { switchMap, catchError, takeUntil, tap, map,startWith} from 'rxjs/operators';
import { Router } from '@angular/router';
import { Playlist } from 'src/app/core/models/playlist.model';
import { User } from 'src/app/core/models/user.model';
import { Song } from 'src/app/core/models/song.model';
import { BaseAuthenticationService } from 'src/app/core/services/impl/base-authentication.service';
import { PlaylistsService } from 'src/app/core/services/impl/playlists.service';
import { SongsService } from 'src/app/core/services/impl/songs.service';
import { ArtistsService } from 'src/app/core/services/impl/artists.service';
import { LanguageService } from '../../core/services/language.service';
import { UserService } from 'src/app/core/services/impl/user.service';

interface SongWithArtists extends Song {
  artistNames?: string[];
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  isMobile: boolean = false;
  showSearch: boolean = false;
  currentLang: string;
  selectedTab: 'all' | 'music' | 'podcasts' = 'all';
  searchQuery: string = '';
  loading: boolean = true;

  private _refreshSubject = new Subject<void>();
  private _destroy$ = new Subject<void>();

  quickAccess$: Observable<Playlist[]>;
  newReleases$: Observable<SongWithArtists[]>;
  recommendedSongs$: Observable<SongWithArtists[]>;
  currentUser$: Observable<User | null>;

  constructor(
    private router: Router,
    private authSvc: BaseAuthenticationService,
    private playlistsSvc: PlaylistsService,
    private songsSvc: SongsService,
    private artistsSvc: ArtistsService,
    private languageService: LanguageService,
    private userService: UserService
  ) {
    this.currentLang = this.languageService.getStoredLanguage();
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile.bind(this));

  this.currentUser$ = this.authSvc.user$.pipe(
    switchMap(user => {
      if (!user) return of(null);
      return this.userService.getById(user.id).pipe(
        map(userData => {
          if (!userData) return null;
          return {
            ...userData,
            displayName: userData.displayName || `${userData.name} ${userData.surname}`,
            image: userData.image || undefined
          };
        }),
        catchError(error => {
          console.error('Error loading user data:', error);
          return of(null);
        })
      );
    }),
    takeUntil(this._destroy$)
  );

  this.quickAccess$ = this.createPlaylistsObservable();
  this.newReleases$ = this.createSongsObservable('new');
  this.recommendedSongs$ = this.createSongsObservable('recommended');

  this.userService.playlistCreated$
    .pipe(
      takeUntil(this._destroy$)
    )
    .subscribe(() => {
      this._refreshSubject.next();
    });

    this.userService.playlistDeleted$
    .pipe(takeUntil(this._destroy$))
    .subscribe(() => {
      this._refreshSubject.next();
    });
  }

  ngOnInit() {
    this.authSvc.ready$.pipe(
      switchMap(ready => {
        if (!ready) return throwError(() => new Error('Authentication not ready'));
        return this.authSvc.authenticated$;
      }),
      takeUntil(this._destroy$)
    ).subscribe({
      next: (isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Authentication error:', error);
        this.router.navigate(['/login']);
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
    window.removeEventListener('resize', this.checkIfMobile.bind(this));
  }

  private createPlaylistsObservable(): Observable<Playlist[]> {
    return combineLatest([
      this._refreshSubject.pipe(
        startWith(null)
      ),
      this.authSvc.user$
    ]).pipe(
      switchMap(([_, user]) => {
        if (!user) return of([]);
        return this.playlistsSvc.getAll(1, 9, { sort: 'createdAt:desc' }).pipe(
          map(response => 'data' in response ? response.data : response),
          catchError(err => {
            console.error('Error loading playlists:', err);
            return of([]);
          })
        );
      }),
      takeUntil(this._destroy$)
    );
  }

  private createSongsObservable(type: 'new' | 'recommended'): Observable<SongWithArtists[]> {
    return combineLatest([
      this._refreshSubject.pipe(
        startWith(null)
      ),
      this.authSvc.user$
    ]).pipe(
      switchMap(([_, user]) => {
        if (!user) return of([]);
        return this.songsSvc.getAll(1, 1000, { sort: 'createdAt:desc' }).pipe(
          switchMap(async (response) => {
            const songs = 'data' in response ? response.data : response;
            return this.enrichSongsWithArtists(songs);
          }),
          map(enrichedSongs => {
            return type === 'new' 
              ? enrichedSongs.slice(0, 8)
              : enrichedSongs.slice(-8);
          }),
          catchError(err => {
            console.error('Error loading songs:', err);
            return of([]);
          })
        );
      }),
      takeUntil(this._destroy$)
    );
  }

  private async enrichSongsWithArtists(songs: Song[]): Promise<SongWithArtists[]> {
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

  onSearchChange(event: CustomEvent) {
    this.searchQuery = event.detail.value;
  }

  openPlaylist(playlist: Playlist) {
    this.router.navigate(['/playlist', playlist.id]);
  }

  openSong(song: Song) {
    console.log('Playing song:', song);
  }

  showAllPlaylists() {
    this.router.navigate(['/playlists']);
  }

  showAllSongs() {
    this.router.navigate(['/songs']);
  }

  showAllRecommended() {
    this.router.navigate(['/recommended']);
  }

  changeLanguage(lang: string) {
    this.languageService.changeLanguage(lang);
    this.currentLang = lang;
    this.languageService.storeLanguage(lang);
  }

  selectTab(tab: 'all' | 'music' | 'podcasts') {
    this.selectedTab = tab;
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  refreshContent() {
    this._refreshSubject.next();
  }
}