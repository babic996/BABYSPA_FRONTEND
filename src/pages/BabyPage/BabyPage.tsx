import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  Table,
  Button,
  Modal,
  Popconfirm,
  Input,
  Form,
  InputNumber,
  DatePicker,
  Pagination,
} from "antd";
import "./BabyPage.scss";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { BabyInterface } from "../../interfaces/BabyInterface";
import { useEffect, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { getBabyValidationSchema } from "../../validations/BabyValidationSchema";
import {
  getBabies,
  addBaby,
  editBaby,
  deleteBaby,
} from "../../services/BabyService";
import dayjs from "dayjs";
import { DEFAULT_PAGE_SIZE, errorResponse } from "../../util/const";
import InfoModal from "../../components/InfoModal/InfoModal";
import {
  toastErrorNotification,
  toastSuccessNotification,
} from "../../util/toastNotification";
import FilterComponent from "../../components/FilterComponent/FilterComponent";
import { useFilter } from "../../context/Filter/useFilter";
import HeaderButtonsComponent from "../../components/HeaderButtonsComponent/HeaderButtonsComponent";
import TableCard from "../../components/TableCard/TableCard";
import useMediaQuery from "../../hooks/useMediaQuery";
import useUpdateEffect from "../../hooks/useUpdateEffect";

const BabyPage = () => {
  const isModalOpen = useRef<boolean>(false);
  const isInfoModalVisible = useRef<boolean>(false);
  const [cursor, setCursor] = useState<number>(1);
  const [babies, setBabies] = useState<BabyInterface[]>([]);
  const [totalElements, setTotalElements] = useState<number>();
  const [isEditBaby, setIsEditBaby] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentNote, setCurrentNote] = useState<string>("");
  const schema = getBabyValidationSchema(isEditBaby);
  const { filter, showFilters, setShowFilters, onResetFilter } = useFilter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BabyInterface>({
    resolver: yupResolver(schema),
  });

  //------------------LIFECYCLE------------------

  useEffect(() => {
    onResetFilter();
  }, []);

  useUpdateEffect(() => {
    if (filter) {
      setLoading(true);
      getBabies(cursor - 1, filter)
        .then((result) => {
          setBabies(result.data.content);
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

  //------------------METOHDS------------------

  const handleEdit = (record: BabyInterface) => {
    setIsEditBaby(true);
    reset({
      babyId: record.babyId ?? null,
      babyName: record.babyName,
      babySurname: record?.babySurname ?? "",
      birthDate: record?.birthDate ?? null,
      numberOfMonths: record.numberOfMonths,
      phoneNumber: record.phoneNumber,
      motherName: record?.motherName ?? "",
      note: record?.note ?? "",
    });
    isModalOpen.current = true;
  };

  const handleDelete = async (babyId?: number | null) => {
    if (babyId) {
      setLoading(true);
      try {
        await deleteBaby(babyId);
        const result = await getBabies(cursor - 1, null);
        setBabies(result.data.content);
        setTotalElements(result.data.totalElements);
        toastSuccessNotification("Obrisano!");
      } catch (e) {
        errorResponse(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModalCancel = () => {
    reset({
      babyId: null,
      babyName: "",
      babySurname: "",
      birthDate: null,
      numberOfMonths: 0,
      phoneNumber: "",
      motherName: "",
      note: "",
    });
    setIsEditBaby(false);
    isModalOpen.current = false;
  };

  const handleCreateModal = () => {
    reset({
      babyId: null,
      babyName: "",
      babySurname: "",
      birthDate: null,
      numberOfMonths: 0,
      phoneNumber: "",
      motherName: "",
      note: "",
    });
    setIsEditBaby(false);
    isModalOpen.current = true;
  };

  const nextPage = (page: number) => {
    setCursor(page);
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

  const onSubmit: SubmitHandler<BabyInterface> = async (data) => {
    setLoading(true);
    try {
      if (isEditBaby) {
        const res = await editBaby(data);
        setBabies((prevBabies) =>
          prevBabies.map((baby) =>
            baby.babyId == data.babyId ? { ...baby, ...res.data.data } : baby
          )
        );
        isModalOpen.current = false;
        toastSuccessNotification("Ažurirano!");
      } else {
        await addBaby(data);
        const result = await getBabies(cursor - 1, null);
        setBabies(result.data.content);
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

  const columns: ColumnsType<BabyInterface> = [
    {
      title: "ID bebe",
      dataIndex: "babyId",
      key: "babyId",
    },
    {
      title: "Ime",
      dataIndex: "babyName",
      key: "babyName",
    },
    {
      title: "Prezime",
      dataIndex: "babySurname",
      key: "babySurname",
      render: (value) => {
        return value ? value : "Nema podatka";
      },
    },
    {
      title: "Datum rođenja",
      dataIndex: "birthDate",
      key: "birthDate",
      render: (value) => {
        return value
          ? dayjs(value).format("DD.MM.YYYY.") + " godine"
          : "Nema podatka";
      },
    },
    {
      title: "Broj mjeseci",
      dataIndex: "numberOfMonths",
      key: "numberOfMonths",
    },
    {
      title: "Telefon",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Ime majke",
      dataIndex: "motherName",
      key: "motherName",
      render: (value) => {
        return value ? value : "Nema podatka";
      },
    },
    {
      title: "Bilješka",
      dataIndex: "note",
      key: "note",
      render: (value) => {
        const previewText =
          value.length > 3 ? value.slice(0, 3) + "..." : value;

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
            title="Da li ste sigurni da želite izbrisati ovu bebu?"
            onConfirm={() => handleDelete(record.babyId)}
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
          isEditBaby ? (
            <div style={{ textAlign: "center" }}>Uredi bebu</div>
          ) : (
            <div style={{ textAlign: "center" }}>Dodaj novu bebu</div>
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
            label="Ime"
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
            label="Prezime"
            validateStatus={errors.babySurname ? "error" : ""}
            help={errors.babySurname?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="babySurname"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Datum rođenja"
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
                    onChange(
                      date ? dayjs(date).format("YYYY-MM-DDTHH:mm:ss") : ""
                    )
                  }
                  style={{ width: "100%" }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Broj mjeseci"
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
            label="Broj telefona"
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
            label="Ime majke"
            validateStatus={errors.motherName ? "error" : ""}
            help={errors.motherName?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="motherName"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} />
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
          buttonTitle="Dodaj bebu"
          onButtonAction={handleCreateModal}
          onFilterAction={() => setShowFilters((prev) => !prev)}
        />
        {showFilters && (
          <FilterComponent
            showSearch={true}
            showRangePicker={true}
            showTimeInRangePicker={false}
          />
        )}

        {isMobile && (
          <>
            {babies.map((x) => (
              <TableCard
                key={x.babyId}
                loading={loading}
                handleEdit={() => handleEdit(x)}
                handleDelete={() => handleDelete(x.babyId)}
                deleteTitle="Da li ste sigurni da želite izbrisati ovu bebu?"
                columns={[
                  { title: "ID bebe", value: x.babyId },
                  {
                    title: "Ime",
                    value: x.babyName ? x.babyName : "Nema podataka",
                  },
                  {
                    title: "Prezime",
                    value: x.babySurname ? x.babySurname : "Nema podataka",
                  },
                  {
                    title: "Datum rođenja",
                    value: x.birthDate
                      ? dayjs(x.birthDate).format("DD.MM.YYYY.") + " godine"
                      : "Nema podatka",
                  },
                  {
                    title: "Broj mjeseci",
                    value: x.numberOfMonths
                      ? x.numberOfMonths
                      : "Nema podataka",
                  },
                  {
                    title: "Telefon",
                    value: x.phoneNumber ? x.phoneNumber : "Nema podataka",
                  },
                  {
                    title: "Ime majke",
                    value: x.motherName ? x.motherName : "Nema podataka",
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
            dataSource={babies}
            rowKey="babyId"
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

export default BabyPage;
