import {
  CreateOrUpdateArrangementInterface,
  TableArrangementInterface,
} from "../interfaces/ArrangementInterface";

export const convertTableArrangementToCreateOrUpdateArrangement = (
  tableArrangement: TableArrangementInterface
): CreateOrUpdateArrangementInterface => {
  return {
    arrangementId: tableArrangement.arrangementId,
    servicePackageId: tableArrangement.servicePackage.id,
    babyId: tableArrangement.babyDetails.id,
    statusId: tableArrangement.status.id,
    discountId: tableArrangement?.discount?.id,
    paymentTypeId: tableArrangement?.paymentType?.id,
    note: tableArrangement?.note,
    extendDurationDays: tableArrangement?.extendDurationDays,
  };
};
