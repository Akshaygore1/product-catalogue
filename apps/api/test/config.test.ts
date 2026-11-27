import { expect, it } from 'vitest';
import { loadConfig } from '../src/config';

it('applies defaults to blank values, coerces numbers and trims origins', () => {
  expect(
    loadConfig({
      SMTP_HOST: '',
      SMTP_PORT: '587',
      SMTP_SECURE: 'true',
      CORS_ORIGINS: ' http://localhost:5173, , https://catalogue.example.test ',
    }),
  ).toMatchObject({
    SMTP_HOST: 'localhost',
    SMTP_PORT: 587,
    SMTP_SECURE: true,
    TRUST_PROXY: false,
    CORS_ORIGINS: ['http://localhost:5173', 'https://catalogue.example.test'],
  });
});

it('rejects invalid configuration with the offending fields', () => {
  expect(() => loadConfig({ SMTP_PORT: 'oops', TRUST_PROXY: 'yes' })).toThrow(
    /^Invalid configuration:(?=[\s\S]*SMTP_PORT)(?=[\s\S]*TRUST_PROXY)/,
  );
});
