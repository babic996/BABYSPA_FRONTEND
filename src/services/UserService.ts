import { LoginInterface } from "../interfaces/LoginInterface";
import { RegisterOrUpdateUserInterface } from "../interfaces/RegisterOrUpdateUserInterface";
import { RegisterUserInterface } from "../interfaces/RegisterUserInterface";
import { AssignRoleInterface } from "../interfaces/UserInterface";
import { baseRequest } from "../util/useAxios";

export const loginUser = (data: LoginInterface) => {
  const request = baseRequest();

  return request({ url: "/user/login", method: "post", data: data });
};

export const editUser = (data: RegisterOrUpdateUserInterface) => {
  const request = baseRequest();

  return request({ url: "/user/update", method: "put", data: data });
};

export const registerUser = (data: RegisterUserInterface) => {
  const request = baseRequest();

  return request({ url: "/user/register", method: "post", data: data });
};

export const getUserInfoByUserId = async (userId: number) => {
  const request = baseRequest();

  const result = await request({
    url: `/user/find-user-info-by-id?userId=${userId}`,
    method: "get",
  });

  return result?.data.data;
};

export const getUsersInfo = async (excludedRoleNames: string[] | null) => {
  const request = baseRequest();

  const params = new URLSearchParams({});

  if (excludedRoleNames && excludedRoleNames?.length > 0) {
    excludedRoleNames.forEach((excludedRoleName: string) =>
      params.append("excludedRoleNames[]", excludedRoleName)
    );
  }

  const result = await request({
    url: `/user/find-all-user-info?${params.toString()}`,
    method: "get",
  });

  return result?.data.data;
};

export const assignRolesToUser = (data: AssignRoleInterface) => {
  const request = baseRequest();

  return request({ url: "/user/assign-roles", method: "put", data: data });
};
