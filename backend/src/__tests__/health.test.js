/**
 * Integration tests for the API health check endpoint.
 * These verify the server starts and responds correctly.
 */
const request = require('supertest');
const app = require('../index');

describe('GET /api/health', () => {
  it('returns status ok and timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});
