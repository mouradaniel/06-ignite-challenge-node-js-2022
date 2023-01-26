import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../shared/infra/typeorm/index';

let connection: Connection;

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close;
  });

  it('Should be able to create a new statement', async () => {
    const user = {
      name: "user",
      email: "user_controller_new_statement@test.com",
      password: "1234"
    }

    const userResponse = await request(app).post('/api/v1/users').send(user);

    const { id } = userResponse.body;

    const authResponse = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    const { token } = authResponse.body;

    const statementResponse = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        user_id: id,
        amount: 100,
        description: "restaurant"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statementResponse.status).toBe(201);
  });

  it('Should not be able to create a new statement with invalid session', async () => {
    const token = "invalid_token";

    const statementResponse = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        user_id: "invalid_user",
        amount: 100,
        description: "restaurant"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statementResponse.status).toBe(401);
  });

  it('Should not be able to make a withdrawal with insufficient balance', async () => {
    const user = {
      name: "user",
      email: "user_controller_invalid@test.com",
      password: "1234"
    }

    const userResponse = await request(app).post('/api/v1/users').send(user);

    const { id } = userResponse.body;

    const authResponse = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    const { token } = authResponse.body;

    const statementResponse = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        user_id: id,
        amount: 100,
        description: "restaurant"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statementResponse.status).toBe(400);
  });
});
