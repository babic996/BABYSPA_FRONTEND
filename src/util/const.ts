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

// export const errorResponse = (e: unknown) => {
//   if (e instanceof AxiosError) {
//     const errorMessage = e.response?.data?.message || "Došlo je do greške.";
//     return toastErrorNotification(errorMessage);
//   } else {
//     return toastErrorNotification("Došlo je do greške.");
//   }
// };

export const groupDataReportType = [
  { value: "day", name: "Grupiši rezultate po danu" },
  { value: "month", name: "Grupiši rezultate po mjesecu" },
  { value: "year", name: "Grupiši rezultate po godini" },
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

export const monthNames = [
  "Januar",
  "Februar",
  "Mart",
  "April",
  "Maj",
  "Jun",
  "Jul",
  "Avgust",
  "Septembar",
  "Oktobar",
  "Novembar",
  "Decembar",
];

export function handleApiError(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const err = error as { response?: { data?: { message?: string } } };
    return err.response?.data?.message || "Zahtjev nije uspešno izvršen";
  }
  return "Došlo je do greške";
}

export const descriptionRole = (role: string): string => {
  const roleName = role.replace("ROLE_", "");

  switch (roleName) {
    case "RESERVATION_MAINTAINER":
      return "Pregled i upravljanje rezervacijama";
    case "BABY_MAINTAINER":
      return "Pregled i upravljanje bebama";
    case "ARRANGEMENT_MAINTAINER":
      return "Pregled i upravljanje aranžmanima";
    case "SERVICE_PACKAGE_MAINTAINER":
      return "Pregled i upravljanje paketima usluga";
    case "REPORT_OVERVIEW":
      return "Pregled izveštaja";
    default:
      return roleName;
  }
};
