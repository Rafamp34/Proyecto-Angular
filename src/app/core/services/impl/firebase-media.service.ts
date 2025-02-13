import { Inject, Injectable } from "@angular/core";
import { BaseMediaService } from "./base-media.service";
import { 
  getStorage, 
  ref, 
  uploadBytes,
  getDownloadURL,
  StorageReference 
} from "firebase/storage";
import { from, map, Observable, switchMap } from "rxjs";
import { AUTH_TOKEN, FIREBASE_CONFIG_TOKEN } from "../../repositories/repository.tokens";
import { initializeApp } from "firebase/app";
import { IAuthentication } from "../interfaces/authentication.interface";
@Injectable({
  providedIn: 'root'
})
export class FirebaseMediaService extends BaseMediaService<string> {
  private storage;
  constructor(
    @Inject(FIREBASE_CONFIG_TOKEN) protected firebaseConfig: any,
    @Inject(AUTH_TOKEN) private auth: IAuthentication
  ) {
    super();
    const app = initializeApp(firebaseConfig);
    this.storage = getStorage(app);
  }
  public upload(blob: Blob): Observable<string[]> {
    return from(this.auth.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user) throw new Error('Usuario no autenticado');
        
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const storageRef: StorageReference = ref(this.storage, `uploads/${fileName}`);
        const metadata = {
          contentType: blob.type,
          customMetadata: {
            'uploaded-by': user.id || 'anonymous'
          }
        };
        return from(uploadBytes(storageRef, blob, metadata)).pipe(
          switchMap(snapshot => getDownloadURL(snapshot.ref)),
          map(url => [url])
        );
      })
    );
  }
} 