import * as yup from "yup";

export const getUserValidationSchema = (isUpdate: boolean) => {
  return yup.object().shape({
    oldPassword: yup.string().when([], {
      is: () => isUpdate,
      then: (schema) =>
        schema.test(
          "oldPasswordRequired",
          "Stara lozinka je obavezna i mora imati najmanje 8 znakova",
          function (value) {
            const { newPassword } = this.parent;
            if (isUpdate && newPassword) {
              return !!value && value.length >= 8;
            }
            return true;
          }
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
    newPassword: yup.string().when([], {
      is: () => isUpdate,
      then: (schema) =>
        schema.test(
          "newPasswordRequired",
          "Nova lozinka je obavezna i mora imati najmanje 8 znakova",
          function (value) {
            const { oldPassword } = this.parent;
            if (isUpdate && oldPassword) {
              return !!value && value.length >= 8;
            }
            return true;
          }
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
    password: yup.string().when([], {
      is: () => !isUpdate,
      then: (schema) =>
        schema
          .required("Lozinka je obavezna")
          .min(8, "Lozinka mora imati najmanje 8 karaktera"),
      otherwise: (schema) => schema.notRequired(),
    }),
    repeatPassword: yup.string().when([], {
      is: () => !isUpdate,
      then: (schema) =>
        schema
          .required("Ponovljena lozinka je obavezna")
          .oneOf([yup.ref("password")], "Lozinke moraju biti iste")
          .min(8, "Lozinka mora imati najmanje 8 karaktera"),
      otherwise: (schema) => schema.notRequired(),
    }),
    lastName: yup.string().required("Morate unijeti prezime").trim(),
    firstName: yup.string().required("Morate unijeti ime").trim(),
    username: yup
      .string()
      .required("Morate unijeti username")
      .trim()
      .matches(/^[^@]+$/, "Username ne smije sadržavati '@'"),
    email: yup
      .string()
      .email("Morate unijeti validan email")
      .required("Morate unijeti email")
      .trim(),
  });
};
