import { baseRequest } from "../util/useAxios";
import { DEFAULT_PAGE_SIZE } from "../util/const";
import { buildQueryParams } from "../util/queryParamsBuilder";
import { ServicePackageInterface } from "../interfaces/ServicePackageInterface";
import { FilterInterface } from "../interfaces/FilterInterface";

export const getServicePackages = async (
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
    url: `/service-package/find-all?${params.toString()}`,
    method: "get",
    signal,
  });

  return result?.data;
};

export const getServicePackagesList = async () => {
  const request = baseRequest();

  const result = await request({
    url: "/service-package/find-all-list",
    method: "get",
  });

  return result?.data.data;
};

export const getMaxPriceServicePackage = async () => {
  const request = baseRequest();

  const result = await request({
    url: "/service-package/find-max-price",
    method: "get",
  });

  return result?.data.data;
};

export const addServicePackage = (data: ServicePackageInterface) => {
  const request = baseRequest();

  return request({ url: "/service-package/save", method: "post", data: data });
};

export const editServicePackage = (data: ServicePackageInterface) => {
  const request = baseRequest();

  return request({ url: "/service-package/update", method: "put", data: data });
};

export const deleteServicePackage = (servicePackageId: number) => {
  const request = baseRequest();

  const params = new URLSearchParams();
  params.set("servicePackageId", String(servicePackageId));

  return request({
    url: `/service-package/delete?${params.toString()}`,
    method: "delete",
  });
};
