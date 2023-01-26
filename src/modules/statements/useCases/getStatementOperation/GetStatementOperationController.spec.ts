import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../shared/infra/typeorm/index';

let connection: Connection;

describe('Get Statement Operation Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close;
  });

  it("Should be able to get statement", async () => {
    const user = {
      name: "user",
      email: "user_controller_get_statement@test.com",
      password: "1234"
    }

    const userResponse = await request(app).post('/api/v1/users').send(user);

    const { id } = userResponse.body;

    const authResponse = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    const { token } = authResponse.body;

    const createdStatement = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        user_id: id,
        amount: 100,
        description: "freela"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id: statement_id } = createdStatement.body;

    const statementResponse = await request(app).get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statementResponse.body).toHaveProperty('id');
  });

  it("Should be not able to get statement with invalid user", async () => {
    const token = "invalid_token";

    const createdStatement = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        user_id: "invalid_user",
        amount: 100,
        description: "freela"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(createdStatement.status).toBe(401);
  });

  it("Should be not able to get invalid statement", async () => {
    const user = {
      name: "user",
      email: "user_controller_get_invalid_statement@test.com",
      password: "1234"
    }

    const userResponse = await request(app).post('/api/v1/users').send(user);

    const { id } = userResponse.body;

    const authResponse = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    const { token } = authResponse.body;

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        user_id: id,
        amount: 100,
        description: "freela"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement_id = uuidV4();

    const statementResponse = await request(app).get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statementResponse.status).toBe(404);
  });
});
