import { Inject, Injectable } from '@angular/core';
import { filter, map, Observable, of, tap, firstValueFrom, from } from 'rxjs';
import { BaseAuthenticationService } from './base-authentication.service';
import { AUTH_MAPPING_TOKEN, FIREBASE_CONFIG_TOKEN } from '../../repositories/repository.tokens';
import { IAuthMapping } from '../interfaces/auth-mapping.interface';
import { User } from '../../models/auth.model';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc,
  collection,
  Firestore 
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthenticationService extends BaseAuthenticationService {
  private auth;
  private db: Firestore;
  private _token: string | null = null;

  constructor(
    @Inject(FIREBASE_CONFIG_TOKEN) protected firebaseConfig: any,
    @Inject(AUTH_MAPPING_TOKEN) authMapping: IAuthMapping
  ) {
    super(authMapping);
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    this.db = getFirestore(app);

    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this._token = await user.getIdToken();
        this._authenticated.next(true);
        this._user.next(this.authMapping.me(user));
      } else {
        this._token = null;
        this._authenticated.next(false);
        this._user.next(undefined);
      }
      this._ready.next(true);
    });
  }

  async getCurrentUser(): Promise<any> {
    await firstValueFrom(this._ready.pipe(filter(ready => ready === true)));
    return firstValueFrom(this._user);
  }

  signIn(authPayload: any): Observable<User> {
    const { email, password } = this.authMapping.signInPayload(authPayload);
    
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(userCredential => {
        return this.authMapping.signIn(userCredential.user);
      })
    );
  }

  signUp(signUpPayload: any): Observable<User> {
    const { email, password } = this.authMapping.signUpPayload(signUpPayload);
    
    return new Observable(observer => {
      createUserWithEmailAndPassword(this.auth, email, password)
        .then(async (userCredential) => {
          try {
            // Crear el documento en la colección users usando el UID como ID del documento
            const userRef = doc(this.db, 'users', userCredential.user.uid);
            await setDoc(userRef, {
              name: signUpPayload.name,
              surname: signUpPayload.surname,
              email: signUpPayload.email,
              gender: signUpPayload.gender || null,
              image: signUpPayload.image || null,
              createdAt: new Date(),
              updatedAt: new Date()
            });

            // Devolver el usuario una vez creado el documento
            observer.next(this.authMapping.signUp(userCredential.user));
            observer.complete();
          } catch (error) {
            // Si hay error al crear el documento, eliminar el usuario de auth
            await userCredential.user.delete();
            observer.error(error);
          }
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  signOut(): Observable<any> {
    return from(firebaseSignOut(this.auth)).pipe(
      tap(() => {
        this._authenticated.next(false);
        this._user.next(undefined);
      })
    );
  }

  me(): Observable<any> {
    return of(this.auth.currentUser).pipe(
      map(user => {
        if (!user) {
          throw new Error('No authenticated user');
        }
        return user;
      })
    );
  }

  getToken(): string | null {
    return this._token;
  }

  
}