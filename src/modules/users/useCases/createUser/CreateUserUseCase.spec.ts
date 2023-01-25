import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateUserError } from "./CreateUserError";

let inMemoryUsersRepository : InMemoryUsersRepository;
let createUserUseCase : CreateUserUseCase;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('Should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: "user",
      email: "user_create@test.com",
      password: "1234"
    })

    expect(user).toHaveProperty('id');
  });

  it('Should be not able to create a new user with same email', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "user",
        email: "user_same_email@test.com",
        password: "1234"
      })

      await createUserUseCase.execute({
        name: "user",
        email: "user_same_email@test.com",
        password: "1234"
      })
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
