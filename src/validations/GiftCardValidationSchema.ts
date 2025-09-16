import { TFunction } from "i18next";
import * as yup from "yup";

export const getGiftCardValidationSchema = (
  isUpdate: boolean,
  t: TFunction
) => {
  return yup.object().shape({
    giftCardId: yup
      .number()
      .nullable()
      .when([], {
        is: () => isUpdate,
        then: (schema) =>
          schema.required(t("giftCardValidation.giftCardIdRequired")),
        otherwise: (schema) => schema.nullable(),
      }),
    serialNumber: yup
      .string()
      .required(t("giftCardValidation.serialNumberRequired"))
      .trim(),
    expirationDate: yup.string().nullable().optional(),
    used: yup
      .boolean()
      .default(false)
      .when([], {
        is: () => isUpdate,
        then: (schema) => schema.required(t("giftCardValidation.usedRequired")),
        otherwise: (schema) => schema.default(false).notRequired(),
      }),
  });
};
