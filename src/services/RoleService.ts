import { baseRequest } from "../util/useAxios";

export const getRoles = async () => {
  const request = baseRequest();

  const result = await request({
    url: "/role/find-all",
    method: "get",
  });

  return result?.data.data;
};
