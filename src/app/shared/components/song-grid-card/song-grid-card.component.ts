import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Song } from 'src/app/core/models/song.model';
import { Artist } from 'src/app/core/models/artist.model';
import { ArtistsService } from 'src/app/core/services/impl/artists.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-song-grid-card',
  templateUrl: './song-grid-card.component.html',
  styleUrls: ['./song-grid-card.component.scss']
})
export class SongGridCardComponent implements OnInit {
  @Input() song!: Song;
  @Output() edit = new EventEmitter<Song>();
  @Output() delete = new EventEmitter<Song>();
  @Output() playSong = new EventEmitter<Song>();

  private _artistNames = new BehaviorSubject<string[]>(['Unknown Artist']);
  artistNames$ = this._artistNames.asObservable();
  
  isPlaying = false;
  isHovered = false;

  constructor(private artistsService: ArtistsService) {}

  ngOnInit() {
    this.loadArtists();
  }

  private loadArtists() {
    if (this.song.artists_IDS?.length) {
      this.artistsService.getByIds(this.song.artists_IDS).subscribe({
        next: (artists) => {
          this._artistNames.next(artists.map(artist => artist.name));
        },
        error: (error) => {
          console.error('Error loading artists:', error);
          this._artistNames.next(['Unknown Artist']);
        }
      });
    } else {
      this._artistNames.next(['Unknown Artist']);
    }
  }

  onEdit() {
    this.edit.emit(this.song);
  }

  onDelete() {
    this.delete.emit(this.song);
  }

  onPlay() {
    this.isPlaying = !this.isPlaying;
    this.playSong.emit(this.song);
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }
}