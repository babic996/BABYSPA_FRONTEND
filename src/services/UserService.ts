import { LoginInterface } from "../interfaces/LoginInterface";
import { RegisterOrUpdateUserInterface } from "../interfaces/RegisterOrUpdateUserInterface";
import { RegisterUserInterface } from "../interfaces/RegisterUserInterface";
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

export const findUserInfoByUserId = async (userId: number) => {
  const request = baseRequest();

  const result = await request({
    url: `/user/find-user-info-by-id?userId=${userId}`,
    method: "get",
  });

  return result?.data.data;
};
