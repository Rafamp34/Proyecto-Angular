// user.service.ts
import { Inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BaseService } from './base-service.service';
import { User } from '../../models/user.model';
import { IUserService } from '../interfaces/user-service.interface';
import { IUserRepository } from '../../repositories/intefaces/user-repository.interface';
import { USERS_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { BaseAuthenticationService } from './base-authentication.service';

@Injectable({
    providedIn: 'root'
})
export class UserService extends BaseService<User> implements IUserService {
    constructor(
        @Inject(USERS_REPOSITORY_TOKEN) private userRepository: IUserRepository,
        private authService: BaseAuthenticationService
    ) {
        super(userRepository);
    }

    getByEmail(email: string): Observable<User | null> {
        return this.userRepository.getByEmail(email);
    }

    updateProfile(id: string, changes: Partial<User>): Observable<User> {
        console.log('Updating profile with changes:', changes);
        return this.update(id, changes as User).pipe(
            tap(updatedUser => {
                console.log('User updated:', updatedUser);
                (this.authService as any).updateCurrentUser(updatedUser);
            })
        );
    }

    follow(userId: string, followId: string): Observable<User> {
        return this.userRepository.follow(userId, followId).pipe(
            tap(updatedUser => {
                (this.authService as any).updateCurrentUser(updatedUser);
            })
        );
    }

    unfollow(userId: string, followId: string): Observable<User> {
        return this.userRepository.unfollow(userId, followId).pipe(
            tap(updatedUser => {
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
                (this.authService as any).updateCurrentUser(updatedUser);
            })
        );
    }

    removePlaylist(userId: string, playlistId: string): Observable<User> {
        return this.userRepository.removePlaylist(userId, playlistId).pipe(
            tap(updatedUser => {
                (this.authService as any).updateCurrentUser(updatedUser);
            })
        );
    }

    override getById(id: string): Observable<User> {
        console.log('Getting user by ID:', id);
        return this.userRepository.getById(id).pipe(
            filter((userData): userData is User => userData !== null),
            tap(userData => {
                console.log('User data retrieved:', userData);
                if (userData.id === (this.authService as any)._user.value?.id) {
                    (this.authService as any).updateCurrentUser(userData);
                }
            })
        );
    }
}