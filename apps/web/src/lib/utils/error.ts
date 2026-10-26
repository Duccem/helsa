export abstract class CommonError extends Error {
  readonly parameters?: Record<string, unknown>;
  constructor(message: string, parameters?: Record<string, unknown>) {
    super();
    this.parameters = parameters;
    this.message = message;
  }
}

export class AuthError extends CommonError {
  constructor() {
    super("You are not authorized or authenticated");
  }
}

export class OrganizationError extends CommonError {
  constructor() {
    super("You no longer belong to an organization");
  }
}

export class NotPermissions extends CommonError {
  constructor() {
    super("You don`t have the permissions to perform this action");
  }
}