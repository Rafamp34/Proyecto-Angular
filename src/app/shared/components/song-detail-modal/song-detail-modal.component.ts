import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, switchMap } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Song } from 'src/app/core/models/song.model';
import { SongsService } from 'src/app/core/services/impl/songs.service';
import { SearchParams } from 'src/app/core/repositories/intefaces/base-repository.interface';
import { Paginated } from 'src/app/core/models/paginated.model';
import { ArtistsService } from 'src/app/core/services/impl/artists.service';

interface SongWithArtists extends Song {
  artistNames?: string[];
}

@Component({
  selector: 'app-song-detail-modal',
  templateUrl: './song-detail-modal.component.html',
  styleUrls: ['./song-detail-modal.component.scss']
})
export class SongDetailModalComponent implements OnInit {
  @Input() excludeSongIds: string[] = [];
  
  private _availableSongs = new BehaviorSubject<SongWithArtists[]>([]);
  availableSongs$ = this._availableSongs.asObservable();
  
  searchTerm = '';
  currentPage = 1;
  pageSize = 20;
  hasMorePages = true;

  constructor(
    private modalCtrl: ModalController,
    private songsSvc: SongsService,
    private artistsSvc: ArtistsService
  ) {}

  ngOnInit() {
    this.loadSongs();
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

  loadSongs(page: number = 1) {
    const filters: SearchParams = this.searchTerm ? { name: this.searchTerm } : {};
    
    this.songsSvc.getAll(page, this.pageSize, filters).pipe(
      switchMap(async (response: Paginated<Song>) => {
        const songs = response.data;
        const filteredSongs = songs.filter(song => !this.excludeSongIds.includes(song.id));
        const enrichedSongs = await this.enrichSongWithArtists(filteredSongs);
        
        return {
          data: enrichedSongs,
          pages: response.pages
        };
      })
    ).subscribe(result => {
      if (page === 1) {
        this._availableSongs.next(result.data);
      } else {
        this._availableSongs.next([...this._availableSongs.value, ...result.data]);
      }
      
      this.hasMorePages = page < result.pages;
    });
  }

  handleSearch(event: CustomEvent) {
    this.searchTerm = event.detail.value.toLowerCase();
    this.currentPage = 1;
    this.loadSongs();
  }

  loadMore(event: CustomEvent) {
    if (this.hasMorePages) {
      this.currentPage++;
      this.loadSongs(this.currentPage);
    }
    (event.target as any)?.complete();
    if (!this.hasMorePages) {
      (event.target as any).disabled = true;
    }
  }

  selectSong(song: Song) {
    this.modalCtrl.dismiss(song, 'select');
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  
}