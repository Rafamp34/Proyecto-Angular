import { DocumentReference } from "firebase/firestore";

export interface FirebaseArtist {
    name: string;
    listiners: number;
    image?: string;
    songs_IDS?: DocumentReference[];
}