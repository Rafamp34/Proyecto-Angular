import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { BaseService } from './base-service.service';
import { User } from '../../models/user.model';
import { IUserService } from '../interfaces/user-service.interface';
import { IUserRepository } from '../../repositories/intefaces/user-repository.interface';
import { USERS_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';

@Injectable({
    providedIn: 'root'
})
export class UserService extends BaseService<User> implements IUserService {
    constructor(
        @Inject(USERS_REPOSITORY_TOKEN) private userRepository: IUserRepository
    ) {
        super(userRepository);
    }

    getByEmail(email: string): Observable<User | null> {
        return this.userRepository.getByEmail(email);
    }

    updateProfile(id: string, changes: Partial<User>): Observable<User> {
        return this.update(id, changes as User);
    }

    follow(userId: string, followId: string): Observable<User> {
        return this.userRepository.follow(userId, followId);
    }

    unfollow(userId: string, followId: string): Observable<User> {
        return this.userRepository.unfollow(userId, followId);
    }

    getFollowers(userId: string): Observable<User[]> {
        return this.userRepository.getFollowers(userId);
    }

    getFollowing(userId: string): Observable<User[]> {
        return this.userRepository.getFollowing(userId);
    }

    addPlaylist(userId: string, playlistId: string): Observable<User> {
        return this.userRepository.addPlaylist(userId, playlistId);
    }

    removePlaylist(userId: string, playlistId: string): Observable<User> {
        return this.userRepository.removePlaylist(userId, playlistId);
    }

    override getById(id: string): Observable<User> {
        return this.userRepository.getById(id).pipe(
            filter((userData): userData is User => userData !== null),
            tap(userData => console.log('Datos obtenidos en UserService:', userData))
        );
    }
}
