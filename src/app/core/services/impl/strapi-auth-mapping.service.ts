import { Injectable } from "@angular/core";
import { IAuthMapping } from "../interfaces/auth-mapping.interface";
import { SignInPayload, SignUpPayload, User } from "../../models/auth.model";

export interface StrapiMeResponse {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    avatar?: {
        url: string;
        large: string;
        medium: string;
        small: string;
        thumbnail: string;
    };
}

export interface StrapiSignInResponse {
    jwt: string;
    user: StrapiUser;
}

export interface StrapiSignUpResponse {
    jwt: string;
    user: StrapiUser;
}

export interface StrapiUser {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    avatar?: {
        url: string;
        large: string;
        medium: string;
        small: string;
        thumbnail: string;
    };
}

interface StrapiSignIn {
    identifier: string;
    password: string;
}

interface StrapiSignUp {
    email: string;
    password: string;
    username: string;
}

@Injectable({
    providedIn: 'root'
})
export class StrapiAuthMappingService implements IAuthMapping {
    signInPayload(payload: SignInPayload): StrapiSignIn {
        return {
            identifier: payload.email,
            password: payload.password
        };
    }

    signUpPayload(payload: SignUpPayload): StrapiSignUp {
        return {
            email: payload.email,
            password: payload.password,
            username: payload.name + " " + payload.surname
        };
    }

    signIn(response: StrapiSignInResponse): User {
        return {
            id: response.user.id.toString(),
            username: response.user.username,
            email: response.user.email,
            image: response.user.avatar ? {
                url: response.user.avatar.url,
                large: response.user.avatar.large,
                medium: response.user.avatar.medium,
                small: response.user.avatar.small,
                thumbnail: response.user.avatar.thumbnail
            } : undefined,
        };
    }

    signUp(response: StrapiSignUpResponse): User {
        return {
            id: response.user.id.toString(),
            username: response.user.username,
            email: response.user.email,
            image: response.user.avatar ? {
                url: response.user.avatar.url,
                large: response.user.avatar.large,
                medium: response.user.avatar.medium,
                small: response.user.avatar.small,
                thumbnail: response.user.avatar.thumbnail
            } : undefined,
        };
    }

    me(response: StrapiMeResponse): User {
        console.log('API Response:', response); // Depuración: Verifica la respuesta de la API
        return {
            id: response.id.toString(),
            username: response.username,
            email: response.email,
            image: response.avatar ? {
                url: response.avatar.url,
                large: response.avatar.large,
                medium: response.avatar.medium,
                small: response.avatar.small,
                thumbnail: response.avatar.thumbnail
            } : undefined
        };
    }
}