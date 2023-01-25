import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository : InMemoryUsersRepository;
let inMemoryStatementsRepository : InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase : CreateUserUseCase;
let getBalanceUseCase : GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Balance', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it('Should be able to get balance', async () => {
    const user = await createUserUseCase.execute({
      name: "user",
      email: "user_balance@test.com",
      password: "1234"
    })

    const balance = await getBalanceUseCase.execute({ user_id: user.id as string });

    expect(balance).toHaveProperty('balance');
    expect(balance.balance).toEqual(0);
    expect(balance).toHaveProperty('statement');
    expect(balance.statement).toHaveLength(0);
  });

  it('Should be not able to get balance with invalid user', async () => {
    expect(async () => {
      const user = {
        id: "invalid_user",
        name: "user",
        email: "user_invalid_balance@test.com",
        password: "1234"
      }

      await getBalanceUseCase.execute({ user_id: user.id });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
