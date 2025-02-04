import { FilterInterface } from "../interfaces/FilterInterface";
import { baseRequest } from "../util/useAxios";

export const getReservationDailyReports = async (
  filter: FilterInterface | null
) => {
  const request = baseRequest();

  let filterString = "";

  if (filter?.babyId) {
    filterString += `&babyId=${filter.babyId}`;
  }

  if (filter?.statusId) {
    filterString += `&statusId=${filter.statusId}`;
  }

  if (filter?.startRangeDate) {
    filterString += `&startRangeDate=${filter.startRangeDate}`;
  }

  if (filter?.endRangeDate) {
    filterString += `&endRangeDate=${filter.endRangeDate}`;
  }

  if (filter?.groupDataType) {
    filterString += `&groupDataType=${filter.groupDataType}`;
  }

  const result = await request({
    url: `/reservation-daily-report/find-all?${filterString}`,
    method: "get",
  });

  return result?.data.data;
};

export const getServicePackageDailyReports = async (
  filter: FilterInterface | null
) => {
  const request = baseRequest();

  let filterString = "";

  if (filter?.servicePackageId) {
    filterString += `&servicePackageId=${filter.servicePackageId}`;
  }

  if (filter?.startRangeDate) {
    filterString += `&startRangeDate=${filter.startRangeDate}`;
  }

  if (filter?.endRangeDate) {
    filterString += `&endRangeDate=${filter.endRangeDate}`;
  }

  if (filter?.groupDataType) {
    filterString += `&groupDataType=${filter.groupDataType}`;
  }

  const result = await request({
    url: `/service-package-daily-report/find-all?${filterString}`,
    method: "get",
  });

  return result?.data.data;
};

export const generateReport = async (
  generateForAllDays: boolean,
  date?: string | null
) => {
  const request = baseRequest();

  let filterString = "";
  if (date) {
    filterString += `&date=${date}`;
  }

  const result = await request({
    url: `/reservation/generate-report?generateForAllDays=${generateForAllDays}${filterString}`,
    method: "get",
  });

  return result?.data.data;
};
