// artists-repository.interface.ts
import { Observable } from 'rxjs';
import { Artist } from "../../models/artist.model";
import { IBaseRepository } from "./base-repository.interface";

export interface IArtistsRepository extends IBaseRepository<Artist> {
    // Obtiene todos los artistas que coinciden con el nombre proporcionado
    getByName(name: string): Observable<Artist[]>;

    // Obtiene artistas por una lista de IDs
    getByIds(ids: string[]): Observable<Artist[]>;

    // Obtiene los artistas más populares basado en el número de oyentes
    getTopArtists(limit: number): Observable<Artist[]>;

    // Busca artistas por nombre usando un término de búsqueda
    searchByName(searchTerm: string, limit?: number): Observable<Artist[]>;

    // Obtiene las canciones asociadas a un artista
    getArtistSongs(artistId: string): Observable<string[]>;

    // Añade una canción a un artista
    addSongToArtist(artistId: string, songId: string): Observable<Artist>;

    // Elimina una canción de un artista
    removeSongFromArtist(artistId: string, songId: string): Observable<Artist>;

    // Actualiza el número de oyentes de un artista
    updateListeners(artistId: string, listeners: number): Observable<Artist>;
}