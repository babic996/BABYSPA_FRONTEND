import { FilterInterface } from "../interfaces/FilterInterface";
import { GiftCardInterface } from "../interfaces/GiftCardInterface";
import { DEFAULT_PAGE_SIZE } from "../util/const";
import { baseRequest } from "../util/useAxios";

export const getGiftCardList = async (
  isUsed: boolean | null,
  arrangementId: number | null | undefined
) => {
  const request = baseRequest();
  const queryParams = new URLSearchParams();

  if (isUsed !== null) {
    queryParams.append("isUsed", String(isUsed));
  }

  if (arrangementId !== null && arrangementId !== undefined) {
    queryParams.append("arrangementId", String(arrangementId));
  }

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

  return request({
    url: `/gift-card/delete?giftCardId=${giftCardId}`,
    method: "delete",
  });
};

export const getGiftCards = async (
  cursor: number | null,
  filter: FilterInterface | null
) => {
  const request = baseRequest();

  let filterString = "";

  if (filter?.searchText) {
    filterString += `&serialNumber=${filter?.searchText}`;
  }

  if (filter?.startRangeDate) {
    filterString += `&startRangeDate=${filter.startRangeDate}`;
  }

  if (filter?.endRangeDate) {
    filterString += `&endRangeDate=${filter.endRangeDate}`;
  }

  const result = await request({
    url: `/gift-card/find-all?page=${cursor}&size=${DEFAULT_PAGE_SIZE}${filterString}`,
    method: "get",
  });

  return result?.data;
};
