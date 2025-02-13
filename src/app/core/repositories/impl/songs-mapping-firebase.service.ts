// songs-mapping-firebase.service.ts
import { Inject, Injectable } from "@angular/core";
import { IBaseMapping } from "../intefaces/base-mapping.interface";
import { Song } from "../../models/song.model";
import { Paginated } from "../../models/paginated.model";
import { FirebaseSong } from "../../models/firebase/firebase-song.model";
import { Firestore, getFirestore, doc } from "firebase/firestore";
import { FIREBASE_CONFIG_TOKEN } from "../repository.tokens";
import { initializeApp } from "firebase/app";

@Injectable({
    providedIn: 'root'
})
export class SongsMappingFirebaseService implements IBaseMapping<Song> {
  
    private db: Firestore;

    constructor(@Inject(FIREBASE_CONFIG_TOKEN) protected firebaseConfig: any) {
        this.db = getFirestore(initializeApp(firebaseConfig));
    }

    getOne(data: { id: string } & FirebaseSong): Song {
        return {
            id: data.id,
            name: data.name,
            album: data.album,
            duration: data.duration,
            artists_IDS: data.artists_IDS?.map(ref => ref.id) || [],
            playlistId_IDS: data.playlistId_IDS?.map(ref => ref.id),
            image: data.image ? {
                url: data.image,
                large: data.image,
                medium: data.image,
                small: data.image,
                thumbnail: data.image
            } : undefined
        };
    }

    getPaginated(page: number, pageSize: number, pages: number, data: ({ id: string } & FirebaseSong)[]): Paginated<Song> {
        return {
            page,
            pageSize,
            pages,
            data: data.map(item => this.getOne(item))
        };
    }

    setAdd(data: Song): FirebaseSong {
        let mappedData: FirebaseSong = {
            name: data.name,
            duration: data.duration,
            album: data.album
        };

        if (data.artists_IDS) {
            mappedData.artists_IDS = data.artists_IDS.map(id => 
                doc(this.db, 'artists', id)
            );
        }

        if (data.playlistId_IDS) {
            mappedData.playlistId_IDS = data.playlistId_IDS.map(id => 
                doc(this.db, 'playlists', id)
            );
        }

        if (data.image?.url) {
            mappedData.image = data.image.url;
        }

        return mappedData;
    }

    setUpdate(data: Partial<Song>): Partial<FirebaseSong> {
        const result: any = {};
        
        if (data.name) result.name = data.name;
        if (data.duration) result.duration = data.duration;
        if (data.album) result.album = data.album;
        if (data.artists_IDS) {
            result.artists_IDS = data.artists_IDS.map(id => 
                doc(this.db, 'artists', id)
            );
        }
        if (data.playlistId_IDS) {
            result.playlistId_IDS = data.playlistId_IDS.map(id => 
                doc(this.db, 'playlists', id)
            );
        }
        if (data.image) {
            result.image = data.image.url;
        }

        return result;
    }

    getAdded(data: { id: string } & FirebaseSong): Song {
        return this.getOne(data);
    }

    getUpdated(data: { id: string } & FirebaseSong): Song {
        return this.getOne(data);
    }

    getDeleted(data: { id: string } & FirebaseSong): Song {
        return this.getOne(data);
    }
}