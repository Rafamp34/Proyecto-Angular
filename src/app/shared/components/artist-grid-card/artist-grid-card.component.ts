import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Artist } from 'src/app/core/models/artist.model';

@Component({
  selector: 'app-artist-grid-card',
  templateUrl: './artist-grid-card.component.html',
  styleUrls: ['./artist-grid-card.component.scss']
})
export class ArtistGridCardComponent {
  @Input() artist!: Artist;
  @Output() edit = new EventEmitter<Artist>();
  @Output() delete = new EventEmitter<Artist>();
  @Output() select = new EventEmitter<Artist>();

  isHovered = false;
  isPlaying = false; // Agrega esta propiedad

  onEdit() {
    this.edit.emit(this.artist);
  }

  onDelete() {
    this.delete.emit(this.artist);
  }

  onSelect() {
    this.select.emit(this.artist);
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  onPlay() {
    this.isPlaying = !this.isPlaying; // Cambia el estado de isPlaying
    console.log('Playing artist:', this.artist);
  }
}