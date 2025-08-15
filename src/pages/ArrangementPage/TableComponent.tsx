import React, { MutableRefObject, useRef, useState } from "react";
import TableCard from "../../components/TableCard/TableCard";
import { convertTableArrangementToCreateOrUpdateArrangement } from "../../mappers/ArrangementMapper";
import dayjs from "dayjs";
import { Pagination, Popconfirm, Popover, Table, Tag, Typography } from "antd";
import { DEFAULT_PAGE_SIZE, handleApiError } from "../../util/const";
import {
  EditOutlined,
  DeleteOutlined,
  ContactsOutlined,
} from "@ant-design/icons";
import {
  CreateOrUpdateArrangementInterface,
  DataStateArrangement,
  DropDownDataInterface,
  TableArrangementInterface,
} from "../../interfaces/ArrangementInterface";
import {
  deleteArrangement,
  getArrangements,
} from "../../services/ArrangementService";
import {
  toastErrorNotification,
  toastSuccessNotification,
} from "../../util/toastNotification";
import {
  existsByArrangement,
  getReservationsByArrangement,
} from "../../services/ReservationServices";
import { UseFormReset } from "react-hook-form";
import InfoModal from "../../components/InfoModal/InfoModal";
import ReservationInfoModal from "../../components/ReservationInfoModal/ReservationInfoModal";
import { ReservationShortDetailsInterface } from "../../interfaces/ReservationShortDetailsInterface";
import { ColumnsType } from "antd/es/table";

interface TableComponentProps {
  setIsEditArrangement: React.Dispatch<React.SetStateAction<boolean>>;
  setDataState: React.Dispatch<React.SetStateAction<DataStateArrangement>>;
  dataState: DataStateArrangement;
  isModalOpen: MutableRefObject<boolean>;
  reset: UseFormReset<CreateOrUpdateArrangementInterface>;
  isMobile: boolean;
  dropdownData: DropDownDataInterface;
  setHidePaymentType: React.Dispatch<React.SetStateAction<boolean>>;
  setDisableEditField: React.Dispatch<React.SetStateAction<boolean>>;
}

const TableComponent: React.FC<TableComponentProps> = ({
  dataState,
  isMobile,
  isModalOpen,
  reset,
  setDataState,
  setIsEditArrangement,
  dropdownData,
  setHidePaymentType,
  setDisableEditField,
}) => {
  const isReservationInfoModalVisible = useRef<boolean>(false);
  const isInfoModalVisible = useRef<boolean>(false);
  const [reservationShortDetails, setRervationShortDetails] = useState<
    ReservationShortDetailsInterface[]
  >([]);
  const [currentNote, setCurrentNote] = useState<string>("");

  //------------------METHODS----------------

  const nextPage = (page: number) => {
    setDataState((prev) => ({ ...prev, cursor: page, loading: true }));
  };

  const handleEdit = (record: CreateOrUpdateArrangementInterface) => {
    setIsEditArrangement(true);
    if (
      dropdownData.status.find((x) => x.statusId == record.statusId)
        ?.statusCode == "created" ||
      dropdownData.status.find((x) => x.statusId == record.statusId)
        ?.statusCode == "not_paid"
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
      giftCardId: record?.giftCardId ?? null,
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
      setDataState((prev) => ({ ...prev, loading: true }));
      try {
        await deleteArrangement(arrangementId);
        const result = await getArrangements(dataState.cursor - 1, null);
        const deletedArrangement = dataState.arrangements.find(
          (x) => x.arrangementId === arrangementId
        );
        const price = deletedArrangement?.price ?? 0;
        setDataState((prev) => ({
          ...prev,
          arrangements: result.data.content,
          totalElements: result.data.totalElements,
          totalSum: prev.totalSum - price,
        }));

        toastSuccessNotification("Obrisano!");
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        setDataState((prev) => ({ ...prev, loading: false }));
      }
    }
  };

  const handleGetReservation = async (arrangementId?: number | null) => {
    if (arrangementId) {
      setDataState((prev) => ({ ...prev, loading: true }));
      try {
        const result = await getReservationsByArrangement(arrangementId);
        setRervationShortDetails(result);
        isReservationInfoModalVisible.current = true;
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        setDataState((prev) => ({ ...prev, loading: false }));
      }
    }
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

  //------------------RENDER----------------

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
      render: (item, record) => {
        const match = dropdownData.paymentTypes.find(
          (x) => x.paymentTypeId === item?.id
        );

        if (match?.paymentTypeCode === "gift") {
          return (
            <Popover content={record?.giftCard?.value} title="Serijski broj">
              <span>{item.value}</span>
            </Popover>
          );
        }

        return item ? item.value : "Nije plaćeno";
      },
    },
    {
      title: "Bilješka",
      dataIndex: "note",
      key: "note",
      render: (value) => {
        const previewText =
          value?.length > 3 ? value?.slice(0, 3) + "..." : value;

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
      {dataState.totalSum > 0 && (
        <div className="price-sum">
          <Typography.Text
            strong
            style={{
              fontSize: 14,
              color: "#FFF",
            }}
          >
            Suma cijena: {dataState.totalSum}KM
          </Typography.Text>
        </div>
      )}
      {isMobile && (
        <>
          {dataState.arrangements.map((x) => (
            <TableCard
              key={x.arrangementId}
              loading={dataState.loading}
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
                  value: x.babyDetails ? x.babyDetails.value : "Nema podataka",
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
                  value: x.discount ? x.discount.value : "Nije ostvaren popust",
                },
                {
                  title: "Tip plaćanja",
                  value: (() => {
                    const selectedPayment = dropdownData.paymentTypes.find(
                      (p) => p.paymentTypeId === x.paymentType?.id
                    );
                    if (selectedPayment?.paymentTypeCode === "gift") {
                      return `${x.paymentType.value} (${x.giftCard?.value})`;
                    }
                    return x.paymentType ? x.paymentType.value : "Nije plaćeno";
                  })(),
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
                  isPreviewable: x.note && x.note?.length > 3 ? true : false,
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
            current={dataState.cursor}
            pageSize={DEFAULT_PAGE_SIZE}
            total={dataState.totalElements}
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
          loading={dataState.loading}
          dataSource={dataState.arrangements}
          rowKey="arrangementId"
          locale={{
            emptyText: "Nema podataka za prikazati",
          }}
          pagination={{
            current: dataState.cursor,
            pageSize: DEFAULT_PAGE_SIZE,
            total: dataState.totalElements,
            showSizeChanger: false,
            onChange: nextPage,
          }}
        />
      )}
    </>
  );
};

export default TableComponent;
