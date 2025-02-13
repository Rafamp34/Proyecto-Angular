// src/app/interfaces/user-mapping.interface.ts
import { User } from '../../models/user.model';
import { Paginated } from '../../models/paginated.model';

export interface IUserMapping {
  getOne(data: any): User;
  getPaginated(page: number, pageSize: number, pages: number, data: any[]): Paginated<User>;
  setAdd(user: User): any;
  setUpdate(user: Partial<User>): any;
  getAdded(data: any): User;
  getUpdated(data: any): User;
  getDeleted(data: any): User;
}
