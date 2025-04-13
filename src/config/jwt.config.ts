import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'supersecretkey',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
}));
