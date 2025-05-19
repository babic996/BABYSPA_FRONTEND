import { ShortDetailsInterface } from "./ShortDetails";

export interface CreateOrUpdateArrangementInterface {
  arrangementId?: number | null;
  note?: string | null;
  discountId?: number | null;
  giftCardId?: number | null;
  babyId: number;
  statusId?: number | null;
  servicePackageId: number;
  paymentTypeId?: number | null;
  extendDurationDays?: number | null;
}

export interface TableArrangementInterface {
  arrangementId: number;
  createdAt: string;
  remainingTerm: number;
  price: number;
  note?: string | null;
  extendDurationDays?: number | null;
  discount?: ShortDetailsInterface | null;
  giftCard?: ShortDetailsInterface | null;
  babyDetails: ShortDetailsInterface;
  status: ShortDetailsInterface;
  servicePackage: ShortDetailsInterface;
  paymentType: ShortDetailsInterface;
}
