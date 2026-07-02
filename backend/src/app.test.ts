import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app';

describe('API', () => {
  const app = createApp();

  it('GET /artists returns a JSON list of artists', async () => {
    const response = await request(app).get('/artists');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /albums/:id returns 404 for an unknown album', async () => {
    const response = await request(app).get('/albums/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  it('GET /labels?country=GB filters by country', async () => {
    const response = await request(app).get('/labels').query({ country: 'GB' });

    expect(response.status).toBe(200);
    expect(response.body.every((label: { country: string }) => label.country === 'GB')).toBe(
      true,
    );
  });
});
