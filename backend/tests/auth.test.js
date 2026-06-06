process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // disconnect from real DB first
  await mongoose.disconnect();

  // connect to memory DB
  await mongoose.connect(uri);

  // load app AFTER connecting to memory DB
  app = require('../server');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // clear all collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Auth Routes', () => {

  test('register new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@test.com',
      password: '123456',
      role: 'jobseeker'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@test.com');
  });

  test('duplicate email fails', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'User A', email: 'dup@test.com', password: '123456', role: 'jobseeker'
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'User B', email: 'dup@test.com', password: '123456', role: 'recruiter'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email already registered');
  });

  test('login with correct credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User', email: 'login@test.com', password: 'mypass', role: 'recruiter'
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com', password: 'mypass'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('login with wrong password fails', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User', email: 'login2@test.com', password: 'mypass', role: 'recruiter'
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'login2@test.com', password: 'wrongpass'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

});