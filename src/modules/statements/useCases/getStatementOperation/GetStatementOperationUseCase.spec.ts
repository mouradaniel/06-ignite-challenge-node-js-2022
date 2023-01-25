import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository : InMemoryUsersRepository;
let inMemoryStatementsRepository : InMemoryStatementsRepository;
let createStatementUseCase : CreateStatementUseCase;
let createUserUseCase : CreateUserUseCase;
let getStatementOperationUseCase : GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it("Should be able to get statement", async () => {
    const user = await createUserUseCase.execute({
      name: "user",
      email: "user_get_statement@test.com",
      password: "1234"
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: "deposit" as OperationType,
      amount: 20000,
      description: "salary"
    });

    const getStatement = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    })

    expect(getStatement).toHaveProperty('id');
  })

  it("Should be not able to get statement with invalid user", () => {
    expect(async () => {
      const user = {
        id: "invalid_user",
        name: "user",
        email: "user_get_statement@test.com",
        password: "1234"
      }

      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: "statement_id"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  })

  it("Should be not able to get invalid statement", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "user",
        email: "user_get_statement_2@test.com",
        password: "1234"
      })

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "invalid_statement"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })
})
