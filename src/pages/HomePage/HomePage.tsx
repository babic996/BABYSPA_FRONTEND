import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Popconfirm,
  Row,
  Col,
  Tag,
  Space,
  Popover,
} from "antd";
import { DatePicker as DatePickerMobile } from "antd-mobile";
import "./HomePage.scss";
import CalendarComponent from "../../components/CalendarComponent/CalendarComponent";
import { useEffect, useRef, useState } from "react";
import {
  CreateOrUpdateReservationInterface,
  DataStateReservation,
  OverviewReservationInterface,
  TableReservationInterface,
} from "../../interfaces/ReservationInterface";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { getStatusList } from "../../services/StatusService";
import {
  addReservation,
  deleteReservation,
  editReservation,
  getReservationsList,
  getReservationsTable,
} from "../../services/ReservationServices";
import { StatusInterface } from "../../interfaces/StatusInterface";
import { ShortDetailsInterface } from "../../interfaces/ShortDetails";
import { getArrangementsList } from "../../services/ArrangementService";
import {
  toastErrorNotification,
  toastSuccessNotification,
} from "../../util/toastNotification";
import dayjs from "dayjs";
import FullPageSpiner from "../../components/FullPageSpiner/FullPageSpiner";
import { yupResolver } from "@hookform/resolvers/yup";
import { getReservationSchema } from "../../validations/ReservationValidationSchema";
import { handleApiError } from "../../util/const";
import AddButton from "../../components/ButtonComponents/AddButton";
import useMediaQuery from "../../hooks/useMediaQuery";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import TableComponent from "./TableComponent";
import { useFilter } from "../../context/Filter/useFilter";
import { FaInfoCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const HomePage = () => {
  const isModalOpen = useRef<boolean>(false);
  const { t } = useTranslation();
  const [isEditReservation, setIsEditReservation] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusInterface[]>([]);
  const [reservations, setReservations] = useState<
    OverviewReservationInterface[]
  >([]);
  const [dataState, setDataState] = useState<DataStateReservation>({
    cursor: 1,
    reservations: [] as TableReservationInterface[],
    totalElements: undefined as number | undefined,
    loading: true,
  });
  const [arrangements, setArrangements] = useState<ShortDetailsInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const reservationSchema = getReservationSchema(isEditReservation, t);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [canFetch, setCanFetch] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [isTableView, setIsTableView] = useState<boolean>(false);
  const { filter, onResetFilter } = useFilter();
  const months = i18n.t("common.months", { returnObjects: true }) as string[];

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<CreateOrUpdateReservationInterface>({
    resolver: yupResolver(reservationSchema),
  });

  //------------------LIFECYCLE----------------

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [arrangementsRes, statusRes] = await Promise.all([
          getArrangementsList(),
          getStatusList("reservation"),
        ]);
        setArrangements(arrangementsRes);
        setStatus(statusRes);
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        setCanFetch(true);
        onResetFilter();
      }
    };

    fetchInitialData();
  }, []);

  useUpdateEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const reservationsRes = await getReservationsList(
          abortController.signal
        );
        setReservations(reservationsRes);
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        setLoading(false);
      }
    };

    if (canFetch) {
      fetchData();
    }

    return () => {
      abortController.abort();
    };
  }, [canFetch]);

  useUpdateEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setDataState((prev) => ({ ...prev, loading: true }));
        const result = await getReservationsTable(
          dataState.cursor - 1,
          filter,
          abortController.signal
        );
        setDataState((prev) => ({
          ...prev,
          reservations: result.data.content,
          totalElements: result.data.totalElements,
        }));
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        setDataState((prev) => ({ ...prev, loading: false }));
      }
    };

    if (canFetch && isTableView) fetchData();

    return () => {
      abortController.abort();
    };
  }, [dataState.cursor, filter, canFetch, isTableView]);

  //------------------METHODS----------------

  const handleEdit = (record: CreateOrUpdateReservationInterface) => {
    setIsEditReservation(true);
    reset({
      reservationId: record.reservationId,
      note: record?.note,
      statusId: record.statusId,
    });
    isModalOpen.current = true;
  };

  const handleDelete = async (reservationId?: number | null) => {
    if (!reservationId) {
      isModalOpen.current = false;
      return;
    }

    setLoading(true);
    try {
      await deleteReservation(reservationId);

      const resultCalendarView = await getReservationsList();
      setReservations(resultCalendarView);

      const resultTableView = await getReservationsTable(
        dataState.cursor - 1,
        null
      );

      setDataState((prev) => ({
        ...prev,
        reservations: resultTableView.data.content,
        totalElements: resultTableView.data.totalElements,
      }));

      const arrangements = await getArrangementsList();
      setArrangements(arrangements);

      toastSuccessNotification("Obrisano!");
    } catch (error) {
      toastErrorNotification(handleApiError(error));
    } finally {
      setLoading(false);
      isModalOpen.current = false;
    }
  };

  const handleModalCancel = () => {
    reset({
      reservationId: null,
      startDate: null,
      statusId: null,
      durationReservation: null,
      arrangementId: null,
      note: "",
    });
    setIsEditReservation(false);
    isModalOpen.current = false;
  };

  const handleCreateModal = () => {
    reset({
      reservationId: null,
      statusId: null,
      startDate: null,
      durationReservation: null,
      arrangementId: null,
      note: "",
    });
    setIsEditReservation(false);
    isModalOpen.current = true;
  };

  const nextPage = (page: number) => {
    setDataState((prev) => ({ ...prev, cursor: page, loading: true }));
  };

  const onSubmit: SubmitHandler<CreateOrUpdateReservationInterface> = async (
    data
  ) => {
    setLoading(true);
    if (isEditReservation) {
      try {
        const res = await editReservation(data);
        setReservations((prev) =>
          prev.map((item) =>
            item.reservationId === data.reservationId
              ? { ...item, ...res.data.data }
              : item
          )
        );
        setDataState((prev) => ({
          ...prev,
          reservations: prev.reservations.map((item) =>
            item.reservationId === data.reservationId
              ? { ...item, ...res.data.data }
              : item
          ),
        }));
        isModalOpen.current = false;
        const arrangements = await getArrangementsList();
        setArrangements(arrangements);
        toastSuccessNotification(t("common.succesfullyEdited"));
        onResetFilter();
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await addReservation(data);

        const resultCalendarView = await getReservationsList();
        setReservations(resultCalendarView);

        const resultTableView = await getReservationsTable(
          dataState.cursor - 1,
          null
        );

        setDataState((prev) => ({
          ...prev,
          reservations: resultTableView.data.content,
          totalElements: resultTableView.data.totalElements,
        }));

        const arrangements = await getArrangementsList();
        setArrangements(arrangements);

        isModalOpen.current = false;
        toastSuccessNotification(t("common.succesfullyAdded"));
        onResetFilter();
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        setLoading(false);
      }
    }
  };

  //------------------RENDER------------------

  return (
    <>
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            {isEditReservation
              ? t("modal.editReservation")
              : t("modal.createReservation")}
          </div>
        }
        maskClosable={false}
        open={isModalOpen.current}
        footer={null}
        onCancel={handleModalCancel}
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
                      format="DD-MM-YYYY HH:mm"
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
                          status?.find((x) => x.statusCode === "term_canceled")
                            ?.statusId == x.statusId
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
                <>
                  <Popconfirm
                    title={t("modal.deleteConfirmReservationTitle")}
                    description={t("modal.deleteConfirmReservation")}
                    okText={t("button.confirm")}
                    cancelText={t("button.cancel")}
                    onConfirm={() => handleDelete(getValues("reservationId"))}
                  >
                    <Button type="default" danger>
                      {t("button.delete")}
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Button.Group>
          </Form.Item>
        </Form>
      </Modal>
      <div className="container">
        {loading && <FullPageSpiner />}
        {!loading && (
          <>
            <Row
              align="middle"
              justify="space-between"
              style={{ marginBottom: 10 }}
            >
              <Col>
                <AddButton
                  buttonTitle={t("button.addReservation")}
                  onButtonAction={handleCreateModal}
                />
              </Col>

              {!isTableView && (
                <Col
                  flex={isMobile ? undefined : "auto"}
                  style={isMobile ? {} : { textAlign: "center" }}
                >
                  {isMobile ? (
                    <Popover
                      content={
                        <Space direction="vertical">
                          <Tag color="#16c9d3">{t("common.reservedTerm")}</Tag>
                          <Tag color="#f40511">{t("common.canceledTerm")}</Tag>
                          <Tag color="#4caf50">{t("common.usedTerm")}</Tag>
                          <Tag color="#ff660d">{t("common.notUsedTerm")}</Tag>
                        </Space>
                      }
                    >
                      <Button type="text" icon={<FaInfoCircle size={18} />} />
                    </Popover>
                  ) : (
                    <Space size={[8, 8]} wrap={false}>
                      <Tag color="#16c9d3">{t("common.reservedTerm")}</Tag>
                      <Tag color="#f40511">{t("common.canceledTerm")}</Tag>
                      <Tag color="#4caf50">{t("common.usedTerm")}</Tag>
                      <Tag color="#ff660d">{t("common.notUsedTerm")}</Tag>
                    </Space>
                  )}
                </Col>
              )}

              <Col>
                <Button
                  type="primary"
                  onClick={() => setIsTableView((prev) => !prev)}
                >
                  {!isTableView
                    ? isMobile
                      ? t("button.table")
                      : t("button.tableLong")
                    : isMobile
                    ? t("button.calendar")
                    : t("button.calendarLong")}
                </Button>
              </Col>
            </Row>

            <div className="calendar-wrapper">
              {isTableView && (
                <TableComponent
                  isMobile={isMobile}
                  handleDelete={handleDelete}
                  handleEdit={handleEdit}
                  dataState={dataState}
                  nextPage={nextPage}
                  t={t}
                />
              )}
              {!isTableView && (
                <CalendarComponent
                  reservations={reservations}
                  onEventClick={handleEdit}
                  t={t}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default HomePage;
