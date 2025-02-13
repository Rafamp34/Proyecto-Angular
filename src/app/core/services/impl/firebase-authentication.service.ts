import { Inject, Injectable } from '@angular/core';
import { filter, map, Observable, of, tap, firstValueFrom, from, switchMap } from 'rxjs';
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
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc,
  getDoc,
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
        try {
          this._token = await user.getIdToken();
          this._authenticated.next(true);
          
          // Obtener datos adicionales del usuario desde Firestore
          const userDoc = await getDoc(doc(this.db, 'users', user.uid));
          const userData = userDoc.data();
          
          // Combinar datos de auth y Firestore
          const enrichedUser = {
            ...user,
            displayName: userData?.['name'] ? `${userData['name']} ${userData['surname']}` : user.displayName,
            // Añadir otros campos según sea necesario
          };
          
          this._user.next(this.authMapping.me(enrichedUser));
        } catch (error) {
          console.error('Error loading user data:', error);
          this._user.next(this.authMapping.me(user));
        }
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
      switchMap(userCredential => 
        from(getDoc(doc(this.db, 'users', userCredential.user.uid))).pipe(
          map(userDoc => {
            const userData = userDoc.data();
            const enrichedUser = {
              ...userCredential.user,
              displayName: userData?.['name'] ? `${userData['name']} ${userData['surname']}` : userCredential.user.displayName,
            };
            return this.authMapping.signIn(enrichedUser);
          })
        )
      )
    );
  }

  signUp(signUpPayload: any): Observable<User> {
    const { email, password } = this.authMapping.signUpPayload(signUpPayload);
    
    return new Observable(observer => {
      createUserWithEmailAndPassword(this.auth, email, password)
        .then(async (userCredential) => {
          try {
            // Establecer el displayName
            await updateProfile(userCredential.user, {
              displayName: `${signUpPayload.name} ${signUpPayload.surname}`
            });

            // Crear el documento en Firestore
            const userRef = doc(this.db, 'users', userCredential.user.uid);
            const userData = {
              name: signUpPayload.name,
              surname: signUpPayload.surname,
              email: signUpPayload.email,
              gender: signUpPayload.gender || null,
              image: signUpPayload.image || null,
              displayName: `${signUpPayload.name} ${signUpPayload.surname}`,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await setDoc(userRef, userData);

            // Combinar datos de auth y Firestore
            const enrichedUser = {
              ...userCredential.user,
              displayName: userData.displayName,
            };

            observer.next(this.authMapping.signUp(enrichedUser));
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