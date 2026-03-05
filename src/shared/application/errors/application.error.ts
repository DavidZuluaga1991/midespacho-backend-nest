export class ApplicationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundApplicationError extends ApplicationError {
  constructor(message: string) {
    super('NOT_FOUND', message);
  }
}

export class ConflictApplicationError extends ApplicationError {
  constructor(message: string) {
    super('CONFLICT', message);
  }
}

export class ValidationApplicationError extends ApplicationError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}

