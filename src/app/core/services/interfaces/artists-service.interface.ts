// artists-service.interface.ts
import { Observable } from 'rxjs';
import { Artist } from '../../models/artist.model';
import { IBaseService } from './base-service.interface';

export interface IArtistsService extends IBaseService<Artist> {
    getByIds(ids: string[]): Observable<Artist[]>;
}