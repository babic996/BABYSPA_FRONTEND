import * as yup from "yup";

export const getServicePackageValidationSchema = (isUpdate: boolean) => {
  return yup.object().shape({
    servicePackageId: yup
      .number()
      .nullable()
      .when([], {
        is: () => isUpdate,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.nullable(),
      }),
    servicePackageName: yup
      .string()
      .required("Morate unijeti naziv paketa usluge")
      .trim(),
    termNumber: yup
      .number()
      .min(1, "Broj termina mora biti veći od 0")
      .required("Morate unijeti broj termina"),
    servicePackageDurationDays: yup
      .number()
      .min(1, "Broj dana koliko traje paket usluge mora biti veći od 0")
      .required("Morate unijeti broj dana koliko traje paket usluge"),
    price: yup
      .number()
      .required("Cijena je obavezna")
      .positive("Cijena mora biti pozitivan broj")
      .typeError("Cijena mora biti broj"),
    note: yup.string().nullable().optional(),
  });
};
