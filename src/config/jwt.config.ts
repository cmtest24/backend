import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'supersecretjwtkey',
  accessTokenExpiresIn: '15m',
  refreshTokenExpiresIn: '7d',
}));
