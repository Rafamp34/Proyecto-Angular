// src/app/shared/pipes/playlist-duration.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Song } from '../../core/models/song.model';

@Pipe({
  name: 'playlistDuration'
})
export class PlaylistDurationPipe implements PipeTransform {
  transform(songs: Song[], format: 'short' | 'long' = 'short'): string {
    if (!songs || songs.length === 0) {
      return format === 'short' ? '0:00' : '0 min';
    }

    const totalSeconds = songs.reduce((acc, song) => {
      const [mins, secs] = song.duration.split(':').map(Number);
      return acc + (mins * 60 + secs);
    }, 0);

    return format === 'short' ? 
      this.formatShortDuration(totalSeconds) : 
      this.formatLongDuration(totalSeconds);
  }

  private formatShortDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${this.padNumber(minutes)}:${this.padNumber(seconds)}`;
    }
    return `${minutes}:${this.padNumber(seconds)}`;
  }

  private formatLongDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
  }

  private padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }
}