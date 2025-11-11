import { User } from '@domain/entities/User';
import { UserId } from '@domain/value-objects/UserId';
import { Email } from '@domain/value-objects/Email';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: UserId): Promise<void>;
  exists(email: Email): Promise<boolean>;
}
