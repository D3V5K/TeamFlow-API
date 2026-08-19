const request = require('supertest');
const app = require('../app');
require('./setup');
const User = require('../models/User');
const RefreshToken = require('../models/refreshToken');

const testUser = { username: 'testuser', email: 'test@example.com', password: 'Password123!' };

const registerAndVerify = async (user = testUser, verify = true) => {
  let payload = user;
  // For default calls, generate a unique user to avoid duplicate key errors across tests
  if (user === testUser) {
    const u = Date.now() + Math.floor(Math.random() * 1000);
    payload = { username: `testuser${u}`, email: `test${u}@example.com`, password: user.password };
  }

  const res = await request(app).post('/api/auth/register').send(payload);
  const created = res.body?.user;
  if (verify && created?._id) {
    await User.findByIdAndUpdate(created._id, { isVerified: true });
    return await User.findById(created._id).lean();
  }
  return created;
};

describe('Auth - /api/auth', () => {
  describe('Login', () => {

    test('Should return 401 if user does not exist', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'noone@example.com',
        password: testUser.password
      });

      expect(res.status).toBe(401);
    });

    test('Should return 401 with invalid password and increment failedAttempts', async () => {
      const created = await registerAndVerify();

      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'BadPassword!'
      });

      expect(res.status).toBe(401);

      const updated = await User.findById(created._id).lean();
      expect(updated).toHaveProperty('failedAttempts');
      expect(updated.failedAttempts).toBeGreaterThanOrEqual(1);
    });

    test('Should return 403 if account is blocked', async () => {
      const created = await registerAndVerify();
      await User.findByIdAndUpdate(created._id, { isBlocked: true });

      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password
      });

      expect(res.status).toBe(403);
    });

    test('Should return 403 if email is not verified', async () => {
      // register without verifying
      const created = await registerAndVerify(testUser, false);

      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password
      });

      expect(res.status).toBe(403);
    });
  });

  describe('Refresh token', () => {
    test('Should refresh access token successfully using refreshToken from cookie', async () => {
      await registerAndVerify();

      const loginRes = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password
      });

      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookies)
        .send();

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body).toHaveProperty('accessToken');
    });

    test('Should return 401 if no refresh token provided', async () => {
      const res = await request(app).post('/api/auth/refresh').send();
      expect(res.status).toBe(401);
    });

    test('Should return 401 if refresh token is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalidtoken'])
        .send();

      expect(res.status).toBe(401);
    });
  });

  describe('Logout', () => {
    test('Should logout successfully and clear cookie and delete refresh token', async () => {
      await registerAndVerify();

      const loginRes = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password
      });

      const cookies = loginRes.headers['set-cookie'];
      const accessToken = loginRes.body.accessToken;

      // Ensure refresh token exists in DB
      const tokenString = cookies[0].split(';')[0].split('=')[1];
      let stored = await RefreshToken.findOne({ token: tokenString });
      expect(stored).toBeTruthy();

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', cookies)
        .send();

      expect(res.status).toBe(200);

      stored = await RefreshToken.findOne({ token: tokenString });
      expect(stored).toBeFalsy();
    });

    test('Should return 401 if trying to logout without authentication', async () => {
      const res = await request(app).post('/api/auth/logout').send();
      expect(res.status).toBe(401);
    });
  });

  describe('Logout All', () => {
    test('Should logout from all devices and delete all refresh tokens', async () => {
      await registerAndVerify();

      // login twice to create two refresh tokens
      const loginA = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
      const cookieA = loginA.headers['set-cookie'];

      const loginB = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
      const cookieB = loginB.headers['set-cookie'];

      const tokens = await RefreshToken.find({});
      expect(tokens.length).toBeGreaterThanOrEqual(2);

      const res = await request(app)
        .post('/api/auth/logout-all')
        .set('Authorization', `Bearer ${loginA.body.accessToken}`)
        .send();

      expect(res.status).toBe(200);

      const remaining = await RefreshToken.find({});
      expect(remaining.length).toBe(0);
    });
  });

  describe('Get Me', () => {
    test('Should return current user info', async () => {
      await registerAndVerify();
      const loginRes = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).not.toHaveProperty('password');
    });

    test('Should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/auth/me').send();
      expect(res.status).toBe(401);
    });
  });

  describe('Security tests', () => {
    test('Should not return password in any response', async () => {
      await registerAndVerify();
      const loginRes = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });

      expect(loginRes.body.user).not.toHaveProperty('password');

      const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${loginRes.body.accessToken}`);
      expect(meRes.body.user).not.toHaveProperty('password');
    });

    test('Should have HttpOnly cookie flag', async () => {
      await registerAndVerify();
      const loginRes = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
      const cookies = loginRes.headers['set-cookie'];
      expect(cookies.join(';')).toMatch(/HttpOnly/i);
    });

    test('Should have secure cookie flag in production', async () => {
      // toggle production env
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await registerAndVerify({ username: 'produser', email: 'prod@example.com', password: 'Password123!' });
      const loginRes = await request(app).post('/api/auth/login').send({ email: 'prod@example.com', password: 'Password123!' });

      const cookies = loginRes.headers['set-cookie'];
      expect(cookies.join(';')).toMatch(/Secure/i);

      process.env.NODE_ENV = original;
    });
  });
});

