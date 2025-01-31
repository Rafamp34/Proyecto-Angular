import { Injectable } from "@angular/core";
import { IAuthMapping } from "../interfaces/auth-mapping.interface";
import { SignInPayload, SignUpPayload, User } from "../../models/auth.model";
import { UserCredential, User as FirebaseUser } from 'firebase/auth';

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

  signUpPayload(payload: SignUpPayload): { email: string, password: string } {
    return {
      email: payload.email,
      password: payload.password
      // No necesitamos username ya que Firebase no lo maneja por defecto
    };
  }

  signIn(response: FirebaseUser): User {
    return {
      id: response.uid,
      username: response.displayName || response.email || '',
      email: response.email || '',
      image: {
        url: response.photoURL || '',
        large: response.photoURL || '',
        medium: response.photoURL || '',
        small: response.photoURL || '',
        thumbnail: response.photoURL || ''
      }
    };
  }

  signUp(response: FirebaseUser): User {
    return {
      id: response.uid,
      username: response.displayName || response.email || '',
      email: response.email || ''
    };
  }

  me(response: FirebaseUser): User {
    return {
      id: response.uid,
      username: response.displayName || response.email || '',
      email: response.email || ''
    };
  }
} 