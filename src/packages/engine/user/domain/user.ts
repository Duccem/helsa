import { Aggregate } from '@helsa/ddd/core/aggregate';
import { BooleanValueObject, DateValueObject, OptionalString, StringValueObject } from '@helsa/ddd/core/value-object';
import { Uuid } from '@helsa/ddd/core/value-objects/uuid';
import { Primitives } from '@helsa/ddd/types/primitives';
import { UserEmail } from './user-email';
import { UserRole, UserRoleValue } from './user-role';

export class User extends Aggregate {
  constructor(
    id: Uuid,
    public email: UserEmail,
    public role: UserRole,
    public name: StringValueObject,
    public emailVerified: BooleanValueObject,
    public bio: OptionalString,
    public image: OptionalString,
    createdAt: DateValueObject,
    updatedAt: DateValueObject
  ) {
    super(id, createdAt, updatedAt);
  }

  public static Create(id: string, email: string, role: string, name: string, bio?: string): User {
    const user = new User(
      new Uuid(id),
      new UserEmail(email),
      new UserRole(role as UserRoleValue),
      new StringValueObject(name),
      new BooleanValueObject(false),
      new OptionalString(bio || ''),
      new OptionalString(''),
      DateValueObject.today(),
      DateValueObject.today()
    );

    return user;
  }

  public static fromPrimitives(data: Primitives<User>) {
    return new User(
      new Uuid(data.id),
      new UserEmail(data.email),
      new UserRole(data.role),
      new StringValueObject(data.name),
      new BooleanValueObject(data.emailVerified),
      new OptionalString(data.bio),
      new OptionalString(data.image),
      new DateValueObject(data.createdAt),
      new DateValueObject(data.updatedAt)
    );
  }

  toPrimitives(): Primitives<User> {
    return {
      id: this.id.value,
      email: this.email.value,
      role: this.role.value,
      name: this.name.value,
      emailVerified: this.emailVerified.value,
      bio: this.bio.value,
      image: this.image.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
    };
  }

  updateRole(role: UserRoleValue) {
    this.role = new UserRole(role);
  }
}
