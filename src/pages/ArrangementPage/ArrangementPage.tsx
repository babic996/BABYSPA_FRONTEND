import { useEffect, useRef, useState } from "react";
import {
  CreateOrUpdateArrangementInterface,
  TableArrangementInterface,
} from "../../interfaces/ArrangementInterface";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  addArrangement,
  deleteArrangement,
  editArrangement,
  getArrangements,
  getArrangementsPrice,
} from "../../services/ArrangementService";
import {
  toastErrorNotification,
  toastSuccessNotification,
} from "../../util/toastNotification";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  ContactsOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { convertTableArrangementToCreateOrUpdateArrangement } from "../../mappers/ArrangementMapper";
import InfoModal from "../../components/InfoModal/InfoModal";
import FilterComponent from "../../components/FilterComponent/FilterComponent";
import { DEFAULT_PAGE_SIZE, errorResponse } from "../../util/const";
import { getServicePackagesList } from "../../services/ServicePackageService";
import { getBabiesList } from "../../services/BabyService";
import { ShortDetailsInterface } from "../../interfaces/ShortDetails";
import { StatusInterface } from "../../interfaces/StatusInterface";
import { getStatusList } from "../../services/StatusService";
import { DiscountInterface } from "../../interfaces/DiscountInterface";
import { getDiscountList } from "../../services/DiscountService";
import { PaymentTypeInterface } from "../../interfaces/PaymentTypeInterface";
import { getPaymentTypeList } from "../../services/PaymentTypeService";
import { useFilter } from "../../context/Filter/useFilter";
import {
  existsByArrangement,
  getReservationsByArrangement,
} from "../../services/ReservationServices";
import { yupResolver } from "@hookform/resolvers/yup";
import { getArrangementValidationSchema } from "../../validations/ArrangementValidationSchema";
import { ReservationShortDetailsInterface } from "../../interfaces/ReservationShortDetailsInterface";
import ReservationInfoModal from "../../components/ReservationInfoModal/ReservationInfoModal";
import HeaderButtonsComponent from "../../components/HeaderButtonsComponent/HeaderButtonsComponent";
import useMediaQuery from "../../hooks/useMediaQuery";
import TableCard from "../../components/TableCard/TableCard";
import "./ArrangementPage.scss";
import useUpdateEffect from "../../hooks/useUpdateEffect";

