import { baseRequest } from "../util/useAxios";

export const getPaymentTypeList = async () => {
  const request = baseRequest();

  const result = await request({
    url: "/payment-type/find-all",
    method: "get",
  });

  return result?.data.data;
};
