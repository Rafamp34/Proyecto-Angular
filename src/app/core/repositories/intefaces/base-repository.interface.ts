import { Observable } from 'rxjs';
import { Model } from '../../models/base.model';
import { Paginated } from '../../models/paginated.model';
import { Playlist } from '../../models/playlist.model';

export interface SearchOperators {
  $eq?: string;
  $in?: string[];
}

export interface SearchParams {
  [key: string]: SearchOperators | string;
}

export interface IBaseRepository<T extends Model> {
  getAll(page: number, pageSize: number, filters: SearchParams): Observable<T[] | Paginated<T>>;
  getById(id: string): Observable<T | null>;
  add(entity: T): Observable<T>;
  update(id: string, entity: T): Observable<T>;
  delete(id: string): Observable<T>;
}
export interface IBaseRepository<T extends Model> {
  getAll(page: number, pageSize: number, filters: SearchParams): Observable<T[] | Paginated<T>>;
  getById(id: string): Observable<T | null>;
  add(entity: T): Observable<T>;
  update(id: string, entity: T): Observable<T>;
  delete(id: string): Observable<T>;
}