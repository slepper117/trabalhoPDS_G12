/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import request from 'supertest';
import app from '../app.js';

const endpoint = '/auth';

describe('Integration Tests - Auth', () => {
  const tests = [
    {
      code: 400,
      description: 'dosent have the mandatory props',
      body: {
        username: 'username',
      },
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - Login ${
      test.description
    }`, async () => {
      const response = await request(app)
        .post(`${endpoint}/login`)
        .send(test.body);
      expect(response.statusCode).toBe(test.code);
    });
  }
});
