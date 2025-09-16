import * as yup from "yup";
import { PaymentTypeInterface } from "../interfaces/PaymentTypeInterface";
import { TFunction } from "i18next";

export const getArrangementValidationSchema = (
  isUpdate: boolean,
  paymentTypes: PaymentTypeInterface[],
  t: TFunction
) => {
  return yup.object().shape({
    arrangementId: yup
      .number()
      .nullable()
      .when([], {
        is: () => isUpdate,
        then: (schema) =>
          schema.required(t("arrangementValidation.arrangementIdRequired")),
        otherwise: (schema) => schema.nullable(),
      }),
    note: yup.string().nullable().optional(),
    discountId: yup.number().nullable().optional(),
    babyId: yup
      .number()
      .min(1, t("arrangementValidation.babyIdMin"))
      .required(t("arrangementValidation.babyIdRequired")),
    statusId: yup
      .number()
      .nullable()
      .when([], {
        is: () => isUpdate,
        then: (schema) =>
          schema.required(t("arrangementValidation.statusIdRequired")),
        otherwise: (schema) => schema.nullable(),
      }),
    servicePackageId: yup
      .number()
      .min(1, t("arrangementValidation.servicePackageIdMin"))
      .required(t("arrangementValidation.servicePackageIdRequired")),
    paymentTypeId: yup.number().nullable().optional(),
    extendDurationDays: yup.number().nullable().optional(),
    giftCardId: yup
      .number()
      .nullable()
      .when(["paymentTypeId"], {
        is: (paymentTypeId: number) => {
          const selectedPayment = paymentTypes.find(
            (x) => x.paymentTypeId === paymentTypeId
          );
          return isUpdate && selectedPayment?.paymentTypeCode === "gift";
        },
        then: (schema) =>
          schema.required(t("arrangementValidation.giftCardIdRequired")),
        otherwise: (schema) => schema.nullable(),
      }),
  });
};
