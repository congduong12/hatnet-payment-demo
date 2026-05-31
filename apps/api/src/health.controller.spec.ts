import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('returns the API smoke contract', () => {
    const response = new HealthController().health();

    expect(response.status).toBe('ok');
    expect(response.service).toBe('hatnet-api');
    expect(Date.parse(response.timestamp)).not.toBeNaN();
  });
});
