import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../shared/infra/typeorm/index';

let connection: Connection;

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close;
  });

  it('Should be able to show user profile', async () => {
    const user = {
      name: "user",
      email: "user_controller_show_user_profile@test.com",
      password: "1234"
    }

    await request(app).post('/api/v1/users').send(user);

    const authResponse = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    const { token } = authResponse.body;

    const profileResponse = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(profileResponse.body).toHaveProperty('id');
  });

  it('Should be not able to show user profile with invalid user', async () => {
    const token = uuidV4();

    const profileResponse = await request(app).get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(profileResponse.status).toBe(401);
  });
});
