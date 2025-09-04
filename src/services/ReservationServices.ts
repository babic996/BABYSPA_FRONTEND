import { baseRequest } from "../util/useAxios";
import { DEFAULT_PAGE_SIZE } from "../util/const";
import { CreateOrUpdateReservationInterface } from "../interfaces/ReservationInterface";
import { FilterInterface } from "../interfaces/FilterInterface";

export const getReservations = async (cursor: number | null) => {
  const request = baseRequest();

  const result = await request({
    url: `/reservation/find-all?page=${cursor}&size=${DEFAULT_PAGE_SIZE}`,
    method: "get",
  });

  return result?.data;
};

export const getReservationsTable = async (
  cursor: number | null,
  filter: FilterInterface | null,
  signal?: AbortSignal
) => {
  const request = baseRequest();

  const params = new URLSearchParams();

  params.set("size", String(DEFAULT_PAGE_SIZE));
  if (cursor !== null) {
    params.set("page", String(cursor));
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
    url: `/reservation/find-all?${params.toString()}`,
    method: "get",
    signal,
  });

  return result?.data;
};

export const getReservationsList = async (signal?: AbortSignal) => {
  const request = baseRequest();

  const result = await request({
    url: "/reservation/find-all-list",
    method: "get",
    signal,
  });

  return result?.data.data;
};

export const existsByArrangement = async (arrangementId: number) => {
  const request = baseRequest();

  const result = await request({
    url: `/reservation/exists-by-arrangement?arrangementId=${arrangementId}`,
    method: "get",
  });

  return result?.data.data;
};

export const getReservationsByArrangement = async (arrangementId: number) => {
  const request = baseRequest();

  const result = await request({
    url: `/reservation/find-by-arrangement-id?arrangementId=${arrangementId}`,
    method: "get",
  });

  return result?.data.data;
};

export const addReservation = (data: CreateOrUpdateReservationInterface) => {
  const request = baseRequest();

  return request({ url: "/reservation/save", method: "post", data: data });
};

export const editReservation = (data: CreateOrUpdateReservationInterface) => {
  const request = baseRequest();

  return request({ url: "/reservation/update", method: "put", data: data });
};

export const deleteReservation = (reservationId: number) => {
  const request = baseRequest();

  return request({
    url: `/reservation/delete?reservationId=${reservationId}`,
    method: "delete",
  });
};
