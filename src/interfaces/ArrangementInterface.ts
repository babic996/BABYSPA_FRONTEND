import { DiscountInterface } from "./DiscountInterface";
import { GiftCardInterface } from "./GiftCardInterface";
import { PaymentTypeInterface } from "./PaymentTypeInterface";
import { ShortDetailsInterface } from "./ShortDetails";
import { StatusInterface } from "./StatusInterface";

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

export interface DropDownDataInterface {
  babies: ShortDetailsInterface[];
  servicePackages: ShortDetailsInterface[];
  discounts: DiscountInterface[];
  giftCards: GiftCardInterface[];
  status: StatusInterface[];
  paymentTypes: PaymentTypeInterface[];
}

export interface DataStateArrangement {
  cursor: number;
  arrangements: TableArrangementInterface[];
  totalElements?: number;
  loading: boolean;
  totalSum: number;
}
