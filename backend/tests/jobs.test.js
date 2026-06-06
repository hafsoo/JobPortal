process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let recruiterToken;
let seekerToken;
let jobId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.disconnect();
  await mongoose.connect(uri);

  app = require('../server');

  const rec = await request(app).post('/api/auth/register').send({
    name: 'Recruiter', email: 'rec@test.com', password: '123456', role: 'recruiter'
  });
  recruiterToken = rec.body.token;

  const seek = await request(app).post('/api/auth/register').send({
    name: 'Seeker', email: 'seek@test.com', password: '123456', role: 'jobseeker'
  });
  seekerToken = seek.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Job Routes', () => {

  test('recruiter creates a job', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ title: 'Frontend Dev', description: 'React job', location: 'Lahore', salary: '80k' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Frontend Dev');
    jobId = res.body._id;
  });

  test('get all jobs returns array', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('create job fails without token', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .send({ title: 'No Auth', description: 'Test', location: 'Remote' });
    expect(res.statusCode).toBe(401);
  });

  test('seeker cannot create job', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({ title: 'Seeker Job', description: 'Test', location: 'Remote' });
    expect(res.statusCode).toBe(403);
  });

  test('recruiter deletes own job', async () => {
    const createRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ title: 'Delete Me', description: 'Test', location: 'Remote' });
    const id = createRes.body._id;

    const res = await request(app)
      .delete(`/api/jobs/${id}`)
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.statusCode).toBe(200);
  });

});