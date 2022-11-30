import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";


let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create a Statement", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository,statementsRepository)
  });

  it("Should be able to create a deposit statement", async() => {
    const user = await usersRepository.create({
      name: "User Test",
      email: "test@example.com",
      password: "test"
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit Test"
    });

    expect(deposit).toHaveProperty("id")
  });


  it("Should be able to create a withdraw statement", async() => {
    const user = await usersRepository.create({
      name: "User Test",
      email: "test@example.com",
      password: "test"
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit Test"
    });

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 250,
      description: "Withdraw Test"
    });

    expect(withdraw).toHaveProperty("id")
  });

  it("Should not be able to withdraw with insufficient funds", () => {
    expect(async() => {
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
  
      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 600,
        description: "Withdraw Test"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });

  it("Should not be able to deposit when user non-existing", () => {
    expect(async() => {
      await createStatementUseCase.execute({
        user_id: "123",
        type: OperationType.DEPOSIT,
        amount: 500,
        description: "Deposit Test"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to withdraw when user non-existing", () => {
    expect(async() => {
      await createStatementUseCase.execute({
        user_id: "123",
        type: OperationType.WITHDRAW,
        amount: 500,
        description: "Withdraw Test"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
})