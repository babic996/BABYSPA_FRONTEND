import * as yup from "yup";
import { TFunction } from "i18next";

export const getServicePackageValidationSchema = (
  isUpdate: boolean,
  t: TFunction
) => {
  return yup.object().shape({
    servicePackageId: yup
      .number()
      .nullable()
      .when([], {
        is: () => isUpdate,
        then: (schema) =>
          schema.required(
            t("servicePackageValidation.servicePackageIdRequired")
          ),
        otherwise: (schema) => schema.nullable(),
      }),
    servicePackageName: yup
      .string()
      .required(t("servicePackageValidation.servicePackageNameRequired"))
      .trim(),
    termNumber: yup
      .number()
      .min(1, t("servicePackageValidation.termNumberMin"))
      .required(t("servicePackageValidation.termNumberRequired")),
    servicePackageDurationDays: yup
      .number()
      .min(1, t("servicePackageValidation.durationDaysMin"))
      .required(t("servicePackageValidation.durationDaysRequired")),
    price: yup
      .number()
      .required(t("servicePackageValidation.priceRequired"))
      .positive(t("servicePackageValidation.pricePositive"))
      .typeError(t("servicePackageValidation.priceTypeError")),
    note: yup.string().nullable().optional(),
  });
};
