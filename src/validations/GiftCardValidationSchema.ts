import * as yup from "yup";

export const getGiftCardValidationSchema = (isUpdate: boolean) => {
  return yup.object().shape({
    giftCardId: yup
      .number()
      .nullable()
      .when([], {
        is: () => isUpdate,
        then: (schema) => schema.required("ID poklon kartice je obavezan"),
        otherwise: (schema) => schema.nullable(),
      }),
    serialNumber: yup
      .string()
      .required("Morate unijeti serijski broj poklon kartice")
      .trim(),
    expirationDate: yup.string().nullable().optional(),
    used: yup
      .boolean()
      .default(false)
      .when([], {
        is: () => isUpdate,
        then: (schema) =>
          schema.required("Obavezno popuniti da li je kartica iskorištena"),
        otherwise: (schema) => schema.default(false).notRequired(),
      }),
  });
};
