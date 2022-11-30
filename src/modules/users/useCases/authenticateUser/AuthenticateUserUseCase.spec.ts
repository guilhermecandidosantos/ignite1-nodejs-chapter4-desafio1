import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate a user", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("Should be able to authenticate a user", async() => {
    const user: ICreateUserDTO = {
      name: "User Test 1",
      email: "test1@example.com",
      password: "test1"
    };

    const passwordHash = await hash(user.password, 8);

    const newUser = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: passwordHash
    });

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: newUser.email,
      password: passwordHash,
    });
    
    expect(userAuthenticated).toHaveProperty("token");
    expect(userAuthenticated).toHaveProperty("user");
  });

  it("Should no be able to authenticate a user with password non-existing", async() => {
    expect(async() => {
      const user: ICreateUserDTO = {
        name: "User Test 1",
        email: "test1@example.com",
        password: "test1"
      };
  
      const passwordHash = await hash(user.password, 8);
  
      const newUser = await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: passwordHash
      });
  
      await authenticateUserUseCase.execute({
        email: newUser.email,
        password: "password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should no be able to authenticate a user with email non-existing", async() => {
    expect(async() => {
      const user: ICreateUserDTO = {
        name: "User Test 1",
        email: "test1@example.com",
        password: "test1"
      };
  
      const passwordHash = await hash(user.password, 8);
  
      const newUser = await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: passwordHash
      });
  
      await authenticateUserUseCase.execute({
        email: "example@example.com",
        password: newUser.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate a user non-existing", async () => {
    expect(async() => {
      await authenticateUserUseCase.execute({
        email: "example@example.com",
        password: "example",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

})