// artists.service.ts
import { Injectable, Inject } from '@angular/core';
import { BaseService } from './base-service.service';
import { IArtistsService } from '../interfaces/artists-service.interface';
import { Artist } from '../../models/artist.model';
import { ARTISTS_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IArtistsRepository } from '../../repositories/intefaces/artists-repository.interface';
import { map, Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArtistsService extends BaseService<Artist> implements IArtistsService {
  constructor(
    @Inject(ARTISTS_REPOSITORY_TOKEN) repository: IArtistsRepository
  ) {
    super(repository);
  }
  
  getByIds(ids: string[]): Observable<Artist[]> {
    return forkJoin(
      ids.map(id => this.getById(id))
    ).pipe(
      map(artists => artists.filter((artist): artist is Artist => artist !== null))
    );
  }
}