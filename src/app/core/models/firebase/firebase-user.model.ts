// src/app/core/models/firebase/firebase-user.model.ts
export interface FirebaseUser {
    uid: string;
    email: string;
    displayName?: string;
    image?: string;
    followers: string[];
    following: string[];
    playlists_ids: string[];
    emailVerified: boolean;
}