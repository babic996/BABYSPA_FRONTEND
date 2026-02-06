import { baseRequest } from "../util/useAxios";

export const getStatusList = async (statusTypeCode: string) => {
  const request = baseRequest();

  const params = new URLSearchParams();
  params.set("statusTypeCode", statusTypeCode);

  const result = await request({
    url: `/status/find-all-status-type-code?${params.toString()}`,
    method: "get",
  });

  return result?.data.data;
};
