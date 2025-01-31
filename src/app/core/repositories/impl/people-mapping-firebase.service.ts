import { Inject, Injectable } from "@angular/core";
import { IBaseMapping } from "../intefaces/base-mapping.interface";
import { Paginated } from "../../models/paginated.model";
import { Person } from "../../models/person.model";
import { doc, DocumentReference, Firestore, getFirestore } from "firebase/firestore";
import { FIREBASE_CONFIG_TOKEN } from "../repository.tokens";
import { initializeApp } from "firebase/app";
import { FirebasePerson } from '../../models/firebase/firebase-person.model';

@Injectable({
  providedIn: 'root'
})
export class PeopleMappingFirebaseService implements IBaseMapping<Person> {
    

  private genderMapping: any = {
    male: 'Masculino',
    female: 'Femenino',
    other: 'Otros'
  };

  private reverseGenderMapping: any = {
    'Masculino': 'male',
    'Femenino': 'female',
    'Otros': 'other'
  };

  private db: Firestore;

  constructor(@Inject(FIREBASE_CONFIG_TOKEN) protected firebaseConfig: any){
        this.db = getFirestore(initializeApp(firebaseConfig));
  }

  setAdd(data: Person): FirebasePerson {
    let dataMapping:FirebasePerson = {
      name: data.name,
      surname: data.surname,
      gender: data.gender ? this.reverseGenderMapping[data.gender] : '',
      user: data.userId || '',
      picture: data.picture ? data.picture.url : ''
    };
    if(dataMapping.groupId){
      dataMapping.groupId = doc(this.db, 'groups', data.groupId || '');
    }
    return dataMapping;
  }

  setUpdate(data: Partial<Person>): FirebasePerson {
    const result: any = {};
    
    if (data.name) result.name = data.name;
    if (data.surname) result.surname = data.surname;
    if (data.gender) result.gender = this.reverseGenderMapping[data.gender];
    if (data.groupId) result.groupId = doc(this.db, 'groups', data.groupId || '');
    if (data.userId) result.user = data.userId || '';
    if (data.picture) result.picture = data.picture.url;

    return result;
  }

  getOne(data: { id: string } & FirebasePerson): Person {
    return {
      id: data.id,
      name: data.name,
      surname: data.surname,
      age: data.age,
      gender: data.gender,
      groupId: data.groupId?.id,
      userId: data.user || '',
      picture: data.picture ? {
        url: data.picture,
        large: data.picture,
        medium: data.picture,
        small: data.picture,
        thumbnail: data.picture
      } : undefined
    };
  }

  getPaginated(page: number, pageSize: number, total: number, data: ({id:string} & FirebasePerson)[]): Paginated<Person> {
    return {
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
      data: data.map(item => this.getOne(item))
    };
  }

  getAdded(data: {id:string} & FirebasePerson): Person {
    return this.getOne(data);
  }

  getUpdated(data: {id:string} & FirebasePerson): Person {
    return this.getOne(data);
  }

  getDeleted(data: {id:string} & FirebasePerson): Person {
    return this.getOne(data);
  }
} 