import { TFunction } from "i18next";
import * as yup from "yup";

export const getLoginValidationSchema = (t: TFunction) => {
  return yup.object().shape({
    username: yup
      .string()
      .required(t("loginValidation.usernameRequired"))
      .trim(),
    password: yup
      .string()
      .required(t("loginValidation.passwordRequired"))
      .trim(),
  });
};
