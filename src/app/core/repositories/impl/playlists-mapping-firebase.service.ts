// src/app/core/repositories/impl/playlists-mapping-firebase.service.ts
import { Inject, Injectable } from '@angular/core';
import { IBaseMapping } from '../intefaces/base-mapping.interface';
import { Playlist } from '../../models/playlist.model';
import { Paginated } from '../../models/paginated.model';
import { FirebasePlaylist } from '../../models/firebase/firebase-playlist.model';
import { Firestore, getFirestore, doc } from 'firebase/firestore';
import { FIREBASE_CONFIG_TOKEN } from '../repository.tokens';
import { initializeApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class PlaylistsMappingFirebaseService implements IBaseMapping<Playlist> {
  
  private db: Firestore;

  constructor(@Inject(FIREBASE_CONFIG_TOKEN) protected firebaseConfig: any) {
    this.db = getFirestore(initializeApp(firebaseConfig));
  }

  getOne(data: { id: string } & FirebasePlaylist): Playlist {
    return {
      id: data.id,
      name: data.name,
      author: data.author,
      duration: data.duration,
      song_IDS: data.song_IDS.map(ref => ref.id),
      users_IDS: data.users_IDS.map(ref => ref.id),
      image: data.image ? {
        url: data.image,
        large: data.image,
        medium: data.image,
        small: data.image,
        thumbnail: data.image
      } : undefined
    };
  }

  getPaginated(page: number, pageSize: number, pages: number, data: ({ id: string } & FirebasePlaylist)[]): Paginated<Playlist> {
    return {
      page,
      pageSize,
      pages,
      data: data.map(item => this.getOne(item))
    };
  }

  setAdd(data: Playlist): FirebasePlaylist {
    const mappedData: FirebasePlaylist = {
      name: data.name,
      author: data.author,
      duration: data.duration,
      song_IDS: data.song_IDS ? data.song_IDS.map(id => doc(this.db, 'songs', id)) : [],
      users_IDS: data.users_IDS ? data.users_IDS.map(id => doc(this.db, 'users', id)) : []
    };

    if (data.image?.url) {
      mappedData.image = data.image.url;
    }

    return mappedData;
  }

  setUpdate(data: Partial<Playlist>): Partial<FirebasePlaylist> {
    const result: Partial<FirebasePlaylist> = {};
    
    if (data.name) result.name = data.name;
    if (data.author) result.author = data.author;
    if (data.duration) result.duration = data.duration;
    if (data.song_IDS) {
      result.song_IDS = data.song_IDS.map(id => 
        doc(this.db, 'songs', id)
      );
    }
    if (data.users_IDS) {
      result.users_IDS = data.users_IDS.map(id => 
        doc(this.db, 'users', id)
      );
    }
    if (data.image?.url) {
      result.image = data.image.url;
    }

    return result;
  }

  getAdded(data: { id: string } & FirebasePlaylist): Playlist {
    return this.getOne(data);
  }

  getUpdated(data: { id: string } & FirebasePlaylist): Playlist {
    return this.getOne(data);
  }

  getDeleted(data: { id: string } & FirebasePlaylist): Playlist {
    return this.getOne(data);
  }
}