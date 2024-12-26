import { StringValueObject } from '@helsa/ddd/core/value-object';
import { Uuid } from '@helsa/ddd/core/value-objects/uuid';
import { User } from './user';
import { UserEmail } from './user-email';

export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: UserEmail): Promise<User | null>;
  findById(id: StringValueObject): Promise<User | null>;
  delete(id: Uuid): Promise<void>;
}
