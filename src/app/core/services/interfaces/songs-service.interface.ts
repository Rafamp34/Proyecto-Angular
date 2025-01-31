// songs-service.interface.ts
import { Observable } from 'rxjs';
import { Song } from '../../models/song.model';
import { IBaseService } from './base-service.interface';

export interface ISongsService extends IBaseService<Song> {
  getByPlaylistId(playlistId: string): Observable<Song[] | null>;
}