import { Enum } from '@helsa/ddd/core/value-objects/enum';

export enum UserRoleValue {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  UNDEFINED = 'UNDEFINED',
  HOSPITAL = 'HOSPITAL',
}
export class UserRole extends Enum<UserRoleValue> {
  constructor(value: UserRoleValue) {
    super(value, Object.values(UserRoleValue));
  }

  static Undefined(): UserRole {
    return new UserRole(UserRoleValue.UNDEFINED);
  }

  static Doctor(): UserRole {
    return new UserRole(UserRoleValue.DOCTOR);
  }
}
