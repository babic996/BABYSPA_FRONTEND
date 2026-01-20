import React, { useRef, useState } from "react";
import {
  CreateOrUpdateReservationInterface,
  DataStateReservation,
  TableReservationInterface,
} from "../../interfaces/ReservationInterface";
import { DEFAULT_PAGE_SIZE } from "../../util/const";

import FilterComponent from "../../components/FilterComponent/FilterComponent";
import { Pagination, Popconfirm, Table, Tag } from "antd";
import TableCard from "../../components/TableCard/TableCard";
import dayjs, { Dayjs } from "dayjs";
import InfoModal from "../../components/InfoModal/InfoModal";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { TFunction } from "i18next";
import { convertTableReservationInterfaceToCreateOrUpdateReservationInterface } from "../../mappers/ReservationMapper";

interface TableComponentProps {
  isMobile: boolean;
  handleEdit: (record: CreateOrUpdateReservationInterface) => void;
  handleDelete: (reservationId?: number | null) => void;
  nextPage: (page: number) => void;
  dataState: DataStateReservation;
  t: TFunction;
}

const TableComponent: React.FC<TableComponentProps> = ({
  isMobile,
  handleEdit,
  handleDelete,
  dataState,
  nextPage,
  t,
}) => {
  const [currentNote, setCurrentNote] = useState<string>("");
  const isInfoModalVisible = useRef<boolean>(false);

  //------------------METHODS----------------

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

  const columns: ColumnsType<TableReservationInterface> = [
    {
      title: t("table.reservationId"),
      dataIndex: "reservationId",
      key: "reservationId",
    },
    {
      title: t("table.arrangementId"),
      dataIndex: "arrangementId",
      key: "arrangementId",
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
      title: t("table.servicePackage"),
      dataIndex: "servicePackageName",
      key: "servicePackageName",
    },
    {
      title: t("table.remainingTerm"),
      dataIndex: "remainingTerm",
      key: "remainingTerm",
    },
    {
      title: t("table.term"),
      key: "reservationTime",
      render: (record) => {
        return formatReservationTerm(record.startDate, record.endDate);
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
      title: t("table.status"),
      dataIndex: "status",
      key: "status",
      render: (item) => {
        return formatReservationStatus(item.statusCode);
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
              handleEdit(
                convertTableReservationInterfaceToCreateOrUpdateReservationInterface(
                  record
                )
              );
            }}
          />
          <Popconfirm
            title={t("modal.deleteConfirmReservation")}
            onConfirm={() => handleDelete(record.reservationId)}
            okText={t("button.confirm")}
            cancelText={t("button.cancel")}
          >
            <DeleteOutlined
              style={{ color: "red", marginRight: 12 }}
              title={t("button.delete")}
            />
          </Popconfirm>
        </>
      ),
    },
  ];

  //------------------RENDER------------------

  const formatReservationTerm = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      return <span>{t("modal.unknownTerm")}</span>;
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    const isNextDay = !start.isSame(end, "day");

    const formatDate = (date: Dayjs) => dayjs(date).format("DD.MM.YYYY (ddd)");
    const formatTime = (date: Dayjs) => dayjs(date).format("HH:mm");

    const previewText = isNextDay
      ? `${formatDate(start)} ${formatTime(start)}h - ${formatDate(
          end
        )} ${formatTime(end)}h`
      : `${formatDate(start)} • ${formatTime(start)}-${formatTime(end)}h`;

    return <span>{previewText}</span>;
  };

  const formatReservationStatus = (statusCode: string) => {
    return statusCode === "term_reserved" ? (
      <Tag color="#16c9d3">{t("common.reservedTerm")}</Tag>
    ) : statusCode === "term_canceled" ? (
      <Tag color="#f40511">{t("common.canceledTerm")}</Tag>
    ) : statusCode === "term_not_used" ? (
      <Tag color="#ff660d">{t("common.notUsedTerm")}</Tag>
    ) : statusCode === "term_used" ? (
      <Tag color="#4caf50">{t("common.usedTerm")}</Tag>
    ) : (
      t("table.noDataCell")
    );
  };

  return (
    <>
      <InfoModal
        visible={isInfoModalVisible.current}
        onClose={handleCloseInfoModal}
        fullText={currentNote}
      />
      <FilterComponent
        showStatusSelect={true}
        statusTypeCode="reservation"
        showRangePicker={true}
        showArrangements={true}
      />
      {isMobile && (
        <>
          {dataState.reservations.map((x) => (
            <TableCard
              key={x.reservationId}
              loading={dataState.loading}
              handleEdit={() => handleEdit(x)}
              handleDelete={() => handleDelete(x.reservationId)}
              deleteTitle={t("modal.deleteConfirmReservation")}
              columns={[
                { title: t("table.reservationId"), value: x.reservationId },
                { title: t("table.arrangementId"), value: x.arrangementId },
                {
                  title: t("table.babyDetails"),
                  value: x.babyDetails.value,
                },
                {
                  title: t("table.servicePackage"),
                  value: x.servicePackageName,
                },
                {
                  title: t("table.remainingTerm"),
                  value: x.remainingTerm,
                },
                {
                  title: t("table.term"),
                  value: formatReservationTerm(x.startDate, x.endDate),
                },
                {
                  title: t("table.note"),
                  value: x.note ? x.note : t("table.noDataCell"),
                  isPreviewable: x.note && x.note?.length > 3 ? true : false,
                  onNoteClick: () => handleOpenInfoModal(x.note),
                },
                {
                  title: t("table.status"),
                  value: formatReservationStatus(x.status.statusCode),
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
          dataSource={dataState.reservations}
          rowKey="reservationId"
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
