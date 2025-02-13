// playlists-service.interface.ts
import { Observable } from 'rxjs';
import { Playlist } from '../../models/playlist.model';
import { IBaseService } from './base-service.interface';

export interface IPlaylistsService extends IBaseService<Playlist> {
  getByUserId(userId: string): Observable<Playlist[] | null>;
  addSong(playlistId: string, songId: string): Observable<Playlist>;
  removeSong(playlistId: string, songId: string): Observable<Playlist>;
  getAllByUser(userId: string): Observable<Playlist[]>;
}