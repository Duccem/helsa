import { database } from "@/modules/shared/infrastructure/database/client";
import { UserId, User } from "../../domain/user";
import { UserRepository } from "../../domain/user-repository";
import { eq } from "drizzle-orm";
import { user } from "./auth.schema";

export class DrizzleUserRepository implements UserRepository {
  async get(user_id: UserId): Promise<User | null> {
    const data = await database.query.user.findFirst({
      where: eq(user.id, user_id.value),
    });

    if (!data) {
      return null;
    }

    return User.fromPrimitives(data);
  }
}
