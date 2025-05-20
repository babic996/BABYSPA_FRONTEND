import { useEffect, useRef, useState } from "react";
import { GiftCardInterface } from "../../interfaces/GiftCardInterface";
import { useFilter } from "../../context/Filter/useFilter";
import useMediaQuery from "../../hooks/useMediaQuery";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getGiftCardValidationSchema } from "../../validations/GiftCardValidationSchema";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import {
  toastErrorNotification,
  toastSuccessNotification,
} from "../../util/toastNotification";
import { DEFAULT_PAGE_SIZE, handleApiError } from "../../util/const";
import {
  addGiftCard,
  deleteGiftCard,
  editGiftCard,
  getGiftCards,
} from "../../services/GiftCardService";
import Table, { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Switch,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import HeaderButtonsComponent from "../HeaderButtonsComponent/HeaderButtonsComponent";
import FilterComponent from "../FilterComponent/FilterComponent";
import TableCard from "../TableCard/TableCard";

const GiftCardComponent = () => {
  const isModalOpen = useRef<boolean>(false);
  const [cursor, setCursor] = useState<number>(1);
  const [giftCards, setGiftCards] = useState<GiftCardInterface[]>([]);
  const [totalElements, setTotalElements] = useState<number>();
  const [isEditGiftCard, setIsEditGiftCard] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const schema = getGiftCardValidationSchema(isEditGiftCard);
  const { filter, showFilters, setShowFilters, onResetFilter } = useFilter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GiftCardInterface>({
    resolver: yupResolver(schema),
  });

  //------------------LIFECYCLE------------------

  useEffect(() => {
    onResetFilter();
  }, []);

  useUpdateEffect(() => {
    if (!filter) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getGiftCards(cursor - 1, filter);
        setGiftCards(result.data.content);
        setTotalElements(result.data.totalElements);
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cursor, filter]);

  useUpdateEffect(() => {
    if (cursor > 1) {
      setCursor(1);
    }
  }, [filter]);

  //------------------METOHDS------------------

  const handleEdit = (record: GiftCardInterface) => {
    setIsEditGiftCard(true);
    reset({
      giftCardId: record.giftCardId ?? null,
      serialNumber: record.serialNumber,
      expirationDate: record?.expirationDate ?? "",
      used: record?.used ?? "",
    });
    isModalOpen.current = true;
  };

  const handleDelete = async (babyId?: number | null) => {
    if (babyId) {
      setLoading(true);
      try {
        await deleteGiftCard(babyId);
        const result = await getGiftCards(cursor - 1, null);
        setGiftCards(result.data.content);
        setTotalElements(result.data.totalElements);
        toastSuccessNotification("Obrisano!");
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModalCancel = () => {
    reset({
      giftCardId: null,
      serialNumber: "",
      expirationDate: "",
      used: false,
    });
    setIsEditGiftCard(false);
    isModalOpen.current = false;
  };

  const handleCreateModal = () => {
    reset({
      giftCardId: null,
      serialNumber: "",
      expirationDate: "",
      used: false,
    });
    setIsEditGiftCard(false);
    isModalOpen.current = true;
  };

  const nextPage = (page: number) => {
    setCursor(page);
  };

  const onSubmit: SubmitHandler<GiftCardInterface> = async (data) => {
    setLoading(true);
    try {
      if (isEditGiftCard) {
        const res = await editGiftCard(data);
        setGiftCards((prevBabies) =>
          prevBabies.map((giftCard) =>
            giftCard.giftCardId == data.giftCardId
              ? { ...giftCard, ...res.data.data }
              : giftCard
          )
        );
        isModalOpen.current = false;
        toastSuccessNotification("Ažurirano!");
      } else {
        await addGiftCard(data);
        const result = await getGiftCards(cursor - 1, null);
        setGiftCards(result.data.content);
        setTotalElements(result.data.totalElements);
        isModalOpen.current = false;
        toastSuccessNotification("Sačuvano!");
      }
    } catch (e) {
      toastErrorNotification(handleApiError(e));
    } finally {
      setLoading(false);
    }
  };

  //------------------RENDER------------------

  const columns: ColumnsType<GiftCardInterface> = [
    {
      title: "ID poklon kartice",
      dataIndex: "giftCardId",
      key: "giftCardId",
    },
    {
      title: "Serijski broj",
      dataIndex: "serialNumber",
      key: "serialNumber",
    },
    {
      title: "Datum važenja kartice",
      dataIndex: "expirationDate",
      key: "expirationDate",
      render: (value) => {
        return value
          ? dayjs(value).format("DD.MM.YYYY.") + " godine"
          : "Nema podatka";
      },
    },
    {
      title: "Status kartice",
      dataIndex: "used",
      key: "used",
      render: (value) => {
        return value === true ? "Iskorištena" : "Nije iskorištena";
      },
    },
    {
      title: "Aranžman",
      dataIndex: "arrangementId",
      key: "arrangementId",
      render: (value, record) => {
        return value
          ? `ID aranžmana: ${value} (${record.phoneNumber})`
          : "Nema podataka";
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
            title="Da li ste sigurni da želite izbrisati ovu poklon karticu?"
            onConfirm={() => handleDelete(record.giftCardId)}
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
      <Modal
        title={
          isEditGiftCard ? (
            <div style={{ textAlign: "center" }}>Uredi poklon karticu</div>
          ) : (
            <div style={{ textAlign: "center" }}>Dodaj novu poklon karticu</div>
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
            label="Serijski broj"
            validateStatus={errors.serialNumber ? "error" : ""}
            help={errors.serialNumber?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="serialNumber"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          {isEditGiftCard && (
            <Form.Item
              label="Status kartice"
              validateStatus={errors.used ? "error" : ""}
              help={errors.used?.message}
              style={{ marginBottom: 8 }}
            >
              <Controller
                name="used"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch
                    checked={value}
                    onChange={onChange}
                    checkedChildren="Iskorištena"
                    unCheckedChildren="Nije iskorištena"
                  />
                )}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Datum isteka kartice"
            validateStatus={errors.expirationDate ? "error" : ""}
            help={errors.expirationDate?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="expirationDate"
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
          buttonTitle="Dodaj poklon karticu"
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
            {giftCards.map((x) => (
              <TableCard
                key={x.giftCardId}
                loading={loading}
                handleEdit={() => handleEdit(x)}
                handleDelete={() => handleDelete(x.giftCardId)}
                deleteTitle="Da li ste sigurni da želite izbrisati ovu poklon karticu?"
                columns={[
                  { title: "ID bebe", value: x.giftCardId },
                  {
                    title: "Serijski broj",
                    value: x.serialNumber ? x.serialNumber : "Nema podataka",
                  },
                  {
                    title: "Datum važenja kartice",
                    value: x.expirationDate
                      ? dayjs(x.expirationDate).format("DD.MM.YYYY.") +
                        " godine"
                      : "Nema podatka",
                  },
                  {
                    title: "Status kartice",
                    value: x.used === true ? "Iskorištena" : "Nije iskorištena",
                  },
                  {
                    title: "Aranžman",
                    value: x.arrangementId
                      ? `ID aranžmana: ${x.arrangementId} (${x.phoneNumber})`
                      : "Nema podataka",
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
            dataSource={giftCards}
            rowKey="giftCardId"
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

export default GiftCardComponent;
