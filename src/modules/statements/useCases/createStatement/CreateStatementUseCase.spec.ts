import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository : InMemoryUsersRepository;
let inMemoryStatementsRepository : InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase : CreateUserUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('Should be able to create a new statement', async () => {
    const user = await createUserUseCase.execute({
      name: "admin",
      email: "admin@test.com",
      password: "1234"
    })

    const statement = {
      user_id: user.id as string,
      type: "deposit" as OperationType,
      amount: 100,
      description: "freela"
    };

    const createdStatement = await createStatementUseCase.execute(statement);

    expect(createdStatement).toHaveProperty('id');
  });

  it('Should not be able to create a new statement without user', async () => {
    expect(async () => {
      const statement = {
        user_id: "invalid_user",
        type: "deposit" as OperationType,
        amount: 100,
        description: "freela"
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('Should not be able to make a withdrawal with insufficient balance', async () => {
    const user = await createUserUseCase.execute({
      name: "admin",
      email: "admin@test.com",
      password: "1234"
    })

    expect(async () => {
      const statement = {
        user_id: user.id as string,
        type: "withdraw" as OperationType,
        amount: 200,
        description: "internet"
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
