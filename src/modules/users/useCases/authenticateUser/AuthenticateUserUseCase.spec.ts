import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository : InMemoryUsersRepository;
let createUserUseCase : CreateUserUseCase;
let authenticateUserUseCase : AuthenticateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it('Should be able to authenticate user', async () => {
    const user = {
      name: "user",
      email: "user_auth@test.com",
      password: "1234"
    }

    await createUserUseCase.execute(user);

    const authenticate = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    })

    expect(authenticate).toHaveProperty('token');
  });

  it('Should be not able to authenticate user with invalid user', async () => {
    expect(async () => {
      const user = {
        name: "user",
        email: "user_auth_invalid_password@test.com",
        password: "1234"
      }

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "invalid password"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('Should be not able to authenticate user with invalid password', async () => {
    expect(async () => {
      const user = {
        name: "user",
        email: "user_auth_invalid@test.com",
        password: "1234"
      }

      await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
