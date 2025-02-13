// src/app/core/services/interfaces/user-service.interface.ts
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { IBaseService } from './base-service.interface';

export interface IUserService extends IBaseService<User> {
    getByEmail(email: string): Observable<User | null>;
    updateProfile(id: string, changes: Partial<User>): Observable<User>
    follow(userId: string, followId: string): Observable<User>;
    unfollow(userId: string, followId: string): Observable<User>;
    getFollowers(userId: string): Observable<User[]>;
    getFollowing(userId: string): Observable<User[]>;
    addPlaylist(userId: string, playlistId: string): Observable<User>;
    removePlaylist(userId: string, playlistId: string): Observable<User>;
}