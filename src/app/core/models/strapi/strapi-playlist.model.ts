// strapi-playlist.model.ts
export interface StrapiPlaylistResponse {
    data: {
        id: number;
        attributes: {
            name: string;
            author: string;
            duration: string;
            image?: {
                data?: {
                    attributes: {
                        url: string;
                        formats: {
                            large?: { url: string };
                            medium?: { url: string };
                            small?: { url: string };
                            thumbnail?: { url: string };
                        }
                    }
                }
            };
            song_IDS: {
                data: Array<{
                    id: number;
                    attributes: any;
                }>
            };
            users_IDS: {
                data: Array<{
                    id: number;
                    attributes: any;
                }>
            };
            createdAt: string;
            updatedAt: string;
        }
    }
}