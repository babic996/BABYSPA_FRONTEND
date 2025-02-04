import { baseRequest } from "../util/useAxios";

export const getDiscountList = async () => {
  const request = baseRequest();

  const result = await request({
    url: "/discount/find-all",
    method: "get",
  });

  return result?.data.data;
};
