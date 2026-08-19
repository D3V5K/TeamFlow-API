const request = require('supertest');
const app = require('../app');
require('./setup');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const unique = () => Date.now() + Math.floor(Math.random() * 1000);

describe('User - /api/users', () => {
  const createdUserIds = [];

  afterAll(async () => {
    await Promise.all(createdUserIds.map(id => User.findByIdAndDelete(id)));
  });

  test('GET /me returns user for valid token', async () => {
    const u = unique();
    const email = `ume${u}@ex.com`;
    const username = `ume${u}`;
    const password = 'Password123';

    const r = await request(app).post('/api/auth/register').send({ username, email, password });
    expect(r.status).toBe(201);
    const id = r.body.user._id;
    createdUserIds.push(id);

    const login = await request(app).post('/api/auth/login').send({ email, password });
    const token = login.body.userLogin.token;

    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('_id');
    expect(res.body.user).not.toHaveProperty('password');
  });

  test('Expired token -> 401', async () => {
    const u = unique();
    const email = `exp${u}@ex.com`;
    const username = `exp${u}`;
    const password = 'Password123';

    // create user directly
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    createdUserIds.push(user._id);

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1ms' });
    // wait to ensure token expiry
    await new Promise(r => setTimeout(r, 20));

    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
