import { FilterInterface } from "../interfaces/FilterInterface";
import { GiftCardInterface } from "../interfaces/GiftCardInterface";
import { DEFAULT_PAGE_SIZE } from "../util/const";
import {
  buildQueryParams,
  buildCustomParams,
} from "../util/queryParamsBuilder";
import { baseRequest } from "../util/useAxios";

export const getGiftCardList = async (
  isUsed: boolean | null,
  arrangementId: number | null | undefined,
) => {
  const request = baseRequest();
  const queryParams = buildCustomParams({
    isUsed: isUsed !== null ? isUsed : undefined,
    arrangementId: arrangementId ?? undefined,
  });

  const result = await request({
    url: `/gift-card/find-all-list?${queryParams.toString()}`,
    method: "get",
  });

  return result?.data.data;
};

export const addGiftCard = (data: GiftCardInterface) => {
  const request = baseRequest();

  return request({ url: "/gift-card/save", method: "post", data: data });
};

export const editGiftCard = (data: GiftCardInterface) => {
  const request = baseRequest();

  return request({ url: "/gift-card/update", method: "put", data: data });
};

export const deleteGiftCard = (giftCardId: number) => {
  const request = baseRequest();

  const params = new URLSearchParams();
  params.set("giftCardId", String(giftCardId));

  return request({
    url: `/gift-card/delete?${params.toString()}`,
    method: "delete",
  });
};

export const getGiftCards = async (
  cursor: number | null,
  filter: FilterInterface | null,
) => {
  const request = baseRequest();

  const params = buildQueryParams(filter, {
    page: cursor,
    size: DEFAULT_PAGE_SIZE,
  });

  const result = await request({
    url: `/gift-card/find-all?${params.toString()}`,
    method: "get",
  });

  return result?.data;
};
