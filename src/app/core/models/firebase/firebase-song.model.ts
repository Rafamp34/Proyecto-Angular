// firebase-song.model.ts
import { DocumentReference } from "firebase/firestore";

export interface FirebaseSong {
    name: string;
    author: string;
    album?: string;
    duration: string;
    image?: string;
    playlistId_IDS?: DocumentReference[];
}