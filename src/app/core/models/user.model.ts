// src/app/core/models/user.model.ts
import { Model } from "./base.model";

export interface User extends Model {
    username: string;
    email: string;
    name: string;
    surname: string;
    displayName?: string;
    image?: {
        url: string | undefined;
        large: string | undefined;
        medium: string | undefined;
        small: string | undefined;
        thumbnail: string | undefined;
    };
    followers: string[];
    following: string[];
    playlists_ids: string[];
    provider?: string;
    confirmed?: boolean;
    blocked?: boolean;
}

export interface SignInPayload{
    email:string,
    password:string
}

export interface SignUpPayload{
    email:string,
    password:string,
    name:string,
    surname:string,
    birthDate:string,
    gender:string,
    group:string,
    user:string
}