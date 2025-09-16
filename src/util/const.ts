import axios from "axios";
import i18n from "i18next";

export const DEFAULT_PAGE_SIZE = 10;

export const calendarMessages = {
  today: "Danas",
  previous: "Prethodni",
  next: "Naredni",
  month: "Mjesec",
  week: "Sedmica",
  day: "Dan",
  agenda: "Agenda",
  date: "Datum",
  time: "Vrijeme",
  event: "Događaj",
};

export const groupDataReportType = [
  { value: "day", name: () => i18n.t("common.groupDataDay") },
  { value: "month", name: () => i18n.t("common.groupDataMonth") },
  { value: "year", name: () => i18n.t("common.groupDataYear") },
];

export const ROLES = {
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
  RESERVATION_MAINTAINER: "RESERVATION_MAINTAINER",
  BABY_MAINTAINER: "BABY_MAINTAINER",
  ARRANGEMENT_MAINTAINER: "ARRANGEMENT_MAINTAINER",
  SERVICE_PACKAGE_MAINTAINER: "SERVICE_PACKAGE_MAINTAINER",
  REPORT_OVERVIEW: "REPORT_OVERVIEW",
};

export const handleApiError = (error: unknown): string => {
  if (axios.isCancel(error)) {
    return "";
  }

  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? "Zahtjev nije uspješno izvršen";
  }

  return "Došlo je do greške";
};

export const descriptionRole = (role: string): string => {
  const roleName = role.replace("ROLE_", "");
  return i18n.t(`common.roleDescriptions.${roleName}`, {
    defaultValue: roleName,
  });
};
