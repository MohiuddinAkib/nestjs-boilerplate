import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_AUTH_USER,
  password: process.env.EMAIL_AUTH_PASSWORD,
  secure: JSON.parse(process.env.EMAIL_SECURE),
}));
