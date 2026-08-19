const request = require('supertest');
const app = require('../app');
require('./setup');
const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const unique = () => Date.now() + Math.floor(Math.random() * 1000);

async function createUserAndToken(role = 'DEVELOPER') {
  // retry on duplicate key errors to avoid flaky collisions
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const u = unique();
      const email = `tuser${u}@ex.com`;
      const username = `tuser${u}`;
      const password = 'Password123';
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashed, role });
      // ensure user is marked verified so login in tests succeeds
      await User.findByIdAndUpdate(user._id, { isVerified: true });

      const login = await request(app).post('/api/auth/login').send({ email, password });
      const token = login.body.userLogin.token;

      return { user, token, password };
    } catch (err) {
      if (err?.code === 11000) {
        // try again with a new unique value
        continue;
      }
      throw err;
    }
  }
  throw new Error('Failed to create unique test user after retries');
}

describe('Tasks API - /api/tasks', () => {
  const users = [];
  const tasks = [];

  afterAll(async () => {
    // cleanup created tasks and users
    await Promise.all(tasks.map(t => Task.findByIdAndDelete(t._id)));
    await Promise.all(users.map(u => User.findByIdAndDelete(u._id)));
  });

  test('GET /tasks without token -> 401', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  test('GET /tasks with valid token -> 200 and pagination', async () => {
    const { user, token } = await createUserAndToken();
    users.push(user);

    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tasks');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('page');
  });

  test('GET /tasks invalid page -> 400', async () => {
    const { user, token } = await createUserAndToken();
    users.push(user);

    const res = await request(app).get('/api/tasks?page=0').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('GET /tasks invalid limit -> 400', async () => {
    const { user, token } = await createUserAndToken();
    users.push(user);

    const res = await request(app).get('/api/tasks?limit=abc').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('GET /tasks limit >100 -> 400', async () => {
    const { user, token } = await createUserAndToken();
    users.push(user);

    const res = await request(app).get('/api/tasks?limit=101').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('GET /tasks invalid sort -> 400', async () => {
    const { user, token } = await createUserAndToken();
    users.push(user);

    const res = await request(app).get('/api/tasks?sort=-name').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('GET /tasks invalid fields -> 400', async () => {
    const { user, token } = await createUserAndToken();
    users.push(user);

    const res = await request(app).get('/api/tasks?fields=badfield').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('Create task requires proper role -> 403 for DEVELOPER', async () => {
    const { user, token } = await createUserAndToken('DEVELOPER');
    users.push(user);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task 1' });

    expect(res.status).toBe(403);
  });

  test('POST /tasks with valid role creates task -> 201', async () => {
    const { user, token } = await createUserAndToken('TEAM_LEADER');
    users.push(user);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Task', description: 'desc' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('task');
    expect(res.body.task).toHaveProperty('title', 'My Task');
    expect(res.body.task).toHaveProperty('createdBy');
    expect(res.body.task.createdBy.toString()).toEqual(user._id.toString());
    tasks.push(res.body.task);
  });

  test('POST /tasks missing title -> 400', async () => {
    const { user, token } = await createUserAndToken('TEAM_LEADER');
    users.push(user);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'no title' });

    expect(res.status).toBe(400);
  });

  test('POST /tasks invalid title -> 400', async () => {
    const { user, token } = await createUserAndToken('TEAM_LEADER');
    users.push(user);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'ab' });

    expect(res.status).toBe(400);
  });

  test('POST /tasks invalid status -> 400', async () => {
    const { user, token } = await createUserAndToken('TEAM_LEADER');
    users.push(user);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Valid title', status: 'UNKNOWN' });

    expect(res.status).toBe(400);
  });

  test('POST /tasks unknown fields -> 400', async () => {
    const { user, token } = await createUserAndToken('TEAM_LEADER');
    users.push(user);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Valid title', extra: 'notallowed' });

    expect(res.status).toBe(400);
  });

  test('attempting to set createdBy in body is rejected (validation)', async () => {
    const { user, token } = await createUserAndToken('TEAM_LEADER');
    users.push(user);

    const fakeOwner = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Owner Test', createdBy: fakeOwner });

    // `createdBy` is not an allowed field in the create schema -> validation should reject it
    expect(res.status).toBe(400);
  });

  test('GET /tasks/:id valid, invalid id and not found', async () => {
    const { user, token } = await createUserAndToken('TEAM_LEADER');
    users.push(user);

    const r = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'GetById Task' });
    expect(r.status).toBe(201);
    const created = r.body.task;
    tasks.push(created);

    const ok = await request(app).get(`/api/tasks/${created._id}`).set('Authorization', `Bearer ${token}`);
    expect(ok.status).toBe(200);

    const invalid = await request(app).get('/api/tasks/123').set('Authorization', `Bearer ${token}`);
    expect(invalid.status).toBe(400);

    const nonexistId = new mongoose.Types.ObjectId();
    const nf = await request(app).get(`/api/tasks/${nonexistId}`).set('Authorization', `Bearer ${token}`);
    expect(nf.status).toBe(404);
  });

  test('Unauthorized update by non-owner -> 403', async () => {
    const owner = await createUserAndToken('TEAM_LEADER');
    users.push(owner.user);
    const r = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Owner Task' });
    expect(r.status).toBe(201);
    const created = r.body.task;
    tasks.push(created);

    const other = await createUserAndToken('DEVELOPER');
    users.push(other.user);

    const upd = await request(app)
      .patch(`/api/tasks/${created._id}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ title: 'Hacked' });

    // Non-owner update is implemented as a not-found (no matching createdBy), expect 404
    expect(upd.status).toBe(404);
  });

  test('DELETE authorization and success for ADMIN', async () => {
    // admin creates task and then deletes it
    const admin = await createUserAndToken('ADMIN');
    users.push(admin.user);

    const r = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ title: 'Admin Task' });
    expect(r.status).toBe(201);
    const created = r.body.task;

    const del = await request(app)
      .delete(`/api/tasks/${created._id}`)
      .set('Authorization', `Bearer ${admin.token}`);

    expect(del.status).toBe(200);
  });

  test('GET /tasks search, filter, empty results', async () => {
    const leader = await createUserAndToken('TEAM_LEADER');
    users.push(leader.user);

    const t1 = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${leader.token}`)
      .send({ title: 'UniqueSearchTitleXYZ', status: 'PENDING' });
    tasks.push(t1.body.task);

    const sf = await request(app)
      .get('/api/tasks?search=UniqueSearchTitleXYZ')
      .set('Authorization', `Bearer ${leader.token}`);
    expect(sf.status).toBe(200);
    expect(sf.body.tasks.length).toBeGreaterThan(0);

    const filt = await request(app)
      .get('/api/tasks?status=PENDING')
      .set('Authorization', `Bearer ${leader.token}`);
    expect(filt.status).toBe(200);
    expect(filt.body.tasks.length).toBeGreaterThan(0);

    const empty = await request(app)
      .get('/api/tasks?search=no-match-abcdef')
      .set('Authorization', `Bearer ${leader.token}`);
    expect(empty.status).toBe(200);
    expect(empty.body.tasks.length).toBe(0);
  });
});

