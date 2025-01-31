// songs-repository.interface.ts
import { Song } from "../../models/song.model";
import { IBaseRepository } from "./base-repository.interface";

export interface ISongsRepository extends IBaseRepository<Song> {
}