import { Button, Form, Input, InputNumber, Select, Divider } from "antd";
import {
  Control,
  Controller,
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormSetValue,
} from "react-hook-form";
import {
  CreateOrUpdateArrangementInterface,
  DataStateArrangement,
  DropDownDataInterface,
} from "../../interfaces/ArrangementInterface";
import React, { MutableRefObject } from "react";
import {
  toastErrorNotification,
  toastSuccessNotification,
} from "../../util/toastNotification";
import { handleApiError } from "../../util/const";
import {
  addArrangement,
  editArrangement,
  getArrangements,
} from "../../services/ArrangementService";
import { useFilter } from "../../context/Filter/useFilter";
import { TFunction } from "i18next";

interface ArrangementModalContentProps {
  disableEditField: boolean;
  hidePaymentType: boolean;
  isEditArrangement: boolean;
  setHidePaymentType: React.Dispatch<React.SetStateAction<boolean>>;
  setDataState: React.Dispatch<React.SetStateAction<DataStateArrangement>>;
  dataState: DataStateArrangement;
  selectedDiscount: number | undefined | null;
  setValue: UseFormSetValue<CreateOrUpdateArrangementInterface>;
  control: Control<CreateOrUpdateArrangementInterface>;
  handleSubmit: UseFormHandleSubmit<CreateOrUpdateArrangementInterface>;
  errors: FieldErrors<CreateOrUpdateArrangementInterface>;
  dropdownData: DropDownDataInterface;
  isModalOpen: MutableRefObject<boolean>;
  t: TFunction;
  onSuccess?: (arrangementId: number) => void;
  onAddBabyClick?: () => void;
}

