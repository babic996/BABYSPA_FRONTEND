import {
  CreateOrUpdateReservationInterface,
  OverviewReservationInterface,
} from "../interfaces/ReservationInterface";

export const convertOverviewReservationInterfaceToCreateOrUpdateReservationInterface =
  (
    overviewReservation: OverviewReservationInterface
  ): CreateOrUpdateReservationInterface => {
    return {
      reservationId: overviewReservation.reservationId,
      statusId: overviewReservation.status.statusId,
      note: overviewReservation?.note,
      // startDate: overviewReservation.startDate,
      // durationReservation: 60, //stavio sam 60 jer mi nije bitan ovaj podatak
      // arrangementId: overviewReservation.arrangement.arrangementId,
    };
  };
