export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(message: string = 'Invalid or expired token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

export class RefreshTokenNotFoundError extends AuthenticationError {
  constructor(message: string = 'Refresh token not found') {
    super(message);
    this.name = 'RefreshTokenNotFoundError';
  }
}
