export interface GiftCardInterface {
  giftCardId?: number | null;
  serialNumber: string;
  expirationDate?: string | null;
  used: boolean;
  arrangementId?: number | null;
  phoneNumber?: string | null;
}
