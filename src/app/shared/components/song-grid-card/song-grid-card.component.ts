import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Song } from 'src/app/core/models/song.model';

@Component({
  selector: 'app-song-grid-card',
  templateUrl: './song-grid-card.component.html',
  styleUrls: ['./song-grid-card.component.scss']
})
export class SongGridCardComponent {
  @Input() song!: Song;
  @Output() edit = new EventEmitter<Song>();
  @Output() delete = new EventEmitter<Song>();
  @Output() playSong = new EventEmitter<Song>();

  isPlaying = false;
  isHovered = false;

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