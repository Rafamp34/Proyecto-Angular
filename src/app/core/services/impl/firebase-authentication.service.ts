import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom, from, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { BaseAuthenticationService } from './base-authentication.service';
import { AUTH_MAPPING_TOKEN, FIREBASE_CONFIG_TOKEN } from '../../repositories/repository.tokens';
import { IAuthMapping } from '../interfaces/auth-mapping.interface';
import { SignInPayload, SignUpPayload, User } from '../../models/auth.model';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
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

    // Escuchar cambios en el estado de autenticación
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        try {
          this._token = await user.getIdToken();
          this._authenticated.next(true);

          // Obtener datos adicionales del usuario desde Firestore
          const userDoc = await getDoc(doc(this.db, 'users', user.uid));
          if (!userDoc.exists()) {
            throw new Error('User document not found in Firestore');
          }

          const userData = userDoc.data();
          const enrichedUser = {
            ...user,
            displayName: userData?.['name'] ? `${userData['name']} ${userData['surname']}` : user.displayName,
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

  async getCurrentUser(): Promise<User | undefined> {
    // Esperar a que el servicio esté listo
    await firstValueFrom(this._ready.pipe(filter(ready => ready === true)));
  
    // Obtener el usuario actual
    const user = this.auth.currentUser;
    if (!user) {
      return undefined; // No hay usuario autenticado
    }
  
    // Obtener datos adicionales de Firestore
    const userDoc = await getDoc(doc(this.db, 'users', user.uid));
    if (!userDoc.exists()) {
      throw new Error('User document not found in Firestore');
    }
  
    const userData = userDoc.data();
    const enrichedUser = {
      ...user,
      displayName: userData?.['name'] ? `${userData['name']} ${userData['surname']}` : user.displayName,
    };
  
    return this.authMapping.me(enrichedUser);
  }

  signIn(authPayload: SignInPayload): Observable<User> {
    const { email, password } = this.authMapping.signInPayload(authPayload);

    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(userCredential => 
        from(getDoc(doc(this.db, 'users', userCredential.user.uid))).pipe(
          map(userDoc => {
            if (!userDoc.exists()) {
              throw new Error('User document not found in Firestore');
            }

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

  signUp(signUpPayload: SignUpPayload): Observable<User> {
    const { email, password, displayName } = this.authMapping.signUpPayload(signUpPayload);
  
    return new Observable(observer => {
      createUserWithEmailAndPassword(this.auth, email, password)
        .then(async (userCredential) => {
          try {
            // Establecer el displayName en Firebase Auth
            await updateProfile(userCredential.user, { displayName });
  
            // Crear el documento en Firestore
            const userRef = doc(this.db, 'users', userCredential.user.uid);
            const userData = {
              name: signUpPayload.name,
              surname: signUpPayload.surname,
              email: signUpPayload.email,
              displayName, // Asignar displayName
              gender: signUpPayload.gender || null,
              image: signUpPayload.image || null,
              createdAt: new Date(),
              updatedAt: new Date()
            };
  
            await setDoc(userRef, userData);
  
            // Combinar datos de auth y Firestore
            const enrichedUser = {
              ...userCredential.user,
              displayName,
            };
  
            observer.next(this.authMapping.signUp(enrichedUser));
            observer.complete();
          } catch (error) {
            console.error('Error creating user in Firestore:', error);
            await userCredential.user.delete(); // Eliminar usuario de Auth si falla Firestore
            observer.error('Error creating user. Please try again.');
          }
        })
        .catch(error => {
          console.error('Error creating user in Firebase Auth:', error);
          observer.error('Error creating user. Please check your credentials.');
        });
    });
  }

  signOut(): Observable<void> {
    return from(firebaseSignOut(this.auth)).pipe(
      tap(() => {
        this._authenticated.next(false);
        this._user.next(undefined);
      })
    );
  }

  me(): Observable<User> {
    return of(this.auth.currentUser).pipe(
      map(user => {
        if (!user) {
          throw new Error('No authenticated user');
        }
        return this.authMapping.me(user);
      })
    );
  }

  getToken(): string | null {
    return this._token;
  }
}