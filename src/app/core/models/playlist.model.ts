// playlist.model.ts
import { Model } from "./base.model";

export interface Playlist extends Model {
    name: string,
    author: string,
    duration: string,
    image?: {
        url: string | undefined,
        large: string | undefined,
        medium: string | undefined,
        small: string | undefined,
        thumbnail: string | undefined
    },
    song_IDS: string[],
    users_IDS: string[] 
}