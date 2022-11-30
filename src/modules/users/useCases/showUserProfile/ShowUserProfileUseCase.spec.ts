import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;


describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  })

  interface User{
    id: string;
    email: string;
    name: string;
    password: string;
  };

  it("Should be able to show user profile", async() => {
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

    const showUserProfile = await showUserProfileUseCase.execute(newUser.id as string);
    
    const showUserProfile2: User = {
      id: newUser.id as string,
      name: newUser.name,
      email: newUser.email,
      password: newUser.password
    };

    expect(showUserProfile).toEqual(showUserProfile2)
  });

  it("Should not be able to show a user profile non-existing", async() => {
    expect(async() => {
      await showUserProfileUseCase.execute("1234");
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  });
});