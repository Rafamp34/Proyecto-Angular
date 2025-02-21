// user.service.ts
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { BaseService } from './base-service.service';
import { User } from '../../models/user.model';
import { IUserService } from '../interfaces/user-service.interface';
import { IUserRepository } from '../../repositories/intefaces/user-repository.interface';
import { USERS_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { BaseAuthenticationService } from './base-authentication.service';
import { Playlist } from '../../models/playlist.model';

@Injectable({
    providedIn: 'root'
})
export class UserService extends BaseService<User> implements IUserService {
    private _user = new BehaviorSubject<User | null>(null);
    public user$ = this._user.asObservable();

    private _playlistCreatedSubject = new Subject<Playlist>();
    private _playlistDeletedSubject = new Subject<string>();

    playlistCreated$ = this._playlistCreatedSubject.asObservable();
    playlistDeleted$ = this._playlistDeletedSubject.asObservable();

    constructor(
        @Inject(USERS_REPOSITORY_TOKEN) private userRepository: IUserRepository,
        private authService: BaseAuthenticationService
    ) {
        super(userRepository);
    }

    public setUser(user: User | null): void {
        this._user.next(user);
    }

    notifyPlaylistCreated(playlist: Playlist) {
        this._playlistCreatedSubject.next(playlist);
    }

    notifyPlaylistDeleted(playlistId: string) {
        this._playlistDeletedSubject.next(playlistId);
    }

    public getCurrentUser(): User | null {
        return this._user.getValue();
    }

    override getById(id: string): Observable<User> {
        console.log('Getting user by ID:', id);
        return this.userRepository.getById(id).pipe(
            filter((userData): userData is User => userData !== null),
            tap(userData => {
                console.log('User data retrieved:', userData);
                this.setUser(userData);
                if (userData.id === (this.authService as any)._user.value?.id) {
                    (this.authService as any).updateCurrentUser(userData);
                }
            })
        );
    }

    getByEmail(email: string): Observable<User | null> {
        return this.userRepository.getByEmail(email);
    }

    updateProfile(userId: string, changes: Partial<User>): Observable<User> {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return this.getById(userId).pipe(
            map(user => ({
                ...user,
                ...changes
            })),
            switchMap(updatedUser => this.update(userId, updatedUser)),
            tap(updatedUser => {
                this.setUser(updatedUser);
            })
        );
    }

    follow(userId: string, followId: string): Observable<User> {
        return this.userRepository.follow(userId, followId).pipe(
            tap(updatedUser => {
                this.setUser(updatedUser);
                (this.authService as any).updateCurrentUser(updatedUser);
            })
        );
    }

    unfollow(userId: string, followId: string): Observable<User> {
        return this.userRepository.unfollow(userId, followId).pipe(
            tap(updatedUser => {
                this.setUser(updatedUser);
                (this.authService as any).updateCurrentUser(updatedUser);
            })
        );
    }

    getFollowers(userId: string): Observable<User[]> {
        return this.userRepository.getFollowers(userId);
    }

    getFollowing(userId: string): Observable<User[]> {
        return this.userRepository.getFollowing(userId);
    }

    addPlaylist(userId: string, playlistId: string): Observable<User> {
        return this.userRepository.addPlaylist(userId, playlistId).pipe(
            tap(updatedUser => {
                this.setUser(updatedUser);
                (this.authService as any).updateCurrentUser(updatedUser);
            })
        );
    }

    removePlaylist(userId: string, playlistId: string): Observable<User> {
        return this.userRepository.removePlaylist(userId, playlistId).pipe(
            tap(updatedUser => {
                this.setUser(updatedUser);
                (this.authService as any).updateCurrentUser(updatedUser);
            })
        );
    }
}