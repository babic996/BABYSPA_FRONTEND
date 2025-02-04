import * as yup from "yup";

export const getBabyValidationSchema = (isUpdate: boolean) => {
  return yup.object().shape({
    babyId: yup
      .number()
      .nullable()
      .when([], {
        is: () => isUpdate,
        then: (schema) => schema.required("ID bebe je obavezan"),
        otherwise: (schema) => schema.nullable(),
      }),
    babyName: yup.string().required("Morate unijeti ime bebe").trim(),
    babySurname: yup.string().nullable().optional(),
    birthDate: yup.string().nullable().optional(),
    numberOfMonths: yup
      .number()
      .min(1, "Broj mjeseci mora biti veći od 0")
      .required("Morate unijeti broj mjeseci"),
    phoneNumber: yup
      .string()
      .matches(
        /^\+\d{10,}$/,
        "Broj mora početi sa '+' i sadržavati najmanje 10 cifara, bez razmaka"
      )
      .required("Morate unijeti kontakt telefon"),
    motherName: yup.string().nullable().optional(),
    note: yup.string().nullable().optional(),
  });
};
