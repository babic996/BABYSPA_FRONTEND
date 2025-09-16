import * as Yup from "yup";
import { TFunction } from "i18next";

export const getReservationSchema = (isUpdate: boolean, t: TFunction) => {
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
        then: (schema) =>
          schema.required(t("reservationValidation.startDateRequired")),
        otherwise: (schema) => schema,
      }),
    durationReservation: Yup.number()
      .nullable()
      .when([], {
        is: () => !isUpdate,
        then: (schema) =>
          schema
            .required(t("reservationValidation.durationReservationRequired"))
            .min(1, t("reservationValidation.durationReservationMin")),
        otherwise: (schema) => schema,
      }),
    arrangementId: Yup.number()
      .nullable()
      .when([], {
        is: () => !isUpdate,
        then: (schema) =>
          schema.required(t("reservationValidation.arrangementIdRequired")),
        otherwise: (schema) => schema,
      }),
    statusId: Yup.number()
      .nullable()
      .when([], {
        is: () => isUpdate,
        then: (schema) =>
          schema.required(t("reservationValidation.statusIdRequired")),
        otherwise: (schema) => schema,
      }),
    note: Yup.string().nullable(),
  });
};
