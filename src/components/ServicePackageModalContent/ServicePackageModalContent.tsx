import React, { MutableRefObject } from "react";
import {
  toastErrorNotification,
  toastSuccessNotification,
} from "../../util/toastNotification";
import {
  addServicePackage,
  editServicePackage,
  getServicePackages,
} from "../../services/ServicePackageService";
import { handleApiError } from "../../util/const";
import {
  Control,
  Controller,
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
} from "react-hook-form";
import {
  DataStateServicePackage,
  ServicePackageInterface,
} from "../../interfaces/ServicePackageInterface";
import { Button, Form, Input, InputNumber } from "antd";
import { useFilter } from "../../context/Filter/useFilter";
import { TFunction } from "i18next";

interface ServicePackageModalContentProps {
  isEditServicePackage: boolean;
  existsByServicePackage: boolean;
  setDataState: React.Dispatch<React.SetStateAction<DataStateServicePackage>>;
  dataState: DataStateServicePackage;
  control: Control<ServicePackageInterface>;
  handleSubmit: UseFormHandleSubmit<ServicePackageInterface>;
  errors: FieldErrors<ServicePackageInterface>;
  isModalOpen: MutableRefObject<boolean>;
  t: TFunction;
}

const ServicePackageModalContent: React.FC<ServicePackageModalContentProps> = ({
  control,
  dataState,
  errors,
  existsByServicePackage,
  handleSubmit,
  isEditServicePackage,
  isModalOpen,
  setDataState,
  t,
}) => {
  const { onResetFilter } = useFilter();
  const onSubmit: SubmitHandler<ServicePackageInterface> = async (data) => {
    setDataState((prev) => ({ ...prev, loading: true }));
    try {
      if (isEditServicePackage) {
        const res = await editServicePackage(data);
        setDataState((prev) => ({
          ...prev,
          servicePackages: prev.servicePackages.map((item) =>
            item.servicePackageId === data.servicePackageId
              ? { ...item, ...res.data.data }
              : item
          ),
        }));
        isModalOpen.current = false;
        toastSuccessNotification(t("common.succesfullyEdited"));
        onResetFilter();
      } else {
        await addServicePackage(data);
        const result = await getServicePackages(dataState.cursor - 1, null);
        setDataState((prev) => ({
          ...prev,
          servicePackages: result.data.content,
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
        label={t("modal.servicePackageName")}
        validateStatus={errors.servicePackageName ? "error" : ""}
        help={errors.servicePackageName?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="servicePackageName"
          control={control}
          render={({ field }) => (
            <Input {...field} disabled={existsByServicePackage} />
          )}
        />
      </Form.Item>

      <Form.Item
        label={t("modal.termNumber")}
        validateStatus={errors.termNumber ? "error" : ""}
        help={errors.termNumber?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="termNumber"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={0}
              style={{ width: "100%" }}
              disabled={existsByServicePackage}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label={t("modal.servicePackageDurationDays")}
        validateStatus={errors.servicePackageDurationDays ? "error" : ""}
        help={errors.servicePackageDurationDays?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="servicePackageDurationDays"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={0}
              style={{ width: "100%" }}
              disabled={existsByServicePackage}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label={t("modal.price")}
        validateStatus={errors.price ? "error" : ""}
        help={errors.price?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={0}
              step={0.01}
              style={{ width: "100%" }}
            />
          )}
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
                if (e.key == "Enter") {
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

export default ServicePackageModalContent;
