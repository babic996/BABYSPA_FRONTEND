import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
} from "antd";
import { DatePicker as DatePickerMobile } from "antd-mobile";
import dayjs from "dayjs";
import {
  Control,
  Controller,
  FieldErrors,
  SubmitHandler,
  UseFormGetValues,
  UseFormHandleSubmit,
} from "react-hook-form";
import { TFunction } from "i18next";
import { CreateOrUpdateReservationInterface } from "../../interfaces/ReservationInterface";
import { ShortDetailsInterface } from "../../interfaces/ShortDetails";
import { StatusInterface } from "../../interfaces/StatusInterface";

interface ReservationModalContentProps {
  isOpen: boolean;
  isEditReservation: boolean;
  control: Control<CreateOrUpdateReservationInterface>;
  errors: FieldErrors<CreateOrUpdateReservationInterface>;
  handleSubmit: UseFormHandleSubmit<CreateOrUpdateReservationInterface>;
  onSubmit: SubmitHandler<CreateOrUpdateReservationInterface>;
  status: StatusInterface[];
  arrangements: ShortDetailsInterface[];
  isMobile: boolean;
  visible: boolean;
  setVisible: (value: boolean) => void;
  months: string[];
  t: TFunction;
  onCancel: () => void;
  onDelete: (reservationId?: number | null) => void | Promise<void>;
  getValues: UseFormGetValues<CreateOrUpdateReservationInterface>;
  onOpenArrangementModalInline: () => void;
}

const ReservationModalContent = ({
  isOpen,
  isEditReservation,
  control,
  errors,
  handleSubmit,
  onSubmit,
  status,
  arrangements,
  isMobile,
  visible,
  setVisible,
  months,
  t,
  onCancel,
  onDelete,
  getValues,
  onOpenArrangementModalInline,
}: ReservationModalContentProps) => {
  return (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>
          {isEditReservation
            ? t("modal.editReservation")
            : t("modal.createReservation")}
        </div>
      }
      maskClosable={false}
      open={isOpen}
      footer={null}
      onCancel={onCancel}
      width={isMobile ? 300 : 600}
      centered
    >
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
        {!isEditReservation && (
          <Form.Item
            label={t("modal.selectArrangement")}
            validateStatus={errors.arrangementId ? "error" : ""}
            help={errors.arrangementId?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="arrangementId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={t("modal.selectArrangement")}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Button
                        type="link"
                        style={{ paddingLeft: 8 }}
                        onClick={onOpenArrangementModalInline}
                      >
                        {t("button.addArrangement")}
                      </Button>
                    </>
                  )}
                  notFoundContent={
                    <div style={{ padding: 8 }}>
                      <div style={{ marginBottom: 8 }}>
                        {t("table.emptyTable")}
                      </div>
                      <Button type="link" onClick={onOpenArrangementModalInline}>
                        {t("button.addArrangement")}
                      </Button>
                    </div>
                  }
                >
                  {arrangements?.map((x) => (
                    <Select.Option key={x.id} value={x.id}>
                      {x.value}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>
        )}

        {!isEditReservation &&
          (isMobile ? (
            <Form.Item
              label={t("modal.reservationDateTime")}
              validateStatus={errors.startDate ? "error" : ""}
              help={errors.startDate?.message}
              style={{ marginBottom: 8 }}
            >
              <Controller
                name="startDate"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <>
                    <Button
                      onClick={() => setVisible(true)}
                      style={{ width: "100%" }}
                    >
                      {value
                        ? dayjs(value).format("DD.MM.YYYY HH:mm")
                        : t("common.chooseDateAndTime")}
                    </Button>
                    <DatePickerMobile
                      visible={visible}
                      onClose={() => setVisible(false)}
                      onConfirm={(date) => {
                        onChange(
                          date
                            ? dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
                            : ""
                        );
                        setVisible(false);
                      }}
                      precision="minute"
                      renderLabel={(type, data) => {
                        if (type === "month") {
                          return months[data - 1];
                        }
                        return data;
                      }}
                    />
                  </>
                )}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label={t("modal.reservationDateTime")}
              validateStatus={errors.startDate ? "error" : ""}
              help={errors.startDate?.message}
              style={{ marginBottom: 8 }}
            >
              <Controller
                name="startDate"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    showTime
                    format={["DD.MM.YYYY HH:mm", "D.M.YYYY HH:mm"]}
                    placeholder={t("common.chooseDateAndTime")}
                    value={value ? dayjs(value, "YYYY-MM-DD HH:mm:ss") : null}
                    onChange={(date) =>
                      onChange(
                        date ? dayjs(date).format("YYYY-MM-DDTHH:mm:ss") : ""
                      )
                    }
                    style={{ width: "100%" }}
                  />
                )}
              />
            </Form.Item>
          ))}

        {!isEditReservation && (
          <Form.Item
            label={t("modal.reservationDuration")}
            validateStatus={errors.durationReservation ? "error" : ""}
            help={errors.durationReservation?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="durationReservation"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} min={0} style={{ width: "100%" }} />
              )}
            />
          </Form.Item>
        )}

        {isEditReservation && (
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
                <Select {...field} placeholder={t("modal.selectStatus")}>
                  {status?.map((x) => (
                    <Select.Option
                      key={x.statusId}
                      value={x.statusId}
                      style={
                        status?.find(
                          (s) => s.statusCode === "term_canceled"
                        )?.statusId == x.statusId
                          ? { color: "red" }
                          : {}
                      }
                    >
                      {x.statusCode === "term_reserved"
                        ? t("common.reservedTerm")
                        : x.statusCode === "term_canceled"
                        ? t("common.canceledTerm")
                        : x.statusCode === "term_not_used"
                        ? t("common.notUsedTerm")
                        : x.statusCode === "term_used"
                        ? t("common.usedTerm")
                        : ""}
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
          <Button.Group>
            <Button type="primary" htmlType="submit">
              {t("button.save")}
            </Button>
            {isEditReservation && (
              <Popconfirm
                title={t("modal.deleteConfirmReservationTitle")}
                description={t("modal.deleteConfirmReservation")}
                okText={t("button.confirm")}
                cancelText={t("button.cancel")}
                onConfirm={() => onDelete(getValues("reservationId"))}
              >
                <Button type="default" danger>
                  {t("button.delete")}
                </Button>
              </Popconfirm>
            )}
          </Button.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReservationModalContent;

