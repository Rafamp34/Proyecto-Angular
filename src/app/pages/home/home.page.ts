import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, forkJoin, map, of, tap } from 'rxjs';
import { Playlist } from 'src/app/core/models/playlist.model';
import { User } from 'src/app/core/models/user.model';
import { Song } from 'src/app/core/models/song.model';
import { BaseAuthenticationService } from 'src/app/core/services/impl/base-authentication.service';
import { PlaylistsService } from 'src/app/core/services/impl/playlists.service';
import { SongsService } from 'src/app/core/services/impl/songs.service';
import { filter, switchMap, take } from 'rxjs/operators';
import { LanguageService } from '../../core/services/language.service';
import { UserService } from 'src/app/core/services/impl/user.service';
import { ArtistsService } from 'src/app/core/services/impl/artists.service';

interface SongWithArtists extends Song {
  artistNames?: string[];
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isMobile: boolean = false;
  showSearch: boolean = false;
  currentLang: string;
  selectedTab: 'all' | 'music' | 'podcasts' = 'all';
  searchQuery: string = '';

  private _quickAccess = new BehaviorSubject<Playlist[]>([]);
  quickAccess$ = this._quickAccess.asObservable();

  private _newReleases = new BehaviorSubject<SongWithArtists[]>([]);
  newReleases$ = this._newReleases.asObservable();

  private _recommendedSongs = new BehaviorSubject<SongWithArtists[]>([]);
  recommendedSongs$ = this._recommendedSongs.asObservable();

  private _currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this._currentUser.asObservable();

  constructor(
    private router: Router,
    public authSvc: BaseAuthenticationService,
    private playlistsSvc: PlaylistsService,
    private songsSvc: SongsService,
    private artistsSvc: ArtistsService,
    private languageService: LanguageService,
    private userService: UserService
  ) {
    this.currentLang = this.languageService.getStoredLanguage();
  }

  ngOnInit() {
    this.checkIfMobile(); 
    window.addEventListener('resize', this.checkIfMobile.bind(this));
    this.authSvc.ready$.pipe(
      filter(ready => ready),
      switchMap(() => this.authSvc.authenticated$),
      take(1)
    ).subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['/login']);
        return;
      }

      this.loadUserContent();
    });

    this.authSvc.user$.pipe(
      filter(user => user !== undefined),
      switchMap(user => {
        if (!user) return of(null);
        return this.userService.getById(user.id);
      })
    ).subscribe({
      next: (userData) => {
        if (userData) {
          const updatedUser: User = {
            ...userData,
            displayName: userData.displayName || `${userData.name} ${userData.surname}`,
            image: userData.image || undefined 
          };
          this._currentUser.next(updatedUser);
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
      }
    });
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

  private loadUserContent() {
    this.authSvc.user$.pipe(
      filter(user => user !== undefined),
      take(1),
      switchMap(user => {
        if (!user) {
          throw new Error('No user found');
        }
  
        // Obtener todas las canciones de una sola vez
        const allSongs$ = this.songsSvc.getAll(1, 1000, { sort: 'createdAt:desc' }).pipe(
          map(response => 'data' in response ? response.data : response),
          switchMap(async songs => this.enrichSongWithArtists(songs)),
          catchError(err => {
            console.error('Error loading songs:', err);
            return of([]);
          })
        );
  
        return forkJoin({
          playlists: this.playlistsSvc.getAll(1, 9, { sort: 'createdAt:desc' }).pipe(
            map(response => 'data' in response ? response.data : response),
            catchError(err => {
              console.error('Error loading playlists:', err);
              return of([]);
            })
          ),
          allSongs: allSongs$
        });
      }),
      map(({ playlists, allSongs }) => {
        // Dividir las canciones en dos grupos
        const songs = allSongs.slice(0, 8); // Las 8 más recientes
        const recommendedSongs = allSongs.slice(-8); // Las 8 más antiguas
  
        return {
          playlists,
          songs,
          recommendedSongs
        };
      })
    ).subscribe({
      next: ({ playlists, songs, recommendedSongs }) => {
        this._quickAccess.next(playlists);
        this._newReleases.next(songs); // Canciones nuevas (las más recientes)
        this._recommendedSongs.next(recommendedSongs); // Canciones recomendadas (las más antiguas)
      },
      error: (error) => {
        console.error('Error loading content:', error);
      }
    });
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
    console.log('Is Mobile:', this.isMobile);
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
}