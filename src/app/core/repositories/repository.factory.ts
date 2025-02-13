// src/app/repositories/repository.factory.ts
import { FactoryProvider, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseRepositoryHttpService } from './impl/base-repository-http.service';
import { IBaseRepository } from './intefaces/base-repository.interface';
import { Model } from '../models/base.model';
import { IBaseMapping } from './intefaces/base-mapping.interface';
import { Song } from '../models/song.model';
import { Playlist } from '../models/playlist.model';
import { User } from '../models/user.model';
import { BaseAuthenticationService } from '../services/impl/base-authentication.service';
import { IAuthMapping } from '../services/interfaces/auth-mapping.interface';
import { StrapiAuthenticationService } from '../services/impl/strapi-authentication.service';
import { StrapiAuthMappingService } from '../services/impl/strapi-auth-mapping.service';
import { FirebaseAuthenticationService } from '../services/impl/firebase-authentication.service';
import { FirebaseAuthMappingService } from '../services/impl/firebase-auth-mapping.service';
import { StrapiMediaService } from '../services/impl/strapi-media.service';
import { BaseMediaService } from '../services/impl/base-media.service';
import { SongsMappingStrapi } from './impl/songs-mapping-strapi.service';
import { PlaylistsMappingStrapi } from './impl/playlists-mapping-strapi.service';
import { UserMappingStrapiService } from './impl/users-mapping-strapi.service';
import { SongsMappingFirebaseService } from './impl/songs-mapping-firebase.service';
import { PlaylistsMappingFirebaseService } from './impl/playlists-mapping-firebase.service';
import { UserMappingFirebaseService } from './impl/users-mapping-firebase.service';

import {
  ARTISTS_API_URL_TOKEN,
  ARTISTS_REPOSITORY_MAPPING_TOKEN,
  ARTISTS_REPOSITORY_TOKEN,
  ARTISTS_RESOURCE_NAME_TOKEN,
  AUTH_MAPPING_TOKEN,
  AUTH_ME_API_URL_TOKEN,
  AUTH_SIGN_IN_API_URL_TOKEN,
  AUTH_SIGN_UP_API_URL_TOKEN,
  BACKEND_TOKEN,
  FIREBASE_CONFIG_TOKEN,
  SONGS_API_URL_TOKEN,
  PLAYLISTS_API_URL_TOKEN,
  USERS_API_URL_TOKEN,
  SONGS_REPOSITORY_MAPPING_TOKEN,
  PLAYLISTS_REPOSITORY_MAPPING_TOKEN,
  USERS_REPOSITORY_MAPPING_TOKEN,
  SONGS_RESOURCE_NAME_TOKEN,
  PLAYLISTS_RESOURCE_NAME_TOKEN,
  USERS_RESOURCE_NAME_TOKEN,
  UPLOAD_API_URL_TOKEN,
  SONGS_REPOSITORY_TOKEN,
  PLAYLISTS_REPOSITORY_TOKEN,
  USERS_REPOSITORY_TOKEN
} from './repository.tokens';
import { StrapiRepositoryService } from './impl/strapi-repository.service';
import { BaseRepositoryFirebaseService } from './impl/base-repository-firebase.service';
import { IStrapiAuthentication } from '../services/interfaces/strapi-authentication.interface';
import { ArtistsMappingFirebaseService } from './impl/artists-mapping-firebase.service';
import { ArtistsMappingStrapi } from './impl/artists-mapping-strapi.service';
import { Artist } from '../models/artist.model';
import { FirebaseMediaService } from '../services/impl/firebase-media.service';

export function createBaseRepositoryFactory<T extends Model>(
  token: InjectionToken<IBaseRepository<T>>,
  dependencies: any[]
): FactoryProvider {
  return {
    provide: token,
    useFactory: (backend: string, http: HttpClient, auth: IStrapiAuthentication | BaseAuthenticationService, apiURL: string, resource: string, mapping: IBaseMapping<T>, firebaseConfig?: any) => {
      switch (backend) {
        case 'strapi':
          if (!('getToken' in auth)) throw new Error("Auth service must implement getToken for Strapi");
          return new StrapiRepositoryService<T>(http, auth as IStrapiAuthentication, apiURL, resource, mapping);
        case 'firebase':
          return new BaseRepositoryFirebaseService<T>(firebaseConfig, resource, mapping);
        default:
          throw new Error("BACKEND NOT IMPLEMENTED");
      }
    },
    deps: dependencies
  };
}

export function createBaseMappingFactory<T extends Model>(
  token: InjectionToken<IBaseMapping<T>>,
  dependencies: any[],
  modelType: 'song' | 'playlist' | 'user' | 'artist' // Añadido 'artist'
): FactoryProvider {
  return {
    provide: token,
    useFactory: (backend: string, firebaseConfig?: any) => {
      switch (backend) {
        case 'strapi':
          switch(modelType) {
            case 'song':
              return new SongsMappingStrapi();
            case 'playlist':
              return new PlaylistsMappingStrapi();
            case 'user':
              return new UserMappingStrapiService();
            case 'artist':
              return new ArtistsMappingStrapi();
            default:
              throw new Error("MODEL TYPE NOT IMPLEMENTED");
          }
        case 'firebase':
          switch(modelType) {
            case 'song':
              return new SongsMappingFirebaseService(firebaseConfig);
            case 'playlist':
              return new PlaylistsMappingFirebaseService(firebaseConfig);
            case 'user':
              return new UserMappingFirebaseService(firebaseConfig);
            case 'artist':
              return new ArtistsMappingFirebaseService(firebaseConfig);
            default:
              throw new Error("MODEL TYPE NOT IMPLEMENTED");
          }
        default:
          throw new Error("BACKEND NOT IMPLEMENTED");
      }
    },
    deps: dependencies
  };
}

