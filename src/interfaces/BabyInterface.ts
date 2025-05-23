export interface BabyInterface {
  babyId?: number | null;
  babyName: string;
  babySurname?: string | null;
  birthDate?: string | null;
  numberOfMonths: number;
  phoneNumber: string;
  motherName?: string | null;
  note?: string | null;
}

export interface DataStateBaby {
  cursor: number;
  babies: BabyInterface[];
  totalElements?: number;
  loading: boolean;
}
