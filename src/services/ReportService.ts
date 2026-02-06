import { FilterInterface } from "../interfaces/FilterInterface";
import { baseRequest } from "../util/useAxios";
import { buildQueryParams } from "../util/queryParamsBuilder";

export const getReservationDailyReports = async (
  filter: FilterInterface | null,
) => {
  const request = baseRequest();

  const params = buildQueryParams(filter);

  const result = await request({
    url: `/reservation-daily-report/find-all?${params.toString()}`,
    method: "get",
  });

  return result?.data.data;
};

export const getServicePackageDailyReports = async (
  filter: FilterInterface | null,
) => {
  const request = baseRequest();

  const params = buildQueryParams(filter);

  const result = await request({
    url: `/service-package-daily-report/find-all?${params.toString()}`,
    method: "get",
  });

  return result?.data.data;
};

export const generateReport = async (
  generateForAllDays: boolean,
  date?: string | null,
) => {
  const request = baseRequest();

  const params = new URLSearchParams();
  params.set("generateForAllDays", String(generateForAllDays));
  if (date) {
    params.set("date", date);
  }

  const result = await request({
    url: `/reservation/generate-report?${params.toString()}`,
    method: "get",
  });

  return result?.data.data;
};
