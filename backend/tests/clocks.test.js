/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import request from 'supertest';
import app from '../app.js';

const endpoint = '/clocks';
const admin = {
  user: process.env.ADMIN_USER,
  pass: process.env.ADMIN_PASS,
};

describe('Integration Tests - List Clocks', () => {
  const tests = [
    {
      type: 'Code',
      code: 200,
      description: 'exists',
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - Clock ${
      test.description
    }`, async () => {
      const response = await request(app)
        .get(endpoint)
        .auth(admin.user, admin.pass);
      expect(response.statusCode).toBe(test.code);
    });
  }
});

describe('Integration Tests - Create Clocks', () => {
  const tests = [
    {
      code: 400,
      description: 'must have mandatory fields',
      body: {
        teste: 'teste',
      },
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - Clock ${
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

describe('Integration Tests - Read Clocks', () => {
  const tests = [
    {
      type: 'Code',
      code: 200,
      description: 'exists',
      id: 1,
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - Clock ${
      test.description
    }`, async () => {
      const response = await request(app)
        .get(`${endpoint}/${test.id}`)
        .auth(admin.user, admin.pass);
      expect(response.statusCode).toBe(test.code);
    });
  }
});

describe('Integration Tests - Update Clocks', () => {
  const tests = [
    {
      code: 400,
      description: 'must have mandatory fields',
      id: 1,
      body: {},
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - Clock ${
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

describe('Integration Tests - Delete Clock', () => {
  const tests = [
    {
      code: 404,
      description: 'must exist',
      id: 100,
    },
  ];

  for (const test of tests) {
    it(`${test.type || 'Error'} ${test.code} - Clock ${
      test.description
    }`, async () => {
      const response = await request(app)
        .del(`${endpoint}/${test.id}`)
        .auth(admin.user, admin.pass);
      expect(response.statusCode).toBe(test.code);
    });
  }
});