// Resto de factories (AuthMapping, Authentication, Media)...

export const SongsMappingFactory = createBaseMappingFactory<Song>(
  SONGS_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN, FIREBASE_CONFIG_TOKEN],
  'song'
);

export const PlaylistsMappingFactory = createBaseMappingFactory<Playlist>(
  PLAYLISTS_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN, FIREBASE_CONFIG_TOKEN],
  'playlist'
);

export const ArtistsMappingFactory = createBaseMappingFactory<Artist>(
  ARTISTS_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN, FIREBASE_CONFIG_TOKEN],
  'artist'
);

export const UsersMappingFactory = createBaseMappingFactory<User>(
  USERS_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN, FIREBASE_CONFIG_TOKEN],
  'user'
);

export const SongsRepositoryFactory = createBaseRepositoryFactory<Song>(
  SONGS_REPOSITORY_TOKEN,
  [
    BACKEND_TOKEN,
    HttpClient,
    BaseAuthenticationService,
    SONGS_API_URL_TOKEN,
    SONGS_RESOURCE_NAME_TOKEN,
    SONGS_REPOSITORY_MAPPING_TOKEN,
    FIREBASE_CONFIG_TOKEN
  ]
);

export const ArtistsRepositoryFactory = createBaseRepositoryFactory<Artist>(
  ARTISTS_REPOSITORY_TOKEN,
  [
    BACKEND_TOKEN,
    HttpClient,
    BaseAuthenticationService,
    ARTISTS_API_URL_TOKEN,
    ARTISTS_RESOURCE_NAME_TOKEN,
    ARTISTS_REPOSITORY_MAPPING_TOKEN,
    FIREBASE_CONFIG_TOKEN
  ]
);

export const PlaylistsRepositoryFactory = createBaseRepositoryFactory<Playlist>(
  PLAYLISTS_REPOSITORY_TOKEN,
  [
    BACKEND_TOKEN,
    HttpClient,
    BaseAuthenticationService,
    PLAYLISTS_API_URL_TOKEN,
    PLAYLISTS_RESOURCE_NAME_TOKEN,
    PLAYLISTS_REPOSITORY_MAPPING_TOKEN,
    FIREBASE_CONFIG_TOKEN
  ]
);

export const UsersRepositoryFactory = createBaseRepositoryFactory<User>(
  USERS_REPOSITORY_TOKEN,
  [
    BACKEND_TOKEN,
    HttpClient,
    BaseAuthenticationService,
    USERS_API_URL_TOKEN,
    USERS_RESOURCE_NAME_TOKEN,
    USERS_REPOSITORY_MAPPING_TOKEN,
    FIREBASE_CONFIG_TOKEN
  ]
);

// Auth Mapping Factory
export const AuthMappingFactory = {
  provide: AUTH_MAPPING_TOKEN,
  useFactory: (backend: string) => {
    switch(backend) {
      case 'strapi':
        return new StrapiAuthMappingService();
      case 'firebase':
        return new FirebaseAuthMappingService();
      default:
        throw new Error("BACKEND NOT IMPLEMENTED");
    }
  },
  deps: [BACKEND_TOKEN]
};

// Auth Service Factory
export const AuthenticationServiceFactory: FactoryProvider = {
  provide: BaseAuthenticationService,
  useFactory: (backend: string, firebaseConfig: any, signIn: string, signUp: string, meUrl: string, mapping: IAuthMapping, http: HttpClient) => {
    switch(backend) {
      case 'strapi':
        return new StrapiAuthenticationService(signIn, signUp, meUrl, mapping, http);
      case 'firebase':
        return new FirebaseAuthenticationService(firebaseConfig, mapping);
      default:
        throw new Error("BACKEND NOT IMPLEMENTED");
    }
  },
  deps: [
    BACKEND_TOKEN, 
    FIREBASE_CONFIG_TOKEN, 
    AUTH_SIGN_IN_API_URL_TOKEN, 
    AUTH_SIGN_UP_API_URL_TOKEN, 
    AUTH_ME_API_URL_TOKEN, 
    AUTH_MAPPING_TOKEN, 
    HttpClient
  ]
};

// Media Service Factory
export const MediaServiceFactory: FactoryProvider = {
  provide: BaseMediaService,
  useFactory: (backend: string, firebaseConfig: any, upload: string, auth: BaseAuthenticationService, http: HttpClient) => {
    switch(backend) {
      case 'strapi':
        if (!('getToken' in auth)) {
          throw new Error("Auth service must implement getToken for media service");
        }
        return new StrapiMediaService(upload, auth as IStrapiAuthentication, http);
      case 'firebase':
        return new FirebaseMediaService(firebaseConfig, auth);
      default:
        throw new Error("BACKEND NOT IMPLEMENTED");
    }
  },
  deps: [BACKEND_TOKEN, FIREBASE_CONFIG_TOKEN, UPLOAD_API_URL_TOKEN, BaseAuthenticationService, HttpClient]
};