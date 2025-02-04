import { RegisterOrUpdateUserInterface } from "../interfaces/RegisterOrUpdateUserInterface";
import { RegisterUserInterface } from "../interfaces/RegisterUserInterface";

export const convertRegisterOrUpdateUserToRegister = (
  registerOrUpdateUser: RegisterOrUpdateUserInterface
): RegisterUserInterface => {
  return {
    username: registerOrUpdateUser.username,
    password: registerOrUpdateUser.password ?? "",
    firstName: registerOrUpdateUser.firstName,
    lastName: registerOrUpdateUser.lastName,
    email: registerOrUpdateUser.email,
  };
};
