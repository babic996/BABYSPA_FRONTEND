import React, { MutableRefObject, useRef, useState } from "react";
import TableCard from "../../components/TableCard/TableCard";
import { convertTableArrangementToCreateOrUpdateArrangement } from "../../mappers/ArrangementMapper";
import dayjs from "dayjs";
import { Pagination, Popconfirm, Table, Tag, Typography } from "antd";
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
import { useFilter } from "../../context/Filter/useFilter";
import { TFunction } from "i18next";

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
  t: TFunction;
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
  t,
}) => {
  const isReservationInfoModalVisible = useRef<boolean>(false);
  const isInfoModalVisible = useRef<boolean>(false);
  const [reservationShortDetails, setRervationShortDetails] = useState<
    ReservationShortDetailsInterface[]
  >([]);
  const [currentNote, setCurrentNote] = useState<string>("");
  const { onResetFilter } = useFilter();

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
        toastSuccessNotification(t("common.succesfullyDeleted"));
        onResetFilter();
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
      title: t("table.arrangementId"),
      dataIndex: "arrangementId",
      key: "arrangementId",
    },
    {
      title: t("table.servicePackage"),
      dataIndex: "servicePackage",
      key: "servicePackage",
      render: (item) => {
        return item ? item.value : t("table.noDataCell");
      },
    },
    {
      title: t("table.babyDetails"),
      dataIndex: "babyDetails",
      key: "babyDetails",
      render: (item) => {
        return item ? item.value : t("table.noDataCell");
      },
    },
    {
      title: t("table.remainingTerm"),
      dataIndex: "remainingTerm",
      key: "remainingTerm",
    },
    {
      title: t("table.price"),
      dataIndex: "price",
      key: "price",
      render: (item) => {
        return item ? item.toFixed(2) : t("table.noDataCell");
      },
    },
    {
      title: t("table.discount"),
      dataIndex: "discount",
      key: "discount",
      render: (item) => {
        return item ? item.value : t("table.noDiscount");
      },
    },
    {
      title: t("table.paymentType"),
      dataIndex: "paymentType",
      key: "paymentType",
      render: (item) => {
        return item ? item.value : t("common.notPaid");
      },
    },
    {
      title: t("table.giftCard"),
      dataIndex: "giftCard",
      key: "giftCard",
      render: (item) => {
        return item ? item.value : t("table.noDataCell");
      },
    },
    {
      title: t("table.note"),
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
      title: t("table.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => {
        return value
          ? dayjs(value).format("DD.MM.YYYY.") + " " + t("common.years")
          : t("table.noDataCell");
      },
    },
    {
      title: t("table.status"),
      dataIndex: "status",
      key: "status",
      render: (item) => {
        return item ? (
          item.value === "paid" ? (
            <Tag color="success">{t("common.paid")}</Tag>
          ) : item.value === "not_paid" ? (
            <Tag color="error">{t("common.notPaid")}</Tag>
          ) : item.value === "created" ? (
            <Tag color="warning">{t("common.created")}</Tag>
          ) : (
            t("table.noDataCell")
          )
        ) : (
          t("table.noDataCell")
        );
      },
    },
    {
      title: t("table.actions"),
      key: "actions",
      render: (_, record) => (
        <>
          <EditOutlined
            style={{ marginRight: 12 }}
            title={t("button.edit")}
            onClick={() => {
              const arrangementDto: CreateOrUpdateArrangementInterface =
                convertTableArrangementToCreateOrUpdateArrangement(record);
              handleEdit(arrangementDto);
            }}
          />
          <Popconfirm
            title={t("table.deleteConfirmArrangement")}
            onConfirm={() => handleDelete(record.arrangementId)}
            okText={t("button.confirm")}
            cancelText={t("button.cancel")}
          >
            <DeleteOutlined
              style={{ color: "red", marginRight: 12 }}
              title={t("button.delete")}
            />
          </Popconfirm>
          <ContactsOutlined
            onClick={() => handleGetReservation(record?.arrangementId)}
            title={t("table.reservations")}
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
        t={t}
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
            {t("table.priceSum")}: {dataState.totalSum}KM
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
              deleteTitle={t("table.deleteConfirmArrangement")}
              columns={[
                { title: t("table.arrangementId"), value: x.arrangementId },
                {
                  title: t("table.servicePackage"),
                  value: x.servicePackage
                    ? x.servicePackage.value
                    : t("table.noDataCell"),
                },
                {
                  title: t("table.babyDetails"),
                  value: x.babyDetails
                    ? x.babyDetails.value
                    : t("table.noDataCell"),
                },
                {
                  title: t("table.remainingTerm"),
                  value: x.remainingTerm ?? t("table.noDataCell"),
                },
                {
                  title: t("table.price"),
                  value: x.price ? x.price.toFixed(2) : t("table.noDataCell"),
                },
                {
                  title: t("table.discount"),
                  value: x.discount ? x.discount.value : t("table.noDiscount"),
                },
                {
                  title: t("table.paymentType"),
                  value: (() => {
                    const selectedPayment = dropdownData.paymentTypes.find(
                      (p) => p.paymentTypeId === x.paymentType?.id
                    );
                    if (selectedPayment?.paymentTypeCode === "gift") {
                      return `${x.paymentType.value} (${x.giftCard?.value})`;
                    }
                    return x.paymentType
                      ? x.paymentType.value
                      : t("table.notPaid");
                  })(),
                },
                {
                  title: t("table.createdAt"),
                  value: x.createdAt
                    ? dayjs(x.createdAt).format("DD.MM.YYYY.") +
                      " " +
                      t("common.years")
                    : t("table.noDataCell"),
                },
                {
                  title: t("table.note"),
                  value: x.note ? x.note : t("table.noDataCell"),
                  isPreviewable: x.note && x.note?.length > 3 ? true : false,
                  onNoteClick: () => handleOpenInfoModal(x.note),
                },
                {
                  title: t("table.status"),
                  value: x.status ? (
                    x.status.value === "paid" ? (
                      <Tag color="success">{t("common.paid")}</Tag>
                    ) : x.status.value === "not_paid" ? (
                      <Tag color="error">{t("common.notPaid")}</Tag>
                    ) : x.status.value === "created" ? (
                      <Tag color="warning">{t("common.created")}</Tag>
                    ) : (
                      t("table.noDataCell")
                    )
                  ) : (
                    t("table.noDataCell")
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
            locale={{ items_per_page: t("table.perPage") }}
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
            emptyText: t("table.emptyTable"),
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
