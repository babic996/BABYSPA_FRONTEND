import { useEffect, useRef, useState } from "react";
import { ServicePackageInterface } from "../../interfaces/ServicePackageInterface";
import {
  addServicePackage,
  deleteServicePackage,
  editServicePackage,
  getServicePackages,
} from "../../services/ServicePackageService";
import {
  toastErrorNotification,
  toastSuccessNotification,
} from "../../util/toastNotification";
import {
  Button,
  Table,
  Popconfirm,
  Modal,
  Form,
  Input,
  InputNumber,
  Pagination,
} from "antd";
import FilterComponent from "../../components/FilterComponent/FilterComponent";
import { DEFAULT_PAGE_SIZE, errorResponse } from "../../util/const";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getServicePackageValidationSchema } from "../../validations/ServicePackageValidationSchema";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import InfoModal from "../../components/InfoModal/InfoModal";
import { useFilter } from "../../context/Filter/useFilter";
import { AxiosError } from "axios";
import HeaderButtonsComponent from "../../components/HeaderButtonsComponent/HeaderButtonsComponent";
import { existsByServicePackageId } from "../../services/ArrangementService";
import useMediaQuery from "../../hooks/useMediaQuery";
import TableCard from "../../components/TableCard/TableCard";
import useUpdateEffect from "../../hooks/useUpdateEffect";

