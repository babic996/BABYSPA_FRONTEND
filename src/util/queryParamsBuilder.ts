import { FilterInterface } from "../interfaces/FilterInterface";

export const buildQueryParams = (
  filter: FilterInterface | null,
  options?: {
    page?: number | null;
    size?: number;
    includeEmpty?: boolean;
  },
): URLSearchParams => {
  const params = new URLSearchParams();

  if (options?.page !== null && options?.page !== undefined) {
    params.set("page", String(options.page));
  }

  if (options?.size) {
    params.set("size", String(options.size));
  }

  if (!filter) {
    return params;
  }

  if (filter.searchText) {
    const searchText = filter.searchText.startsWith("+")
      ? filter.searchText.slice(1)
      : filter.searchText;
    params.set("searchText", searchText);
  }

  if (filter.startRangeDate) {
    params.set("startRangeDate", filter.startRangeDate);
  }

  if (filter.endRangeDate) {
    params.set("endRangeDate", filter.endRangeDate);
  }

  if (filter.startPrice !== null && filter.startPrice !== undefined) {
    params.set("startPrice", String(filter.startPrice));
  }

  if (filter.endPrice !== null && filter.endPrice !== undefined) {
    params.set("endPrice", String(filter.endPrice));
  }

  if (filter.statusId) {
    params.set("statusId", String(filter.statusId));
  }

  if (filter.babyId) {
    params.set("babyId", String(filter.babyId));
  }

  if (filter.paymentTypeId) {
    params.set("paymentTypeId", String(filter.paymentTypeId));
  }

  if (filter.servicePackageId) {
    params.set("servicePackageId", String(filter.servicePackageId));
  }

  if (filter.giftCardId) {
    params.set("giftCardId", String(filter.giftCardId));
  }

  if (filter.remainingTerm !== null && filter.remainingTerm !== undefined) {
    params.set("remainingTerm", String(filter.remainingTerm));
  }

  if (filter.arrangementId) {
    params.set("arrangementId", String(filter.arrangementId));
  }

  if (filter.date) {
    params.set("date", filter.date);
  }

  if (filter.groupDataType) {
    params.set("groupDataType", filter.groupDataType);
  }

  return params;
};

export const buildCustomParams = (
  customParams?: Record<string, string | number | boolean | null | undefined>,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (customParams) {
    Object.entries(customParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });
  }

  return params;
};
