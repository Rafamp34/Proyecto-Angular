import { Model } from "./base.model";

export interface Artist extends Model {
    name: string,
    listiners: number,
    image?: {
        url: string | undefined,
        large: string | undefined,
        medium: string | undefined,
        small: string | undefined,
        thumbnail: string | undefined
    },
    songs_IDS: string[]
}