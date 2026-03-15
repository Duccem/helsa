import { Primitives } from "@/modules/shared/domain/primitives";
import { BooleanValueObject, StringValueObject } from "@/modules/shared/domain/value-object";
import { File } from "@/modules/shared/domain/value-objects/file";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";
import { InvalidRole } from "./invalid-role";

export class UserId extends Uuid {}
export class UserName extends StringValueObject {}
export class UserEmail extends StringValueObject {}
export class UserEmailVerified extends BooleanValueObject {}
export class UserImage extends File {}
export class UserCreatedAt extends Timestamp {}
export class UserUpdatedAt extends Timestamp {}
export class UserRole extends StringValueObject {
  validate(): void {
    const validRoles = ["admin", "doctor", "patient"];
    if (!validRoles.includes(this.value)) {
      throw new InvalidRole(this.value);
    }
  }
}
export class UserBanned extends BooleanValueObject {}
export class UserBanReason extends StringValueObject {}
export class UserBanExpires extends Timestamp {}
export class User {
  constructor(
    public id: UserId,
    public name: UserName,
    public email: UserEmail,
    public emailVerified: UserEmailVerified,
    public image: UserImage | null = null,
    public createdAt: UserCreatedAt,
    public updatedAt: UserUpdatedAt,
    public role: UserRole | null = null,
    public banned: UserBanned | null = null,
    public banReason: UserBanReason | null = null,
    public banExpires: UserBanExpires | null = null,
  ) {}

  toPrimitives(): Primitives<User> {
    return {
      id: this.id.value,
      name: this.name.value,
      email: this.email.value,
      emailVerified: this.emailVerified.value,
      image: this.image ? this.image.value : null,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
      role: this.role ? this.role.value : null,
      banned: this.banned ? this.banned.value : null,
      banReason: this.banReason ? this.banReason.value : null,
      banExpires: this.banExpires ? this.banExpires.value : null,
    };
  }

  static fromPrimitives(primitives: Primitives<User>): User {
    return new User(
      UserId.fromString(primitives.id),
      UserName.fromString(primitives.name),
      UserEmail.fromString(primitives.email),
      UserEmailVerified.fromBoolean(primitives.emailVerified),
      primitives.image ? UserImage.fromString(primitives.image) : null,
      UserCreatedAt.fromDate(primitives.createdAt),
      UserUpdatedAt.fromDate(primitives.updatedAt),
      primitives.role ? UserRole.fromString(primitives.role) : null,
      primitives.banned !== null ? UserBanned.fromBoolean(primitives.banned) : null,
      primitives.banReason ? UserBanReason.fromString(primitives.banReason) : null,
      primitives.banExpires ? UserBanExpires.fromDate(primitives.banExpires) : null,
    );
  }

  changeRole(newRole: string) {
    this.role = UserRole.fromString(newRole);
    this.updatedAt = UserUpdatedAt.now();
  }
}

