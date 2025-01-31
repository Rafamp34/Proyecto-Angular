import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { SongsService } from '../../core/services/impl/songs.service';
import { Song } from '../../core/models/song.model';
import { Paginated } from '../../core/models/paginated.model';
import { TranslateService } from '@ngx-translate/core';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { SongModalComponent } from 'src/app/shared/components/song-modal/song-modal.component';
import { SearchParams } from '../../core/repositories/intefaces/base-repository.interface';

@Component({
  selector: 'app-songs',
  templateUrl: './songs.page.html',
  styleUrls: ['./songs.page.scss'],
})
export class SongsPage implements OnInit, OnDestroy {
  private _songs: BehaviorSubject<Song[]> = new BehaviorSubject<Song[]>([]);
  songs$: Observable<Song[]> = this._songs.asObservable();
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  isWeb: boolean = false;
  page: number = 1;
  pageSize: number = 25;
  pages: number = 0;
  currentSearchTerm: string = '';

  constructor(
    private songsSvc: SongsService,
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



  loadSongs(isSearch: boolean = false) {
    if (isSearch) {
      this.page = 1;
      this._songs.next([]); 
    }


    this.songsSvc.getAll(this.page, this.pageSize).subscribe({
      next: (response: Paginated<Song>) => {
        if (isSearch || this.page === 1) {
          this._songs.next([...response.data]);
        } else {
          this._songs.next([...this._songs.value, ...response.data]);
        }
        this.page++;
        this.pages = response.pages;
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