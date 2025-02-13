// src/app/core/repositories/impl/user-mapping-strapi.service.ts
import { Injectable } from "@angular/core";
import { IUserMapping } from "../intefaces/user-mapping.interface";
import { User } from "../../models/user.model";
import { Paginated } from "../../models/paginated.model";
import { StrapiUser, StrapiUserResponse } from "../../models/strapi/strapi-user.model";

@Injectable({
    providedIn: 'root'
})
export class UserMappingStrapiService implements IUserMapping {
    getPaginated(page: number, pageSize: number, pages: number, data: StrapiUserResponse[]): Paginated<User> {
        return {
            page,
            pageSize,
            pages,
            data: data.map(item => this.getOne(item))
        };
    }

    getOne(data: any): User {
        if (!data || !data.data) {
            console.warn('Los datos recibidos son nulos o indefinidos:', data);
            return {
                id: data?.id?.toString() || 'unknown',
                username: data?.username || 'unknown',
                email: data?.email || 'unknown',
                provider: data?.provider || 'unknown',
                confirmed: data?.confirmed || false,
                blocked: data?.blocked || false,
                name: data?.name || '', // Añadir name
                surname: data?.surname || '', // Añadir surname
                followers: [],
                following: [],
                playlists_ids: [],
                image: undefined,
                createdAt: data?.createdAt || new Date().toISOString(),
                updatedAt: data?.updatedAt || new Date().toISOString()
                };
            }
      
        const attributes = data.data.attributes;
        return {
            id: data.data.id.toString(),
            username: attributes.username,
            email: attributes.email,
            provider: attributes.provider,
            confirmed: attributes.confirmed,
            blocked: attributes.blocked,
            name: attributes.name || '', // Añadir name
            surname: attributes.surname || '', // Añadir surname
            followers: attributes.followers?.data?.map((f: { id: number | string }) => f.id.toString()) || [],
            following: attributes.following?.data?.map((f: { id: number | string }) => f.id.toString()) || [],
            playlists_ids: attributes.playlists?.data?.map((p: { id: number | string }) => p.id.toString()) || [],
            image: attributes.image ? {
                url: attributes.image.url,
                large: attributes.image.formats?.large?.url,
                medium: attributes.image.formats?.medium?.url,
                small: attributes.image.formats?.small?.url,
                thumbnail: attributes.image.formats?.thumbnail?.url
          } : undefined,
            createdAt: attributes.createdAt,
            updatedAt: attributes.updatedAt
        };
    }

    setAdd(data: User): any {
        return {
            data: {
                username: data.username,
                email: data.email
            }
        };
    }

    setUpdate(data: Partial<User>): any {  
        
        const mappedData: any = {};
        
        if (data.username) mappedData.username = data.username;
        if (data.email) mappedData.email = data.email;
        if (data.image !== undefined) mappedData.image = data.image?.url;
    
        return mappedData;
    }

    getAdded(data: StrapiUserResponse): User {
        return this.getOne(data);
    }

    getUpdated(data: StrapiUserResponse): User {
        return this.getOne(data);
    }

    getDeleted(data: StrapiUserResponse): User {
        return this.getOne(data);
    }
}
