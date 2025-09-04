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

interface TableComponentProps {
  isMobile: boolean;
  handleEdit: (record: CreateOrUpdateReservationInterface) => void;
  handleDelete: (reservationId?: number | null) => void;
  nextPage: (page: number) => void;
  dataState: DataStateReservation;
}

const TableComponent: React.FC<TableComponentProps> = ({
  isMobile,
  handleEdit,
  handleDelete,
  dataState,
  nextPage,
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
      title: "ID rezervacije",
      dataIndex: "reservationId",
      key: "reservationId",
    },
    {
      title: "ID aranžmana",
      dataIndex: "arrangementId",
      key: "arrangementId",
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
      title: "Paket usluge",
      dataIndex: "servicePackageName",
      key: "servicePackageName",
    },
    {
      title: "Broj preostalih termina aranžmana",
      dataIndex: "remainingTerm",
      key: "remainingTerm",
    },
    {
      title: "Termin",
      key: "reservationTime",
      render: (record) => {
        return formatReservationTerm(record.startDate, record.endDate);
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (item) => {
        return formatReservationStatus(item.statusCode);
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
              handleEdit(record);
            }}
          />
          <Popconfirm
            title="Da li ste sigurni da želite izbrisati ovu rezervaciju?"
            onConfirm={() => handleDelete(record.reservationId)}
            okText="Da"
            cancelText="Ne"
          >
            <DeleteOutlined
              style={{ color: "red", marginRight: 12 }}
              title="Izbriši"
            />
          </Popconfirm>
        </>
      ),
    },
  ];

  //------------------RENDER------------------

  const formatReservationTerm = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      return <span>Nepoznat termin</span>;
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
      <Tag color="#16c9d3">Rezervisan termin</Tag>
    ) : statusCode === "term_canceled" ? (
      <Tag color="#f40511">Otkazan termin</Tag>
    ) : statusCode === "term_not_used" ? (
      <Tag color="#ff660d">Termin nije iskorišten</Tag>
    ) : statusCode === "term_used" ? (
      <Tag color="#4caf50">Iskorišten termin</Tag>
    ) : (
      "Nema podatka"
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
              deleteTitle="Da li ste sigurni da želite izbrisati ovu rezervaciju?"
              columns={[
                { title: "ID rezervacije", value: x.reservationId },
                { title: "ID aranžmana", value: x.arrangementId },
                {
                  title: "Podaci o bebi",
                  value: x.babyDetails.value,
                },
                {
                  title: "Paket usluge",
                  value: x.servicePackageName,
                },
                {
                  title: "Broj preostalih termina aranžmana",
                  value: x.remainingTerm,
                },
                {
                  title: "Termin",
                  value: formatReservationTerm(x.startDate, x.endDate),
                },
                {
                  title: "Bilješka",
                  value: x.note ? x.note : "Nema podataka",
                  isPreviewable: x.note && x.note?.length > 3 ? true : false,
                  onNoteClick: () => handleOpenInfoModal(x.note),
                },
                {
                  title: "Status",
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
            locale={{ items_per_page: "po stranici" }}
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
