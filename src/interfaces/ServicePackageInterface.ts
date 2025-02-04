export interface ServicePackageInterface {
  servicePackageId?: number | null;
  servicePackageName: string;
  termNumber: number;
  servicePackageDurationDays: number;
  price: number;
  note?: string | null;
}
