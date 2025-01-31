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

  private _newReleases = new BehaviorSubject<Song[]>([]);
  newReleases$ = this._newReleases.asObservable();

  private _recommendedSongs = new BehaviorSubject<Song[]>([]);
  recommendedSongs$ = this._recommendedSongs.asObservable();

  private _currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this._currentUser.asObservable();

  private _filteredQuickAccess = new BehaviorSubject<Playlist[]>([]);
  filteredQuickAccess$ = this._filteredQuickAccess.asObservable();

  private _filteredNewReleases = new BehaviorSubject<Song[]>([]);
  filteredNewReleases$ = this._filteredNewReleases.asObservable();

  private _filteredRecommendedSongs = new BehaviorSubject<Song[]>([]);
  filteredRecommendedSongs$ = this._filteredRecommendedSongs.asObservable();

  constructor(
    private router: Router,
    public authSvc: BaseAuthenticationService,
    private playlistsSvc: PlaylistsService,
    private songsSvc: SongsService,
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

        const playlists$ = this.playlistsSvc.getAll(1, 9, { sort: 'createdAt:desc' }).pipe(
          map(response => 'data' in response ? response.data : response),
          catchError(err => {
            console.error('Error loading playlists:', err);
            return of([]);
          })
        );

        const songs$ = this.songsSvc.getAll(1, 8, { sort: 'createdAt:desc' }).pipe(
          map(response => 'data' in response ? response.data : response),
          catchError(err => {
            console.error('Error loading songs:', err);
            return of([]);
          })
        );

        const recommendedSongs$ = this.songsSvc.getAll(1, 8, { sort: 'createdAt:asc' }).pipe(
          map(response => 'data' in response ? response.data : response),
          catchError(err => {
            console.error('Error loading recommended songs:', err);
            return of([]);
          })
        );

        return forkJoin({
          playlists: playlists$,
          songs: songs$,
          recommendedSongs: recommendedSongs$
        });
      })
    ).subscribe({
      next: ({ playlists, songs, recommendedSongs }) => {
        this._quickAccess.next(playlists);
        this._newReleases.next(songs);
        this._recommendedSongs.next(recommendedSongs);
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
}
