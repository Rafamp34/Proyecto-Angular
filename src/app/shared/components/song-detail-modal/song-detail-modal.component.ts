import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Song } from 'src/app/core/models/song.model';
import { SongsService } from 'src/app/core/services/impl/songs.service';
import { SearchParams } from 'src/app/core/repositories/intefaces/base-repository.interface';
import { Paginated } from 'src/app/core/models/paginated.model';

@Component({
  selector: 'app-song-detail-modal',
  templateUrl: './song-detail-modal.component.html',
  styleUrls: ['./song-detail-modal.component.scss']
})
export class SongDetailModalComponent implements OnInit {
  @Input() excludeSongIds: string[] = [];
  
  private _availableSongs = new BehaviorSubject<Song[]>([]);
  availableSongs$ = this._availableSongs.asObservable();
  
  searchTerm = '';
  currentPage = 1;
  pageSize = 20;
  hasMorePages = true;

  constructor(
    private modalCtrl: ModalController,
    private songsSvc: SongsService
  ) {}

  ngOnInit() {
    this.loadSongs();
  }

  loadSongs(page: number = 1) {
    const filters: SearchParams = this.searchTerm ? { name: this.searchTerm } : {};
    
    this.songsSvc.getAll(page, this.pageSize, filters).subscribe(response => {
      const songs = Array.isArray(response) ? response : (response as Paginated<Song>).data;
      const filteredSongs = songs.filter(song => !this.excludeSongIds.includes(song.id));
      
      if (page === 1) {
        this._availableSongs.next(filteredSongs);
      } else {
        this._availableSongs.next([...this._availableSongs.value, ...filteredSongs]);
      }

      if ('pages' in response) {
        this.hasMorePages = page < (response as Paginated<Song>).pages;
      }
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