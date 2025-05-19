import {
  Control,
  Controller,
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
} from "react-hook-form";
import { RegisterOrUpdateUserInterface } from "../../interfaces/RegisterOrUpdateUserInterface";
import { editUser, registerUser } from "../../services/UserService";
import {
  toastErrorNotification,
  toastSuccessNotification,
} from "../../util/toastNotification";
import { convertRegisterOrUpdateUserToRegister } from "../../mappers/UserMapper";
import { handleApiError } from "../../util/const";
import { Button, Form, Input } from "antd";

interface CreateAndEditUserComponentProps {
  isEditUser: boolean;
  setIsUserModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  control: Control<RegisterOrUpdateUserInterface>;
  handleSubmit: UseFormHandleSubmit<RegisterOrUpdateUserInterface>;
  errors: FieldErrors<RegisterOrUpdateUserInterface>;
  handleLogout: () => void;
}

const CreateAndEditUserComponent: React.FC<CreateAndEditUserComponentProps> = ({
  isEditUser,
  setIsUserModalOpen,
  control,
  handleSubmit,
  errors,
  handleLogout,
}) => {
  const onSubmit: SubmitHandler<RegisterOrUpdateUserInterface> = async (
    data
  ) => {
    try {
      if (isEditUser) {
        await editUser(data);
        toastSuccessNotification("Ažurirano!");
        handleLogout();
      } else {
        await registerUser(convertRegisterOrUpdateUserToRegister(data));
        toastSuccessNotification("Sačuvano!");
      }
      setIsUserModalOpen(false);
    } catch (e) {
      toastErrorNotification(handleApiError(e));
    }
  };
  return (
    <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
      <Form.Item
        label="Ime"
        validateStatus={errors.firstName ? "error" : ""}
        help={errors.firstName?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item
        label="Prezime"
        validateStatus={errors.lastName ? "error" : ""}
        help={errors.lastName?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => <Input {...field} value={field.value ?? ""} />}
        />
      </Form.Item>

      <Form.Item
        label="Email"
        validateStatus={errors.email ? "error" : ""}
        help={errors.email?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => <Input {...field} value={field.value ?? ""} />}
        />
      </Form.Item>

      <Form.Item
        label="Username"
        validateStatus={errors.username ? "error" : ""}
        help={errors.username?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="username"
          control={control}
          render={({ field }) => <Input {...field} value={field.value ?? ""} />}
        />
      </Form.Item>

      {isEditUser && (
        <>
          <Form.Item
            label="Stari password"
            validateStatus={errors.oldPassword ? "error" : ""}
            help={errors.oldPassword?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="oldPassword"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} value={field.value ?? ""} />
              )}
            />
          </Form.Item>
          <Form.Item
            label="Novi password"
            validateStatus={errors.newPassword ? "error" : ""}
            help={errors.newPassword?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} value={field.value ?? ""} />
              )}
            />
          </Form.Item>
        </>
      )}

      {!isEditUser && (
        <>
          <Form.Item
            label="Password"
            validateStatus={errors.password ? "error" : ""}
            help={errors.password?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} value={field.value ?? ""} />
              )}
            />
          </Form.Item>
          <Form.Item
            label="Ponovi password"
            validateStatus={errors.repeatPassword ? "error" : ""}
            help={errors.repeatPassword?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="repeatPassword"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} value={field.value ?? ""} />
              )}
            />
          </Form.Item>
        </>
      )}

      <Form.Item
        style={{ textAlign: "center", marginBottom: 8 }}
        wrapperCol={{ span: 24 }}
      >
        <Button type="primary" htmlType="submit">
          Sačuvaj
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateAndEditUserComponent;
