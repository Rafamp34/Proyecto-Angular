// artists-mapping-firebase.service.ts
import { Inject, Injectable } from "@angular/core";
import { IBaseMapping } from "../intefaces/base-mapping.interface";
import { Artist } from "../../models/artist.model";
import { Paginated } from "../../models/paginated.model";
import { FirebaseArtist } from "../../models/firebase/firebase-artist.model";
import { Firestore, getFirestore, doc } from "firebase/firestore";
import { FIREBASE_CONFIG_TOKEN } from "../repository.tokens";
import { initializeApp } from "firebase/app";

@Injectable({
    providedIn: 'root'
})
export class ArtistsMappingFirebaseService implements IBaseMapping<Artist> {
  
    private db: Firestore;

    constructor(@Inject(FIREBASE_CONFIG_TOKEN) protected firebaseConfig: any) {
        this.db = getFirestore(initializeApp(firebaseConfig));
    }

    getOne(data: { id: string } & FirebaseArtist): Artist {
        const songs = Array.isArray(data.songs_IDS) 
            ? data.songs_IDS.map(ref => ref?.id || '')
            : [];

        return {
            id: data.id,
            name: data.name,
            listiners: data.listiners || 0,
            songs_IDS: songs,
            image: data.image ? {
                url: data.image,
                large: data.image,
                medium: data.image,
                small: data.image,
                thumbnail: data.image
            } : undefined
        };
    }

    getPaginated(page: number, pageSize: number, pages: number, data: ({ id: string } & FirebaseArtist)[]): Paginated<Artist> {
        return {
            page,
            pageSize,
            pages,
            data: Array.isArray(data) ? data.map(item => this.getOne(item)) : []
        };
    }

    setAdd(data: Artist): FirebaseArtist {
        const mappedData: FirebaseArtist = {
            name: data.name,
            listiners: data.listiners || 0,
            songs_IDS: data.songs_IDS ? data.songs_IDS.map(id => 
                doc(this.db, 'songs', id)
            ) : []
        };

        if (data.image?.url) {
            mappedData.image = data.image.url;
        }

        return mappedData;
    }

    setUpdate(data: Partial<Artist>): Partial<FirebaseArtist> {
        const result: any = {};
        
        if (data.name) result.name = data.name;
        if (data.listiners !== undefined) result.listiners = data.listiners;
        if (data.songs_IDS) {
            result.songs_IDS = data.songs_IDS.map(id => 
                doc(this.db, 'songs', id)
            );
        }
        if (data.image?.url) {
            result.image = data.image.url;
        }

        return result;
    }

    getAdded(data: { id: string } & FirebaseArtist): Artist {
        return this.getOne(data);
    }

    getUpdated(data: { id: string } & FirebaseArtist): Artist {
        return this.getOne(data);
    }

    getDeleted(data: { id: string } & FirebaseArtist): Artist {
        return this.getOne(data);
    }
}