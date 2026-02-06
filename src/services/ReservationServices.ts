import { baseRequest } from "../util/useAxios";
import { DEFAULT_PAGE_SIZE } from "../util/const";
import { buildQueryParams } from "../util/queryParamsBuilder";
import { CreateOrUpdateReservationInterface } from "../interfaces/ReservationInterface";
import { FilterInterface } from "../interfaces/FilterInterface";

export const getReservations = async (cursor: number | null) => {
  const request = baseRequest();

  const params = new URLSearchParams();
  if (cursor !== null) {
    params.set("page", String(cursor));
  }
  params.set("size", String(DEFAULT_PAGE_SIZE));

  const result = await request({
    url: `/reservation/find-all?${params.toString()}`,
    method: "get",
  });

  return result?.data;
};

export const getReservationsTable = async (
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

  const params = new URLSearchParams();
  params.set("arrangementId", String(arrangementId));

  const result = await request({
    url: `/reservation/exists-by-arrangement?${params.toString()}`,
    method: "get",
  });

  return result?.data.data;
};

export const getReservationsByArrangement = async (arrangementId: number) => {
  const request = baseRequest();

  const params = new URLSearchParams();
  params.set("arrangementId", String(arrangementId));

  const result = await request({
    url: `/reservation/find-by-arrangement-id?${params.toString()}`,
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

  const params = new URLSearchParams();
  params.set("reservationId", String(reservationId));

  return request({
    url: `/reservation/delete?${params.toString()}`,
    method: "delete",
  });
};
