// artists-mapping-strapi.service.ts
import { Injectable } from "@angular/core";
import { IBaseMapping } from "../intefaces/base-mapping.interface";
import { Paginated } from "../../models/paginated.model";
import { Artist } from "../../models/artist.model";

@Injectable({
    providedIn: 'root'
})
export class ArtistsMappingStrapi implements IBaseMapping<Artist> {
    setAdd(data: Artist): any {
        return {
            data: {
                name: data.name,
                listiners: data.listiners,
                songs_IDS: data.songs_IDS ? 
                    data.songs_IDS.map(id => Number(id)) : []
            }
        };
    }

    setUpdate(data: Partial<Artist>): any {
        const mappedData: any = {};
        
        Object.keys(data).forEach(key => {
            switch(key) {
                case 'name': mappedData.name = data[key];
                    break;
                case 'listiners': mappedData.listiners = data[key];
                    break;
                case 'songs_IDS': 
                    mappedData.songs_IDS = data[key] ? 
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

    getPaginated(page: number, pageSize: number, pages: number, data: any[]): Paginated<Artist> {
        return {
            page, 
            pageSize, 
            pages, 
            data: data.map(d => this.getOne(d))
        };
    }

    getOne(data: any): Artist {
        const attributes = data.attributes || data;
        const id = data.id || data.data?.id;

        return {
            id: id.toString(),
            name: attributes.name,
            listiners: attributes.listiners,
            songs_IDS: attributes.songs_IDS?.data?.map((s: any) => 
                s.id.toString()) || [],
            image: attributes.image?.data ? {
                url: attributes.image.data.attributes.url,
                large: attributes.image.data.attributes.formats?.large?.url,
                medium: attributes.image.data.attributes.formats?.medium?.url,
                small: attributes.image.data.attributes.formats?.small?.url,
                thumbnail: attributes.image.data.attributes.formats?.thumbnail?.url,
            } : undefined
        };
    }

    getAdded(data: any): Artist {
        return this.getOne(data);
    }

    getUpdated(data: any): Artist {
        return this.getOne(data);
    }

    getDeleted(data: any): Artist {
        return this.getOne(data);
    }
}