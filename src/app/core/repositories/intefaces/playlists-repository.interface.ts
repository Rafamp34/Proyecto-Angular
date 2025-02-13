// playlists-repository.interface.ts
import { Playlist } from "../../models/playlist.model";
import { IBaseRepository } from "./base-repository.interface";

export interface IPlaylistsRepository extends IBaseRepository<Playlist> {
}