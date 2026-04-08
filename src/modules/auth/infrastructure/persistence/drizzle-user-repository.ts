import { database } from "@/modules/shared/infrastructure/database/client";
import { UserId, User } from "../../domain/user";
import { UserRepository } from "../../domain/user-repository";
import { eq } from "drizzle-orm";
import { user } from "./auth.schema";
import { InfrastructureService } from "@/modules/shared/domain/service.";
@InfrastructureService()
export class DrizzleUserRepository extends UserRepository {
  async get(user_id: UserId): Promise<User | null> {
    const data = await database.query.user.findFirst({
      where: eq(user.id, user_id.value),
    });

    if (!data) {
      return null;
    }

    return User.fromPrimitives(data);
  }

  async save(payload: User): Promise<void> {
    await database
      .update(user)
      .set({
        role: payload.role ? payload.role.value : null,
      })
      .where(eq(user.id, payload.id.value));
  }
}

