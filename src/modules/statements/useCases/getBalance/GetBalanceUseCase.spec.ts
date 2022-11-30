import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository"
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";


let statementsRepository: IStatementsRepository;
let usersRepository:IUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance" , () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)
  });

  it("Should be able to get the balance", async() => {
    const user = await usersRepository.create({
      name: "User Test",
      email: "test@example.com",
      password: "test"
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit Test"
    });

    const balance = await getBalanceUseCase.execute({user_id: user.id as string});

    expect(balance).toHaveProperty("balance");
    expect(balance).toHaveProperty("statement");
  });

  it("Should not be able to get the balance if user do not exist", async() => {
    expect(async() => {
      await statementsRepository.create({
        amount: 100,
        description: "test",
        type: OperationType.DEPOSIT,
        user_id: "non-existent",
      });

      await getBalanceUseCase.execute({user_id: "non-existent"});
    }).rejects.toBeInstanceOf(GetBalanceError)
  });
})