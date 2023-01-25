import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository : InMemoryUsersRepository;
let createUserUseCase : CreateUserUseCase;
let showUserProfileUseCase : ShowUserProfileUseCase;

describe('Show User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it('Should be able to show user profile', async () => {
    const user = await createUserUseCase.execute({
      name: "user",
      email: "user_show@test.com",
      password: "1234"
    })

    const profile = await showUserProfileUseCase.execute(user.id as string);

    expect(profile).toHaveProperty('id');
  });

  it('Should be not able to show user profile with invalid user', async () => {
    expect(async () => {
      const user = {
        id: "invalid_user",
        name: "user",
        email: "user_show_invalid@test.com",
        password: "1234"
      }

      await showUserProfileUseCase.execute(user.id);
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
