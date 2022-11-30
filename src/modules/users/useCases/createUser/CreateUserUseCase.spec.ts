import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create a new user", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository)
  });

  it("Should be able to create a new user", async() => {
    const user: ICreateUserDTO = {
      name: "User Test",
      email: "test@example.com",
      password: "test"
    };

    const passwordHash = await hash(user.password, 8);

    const newUser = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: passwordHash
    });

    expect(newUser).toHaveProperty("id");
  });

  it("Should not be able to create a user with email already registered", async() => {
    expect(async() => {
      const user: ICreateUserDTO = {
        name: "User Test 1",
        email: "test1@example.com",
        password: "test1"
      };
  
      const passwordHash = await hash(user.password, 8);
  
      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: passwordHash
      });

      await createUserUseCase.execute({
        name: "User Test 2",
        email: user.email,
        password: "test2"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  })

})