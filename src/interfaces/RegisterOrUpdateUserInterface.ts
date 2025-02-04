import { UserInterface } from "./UserInterface";

export interface RegisterOrUpdateUserInterface extends UserInterface {
  oldPassword?: string;
  newPassword?: string;
  password?: string;
  repeatPassword?: string;
}
