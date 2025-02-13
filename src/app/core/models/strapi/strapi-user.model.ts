// src/app/core/models/strapi/strapi-user.model.ts
export interface StrapiUser {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    followers: {
        data: { id: number }[];
    };
    following: {
        data: { id: number }[];
    };
    playlists: {
        data: { id: number }[];
    };
    image: {
        data: {
            attributes: {
                url: string;
                formats: {
                    large: { url: string };
                    medium: { url: string };
                    small: { url: string };
                    thumbnail: { url: string };
                };
            };
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface StrapiUserResponse {
    data: {
        id: number;
        attributes: StrapiUser;
    };
    meta: any;
}