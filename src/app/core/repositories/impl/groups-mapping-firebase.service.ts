import { Inject, Injectable } from '@angular/core';
import { IBaseMapping } from '../intefaces/base-mapping.interface';
import { Group } from '../../models/group.model';
import { Paginated } from '../../models/paginated.model';
import { FirebaseGroup } from '../../models/firebase/firebase-group.model';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG_TOKEN } from '../repository.tokens';
import { initializeApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class GroupsMappingFirebaseService implements IBaseMapping<Group> {
  

  private db: Firestore;

  constructor(@Inject(FIREBASE_CONFIG_TOKEN) protected firebaseConfig: any){
        this.db = getFirestore(initializeApp(firebaseConfig));
  }
  getOne(data: { id: string } & FirebaseGroup): Group {
    return {
      id: data.id,
      name: data.name
    };
  }

  getPaginated(page: number, pageSize: number, pages: number, data: ({ id: string } & FirebaseGroup)[]): Paginated<Group> {
    return {
      page,
      pageSize,
      pages,
      data: data.map(item => this.getOne(item))
    };
  }

  setAdd(data: Group): FirebaseGroup {
    return {
      name: data.name
    };
  }

  setUpdate(data: Group): FirebaseGroup {
    return {
      name: data.name
    };
  }

  getAdded(data:{id:string} & FirebaseGroup): Group {
    return this.getOne(data);
  }

  getUpdated(data:{id:string} & FirebaseGroup): Group {
    return this.getOne(data);
  }

  getDeleted(data:{id:string} & FirebaseGroup): Group {
    return this.getOne(data);
  }
} 