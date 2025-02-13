// song.model.ts
import { Model } from "./base.model";

export interface Song extends Model {
    name: string,
    album?: string,
    duration: string,
    image?: {
        url: string | undefined,
        large: string | undefined,
        medium: string | undefined,
        small: string | undefined,
        thumbnail: string | undefined
    },
    playlistId_IDS?: string[],  // Para las referencias a playlists
    artists_IDS: string[]
}