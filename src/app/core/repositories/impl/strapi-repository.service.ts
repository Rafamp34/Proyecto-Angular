// src/app/repositories/impl/strapi-repository.service.ts
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, catchError, tap } from 'rxjs';
import { IBaseRepository, SearchParams } from '../intefaces/base-repository.interface';
import { API_URL_TOKEN, REPOSITORY_MAPPING_TOKEN, RESOURCE_NAME_TOKEN, STRAPI_AUTH_TOKEN } from '../repository.tokens';
import { Model } from '../../models/base.model';
import { IBaseMapping } from '../intefaces/base-mapping.interface';
import { Paginated } from '../../models/paginated.model';
import { IStrapiAuthentication } from '../../services/interfaces/strapi-authentication.interface';

export interface PaginatedRaw<T> {
  data: Data<T>[]
  meta: Meta
}

export interface Data<T> {
  id: number
  attributes: T
}

export interface Meta {
  pagination: Pagination
}

export interface Pagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

@Injectable({
  providedIn: 'root'
})
export class StrapiRepositoryService<T extends Model> implements IBaseRepository<T> {
  constructor(
    protected http: HttpClient,
    @Inject(STRAPI_AUTH_TOKEN) protected auth: IStrapiAuthentication,
    @Inject(API_URL_TOKEN) protected apiUrl: string,
    @Inject(RESOURCE_NAME_TOKEN) protected resource: string,
    @Inject(REPOSITORY_MAPPING_TOKEN) protected mapping: IBaseMapping<T>
  ) {}

  private getHeaders() {
    const token = this.auth.getToken();
    if (!token) {
      console.warn('No token found');
      return {};
    }

    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  }

  getAll(page: number, pageSize: number, filters: SearchParams = {}): Observable<T[] | Paginated<T>> {
    // Construimos la base URL
    let url = `${this.apiUrl}/${this.resource}?populate=*`;

    // Añadimos paginación
    url += `&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;

    // Procesamos los filtros específicamente para Strapi
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        switch(key) {
          case 'user':
            url += `&filters[users_IDS][id][$eq]=${value}`;
            break;
          case 'sort':
            url += `&sort[0]=${value}`;
            break;
          default:
            url += `&filters[${key}][$eq]=${value}`;
        }
      }
    });

    console.log('URL completa:', url);
    const headers = this.getHeaders();
    console.log('Headers:', headers);

    return this.http.get<PaginatedRaw<T>>(url, headers).pipe(
      tap(response => console.log('Respuesta de Strapi:', response)),
      map(res => {
        if (!res.meta?.pagination) {
          return this.mapping.getPaginated(page, pageSize, res.data.length, res.data);
        }
        return this.mapping.getPaginated(
          page,
          pageSize,
          res.meta.pagination.total,
          res.data
        );
      }),
      catchError(error => {
        console.error('Error en la petición:', {
          error,
          url,
          headers: this.getHeaders(),
          token: this.auth.getToken()
        });
        throw error;
      })
    );
  }

  getById(id: string): Observable<T | null> {
    const url = `${this.apiUrl}/${this.resource}/${id}?populate=*`;
    return this.http.get<PaginatedRaw<T>>(url, this.getHeaders())
      .pipe(
        map(res => this.mapping.getOne(res.data))
      );
  }

  add(entity: T): Observable<T> {
    return this.http.post<T>(
      `${this.apiUrl}/${this.resource}`,
      this.mapping.setAdd(entity),
      this.getHeaders()
    ).pipe(
      map(res => this.mapping.getAdded(res))
    );
  }

  update(id: string, entity: T): Observable<T> {
    return this.http.put<T>(
      `${this.apiUrl}/${this.resource}/${id}`,
      this.mapping.setUpdate(entity),
      this.getHeaders()
    ).pipe(
      map(res => this.mapping.getUpdated(res))
    );
  }

  delete(id: string): Observable<T> {
    return this.http.delete<T>(
      `${this.apiUrl}/${this.resource}/${id}`,
      this.getHeaders()
    ).pipe(
      map(res => this.mapping.getDeleted(res))
    );
  }
}