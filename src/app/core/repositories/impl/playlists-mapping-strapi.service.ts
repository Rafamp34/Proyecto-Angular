// playlists-mapping-strapi.service.ts
import { Injectable } from "@angular/core";
import { IBaseMapping } from "../intefaces/base-mapping.interface";
import { Paginated } from "../../models/paginated.model";
import { Playlist } from "../../models/playlist.model";
import { StrapiPlaylistResponse } from "../../models/strapi/strapi-playlist.model";

@Injectable({
    providedIn: 'root'
})
export class PlaylistsMappingStrapi implements IBaseMapping<Playlist> {
    
    setAdd(data: Playlist): any {
        return {
            data: {
                name: data.name,
                author: data.author,
                duration: data.duration,
                song_IDS: data.song_IDS ? 
                    data.song_IDS.map(id => Number(id)) : [],
                users_IDS: data.users_IDS ? 
                    data.users_IDS.map(id => Number(id)) : []
            }
        };
    }

    setUpdate(data: Partial<Playlist>): any {
        const mappedData: any = {};
        
        Object.keys(data).forEach(key => {
            switch(key) {
                case 'name': mappedData.name = data[key];
                    break;
                case 'author': mappedData.author = data[key];
                    break;
                case 'duration': mappedData.duration = data[key];
                    break;
                case 'song_IDS': 
                    mappedData.song_IDS = data[key] ? 
                        data[key]?.map(id => Number(id)) : [];
                    break;
                case 'users_IDS': 
                    mappedData.users_IDS = data[key] ? 
                        data[key]?.map(id => Number(id)) : [];
                    break;
                case 'image': 
                    mappedData.image = data[key] ? Number(data[key]) : null;
                    break;
            }
        });

        return {
            data: mappedData
        };
    }

    getPaginated(page: number, pageSize: number, pages: number, data: any[]): Paginated<Playlist> {
        return {
            page, 
            pageSize, 
            pages, 
            data: data.map(d => this.getOne(d))
        };
    }

    getOne(data: any): Playlist {
        const attributes = data.attributes || data;
        const id = data.id || data.data?.id;

        return {
            id: id.toString(),
            name: attributes.name,
            author: attributes.author,
            duration: attributes.duration,
            song_IDS: attributes.song_IDS?.data?.map((s: any) => 
                s.id.toString()),
            users_IDS: attributes.users_IDS?.data?.map((u: any) => 
                u.id.toString()),
            image: attributes.image?.data ? {
                url: attributes.image.data.attributes.url,
                large: attributes.image.data.attributes.formats?.large?.url,
                medium: attributes.image.data.attributes.formats?.medium?.url,
                small: attributes.image.data.attributes.formats?.small?.url,
                thumbnail: attributes.image.data.attributes.formats?.thumbnail?.url,
            } : undefined
        };
    }

    getAdded(data: any): Playlist {
        return this.getOne(data);
    }

    getUpdated(data: any): Playlist {
        return this.getOne(data);
    }

    getDeleted(data: any): Playlist {
        return this.getOne(data);
    }
}