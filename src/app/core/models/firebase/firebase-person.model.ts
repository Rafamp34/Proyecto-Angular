import { DocumentReference } from "firebase/firestore";

export interface FirebasePerson {
  name: string;
  surname: string;
  age?: number;
  gender: string;
  user: string;
  groupId?: DocumentReference;
  picture?: string;
} 