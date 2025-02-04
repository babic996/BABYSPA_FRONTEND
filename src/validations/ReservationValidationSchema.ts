import * as Yup from "yup";

export const getReservationSchema = (isUpdate: boolean) => {
  return Yup.object().shape({
    reservationId: Yup.number()
      .nullable()
      .when([], {
        is: () => isUpdate,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema,
      }),
    startDate: Yup.string()
      .nullable()
      .when([], {
        is: () => !isUpdate,
        then: (schema) => schema.required("Odaberite datum rezervacije"),
        otherwise: (schema) => schema,
      }),
    durationReservation: Yup.number()
      .nullable()
      .when([], {
        is: () => !isUpdate,
        then: (schema) =>
          schema
            .required("Vrijeme trajanja rezervacije je obavezno")
            .min(1, "Vrijeme trajanja rezervacije mora biti veće od 0 minuta"),
        otherwise: (schema) => schema,
      }),
    arrangementId: Yup.number()
      .nullable()
      .when([], {
        is: () => !isUpdate,
        then: (schema) => schema.required("Odaberite aranžman"),
        otherwise: (schema) => schema,
      }),
    statusId: Yup.number()
      .nullable()
      .when([], {
        is: () => isUpdate,
        then: (schema) => schema.required("Odaberite status"),
        otherwise: (schema) => schema,
      }),
    note: Yup.string().nullable(),
  });
};
