import { Injectable } from "@angular/core";
import { IBaseMapping } from "../intefaces/base-mapping.interface";
import { Paginated } from "../../models/paginated.model";
import { Song } from "../../models/song.model";

@Injectable({
    providedIn: 'root'
})
export class SongsMappingStrapi implements IBaseMapping<Song> {
    setAdd(data: Song): any {
        return {
            data: {
                name: data.name,
                album: data.album,
                duration: data.duration,
                artists_IDS: data.artists_IDS ? 
                    data.artists_IDS.map(id => Number(id)) : [],
                playlistId_IDS: data.playlistId_IDS ? 
                    data.playlistId_IDS.map(id => Number(id)) : []
            }
        };
    }

    setUpdate(data: Partial<Song>): any {
        const mappedData: any = {};
        
        Object.keys(data).forEach(key => {
            switch(key) {
                case 'name': mappedData.name = data[key];
                    break;
                case 'album': mappedData.album = data[key];
                    break;
                case 'duration': mappedData.duration = data[key];
                    break;
                case 'artists_IDS': 
                    mappedData.artists_IDS = data[key] ? 
                        data[key]?.map(id => Number(id)) : [];
                    break;
                case 'playlistId_IDS': 
                    mappedData.playlistId_IDS = data[key] ? 
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

    getPaginated(page: number, pageSize: number, pages: number, data: any[]): Paginated<Song> {
        return {
            page, 
            pageSize, 
            pages, 
            data: data.map(d => this.getOne(d))
        };
    }

    getOne(data: any): Song {
        const attributes = data.attributes || data;
        const id = data.id || data.data?.id;
    
        // Convert duration from seconds to MM:SS format
        const minutes = Math.floor(attributes.duration / 60);
        const seconds = attributes.duration % 60;
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
        return {
            id: id.toString(),
            name: attributes.name,
            album: attributes.album,
            duration: formattedDuration,
            artists_IDS: attributes.artists_IDS?.data?.map((a: any) => 
                a.id.toString()) || [],
            playlistId_IDS: attributes.playlistId_IDS?.data?.map((p: any) => 
                p.id.toString()) || [],
            image: attributes.image?.data ? {
                url: attributes.image.data.attributes.url,
                large: attributes.image.data.attributes.formats?.large?.url,
                medium: attributes.image.data.attributes.formats?.medium?.url,
                small: attributes.image.data.attributes.formats?.small?.url,
                thumbnail: attributes.image.data.attributes.formats?.thumbnail?.url,
            } : undefined
        };
    }

    getAdded(data: any): Song {
        return this.getOne(data);
    }

    getUpdated(data: any): Song {
        return this.getOne(data);
    }

    getDeleted(data: any): Song {
        return this.getOne(data);
    }
}