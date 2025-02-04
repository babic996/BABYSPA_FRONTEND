import { baseRequest } from "../util/useAxios";
import { DEFAULT_PAGE_SIZE } from "../util/const";
import { CreateOrUpdateReservationInterface } from "../interfaces/ReservationInterface";

export const getReservations = async (cursor: number | null) => {
  const request = baseRequest();

  const result = await request({
    url: `/reservation/find-all?page=${cursor}&size=${DEFAULT_PAGE_SIZE}`,
    method: "get",
  });

  return result?.data;
};

export const getReservationsList = async () => {
  const request = baseRequest();

  const result = await request({
    url: "/reservation/find-all-list",
    method: "get",
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
