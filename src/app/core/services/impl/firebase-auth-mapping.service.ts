import { Injectable } from "@angular/core";
import { IAuthMapping } from "../interfaces/auth-mapping.interface";
import { SignInPayload, SignUpPayload, User } from "../../models/auth.model";
import { User as FirebaseUser } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthMappingService implements IAuthMapping {
  signInPayload(payload: SignInPayload): { email: string, password: string } {
    return {
      email: payload.email,
      password: payload.password
    };
  }

  signUpPayload(payload: SignUpPayload): { email: string, password: string, displayName: string } {
    return {
      email: payload.email,
      password: payload.password,
      displayName: `${payload.name} ${payload.surname}` // Concatenar nombre y apellido
    };
  }

  signIn(response: FirebaseUser): User {
    return {
      id: response.uid,
      username: response.displayName || response.email || '',
      email: response.email || '',
      image: response.photoURL ? {
        url: response.photoURL,
        large: response.photoURL,
        medium: response.photoURL,
        small: response.photoURL,
        thumbnail: response.photoURL
      } : undefined
    };
  }

  signUp(response: FirebaseUser): User {
    return {
      id: response.uid,
      username: response.displayName || response.email || '',
      email: response.email || '',
      image: response.photoURL ? {
        url: response.photoURL,
        large: response.photoURL,
        medium: response.photoURL,
        small: response.photoURL,
        thumbnail: response.photoURL
      } : undefined
    };
  }

  me(response: FirebaseUser): User {
    return {
      id: response.uid,
      username: response.displayName || response.email || '',
      email: response.email || '',
      image: response.photoURL ? {
        url: response.photoURL,
        large: response.photoURL,
        medium: response.photoURL,
        small: response.photoURL,
        thumbnail: response.photoURL
      } : undefined
    };
  }
}