import { TableArrangementInterface } from "./ArrangementInterface";
import { StatusInterface } from "./StatusInterface";

export interface OverviewReservationInterface {
  reservationId: number;
  createdAt: string;
  startDate: string;
  endDate: string;
  note?: string | null;
  arrangement: TableArrangementInterface;
  status: StatusInterface;
}

export interface CreateOrUpdateReservationInterface {
  reservationId?: number | null;
  startDate?: string | null;
  durationReservation?: number | null;
  note?: string | null;
  arrangementId?: number | null;
  statusId?: number | null;
}
