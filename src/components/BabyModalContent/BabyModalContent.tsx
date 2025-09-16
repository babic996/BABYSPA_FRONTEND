import React, { MutableRefObject } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
} from "react-hook-form";
import { BabyInterface, DataStateBaby } from "../../interfaces/BabyInterface";
import {
  toastErrorNotification,
  toastSuccessNotification,
} from "../../util/toastNotification";
import { handleApiError } from "../../util/const";
import { addBaby, editBaby, getBabies } from "../../services/BabyService";
import { Button, DatePicker, Form, Input, InputNumber } from "antd";
import dayjs from "dayjs";
import { useFilter } from "../../context/Filter/useFilter";
import { TFunction } from "i18next";

interface BabyModalContentProps {
  isEditBaby: boolean;
  setDataState: React.Dispatch<React.SetStateAction<DataStateBaby>>;
  dataState: DataStateBaby;
  control: Control<BabyInterface>;
  handleSubmit: UseFormHandleSubmit<BabyInterface>;
  errors: FieldErrors<BabyInterface>;
  isModalOpen: MutableRefObject<boolean>;
  t: TFunction;
}

const BabyModalContent: React.FC<BabyModalContentProps> = ({
  control,
  dataState,
  errors,
  handleSubmit,
  isEditBaby,
  isModalOpen,
  setDataState,
  t,
}) => {
  const { onResetFilter } = useFilter();
  const onSubmit: SubmitHandler<BabyInterface> = async (data) => {
    setDataState((prev) => ({ ...prev, loading: true }));
    try {
      if (isEditBaby) {
        const res = await editBaby(data);
        setDataState((prev) => ({
          ...prev,
          babies: dataState.babies.map((baby) =>
            baby.babyId == data.babyId ? { ...baby, ...res.data.data } : baby
          ),
        }));
        isModalOpen.current = false;
        toastSuccessNotification(t("common.succesfullyEdited"));
        onResetFilter();
      } else {
        await addBaby(data);
        const result = await getBabies(dataState.cursor - 1, null);
        setDataState((prev) => ({
          ...prev,
          babies: result.data.content,
          totalElements: result.data.totalElements,
        }));
        isModalOpen.current = false;
        toastSuccessNotification(t("common.succesfullyAdded"));
        onResetFilter();
      }
    } catch (e) {
      toastErrorNotification(handleApiError(e));
    } finally {
      setDataState((prev) => ({ ...prev, loading: false }));
    }
  };
  return (
    <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
      <Form.Item
        label={t("modal.babyName")}
        validateStatus={errors.babyName ? "error" : ""}
        help={errors.babyName?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="babyName"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item
        label={t("modal.babySurname")}
        validateStatus={errors.babySurname ? "error" : ""}
        help={errors.babySurname?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="babySurname"
          control={control}
          render={({ field }) => <Input {...field} value={field.value ?? ""} />}
        />
      </Form.Item>

      <Form.Item
        label={t("modal.birthDate")}
        validateStatus={errors.birthDate ? "error" : ""}
        help={errors.birthDate?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="birthDate"
          control={control}
          render={({ field: { onChange, value } }) => (
            <DatePicker
              value={value ? dayjs(value, "YYYY-MM-DD") : null}
              onChange={(date) =>
                onChange(date ? dayjs(date).format("YYYY-MM-DDTHH:mm:ss") : "")
              }
              style={{ width: "100%" }}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label={t("modal.numberOfMonths")}
        validateStatus={errors.numberOfMonths ? "error" : ""}
        help={errors.numberOfMonths?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="numberOfMonths"
          control={control}
          render={({ field }) => (
            <InputNumber {...field} min={0} style={{ width: "100%" }} />
          )}
        />
      </Form.Item>

      <Form.Item
        label={t("modal.phoneNumber")}
        validateStatus={errors.phoneNumber ? "error" : ""}
        help={errors.phoneNumber?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item
        label={t("modal.motherName")}
        validateStatus={errors.motherName ? "error" : ""}
        help={errors.motherName?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="motherName"
          control={control}
          render={({ field }) => <Input {...field} value={field.value ?? ""} />}
        />
      </Form.Item>

      <Form.Item
        label={t("modal.note")}
        validateStatus={errors.note ? "error" : ""}
        help={errors.note?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              value={field.value ?? ""}
              autoSize={{ minRows: 0, maxRows: 6 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const newValue = `${field.value ?? ""}\n`;
                  field.onChange(newValue);
                }
              }}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        style={{ textAlign: "center", marginBottom: 8 }}
        wrapperCol={{ span: 24 }}
      >
        <Button type="primary" htmlType="submit">
          {t("button.save")}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BabyModalContent;
