import { UserStore, User } from '../../src/models/user';
import client from '../../src/database';

const store = new UserStore();
let testUser: User;

describe('User Model', () => {
  beforeEach(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE users RESTART IDENTITY CASCADE;');
    conn.release();

    testUser = await store.create({
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    });
  });

  it('should have a create method', () => {
    expect(store.create).toBeDefined();
  });

  it('create method should add a new user', async () => {
    expect(testUser.firstName).toEqual('Test');
    expect(testUser.lastName).toEqual('User');
    expect(testUser.id).toBeDefined();
  });

  it('should have an index method', () => {
    expect(store.index).toBeDefined();
  });

  it('index method should return a list containing the created user', async () => {
    const result = await store.index();
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual(testUser.id);
    expect(result[0].firstName).toEqual('Test');
  });

  it('should have a show method', () => {
    expect(store.show).toBeDefined();
  });

  it('show method should return the correct user', async () => {
    const result = await store.show(testUser.id!.toString());
    expect(result.id).toEqual(testUser.id);
    expect(result.firstName).toEqual('Test');
    expect(result.lastName).toEqual('User');
  });

  it('should have a delete method', () => {
    expect(store.delete).toBeDefined();
  });

  it('delete method should remove the user', async () => {
    await store.delete(testUser.id!.toString());
    const result = await store.index();
    expect(result.length).toEqual(0);
  });

  afterAll(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE users RESTART IDENTITY CASCADE;');
    conn.release();
  });
});
