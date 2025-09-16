import * as yup from "yup";
import { TFunction } from "i18next";

export const getBabyValidationSchema = (isUpdate: boolean, t: TFunction) => {
  return yup.object().shape({
    babyId: yup
      .number()
      .nullable()
      .when([], {
        is: () => isUpdate,
        then: (schema) =>
          schema.required(t("babyModalValidation.babyIdRequired")),
        otherwise: (schema) => schema.nullable(),
      }),
    babyName: yup
      .string()
      .required(t("babyModalValidation.babyNameRequired"))
      .trim(),
    babySurname: yup.string().nullable().optional(),
    birthDate: yup.string().nullable().optional(),
    numberOfMonths: yup
      .number()
      .min(1, t("babyModalValidation.numberOfMonthsMin"))
      .required(t("babyModalValidation.numberOfMonthsRequired")),
    phoneNumber: yup
      .string()
      .matches(/^\+\d{10,}$/, t("babyModalValidation.phoneNumberInvalid"))
      .required(t("babyModalValidation.phoneNumberRequired")),
    motherName: yup.string().nullable().optional(),
    note: yup.string().nullable().optional(),
  });
};
