import { baseRequest } from "../util/useAxios";
import { DEFAULT_PAGE_SIZE } from "../util/const";
import { buildQueryParams } from "../util/queryParamsBuilder";
import { CreateOrUpdateArrangementInterface } from "../interfaces/ArrangementInterface";
import { FilterInterface } from "../interfaces/FilterInterface";

export const getArrangements = async (
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
    url: `/arrangement/find-all?${params.toString()}`,
    method: "get",
    signal,
  });

  return result?.data;
};

export const getArrangementsPrice = async (
  filter: FilterInterface | null,
  signal?: AbortSignal,
) => {
  const request = baseRequest();
  const params = buildQueryParams(filter);

  const result = await request({
    url: `/arrangement/find-price?${params.toString()}`,
    method: "get",
    signal,
  });

  return result?.data;
};

export const getArrangementsList = async () => {
  const request = baseRequest();

  const result = await request({
    url: "/arrangement/find-all-list",
    method: "get",
  });

  return result?.data.data;
};

export const addArrangement = (data: CreateOrUpdateArrangementInterface) => {
  const request = baseRequest();

  return request({ url: "/arrangement/save", method: "post", data: data });
};

export const editArrangement = (data: CreateOrUpdateArrangementInterface) => {
  const request = baseRequest();

  return request({ url: "/arrangement/update", method: "put", data: data });
};

export const deleteArrangement = (arrangementId: number) => {
  const request = baseRequest();

  const params = new URLSearchParams();
  params.set("arrangementId", String(arrangementId));

  return request({
    url: `/arrangement/delete?${params.toString()}`,
    method: "delete",
  });
};

export const existsByServicePackageId = async (servicePackageId: number) => {
  const request = baseRequest();

  const params = new URLSearchParams();
  params.set("servicePackageId", String(servicePackageId));

  const result = await request({
    url: `/arrangement/exists-by-service-package-id?${params.toString()}`,
    method: "get",
  });

  return result?.data.data;
};
