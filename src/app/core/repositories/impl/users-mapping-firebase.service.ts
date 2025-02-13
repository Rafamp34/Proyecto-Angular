// src/app/core/repositories/impl/user-mapping-firebase.service.ts
import { Inject, Injectable } from "@angular/core";
import { IUserMapping } from "../intefaces/user-mapping.interface";
import { User } from "../../models/user.model";
import { Paginated } from "../../models/paginated.model";
import { FirebaseUser } from "../../models/firebase/firebase-user.model";
import { FIREBASE_CONFIG_TOKEN } from "../../repositories/repository.tokens";
import { Firestore, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

@Injectable({
    providedIn: 'root'
})
export class UserMappingFirebaseService implements IUserMapping {
    private db: Firestore;

    constructor(@Inject(FIREBASE_CONFIG_TOKEN) protected firebaseConfig: any) {
        this.db = getFirestore(initializeApp(firebaseConfig));
    }

    getPaginated(page: number, pageSize: number, pages: number, data: FirebaseUser[]): Paginated<User> {
        return {
            page,
            pageSize,
            pages,
            data: data.map(item => this.getOne(item))
        };
    }

    getOne(data: FirebaseUser): User {
        return {
          id: data.uid,
          username: data.email?.split('@')[0] || '',
          email: data.email || '',
          displayName: data.displayName,
          name: data.name || '', // Añadir name
          surname: data.surname || '', // Añadir surname
          image: data.image ? {
            url: data.image,
            large: data.image,
            medium: data.image,
            small: data.image,
            thumbnail: data.image
          } : undefined,
          followers: data.followers || [],
          following: data.following || [],
          playlists_ids: data.playlists_ids || []
        };
      }

    setAdd(data: User): any {
        return {
            email: data.email,
            displayName: data.displayName,
            image: data.image?.url,
            followers: [],
            following: [],
            playlists_ids: []
        };
    }

    setUpdate(data: Partial<User>): any {
        const result: any = {};
        if (data.displayName) result.displayName = data.displayName;
        if (data.image?.url) result.image = data.image.url;
        if (data.followers) result.followers = data.followers;
        if (data.following) result.following = data.following;
        if (data.playlists_ids) result.playlists_ids = data.playlists_ids;
        return result;
    }

    getAdded(data: FirebaseUser): User {
        return this.getOne(data);
    }

    getUpdated(data: FirebaseUser): User {
        return this.getOne(data);
    }

    getDeleted(data: FirebaseUser): User {
        return this.getOne(data);
    }
}