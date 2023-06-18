/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import request from 'supertest';
import app from '../app.js';

const endpoint = '/access';
const system = {
  user: process.env.SYSTEM_USER,
  pass: process.env.SYSTEM_PASS,
};

describe('Integration Tests - Access ClockIn', () => {
  const tests = [
    {
      code: 404,
      description: 'Tag must exist',
      body: {
        tag: 'eb7177by',
      },
    },
    {
      code: 401,
      description: 'must be on work schedule',
      body: {
        tag: 'eb7177bt',
      },
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - User ${
      test.description
    }`, async () => {
      const response = await request(app)
        .post(`${endpoint}/clockIn`)
        .auth(system.user, system.pass)
        .send(test.body);
      expect(response.statusCode).toBe(test.code);
    });
  }
});

describe('Integration Tests - Access ClockOut', () => {
  const tests = [
    {
      code: 404,
      description: 'Tag must exist',
      body: {
        tag: 'eb7177by',
      },
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - User ${
      test.description
    }`, async () => {
      const response = await request(app)
        .post(`${endpoint}/clockOut`)
        .auth(system.user, system.pass)
        .send(test.body);
      expect(response.statusCode).toBe(test.code);
    });
  }
});

describe('Integration Tests - Access Area', () => {
  const tests = [
    {
      code: 404,
      description: 'Tag must exist',
      id: 1,
      body: {
        tag: 'eb7177by',
      },
    },
    {
      code: 401,
      description: 'must be on work schedule',
      id: 1,
      body: {
        tag: 'eb7177bt',
      },
    },
    {
      code: 401,
      description: 'must have authorization',
      id: 1,
      body: {
        tag: 'eb7177bu',
      },
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - User ${
      test.description
    }`, async () => {
      const response = await request(app)
        .post(`${endpoint}/area/${test.id}`)
        .auth(system.user, system.pass)
        .send(test.body);
      expect(response.statusCode).toBe(test.code);
    });
  }
});

describe('Integration Tests - Access Room', () => {
  const tests = [
    {
      code: 404,
      description: 'Tag must exist',
      id: 2,
      body: {
        tag: 'eb7177by',
      },
    },
    {
      code: 401,
      description: 'must be on work schedule',
      id: 2,
      body: {
        tag: 'eb7177bt',
      },
    },
    {
      code: 404,
      description: 'must have booking',
      id: 2,
      body: {
        tag: 'eb7177bg',
      },
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - User ${
      test.description
    }`, async () => {
      const response = await request(app)
        .post(`${endpoint}/room/${test.id}`)
        .auth(system.user, system.pass)
        .send(test.body);
      expect(response.statusCode).toBe(test.code);
    });
  }
});