const ArrangementModalContent: React.FC<ArrangementModalContentProps> = ({
  control,
  disableEditField,
  dropdownData,
  selectedDiscount,
  errors,
  handleSubmit,
  setDataState,
  dataState,
  hidePaymentType,
  isEditArrangement,
  setHidePaymentType,
  setValue,
  isModalOpen,
  t,
  onSuccess,
  onAddBabyClick,
}) => {
  const { onResetFilter } = useFilter();
  const onSubmit: SubmitHandler<CreateOrUpdateArrangementInterface> = async (
    data,
  ) => {
    setDataState((prev) => ({ ...prev, loading: true }));
    try {
      if (isEditArrangement) {
        if (
          data.statusId ===
            dropdownData.status.find((x) => x.statusCode == "paid")?.statusId &&
          data.paymentTypeId == null
        ) {
          toastErrorNotification(t("modal.paymentTypeRequiredMessage"));
        } else {
          const res = await editArrangement(data);
          const oldItem = dataState.arrangements.find(
            (item) => item.arrangementId === data.arrangementId,
          );
          const oldPrice = oldItem?.price || 0;
          const newPrice = res.data.data?.price || 0;
          setDataState((prev) => ({
            ...prev,
            arrangements: prev.arrangements.map((item) =>
              item.arrangementId === data.arrangementId
                ? { ...item, ...res.data.data }
                : item,
            ),
            totalSum: prev.totalSum - oldPrice + newPrice,
          }));
          isModalOpen.current = false;
          toastSuccessNotification(t("common.succesfullyEdited"));
          onResetFilter();
        }
      } else {
        const res = await addArrangement(data);
        const result = await getArrangements(dataState.cursor - 1, null);
        setDataState((prev) => ({
          ...prev,
          arrangements: result.data.content,
          totalElements: result.data.totalElements,
          totalSum: dataState.totalSum + res.data.data.price,
        }));
        isModalOpen.current = false;
        toastSuccessNotification(t("common.succesfullyAdded"));
        if (res?.data?.data?.arrangementId && onSuccess) {
          onSuccess(res.data.data.arrangementId);
        }
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
        label={t("modal.selectBaby")}
        validateStatus={errors.babyId ? "error" : ""}
        help={errors.babyId?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="babyId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              disabled={disableEditField}
              placeholder={t("modal.selectBaby")}
              value={field.value == 0 ? null : field.value}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              dropdownRender={(menu) =>
                onAddBabyClick ? (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Button type="link" onClick={onAddBabyClick}>
                      {t("button.addBaby")}
                    </Button>
                  </>
                ) : (
                  menu
                )
              }
            >
              {dropdownData.babies?.map((x) => (
                <Select.Option key={x.id} value={x.id}>
                  {x.value}
                </Select.Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      <Form.Item
        label={t("modal.selectServicePackage")}
        validateStatus={errors.servicePackageId ? "error" : ""}
        help={errors.servicePackageId?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="servicePackageId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder={t("modal.selectServicePackage")}
              disabled={disableEditField}
              value={field.value == 0 ? null : field.value}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {dropdownData.servicePackages?.map((x) => (
                <Select.Option key={x.id} value={x.id}>
                  {x.value}
                </Select.Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      <Form.Item
        label={t("modal.selectDiscount")}
        validateStatus={errors.discountId ? "error" : ""}
        help={errors.discountId?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          name="discountId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder={t("modal.noDiscount")}
              showSearch
              allowClear
              optionFilterProp="children"
              onChange={(value) => {
                field.onChange(value);
                console.log(value);
                if (value === 0 || value === null || value === undefined) {
                  setValue("giftCardId", null);
                }
              }}
            >
              {dropdownData.discounts?.map((x) => (
                <Select.Option key={x.discountId} value={x.discountId}>
                  {x.discountName}
                </Select.Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      {isEditArrangement && (
        <>
          <Form.Item
            label={t("modal.selectStatus")}
            validateStatus={errors.statusId ? "error" : ""}
            help={errors.statusId?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="statusId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={t("modal.selectStatus")}
                  value={field.value == 0 ? null : field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    const selectedStatus = dropdownData.status.find(
                      (x) => x.statusId === value,
                    );
                    if (
                      selectedStatus?.statusCode === "created" ||
                      selectedStatus?.statusCode === "not_paid"
                    ) {
                      setHidePaymentType(true);
                      setValue("paymentTypeId", null);
                    } else {
                      setHidePaymentType(false);
                    }
                  }}
                >
                  {dropdownData.status?.map((x) => (
                    <Select.Option key={x.statusId} value={x.statusId}>
                      {x.statusCode === "paid"
                        ? t("common.paid")
                        : x.statusCode === "not_paid"
                          ? t("common.notPaid")
                          : x.statusCode === "created"
                            ? t("common.created")
                            : null}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          {!hidePaymentType && (
            <Form.Item
              label={t("modal.selectPaymentType")}
              validateStatus={errors.paymentTypeId ? "error" : ""}
              help={errors.paymentTypeId?.message}
              style={{ marginBottom: 8 }}
            >
              <Controller
                name="paymentTypeId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder={t("modal.selectPaymentType")}
                    value={field.value == 0 ? null : field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    {dropdownData.paymentTypes?.map((x) => (
                      <Select.Option
                        key={x.paymentTypeId}
                        value={x.paymentTypeId}
                      >
                        {x.paymentTypeName}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          )}

          <Form.Item
            label={t("modal.extendDurationDays")}
            validateStatus={errors.extendDurationDays ? "error" : ""}
            help={errors.extendDurationDays?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="extendDurationDays"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} min={0} style={{ width: "100%" }} />
              )}
            />
          </Form.Item>
        </>
      )}
      {selectedDiscount != null && selectedDiscount > 0 && (
        <Form.Item
          label={t("modal.selectGiftCard")}
          validateStatus={errors.giftCardId ? "error" : ""}
          help={errors.giftCardId?.message}
          style={{ marginBottom: 8 }}
        >
          <Controller
            name="giftCardId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder={t("modal.selectGiftCard")}
                showSearch
                allowClear
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                value={field.value == 0 ? null : field.value}
              >
                {dropdownData.giftCards?.map((x) => (
                  <Select.Option key={x.giftCardId} value={x.giftCardId}>
                    {x.serialNumber}
                  </Select.Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>
      )}

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

export default ArrangementModalContent;
