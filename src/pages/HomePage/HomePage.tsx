import { Button, Modal, Row, Col, Tag, Space, Popover } from "antd";
import "./HomePage.scss";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  CreateOrUpdateReservationInterface,
  DataStateReservation,
  OverviewReservationInterface,
  TableReservationInterface,
} from "../../interfaces/ReservationInterface";
import { useForm, SubmitHandler, useWatch } from "react-hook-form";
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
import FullPageSpiner from "../../components/FullPageSpiner/FullPageSpiner";
import { yupResolver } from "@hookform/resolvers/yup";
import { getReservationSchema } from "../../validations/ReservationValidationSchema";
import { handleApiError } from "../../util/const";
import AddButton from "../../components/ButtonComponents/AddButton";
import useMediaQuery from "../../hooks/useMediaQuery";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import { useFilter } from "../../context/Filter/useFilter";
import { FaInfoCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import ResponsiveCalendarWrapper from "../../components/CalendarComponent/ResponsiveCalendarWrapper";
import { BabyInterface, DataStateBaby } from "../../interfaces/BabyInterface";
import {
  CreateOrUpdateArrangementInterface,
  DataStateArrangement,
  DropDownDataInterface,
} from "../../interfaces/ArrangementInterface";
import { getBabyValidationSchema } from "../../validations/BabyValidationSchema";
import { getArrangementValidationSchema } from "../../validations/ArrangementValidationSchema";
import BabyModalContent from "../../components/BabyModalContent/BabyModalContent";
import ArrangementModalContent from "../../components/ArrangementModalContent/ArrangementModalContent";
import { getBabiesList } from "../../services/BabyService";
import { getServicePackagesList } from "../../services/ServicePackageService";
import { getDiscountList } from "../../services/DiscountService";
import { getPaymentTypeList } from "../../services/PaymentTypeService";
import ReservationModalContent from "../../components/ReservationModalContent/ReservationModalContent";

const TableComponent = lazy(() => import("./TableComponent"));

const HomePage = () => {
  const isModalOpen = useRef<boolean>(false);
  const isBabyModalOpen = useRef<boolean>(false);
  const isArrangementModalOpen = useRef<boolean>(false);
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
  const [isBabyModalVisible, setIsBabyModalVisible] = useState<boolean>(false);
  const [isArrangementModalVisible, setIsArrangementModalVisible] =
    useState<boolean>(false);
  const [babyDataState, setBabyDataState] = useState<DataStateBaby>({
    cursor: 1,
    babies: [],
    totalElements: undefined,
    loading: false,
  });
  const [isEditBabyInline, setIsEditBabyInline] = useState<boolean>(false);
  const [arrangementDataState, setArrangementDataState] =
    useState<DataStateArrangement>({
      cursor: 1,
      arrangements: [],
      totalElements: undefined,
      totalSum: 0,
      loading: false,
    });
  const [dropdownData, setDropdownData] = useState<DropDownDataInterface>({
    babies: [],
    servicePackages: [],
    discounts: [],
    giftCards: [],
    status: [],
    paymentTypes: [],
  });
  const [isEditArrangementInline, setIsEditArrangementInline] =
    useState<boolean>(false);
  const [hidePaymentTypeInline, setHidePaymentTypeInline] =
    useState<boolean>(false);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
    setValue,
  } = useForm<CreateOrUpdateReservationInterface>({
    resolver: yupResolver(reservationSchema),
  });

  const {
    control: babyControl,
    handleSubmit: handleSubmitBaby,
    reset: resetBaby,
    formState: { errors: babyErrors },
  } = useForm<BabyInterface>({
    resolver: yupResolver(getBabyValidationSchema(isEditBabyInline, t)),
  });

  const arrangementSchema = getArrangementValidationSchema(
    isEditArrangementInline,
    dropdownData.paymentTypes,
    t,
  );

  const {
    control: arrangementControl,
    handleSubmit: handleSubmitArrangement,
    reset: resetArrangement,
    setValue: setArrangementValue,
    formState: { errors: arrangementErrors },
  } = useForm<CreateOrUpdateArrangementInterface>({
    resolver: yupResolver(arrangementSchema),
  });

  const selectedDiscountId = useWatch({
    control: arrangementControl,
    name: "discountId",
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

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [servicePackages, babies, status, discounts, paymentTypes] =
          await Promise.all([
            getServicePackagesList(),
            getBabiesList(),
            getStatusList("arrangement"),
            getDiscountList(),
            getPaymentTypeList(),
          ]);

        setDropdownData((prev) => ({
          ...prev,
          servicePackages,
          babies,
          discounts,
          status,
          paymentTypes,
        }));
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      }
    };

    fetchDropdownData();
  }, []);

  useUpdateEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const reservationsRes = await getReservationsList(
          abortController.signal,
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
          abortController.signal,
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
        null,
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

  const handleOpenBabyModalInline = () => {
    resetBaby({
      babyId: null,
      babyName: "",
      babySurname: "",
      birthDate: null,
      numberOfMonths: 0,
      phoneNumber: "",
      motherName: "",
      note: "",
    });
    setIsEditBabyInline(false);
    isBabyModalOpen.current = true;
    setIsBabyModalVisible(true);
  };

  const handleOpenArrangementModalInline = () => {
    resetArrangement({
      arrangementId: null,
      note: "",
      discountId: null,
      giftCardId: null,
      babyId: 0,
      statusId: null,
      servicePackageId: 0,
      paymentTypeId: null,
      extendDurationDays: null,
    });
    setIsEditArrangementInline(false);
    setHidePaymentTypeInline(false);
    isArrangementModalOpen.current = true;
    setIsArrangementModalVisible(true);
  };

  const handleBabyCreatedInline = async (babyId: number) => {
    try {
      const babies = await getBabiesList();
      setDropdownData((prev) => ({
        ...prev,
        babies,
      }));
      setArrangementValue("babyId", babyId);
      isBabyModalOpen.current = false;
      setIsBabyModalVisible(false);
    } catch (e) {
      toastErrorNotification(handleApiError(e));
    }
  };

  const handleArrangementCreatedInline = async (arrangementId: number) => {
    try {
      const arrangementsRes = await getArrangementsList();
      setArrangements(arrangementsRes);
      setValue("arrangementId", arrangementId);
      isArrangementModalOpen.current = false;
      setIsArrangementModalVisible(false);
    } catch (e) {
      toastErrorNotification(handleApiError(e));
    }
  };

  const nextPage = (page: number) => {
    setDataState((prev) => ({ ...prev, cursor: page, loading: true }));
  };

  const onSubmit: SubmitHandler<CreateOrUpdateReservationInterface> = async (
    data,
  ) => {
    setLoading(true);
    if (isEditReservation) {
      try {
        const res = await editReservation(data);
        setReservations((prev) =>
          prev.map((item) =>
            item.reservationId === data.reservationId
              ? { ...item, ...res.data.data }
              : item,
          ),
        );
        setDataState((prev) => ({
          ...prev,
          reservations: prev.reservations.map((item) =>
            item.reservationId === data.reservationId
              ? { ...item, ...res.data.data }
              : item,
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
          null,
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
      <ReservationModalContent
        isOpen={isModalOpen.current}
        isEditReservation={isEditReservation}
        control={control}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        status={status}
        arrangements={arrangements}
        isMobile={isMobile}
        visible={visible}
        setVisible={setVisible}
        months={months}
        t={t}
        onCancel={handleModalCancel}
        onDelete={handleDelete}
        getValues={getValues}
        onOpenArrangementModalInline={handleOpenArrangementModalInline}
      />
      <Modal
        title={
          <div style={{ textAlign: "center" }}>{t("modal.createBaby")}</div>
        }
        maskClosable={false}
        open={isBabyModalVisible}
        footer={null}
        onCancel={() => {
          isBabyModalOpen.current = false;
          setIsBabyModalVisible(false);
        }}
        width={isMobile ? 300 : 600}
        centered
      >
        <BabyModalContent
          control={babyControl}
          dataState={babyDataState}
          errors={babyErrors}
          handleSubmit={handleSubmitBaby}
          isEditBaby={isEditBabyInline}
          isModalOpen={isBabyModalOpen}
          setDataState={setBabyDataState}
          t={t}
          onSuccess={handleBabyCreatedInline}
        />
      </Modal>
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            {t("modal.createArrangement")}
          </div>
        }
        maskClosable={false}
        open={isArrangementModalVisible}
        footer={null}
        onCancel={() => {
          isArrangementModalOpen.current = false;
          setIsArrangementModalVisible(false);
        }}
        width={isMobile ? 300 : 600}
        centered
      >
        <ArrangementModalContent
          control={arrangementControl}
          dataState={arrangementDataState}
          disableEditField={false}
          dropdownData={dropdownData}
          errors={arrangementErrors}
          handleSubmit={handleSubmitArrangement}
          hidePaymentType={hidePaymentTypeInline}
          isEditArrangement={isEditArrangementInline}
          isModalOpen={isArrangementModalOpen}
          selectedDiscount={selectedDiscountId}
          setDataState={setArrangementDataState}
          setHidePaymentType={setHidePaymentTypeInline}
          setValue={setArrangementValue}
          t={t}
          onSuccess={handleArrangementCreatedInline}
          onAddBabyClick={handleOpenBabyModalInline}
        />
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
                <Suspense fallback={<FullPageSpiner />}>
                  <TableComponent
                    isMobile={isMobile}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                    dataState={dataState}
                    nextPage={nextPage}
                    t={t}
                  />
                </Suspense>
              )}
              {!isTableView && (
                <ResponsiveCalendarWrapper
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
