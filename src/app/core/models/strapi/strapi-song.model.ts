// strapi-song.model.ts
export interface StrapiSongResponse {
    data: {
        id: number;
        attributes: {
            name: string;
            author: string;
            album: string;
            duration: number;
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
            playlistid_IDS: {
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