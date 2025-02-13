import { InjectionToken } from '@angular/core';
import { IBaseRepository } from './intefaces/base-repository.interface';
import { IBaseMapping } from './intefaces/base-mapping.interface';
import { Song } from '../models/song.model';
import { Playlist } from '../models/playlist.model';
import { User } from '../models/user.model';
import { IStrapiAuthentication } from '../services/interfaces/strapi-authentication.interface';
import { IAuthentication } from '../services/interfaces/authentication.interface';
import { ISongsRepository } from './intefaces/songs-repository.interface';
import { IPlaylistsRepository } from './intefaces/playlists-repository.interface';
import { IUserRepository } from './intefaces/user-repository.interface';
import { Artist } from '../models/artist.model';
import { IArtistsRepository } from './intefaces/artists-repository.interface';

// Generic Tokens
export const API_URL_TOKEN = new InjectionToken<string>('ApiUrl');
export const RESOURCE_NAME_TOKEN = new InjectionToken<string>('ResourceName');
export const REPOSITORY_TOKEN = new InjectionToken<IBaseRepository<any>>('REPOSITORY_TOKEN');
export const REPOSITORY_MAPPING_TOKEN = new InjectionToken<IBaseMapping<any>>('IBaseRepositoryMapping');

// Songs Tokens
export const SONGS_RESOURCE_NAME_TOKEN = new InjectionToken<string>('SongsResourceName');
export const SONGS_API_URL_TOKEN = new InjectionToken<string>('SongsApiUrl');
export const SONGS_REPOSITORY_TOKEN = new InjectionToken<ISongsRepository>('ISongsRepository');
export const SONGS_REPOSITORY_MAPPING_TOKEN = new InjectionToken<IBaseMapping<Song>>('ISongsRepositoryMapping');

// Playlists Tokens
export const PLAYLISTS_RESOURCE_NAME_TOKEN = new InjectionToken<string>('PlaylistsResourceName');
export const PLAYLISTS_API_URL_TOKEN = new InjectionToken<string>('PlaylistsApiUrl');
export const PLAYLISTS_REPOSITORY_TOKEN = new InjectionToken<IPlaylistsRepository>('IPlaylistsRepository');
export const PLAYLISTS_REPOSITORY_MAPPING_TOKEN = new InjectionToken<IBaseMapping<Playlist>>('IPlaylistsRepositoryMapping');

// Users Tokens
export const USERS_RESOURCE_NAME_TOKEN = new InjectionToken<string>('UsersResourceName');
export const USERS_API_URL_TOKEN = new InjectionToken<string>('UsersApiUrl');
export const USERS_REPOSITORY_TOKEN = new InjectionToken<IUserRepository>('IUserRepository');
export const USERS_REPOSITORY_MAPPING_TOKEN = new InjectionToken<IBaseMapping<User>>('IUsersRepositoryMapping');

// Authentication Tokens
export const AUTH_TOKEN = new InjectionToken<IAuthentication>('IAuthentication');
export const STRAPI_AUTH_TOKEN = new InjectionToken<IStrapiAuthentication>('IStrapiAuthentication');
export const AUTH_MAPPING_TOKEN = new InjectionToken<IBaseMapping<User>>('IAuthMapping');
export const AUTH_SIGN_IN_API_URL_TOKEN = new InjectionToken<string>('AuthSignInApiUrl');
export const AUTH_SIGN_UP_API_URL_TOKEN = new InjectionToken<string>('AuthSignUpApiUrl');
export const AUTH_ME_API_URL_TOKEN = new InjectionToken<string>('AuthMeApiUrl');

// Firebase Tokens
export const BACKEND_TOKEN = new InjectionToken<string>('Backend');
export const FIREBASE_CONFIG_TOKEN = new InjectionToken<any>('FIREBASE_CONFIG_TOKEN');
export const FIREBASE_COLLECTION_TOKEN = new InjectionToken<string>('FIREBASE_COLLECTION_TOKEN');

// Media Tokens
export const UPLOAD_API_URL_TOKEN = new InjectionToken<string>('UploadApiUrl');

// Artist Tokens
export const ARTISTS_RESOURCE_NAME_TOKEN = new InjectionToken<string>('ArtistsResourceName');
export const ARTISTS_API_URL_TOKEN = new InjectionToken<string>('ArtistsApiUrl');
export const ARTISTS_REPOSITORY_TOKEN = new InjectionToken<IArtistsRepository>('IArtistsRepository');
export const ARTISTS_REPOSITORY_MAPPING_TOKEN = new InjectionToken<IBaseMapping<Artist>>('IArtistsRepositoryMapping');
