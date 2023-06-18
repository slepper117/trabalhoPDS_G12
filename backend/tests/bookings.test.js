/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import request from 'supertest';
import app from '../app.js';

const endpoint = '/bookings';
const admin = {
  user: process.env.ADMIN_USER,
  pass: process.env.ADMIN_PASS,
};

describe('Integration Tests - List Bookings', () => {
  const tests = [
    {
      type: 'Code',
      code: 200,
      description: 'exists',
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - Booking ${
      test.description
    }`, async () => {
      const response = await request(app)
        .get(endpoint)
        .auth(admin.user, admin.pass);
      expect(response.statusCode).toBe(test.code);
    });
  }
});

describe('Integration Tests - Create Booking', () => {
  const tests = [
    {
      code: 400,
      error: 'must have mandatory fields',
      body: {
        start: '2023-05-05T18:00:00.000Z',
        final: '2023-05-05T24:00:00.000Z',
        description: 'Reunião Teste Sala 1',
      },
    },
    {
      code: 400,
      error: 'start date has to be bigger than end date',
      body: {
        room: 1,
        start: '2023-05-06T18:00:00.000Z',
        final: '2023-05-05T24:00:00.000Z',
        description: 'Reunião Teste Sala 1',
      },
    },
    {
      code: 400,
      error: 'cannot be on same range that other validated',
      body: {
        room: 1,
        start: '2023-05-19T18:00:00.000Z',
        final: '2023-05-19T19:00:00.000Z',
        description: 'Reunião Teste Sala 1',
      },
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - Area ${
      test.description
    }`, async () => {
      const response = await request(app)
        .post(endpoint)
        .auth(admin.user, admin.pass)
        .send(test.body);
      expect(response.statusCode).toBe(test.code);
    });
  }
});

describe('Integration Tests - Read Bookings', () => {
  const tests = [
    {
      type: 'Code',
      code: 200,
      description: 'exists',
      id: 1,
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - Booking ${
      test.description
    }`, async () => {
      const response = await request(app)
        .get(`${endpoint}/${test.id}`)
        .auth(admin.user, admin.pass);
      expect(response.statusCode).toBe(test.code);
    });
  }
});

describe('Integration Tests - Update Booking', () => {
  const tests = [
    {
      code: 400,
      description: 'validated cannot be changed',
      id: 1,
      body: {
        teste: 'teste',
      },
    },
    {
      code: 400,
      description: 'mandatory properties are missing',
      id: 2,
      body: {},
    },
    {
      code: 400,
      description: 'end date has to be bigger than start date',
      id: 2,
      body: {
        start: '2023-05-06T18:00:00.000Z',
        final: '2023-05-05T24:00:00.000Z',
      },
    },
    {
      code: 400,
      error: 'cannot be on same range that other validated',
      id: 2,
      body: {
        room: 1,
      },
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - Booking ${
      test.description
    }`, async () => {
      const response = await request(app)
        .put(`${endpoint}/${test.id}`)
        .auth(admin.user, admin.pass)
        .send(test.body);
      expect(response.statusCode).toBe(test.code);
    });
  }
});

describe('Integration Tests - Delete Bookings', () => {
  const tests = [
    {
      code: 400,
      description: 'cannot have users authorized',
      id: 1,
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - Booking ${
      test.description
    }`, async () => {
      const response = await request(app)
        .del(`${endpoint}/${test.id}`)
        .auth(admin.user, admin.pass);
      expect(response.statusCode).toBe(test.code);
    });
  }
});