const ArrangementPage = () => {
  const isModalOpen = useRef<boolean>(false);
  const [cursor, setCursor] = useState<number>(1);
  const [arrangements, setArrangements] = useState<TableArrangementInterface[]>(
    []
  );
  const [babies, setBabies] = useState<ShortDetailsInterface[]>([]);
  const [servicePackages, setServicePackages] = useState<
    ShortDetailsInterface[]
  >([]);
  const [discounts, setDiscounts] = useState<DiscountInterface[]>([]);
  const [status, setStatus] = useState<StatusInterface[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeInterface[]>([]);
  const [reservationShortDetails, setRervationShortDetails] = useState<
    ReservationShortDetailsInterface[]
  >([]);
  const [totalElements, setTotalElements] = useState<number>();
  const [isEditArrangement, setIsEditArrangement] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentNote, setCurrentNote] = useState<string>("");
  const isInfoModalVisible = useRef<boolean>(false);
  const isReservationInfoModalVisible = useRef<boolean>(false);
  const [hidePaymentType, setHidePaymentType] = useState<boolean>(false);
  const [disableEditField, setDisableEditField] = useState<boolean>(false);
  const [totalSum, setTotalSum] = useState<number>(0);
  const schema = getArrangementValidationSchema(isEditArrangement);
  const { filter, showFilters, setShowFilters, onResetFilter } = useFilter();
  const isMobile = useMediaQuery("(max-width: 1280px)");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateOrUpdateArrangementInterface>({
    resolver: yupResolver(schema),
  });

  //------------------LIFECYCLE------------------

  useEffect(() => {
    Promise.all([
      getServicePackagesList(),
      getBabiesList(),
      getStatusList("arrangement"),
      getDiscountList(),
      getPaymentTypeList(),
    ]).then(([servicePackages, babies, status, discounts, paymentTypes]) => {
      setServicePackages(servicePackages);
      setBabies(babies);
      setStatus(status);
      setDiscounts(discounts);
      setPaymentTypes(paymentTypes);
    });
    onResetFilter();
  }, []);

  useUpdateEffect(() => {
    if (filter) {
      setLoading(true);
      Promise.all([
        getArrangements(cursor - 1, filter),
        getArrangementsPrice(filter),
      ])
        .then(([arrangementsResult, priceResult]) => {
          setArrangements(arrangementsResult.data.content);
          setTotalElements(arrangementsResult.data.totalElements);
          setTotalSum(priceResult.data);
        })
        .catch((e) => {
          toastErrorNotification(e.response?.data?.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [cursor, filter]);

  useUpdateEffect(() => {
    if (cursor > 1) {
      setCursor(1);
    }
  }, [filter]);

  //------------------METHODS----------------

  const nextPage = (page: number) => {
    setCursor(page);
  };

  const handleEdit = (record: CreateOrUpdateArrangementInterface) => {
    setIsEditArrangement(true);
    if (
      status.find((x) => x.statusId == record.statusId)?.statusCode ==
        "created" ||
      status.find((x) => x.statusId == record.statusId)?.statusCode ==
        "not_paid"
    ) {
      setHidePaymentType(true);
    } else {
      setHidePaymentType(false);
    }
    if (record.arrangementId) {
      existsByArrangement(record.arrangementId).then((res) =>
        setDisableEditField(res)
      );
    }
    reset({
      arrangementId: record.arrangementId ?? null,
      discountId: record?.discountId ?? null,
      paymentTypeId: record?.paymentTypeId ?? null,
      babyId: record.babyId,
      note: record?.note ?? "",
      servicePackageId: record.servicePackageId,
      statusId: record.statusId,
      extendDurationDays: record.extendDurationDays,
    });
    isModalOpen.current = true;
  };

  const handleDelete = async (arrangementId?: number | null) => {
    if (arrangementId) {
      setLoading(true);
      try {
        await deleteArrangement(arrangementId);
        const result = await getArrangements(cursor - 1, null);
        setArrangements(result.data.content);
        setTotalElements(result.data.totalElements);
        toastSuccessNotification("Obrisano!");
      } catch (e) {
        errorResponse(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGetReservation = async (arrangementId?: number | null) => {
    if (arrangementId) {
      setLoading(true);
      try {
        const result = await getReservationsByArrangement(arrangementId);
        setRervationShortDetails(result);
        isReservationInfoModalVisible.current = true;
      } catch (e) {
        errorResponse(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModalCancel = () => {
    reset({
      arrangementId: null,
      discountId: null,
      babyId: 0,
      statusId: null,
      paymentTypeId: null,
      servicePackageId: 0,
      note: "",
    });
    setIsEditArrangement(false);
    setDisableEditField(false);
    isModalOpen.current = false;
  };

  const handleCreateModal = () => {
    reset({
      arrangementId: null,
      discountId: null,
      babyId: 0,
      statusId: null,
      paymentTypeId: null,
      servicePackageId: 0,
      note: "",
    });
    setIsEditArrangement(false);
    setDisableEditField(false);
    isModalOpen.current = true;
  };

  const handleOpenInfoModal = (note?: string | null) => {
    if (note) {
      setCurrentNote(note);
      isInfoModalVisible.current = true;
    }
  };

  const handleCloseInfoModal = () => {
    isInfoModalVisible.current = false;
    setCurrentNote("");
  };

  const handleCloseReservationInfoModal = () => {
    isReservationInfoModalVisible.current = false;
    setRervationShortDetails([]);
  };

  const onSubmit: SubmitHandler<CreateOrUpdateArrangementInterface> = async (
    data
  ) => {
    setLoading(true);
    try {
      if (isEditArrangement) {
        if (
          data.statusId ===
            status.find((x) => x.statusCode == "paid")?.statusId &&
          data.paymentTypeId == null
        ) {
          toastErrorNotification("Morate izabrati tip plaćanja!");
        } else {
          const res = await editArrangement(data);
          setArrangements((prev) =>
            prev.map((item) =>
              item.arrangementId === data.arrangementId
                ? { ...item, ...res.data.data }
                : item
            )
          );
          isModalOpen.current = false;
          toastSuccessNotification("Ažurirano!");
        }
      } else {
        await addArrangement(data);
        const result = await getArrangements(cursor - 1, null);
        setArrangements(result.data.content);
        setTotalElements(result.data.totalElements);
        isModalOpen.current = false;
        toastSuccessNotification("Sačuvano!");
      }
    } catch (e) {
      errorResponse(e);
    } finally {
      setLoading(false);
    }
  };

  //------------------RENDER------------------

  const columns: ColumnsType<TableArrangementInterface> = [
    {
      title: "ID aranžmana",
      dataIndex: "arrangementId",
      key: "arrangementId",
    },
    {
      title: "Naziv paketa usluge",
      dataIndex: "servicePackage",
      key: "servicePackage",
      render: (item) => {
        return item ? item.value : "Nema podatka";
      },
    },
    {
      title: "Podaci o bebi",
      dataIndex: "babyDetails",
      key: "babyDetails",
      render: (item) => {
        return item ? item.value : "Nema podatka";
      },
    },
    {
      title: "Broj preostalih termina",
      dataIndex: "remainingTerm",
      key: "remainingTerm",
    },
    {
      title: "Cijena u KM",
      dataIndex: "price",
      key: "price",
      render: (item) => {
        return item ? item.toFixed(2) : "Nema podatka";
      },
    },
    {
      title: "Ostvareni popust",
      dataIndex: "discount",
      key: "discount",
      render: (item) => {
        return item ? item.value : "Nije ostvaren popust";
      },
    },
    {
      title: "Tip plaćanja",
      dataIndex: "paymentType",
      key: "paymentType",
      render: (item) => {
        return item ? item.value : "Nije plaćeno";
      },
    },
    {
      title: "Bilješka",
      dataIndex: "note",
      key: "note",
      render: (value) => {
        const previewText =
          value?.length > 3 ? value.slice(0, 3) + "..." : value;

        return (
          <span
            onClick={() => handleOpenInfoModal(value)}
            style={{ cursor: "pointer", color: "#1890ff" }}
          >
            {previewText}
          </span>
        );
      },
    },
    {
      title: "Datum kreiranja",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => {
        return value
          ? dayjs(value).format("DD.MM.YYYY.") + " godine"
          : "Nema podatka";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (item) => {
        return item ? (
          item.value === "Plaćen" ? (
            <Tag color="success">{item.value}</Tag>
          ) : item.value === "Nije plaćen" ? (
            <Tag color="error">{item.value}</Tag>
          ) : item.value === "Kreiran" ? (
            <Tag color="warning">{item.value}</Tag>
          ) : (
            "Nema podatka"
          )
        ) : (
          "Nema podatka"
        );
      },
    },
    {
      title: "Akcije",
      key: "actions",
      render: (_, record) => (
        <>
          <EditOutlined
            style={{ marginRight: 12 }}
            title="Uredi"
            onClick={() => {
              const arrangementDto: CreateOrUpdateArrangementInterface =
                convertTableArrangementToCreateOrUpdateArrangement(record);
              handleEdit(arrangementDto);
            }}
          />
          <Popconfirm
            title="Da li ste sigurni da želite izbrisati ovaj aranžman?"
            onConfirm={() => handleDelete(record.arrangementId)}
            okText="Da"
            cancelText="Ne"
          >
            <DeleteOutlined
              style={{ color: "red", marginRight: 12 }}
              title="Izbriši"
            />
          </Popconfirm>
          <ContactsOutlined
            onClick={() => handleGetReservation(record?.arrangementId)}
            title="Rezervacije"
          />
        </>
      ),
    },
  ];

  return (
    <>
      <InfoModal
        visible={isInfoModalVisible.current}
        onClose={handleCloseInfoModal}
        fullText={currentNote}
      />
      <ReservationInfoModal
        visible={isReservationInfoModalVisible.current}
        onClose={handleCloseReservationInfoModal}
        reservations={reservationShortDetails}
      />
      <Modal
        title={
          isEditArrangement ? (
            <div style={{ textAlign: "center" }}>Uredi aranžman</div>
          ) : (
            <div style={{ textAlign: "center" }}>Dodaj novi aranžman</div>
          )
        }
        maskClosable={false}
        open={isModalOpen.current}
        footer={null}
        onCancel={handleModalCancel}
        width={isMobile ? 300 : 600}
        centered
      >
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
          <Form.Item
            label="Odaberi bebu"
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
                  placeholder="Odaberi bebu"
                  value={field.value == 0 ? null : field.value}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {babies?.map((x) => (
                    <Select.Option key={x.id} value={x.id}>
                      {x.value}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Odaberi paket usluge"
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
                  placeholder="Odaberi paket usluge"
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
                  {servicePackages?.map((x) => (
                    <Select.Option key={x.id} value={x.id}>
                      {x.value}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Odaberi popust"
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
                  placeholder="Odaberi popust"
                  showSearch
                  optionFilterProp="children"
                  value={
                    field.value == 0 ||
                    field.value == null ||
                    field.value == undefined
                      ? 0
                      : field.value
                  }
                  filterOption={(input, option) =>
                    (option?.children as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  <Select.Option key={0} value={0}>
                    Bez popusta
                  </Select.Option>
                  {discounts?.map((x) => (
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
                label="Odaberi status"
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
                      placeholder="Odaberi status"
                      value={field.value == 0 ? null : field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        if (
                          status.find((x) => x.statusId == value)?.statusCode ==
                            "created" ||
                          status.find((x) => x.statusId == value)?.statusCode ==
                            "not_paid"
                        ) {
                          setHidePaymentType(true);
                          setValue("paymentTypeId", 0);
                        } else {
                          setHidePaymentType(false);
                        }
                      }}
                    >
                      {status?.map((x) => (
                        <Select.Option key={x.statusId} value={x.statusId}>
                          {x.statusName}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
              <Form.Item
                label="Povećaj broj dana"
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

          {isEditArrangement && hidePaymentType == false && (
            <Form.Item
              label="Odaberi tip plaćanja"
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
                    placeholder="Odaberi tip plaćanja"
                    value={field.value == 0 ? null : field.value}
                  >
                    {paymentTypes?.map((x) => (
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
            label="Bilješka"
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
              Sačuvaj
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <div style={{ padding: "16px" }}>
        <HeaderButtonsComponent
          buttonTitle="Dodaj aranžman"
          onButtonAction={handleCreateModal}
          onFilterAction={() => setShowFilters((prev) => !prev)}
        />
        {showFilters && (
          <FilterComponent
            showSelectBebies={true}
            showPriceSlider={true}
            showSelectServicePackages={true}
            showPaymentTypeSelect={true}
            showStatusSelect={true}
            showArrangementIdSearch={true}
            statusTypeCode="arrangement"
            showRemainingTerm={true}
            showRangePicker={true}
          />
        )}

        {totalSum > 0 && (
          <div className="price-sum">
            <Typography.Text
              strong
              style={{
                fontSize: 14,
                color: "#FFF",
              }}
            >
              Suma cijena: {totalSum}KM
            </Typography.Text>
          </div>
        )}
        {isMobile && (
          <>
            {arrangements.map((x) => (
              <TableCard
                key={x.arrangementId}
                loading={loading}
                handleEdit={() =>
                  handleEdit(
                    convertTableArrangementToCreateOrUpdateArrangement(x)
                  )
                }
                handleDelete={() => handleDelete(x.arrangementId)}
                handleReservationPreview={() =>
                  handleGetReservation(x?.arrangementId)
                }
                deleteTitle="Da li ste sigurni da želite izbrisati ovaj paket usluge?"
                columns={[
                  { title: "ID aranžmana", value: x.arrangementId },
                  {
                    title: "Naziv paketa usluge",
                    value: x.servicePackage
                      ? x.servicePackage.value
                      : "Nema podataka",
                  },
                  {
                    title: "Podaci o bebi",
                    value: x.babyDetails
                      ? x.babyDetails.value
                      : "Nema podataka",
                  },
                  {
                    title: "Broj preostalih termina",
                    value: x.remainingTerm ? x.remainingTerm : "Nema podataka",
                  },
                  {
                    title: "Cijena u KM",
                    value: x.price ? x.price.toFixed(2) : "Nema podataka",
                  },
                  {
                    title: "Ostvareni popust",
                    value: x.discount
                      ? x.discount.value
                      : "Nije ostvaren popust",
                  },
                  {
                    title: "Tip plaćanja",
                    value: x.paymentType ? x.paymentType.value : "Nije plaćeno",
                  },
                  {
                    title: "Datum kreiranja",
                    value: x.createdAt
                      ? dayjs(x.createdAt).format("DD.MM.YYYY.") + " godine"
                      : "Nema podatka",
                  },
                  {
                    title: "Bilješka",
                    value: x.note ? x.note : "Nema podataka",
                    isPreviewable: x.note && x.note.length > 3 ? true : false,
                    onNoteClick: () => handleOpenInfoModal(x.note),
                  },
                  {
                    title: "Status",
                    value: x.status ? (
                      x.status.value === "Plaćen" ? (
                        <Tag color="success">{x.status.value}</Tag>
                      ) : x.status.value === "Nije plaćen" ? (
                        <Tag color="error">{x.status.value}</Tag>
                      ) : x.status.value === "Kreiran" ? (
                        <Tag color="warning">{x.status.value}</Tag>
                      ) : (
                        "Nema podatka"
                      )
                    ) : (
                      "Nema podatka"
                    ),
                  },
                ]}
              />
            ))}
            <Pagination
              current={cursor}
              pageSize={DEFAULT_PAGE_SIZE}
              total={totalElements}
              onChange={nextPage}
              showSizeChanger={false}
              locale={{ items_per_page: "po stranici" }}
              style={{ justifyContent: "center" }}
            />
          </>
        )}
        {!isMobile && (
          <Table
            columns={columns}
            loading={loading}
            dataSource={arrangements}
            rowKey="arrangementId"
            locale={{
              emptyText: "Nema podataka za prikazati",
            }}
            pagination={{
              current: cursor,
              pageSize: DEFAULT_PAGE_SIZE,
              total: totalElements,
              showSizeChanger: false,
              onChange: nextPage,
            }}
          />
        )}
      </div>
    </>
  );
};

export default ArrangementPage;
