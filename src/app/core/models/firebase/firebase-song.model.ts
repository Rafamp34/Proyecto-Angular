// firebase-song.model.ts
import { DocumentReference } from "firebase/firestore";

export interface FirebaseSong {
    name: string;
    album?: string;
    duration: string;
    image?: string;
    artists_IDS?: DocumentReference[];
    playlistId_IDS?: DocumentReference[];
}