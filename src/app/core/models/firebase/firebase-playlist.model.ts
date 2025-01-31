// firebase-playlist.model.ts
import { DocumentReference } from "firebase/firestore";

export interface FirebasePlaylist {
    name: string;
    author: string;
    duration: string;
    image?: string;
    song_IDS: DocumentReference[];
    users_IDS: DocumentReference[];
}