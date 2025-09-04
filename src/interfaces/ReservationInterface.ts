import { TableArrangementInterface } from "./ArrangementInterface";
import { ShortDetailsInterface } from "./ShortDetails";
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

export interface TableReservationInterface {
  reservationId: number;
  arrangementId: number;
  createdAt: string;
  startDate: string;
  endDate: string;
  note?: string | null;
  servicePackageName: string;
  status: StatusInterface;
  babyDetails: ShortDetailsInterface;
  remainingTerm: number;
}

export interface DataStateReservation {
  cursor: number;
  reservations: TableReservationInterface[];
  totalElements?: number;
  loading: boolean;
}

export interface CreateOrUpdateReservationInterface {
  reservationId?: number | null;
  startDate?: string | null;
  durationReservation?: number | null;
  note?: string | null;
  arrangementId?: number | null;
  statusId?: number | null;
}
