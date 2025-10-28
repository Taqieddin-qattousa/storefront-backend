/// <reference types="jasmine" />

import supertest from 'supertest';
import app from '../../src/server';
import { UserStore, User } from '../../src/models/user';
import client from '../../src/database';

const request = supertest(app);
const userStore = new UserStore();

let token: string;
let testUser: User;

describe('User Handler Endpoints', () => {
  beforeEach(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE users RESTART IDENTITY CASCADE;');
    conn.release();

    testUser = await userStore.create({
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    });

    const authResponse = await request.post('/users').send({
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    });
    token = authResponse.body.token;

    if (!token) {
      throw new Error('Could not obtain JWT token for user testing');
    }
  });

  it('POST /users should create a new user and return a token', async () => {
    const newUser = {
      firstName: 'Jane',
      lastName: 'Doe',
      password: 'newPassword456',
    };
    const response = await request.post('/users').send(newUser);

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('GET /users should return a list of users (requires token)', async () => {
    const response = await request
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    const foundUser = response.body.find((u: User) => u.id === testUser.id);
    expect(foundUser).toBeDefined();
    expect(foundUser?.firstName).toEqual('Test');
    expect(foundUser?.lastName).toEqual('User');
  });

  it('GET /users should return 401 if no token is provided', async () => {
    const response = await request.get('/users');
    expect(response.status).toBe(401);
  });

  it('GET /users/:id should return the correct user (requires token)', async () => {
    const response = await request
      .get(`/users/${testUser.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(testUser.id);
    expect(response.body.firstName).toEqual('Test');
    expect(response.body.lastName).toEqual('User');
    expect(response.body.password).toBeUndefined();
  });

  it('GET /users/:id should return 401 if no token is provided', async () => {
    const response = await request.get(`/users/${testUser.id}`);
    expect(response.status).toBe(401);
  });

  it('GET /users/:id should handle non-existent user ID (requires token)', async () => {
    const nonExistentId = 9999;
    const response = await request
      .get(`/users/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it('GET /users/:id should include recentPurchases array', async () => {
    const response = await request
      .get(`/users/${testUser.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.recentPurchases).toBeDefined();
    expect(Array.isArray(response.body.recentPurchases)).toBeTrue();
  });

  it('DELETE /users/:id should delete a user (requires token)', async () => {
    const newUserResponse = await request.post('/users').send({
      firstName: 'ToDelete',
      lastName: 'User',
      password: 'password',
    });
    const newToken = newUserResponse.body.token;

    const usersBeforeDelete = await request
      .get('/users')
      .set('Authorization', `Bearer ${token}`);
    const userCount = usersBeforeDelete.body.length;

    const userToDelete = usersBeforeDelete.body.find(
      (u: User) => u.firstName === 'ToDelete'
    );

    const deleteResponse = await request
      .delete(`/users/${userToDelete.id}`)
      .set('Authorization', `Bearer ${newToken}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.id).toEqual(userToDelete.id);

    const usersAfterDelete = await request
      .get('/users')
      .set('Authorization', `Bearer ${token}`);
    expect(usersAfterDelete.body.length).toEqual(userCount - 1);
  });

  it('DELETE /users/:id should return 401 if no token is provided', async () => {
    const response = await request.delete(`/users/${testUser.id}`);
    expect(response.status).toBe(401);
  });

  afterAll(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE users RESTART IDENTITY CASCADE;');
    conn.release();
  });
});
