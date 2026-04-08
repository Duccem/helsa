import { User, UserId } from "./user";

export abstract class UserRepository {
  abstract get(user_id: UserId): Promise<User | null>;
  abstract save(user: User): Promise<void>;
}