const ServicePackagePage = () => {
  const isModalOpen = useRef<boolean>(false);
  const isInfoModalVisible = useRef<boolean>(false);
  const [cursor, setCursor] = useState<number>(1);
  const [servicePackages, setServicePackages] = useState<
    ServicePackageInterface[]
  >([]);
  const [totalElements, setTotalElements] = useState<number>();
  const [isEditServicePackage, setIsEditServicePackage] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [existsByServicePackage, setExistsByServicePackage] =
    useState<boolean>(false);
  const [currentNote, setCurrentNote] = useState<string>("");
  const schema = getServicePackageValidationSchema(isEditServicePackage);
  const { filter, showFilters, setShowFilters, onResetFilter } = useFilter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServicePackageInterface>({
    resolver: yupResolver(schema),
  });

  //------------------LIFECYCLE------------------

  useEffect(() => {
    onResetFilter();
  }, []);

  useUpdateEffect(() => {
    if (filter) {
      setLoading(true);
      getServicePackages(cursor - 1, filter)
        .then((result) => {
          setServicePackages(result.data.content);
          setTotalElements(result.data.totalElements);
        })
        .catch((e) => {
          toastErrorNotification(e.response.data.message);
        })
        .finally(() => setLoading(false));
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

  const handleEdit = async (record: ServicePackageInterface) => {
    setIsEditServicePackage(true);
    try {
      if (record.servicePackageId) {
        const res = await existsByServicePackageId(record.servicePackageId);
        setExistsByServicePackage(res);
      }
    } catch (e) {
      errorResponse(e);
    }
    reset({
      servicePackageId: record.servicePackageId,
      servicePackageName: record.servicePackageName,
      termNumber: record.termNumber,
      servicePackageDurationDays: record.servicePackageDurationDays,
      price: record.price,
      note: record?.note ?? "",
    });
    isModalOpen.current = true;
  };

  const handleDelete = async (servicePackageId?: number | null) => {
    if (servicePackageId) {
      setLoading(true);
      try {
        await deleteServicePackage(servicePackageId);
        const result = await getServicePackages(cursor - 1, null);
        setServicePackages(result.data.content);
        setTotalElements(result.data.totalElements);
        toastSuccessNotification("Obrisano!");
      } catch (e) {
        if (e instanceof AxiosError) {
          const errorMessage = e.response?.data?.message;
          toastErrorNotification(errorMessage);
        } else {
          toastErrorNotification("Došlo je do greške.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModalCancel = () => {
    reset({
      servicePackageId: null,
      servicePackageName: "",
      termNumber: 0,
      servicePackageDurationDays: 0,
      price: 0,
      note: "",
    });
    setIsEditServicePackage(false);
    setExistsByServicePackage(false);
    isModalOpen.current = false;
  };

  const handleCreateModal = () => {
    reset({
      servicePackageId: null,
      servicePackageName: "",
      termNumber: 0,
      servicePackageDurationDays: 0,
      price: 0,
      note: "",
    });
    setIsEditServicePackage(false);
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

  const onSubmit: SubmitHandler<ServicePackageInterface> = async (data) => {
    setLoading(true);
    try {
      if (isEditServicePackage) {
        const res = await editServicePackage(data);
        setServicePackages((prev) =>
          prev.map((item) =>
            item.servicePackageId === data.servicePackageId
              ? { ...item, ...res.data.data }
              : item
          )
        );
        isModalOpen.current = false;
        toastSuccessNotification("Ažurirano!");
      } else {
        await addServicePackage(data);
        const result = await getServicePackages(cursor - 1, null);
        setServicePackages(result.data.content);
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

  const columns: ColumnsType<ServicePackageInterface> = [
    {
      title: "ID paketa usluge",
      dataIndex: "servicePackageId",
      key: "servicePackageId",
    },
    {
      title: "Naziv paketa usluge",
      dataIndex: "servicePackageName",
      key: "servicePackageName",
    },
    {
      title: "Broj termina",
      dataIndex: "termNumber",
      key: "termNumber",
      render: (value) => {
        return value ? value : "Nema podatka";
      },
    },
    {
      title: "Trajanje paketa u danima",
      dataIndex: "servicePackageDurationDays",
      key: "servicePackageDurationDays",
      render: (value) => {
        return value ? value : "Nema podatka";
      },
    },
    {
      title: "Cijena u KM",
      dataIndex: "price",
      key: "price",
      render: (value) => {
        return value ? value.toFixed(2) : "Nema podatka";
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
      title: "Akcije",
      key: "actions",
      render: (_, record) => (
        <>
          <EditOutlined
            title="Uredi"
            style={{ marginRight: 16 }}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Da li ste sigurni da želite izbrisati ovaj paket usluge?"
            onConfirm={() => handleDelete(record.servicePackageId)}
            okText="Da"
            cancelText="Ne"
          >
            <DeleteOutlined style={{ color: "red" }} title="Izbriši" />
          </Popconfirm>
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
      <Modal
        title={
          isEditServicePackage ? (
            <div style={{ textAlign: "center" }}>Uredi paket usluge</div>
          ) : (
            <div style={{ textAlign: "center" }}>Dodaj novi paket usluge</div>
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
            label="Naziv paketa usluge"
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
            label="Broj termina"
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
            label="Broj dana trajanja paketa"
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
            label="Cijena"
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
          buttonTitle="Dodaj paket usluge"
          onButtonAction={handleCreateModal}
          onFilterAction={() => setShowFilters((prev) => !prev)}
        />
        {showFilters && (
          <FilterComponent showSearch={true} showPriceSlider={true} />
        )}
        {isMobile && (
          <>
            {servicePackages.map((x) => (
              <TableCard
                key={x.servicePackageId}
                loading={loading}
                handleEdit={() => handleEdit(x)}
                handleDelete={() => handleDelete(x.servicePackageId)}
                deleteTitle="Da li ste sigurni da želite izbrisati ovaj paket usluge?"
                columns={[
                  { title: "ID paketa usluge", value: x.servicePackageId },
                  {
                    title: "Naziv paketa usluge",
                    value: x.servicePackageName
                      ? x.servicePackageName
                      : "Nema podataka",
                  },
                  {
                    title: "Broj termina",
                    value: x.termNumber ? x.termNumber : "Nema podataka",
                  },
                  {
                    title: "Trajanje paketa u danima",
                    value: x.servicePackageDurationDays
                      ? x.servicePackageDurationDays
                      : "Nema podataka",
                  },
                  {
                    title: "Cijena u KM",
                    value: x.price ? x.price.toFixed(2) : "Nema podataka",
                  },
                  {
                    title: "Bilješka",
                    value: x.note ? x.note : "Nema podataka",
                    isPreviewable: x.note && x.note.length > 3 ? true : false,
                    onNoteClick: () => handleOpenInfoModal(x.note),
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
            dataSource={servicePackages}
            rowKey="servicePackageId"
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

export default ServicePackagePage;
