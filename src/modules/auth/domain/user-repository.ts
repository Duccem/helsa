import { User, UserId } from "./user";

export interface UserRepository {
  get(user_id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}

