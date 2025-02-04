import * as yup from "yup";

export const getLoginValidationSchema = () => {
  return yup.object().shape({
    username: yup.string().required("Morate unijeti username").trim(),
    password: yup.string().required("Morate unijeti password").trim(),
  });
};
