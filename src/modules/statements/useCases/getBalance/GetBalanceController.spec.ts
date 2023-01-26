import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../shared/infra/typeorm/index';

let connection: Connection;

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close;
  });

  it('Should be able to get balance', async () => {
    const user = {
      name: "user",
      email: "user_controller_get_balance@test.com",
      password: "1234"
    }

    await request(app).post('/api/v1/users').send(user);

    const authResponse = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    const { token } = authResponse.body;

    const balanceResponse = await request(app).get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { balance, statement } = balanceResponse.body;

    expect(balanceResponse.status).toBe(200);
    expect(balance).toEqual(0);
    expect(statement).toHaveLength(0);
  });

  it('Should be not able to get balance with invalid user', async () => {
    const token = uuidV4();

    const balanceResponse = await request(app).get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(balanceResponse.status).toBe(401);
  });
});
