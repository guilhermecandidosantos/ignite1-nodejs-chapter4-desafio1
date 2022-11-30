import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository"
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";



let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository)
  });

  it("Should be able to get statement operation", async() => {
    const user = await usersRepository.create({
      name: "User Test",
      email: "test@example.com",
      password: "test"
    })

    const statement = await statementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit Test"
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    });

    expect(statementOperation).toBe(statement);
  });

  it("Should not be able to get the statement when user non-existing", async() => {
    expect(async() => {
      const user = await usersRepository.create({
        name: "User Test",
        email: "test@example.com",
        password: "test"
      })
  
      const statement = await statementsRepository.create({
        user_id: user.id as string,
        type: OperationType.DEPOSIT,
        amount: 500,
        description: "Deposit Test"
      });
  
      await getStatementOperationUseCase.execute({
        user_id: "123",
        statement_id: statement.id as string
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  });

  it("Should not be able to get the statement when statement non-existing", async() => {
    expect(async() => {
      const user = await usersRepository.create({
        name: "User Test",
        email: "test@example.com",
        password: "test"
      })
  
      const statement = await statementsRepository.create({
        user_id: user.id as string,
        type: OperationType.DEPOSIT,
        amount: 500,
        description: "Deposit Test"
      });
  
      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "123"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  });
})