import { baseRequest } from "../util/useAxios";
import { DEFAULT_PAGE_SIZE } from "../util/const";
import { CreateOrUpdateArrangementInterface } from "../interfaces/ArrangementInterface";
import { FilterInterface } from "../interfaces/FilterInterface";

export const getArrangements = async (
  cursor: number | null,
  filter: FilterInterface | null
) => {
  const request = baseRequest();

  const params = new URLSearchParams();

  params.set("size", String(DEFAULT_PAGE_SIZE));
  if (cursor !== null) {
    params.set("page", String(cursor));
  }

  if (filter?.remainingTerm != undefined) {
    params.append("remainingTerm", filter.remainingTerm.toString());
  }

  if (filter?.startPrice) {
    params.append("startPrice", filter.startPrice.toString());
  }

  if (filter?.endPrice) {
    params.append("endPrice", filter.endPrice.toString());
  }

  if (filter?.babyId) {
    params.append("babyId", filter.babyId.toString());
  }

  if (filter?.paymentTypeId) {
    params.append("paymentTypeId", filter.paymentTypeId.toString());
  }

  if (filter?.servicePackageId) {
    params.append("servicePackageId", filter.servicePackageId.toString());
  }

  if (filter?.giftCardId) {
    params.append("giftCardId", filter.giftCardId.toString());
  }

  if (filter?.statusId) {
    params.append("statusId", filter.statusId.toString());
  }

  if (filter?.arrangementId) {
    params.append("arrangementId", filter.arrangementId.toString());
  }

  if (filter?.startRangeDate) {
    params.append("startRangeDate", filter.startRangeDate.toString());
  }

  if (filter?.endRangeDate) {
    params.append("endRangeDate", filter.endRangeDate.toString());
  }

  const result = await request({
    url: `/arrangement/find-all??${params.toString()}`,
    method: "get",
  });

  return result?.data;
};

export const getArrangementsPrice = async (filter: FilterInterface | null) => {
  const request = baseRequest();
  const params = new URLSearchParams();

  if (filter?.remainingTerm != undefined) {
    params.append("remainingTerm", filter.remainingTerm.toString());
  }

  if (filter?.startPrice) {
    params.append("startPrice", filter.startPrice.toString());
  }

  if (filter?.endPrice) {
    params.append("endPrice", filter.endPrice.toString());
  }

  if (filter?.babyId) {
    params.append("babyId", filter.babyId.toString());
  }

  if (filter?.paymentTypeId) {
    params.append("paymentTypeId", filter.paymentTypeId.toString());
  }

  if (filter?.servicePackageId) {
    params.append("servicePackageId", filter.servicePackageId.toString());
  }

  if (filter?.giftCardId) {
    params.append("giftCardId", filter.giftCardId.toString());
  }

  if (filter?.statusId) {
    params.append("statusId", filter.statusId.toString());
  }

  if (filter?.arrangementId) {
    params.append("arrangementId", filter.arrangementId.toString());
  }

  if (filter?.startRangeDate) {
    params.append("startRangeDate", filter.startRangeDate.toString());
  }

  if (filter?.endRangeDate) {
    params.append("endRangeDate", filter.endRangeDate.toString());
  }

  const result = await request({
    url: `/arrangement/find-price?${params.toString()}`,
    method: "get",
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

  return request({
    url: `/arrangement/delete?arrangementId=${arrangementId}`,
    method: "delete",
  });
};

export const existsByServicePackageId = async (servicePackageId: number) => {
  const request = baseRequest();

  const result = await request({
    url: `/arrangement/exists-by-service-package-id?servicePackageId=${servicePackageId}`,
    method: "get",
  });

  return result?.data.data;
};
