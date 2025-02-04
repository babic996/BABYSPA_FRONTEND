import { baseRequest } from "../util/useAxios";

export const getStatusList = async (statusTypeCode: string) => {
  const request = baseRequest();

  const result = await request({
    url: `/status/find-all-status-type-code?statusTypeCode=${statusTypeCode}`,
    method: "get",
  });

  return result?.data.data;
};
