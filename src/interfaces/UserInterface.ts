import { RoleInterface } from "./RoleInterface";

export interface UserInterface {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface UserInfoInterface {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: RoleInterface[];
}

export interface AssignRoleInterface {
  userId: number;
  roleIds: number[];
}
