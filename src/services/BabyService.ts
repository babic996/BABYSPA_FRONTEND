import { baseRequest } from "../util/useAxios";
import { DEFAULT_PAGE_SIZE } from "../util/const";
import { buildQueryParams } from "../util/queryParamsBuilder";
import { BabyInterface } from "../interfaces/BabyInterface";
import { FilterInterface } from "../interfaces/FilterInterface";

export const getBabies = async (
  cursor: number | null,
  filter: FilterInterface | null,
  signal?: AbortSignal,
) => {
  const request = baseRequest();

  const params = buildQueryParams(filter, {
    page: cursor,
    size: DEFAULT_PAGE_SIZE,
  });

  const result = await request({
    url: `/baby/find-all?${params.toString()}`,
    method: "get",
    signal,
  });

  return result?.data;
};

export const getBabiesList = async () => {
  const request = baseRequest();

  const result = await request({
    url: "/baby/find-all-list",
    method: "get",
  });

  return result?.data.data;
};

export const addBaby = (data: BabyInterface) => {
  const request = baseRequest();

  return request({ url: "/baby/save", method: "post", data: data });
};

export const editBaby = (data: BabyInterface) => {
  const request = baseRequest();

  return request({ url: "/baby/update", method: "put", data: data });
};

export const deleteBaby = (babyId: number) => {
  const request = baseRequest();

  const params = new URLSearchParams();
  params.set("babyId", String(babyId));

  return request({
    url: `/baby/delete?${params.toString()}`,
    method: "delete",
  });
};
