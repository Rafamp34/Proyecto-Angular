// songs.service.ts
import { Injectable, Inject } from '@angular/core';
import { BaseService } from './base-service.service';
import { ISongsService } from '../interfaces/songs-service.interface';
import { Song } from '../../models/song.model';
import { SONGS_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { ISongsRepository } from '../../repositories/intefaces/songs-repository.interface';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SongsService extends BaseService<Song> implements ISongsService {
  constructor(
    @Inject(SONGS_REPOSITORY_TOKEN) repository: ISongsRepository
  ) {
    super(repository);
  }
  
  getByPlaylistId(playlistId: string): Observable<Song[] | null> {
    return this.repository.getAll(1, 1000, {playlistId: playlistId}).pipe(
      map(res => Array.isArray(res) ? res : res.data)
    );
  }
}