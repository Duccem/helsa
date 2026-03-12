import { Primitives } from "@/modules/shared/domain/primitives";
import { BooleanValueObject, StringValueObject } from "@/modules/shared/domain/value-object";
import { File } from "@/modules/shared/domain/value-objects/file";
import { Timestamp } from "@/modules/shared/domain/value-objects/timestamp";
import { Uuid } from "@/modules/shared/domain/value-objects/uuid";

export class UserId extends Uuid {}
export class UserName extends StringValueObject {}
export class UserEmail extends StringValueObject {}
export class UserEmailVerified extends BooleanValueObject {}
export class UserImage extends File {}
export class UserCreatedAt extends Timestamp {}
export class UserUpdatedAt extends Timestamp {}
export class User {
  constructor(
    public id: UserId,
    public name: UserName,
    public email: UserEmail,
    public emailVerified: UserEmailVerified,
    public image: UserImage | null,
    public createdAt: UserCreatedAt,
    public updatedAt: UserUpdatedAt,
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
    );
  }
}

