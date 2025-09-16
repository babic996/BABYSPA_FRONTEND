import TableCard from "../../components/TableCard/TableCard";
import Table, { ColumnsType } from "antd/es/table";
import { BabyInterface, DataStateBaby } from "../../interfaces/BabyInterface";
import dayjs from "dayjs";
import { Pagination, Popconfirm } from "antd";
import { deleteBaby, getBabies } from "../../services/BabyService";
import { DEFAULT_PAGE_SIZE, handleApiError } from "../../util/const";
import {
  toastErrorNotification,
  toastSuccessNotification,
} from "../../util/toastNotification";
import InfoModal from "../../components/InfoModal/InfoModal";
import React, { MutableRefObject, useRef, useState } from "react";
import { UseFormReset } from "react-hook-form";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useFilter } from "../../context/Filter/useFilter";
import { TFunction } from "i18next";

interface TableComponentProps {
  setIsEditBaby: React.Dispatch<React.SetStateAction<boolean>>;
  setDataState: React.Dispatch<React.SetStateAction<DataStateBaby>>;
  dataState: DataStateBaby;
  isModalOpen: MutableRefObject<boolean>;
  reset: UseFormReset<BabyInterface>;
  isMobile: boolean;
  t: TFunction;
}

const TableComponent: React.FC<TableComponentProps> = ({
  dataState,
  setDataState,
  setIsEditBaby,
  isModalOpen,
  reset,
  isMobile,
  t,
}) => {
  const [currentNote, setCurrentNote] = useState<string>("");
  const isInfoModalVisible = useRef<boolean>(false);
  const { onResetFilter } = useFilter();

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

  const nextPage = (page: number) => {
    setDataState((prev) => ({ ...prev, cursor: page, loading: true }));
  };

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
      setDataState((prev) => ({ ...prev, loading: true }));
      try {
        await deleteBaby(babyId);
        const result = await getBabies(dataState.cursor - 1, null);
        setDataState((prev) => ({
          ...prev,
          babies: result.data.content,
          totalElements: result.data.totalElements,
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

  //------------------RENDER----------------

  const columns: ColumnsType<BabyInterface> = [
    {
      title: t("table.babyId"),
      dataIndex: "babyId",
      key: "babyId",
    },
    {
      title: t("table.babyName"),
      dataIndex: "babyName",
      key: "babyName",
    },
    {
      title: t("table.babySurname"),
      dataIndex: "babySurname",
      key: "babySurname",
      render: (value) => {
        return value ? value : t("table.noDataCell");
      },
    },
    {
      title: t("table.birthDate"),
      dataIndex: "birthDate",
      key: "birthDate",
      render: (value) => {
        return value
          ? dayjs(value).format("DD.MM.YYYY.") + " " + t("common.years")
          : t("table.noDataCell");
      },
    },
    {
      title: t("table.numberOfMonths"),
      dataIndex: "numberOfMonths",
      key: "numberOfMonths",
    },
    {
      title: t("table.phoneNumber"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: t("table.motherName"),
      dataIndex: "motherName",
      key: "motherName",
      render: (value) => {
        return value ? value : t("table.noDataCell");
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
      title: t("table.actions"),
      key: "actions",
      render: (_, record) => (
        <>
          <EditOutlined
            title={t("button.edit")}
            style={{ marginRight: 16 }}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title={t("table.deleteConfirmBaby")}
            onConfirm={() => handleDelete(record.babyId)}
            okText={t("button.confirm")}
            cancelText={t("button.cancel")}
          >
            <DeleteOutlined
              style={{ color: "red" }}
              title={t("button.delete")}
            />
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
      {isMobile && (
        <>
          {dataState.babies.map((x) => (
            <TableCard
              key={x.babyId}
              loading={dataState.loading}
              handleEdit={() => handleEdit(x)}
              handleDelete={() => handleDelete(x.babyId)}
              deleteTitle={t("table.deleteConfirmBaby")}
              columns={[
                { title: t("table.babyId"), value: x.babyId },
                {
                  title: t("table.babyName"),
                  value: x.babyName ? x.babyName : t("table.noDataCell"),
                },
                {
                  title: t("table.babySurname"),
                  value: x.babySurname ? x.babySurname : t("table.noDataCell"),
                },
                {
                  title: t("table.birthDate"),
                  value: x.birthDate
                    ? dayjs(x.birthDate).format("DD.MM.YYYY.") +
                      " " +
                      t("common.years")
                    : t("table.noDataCell"),
                },
                {
                  title: t("table.numberOfMonths"),
                  value: x.numberOfMonths
                    ? x.numberOfMonths
                    : t("table.noDataCell"),
                },
                {
                  title: t("table.phoneNumber"),
                  value: x.phoneNumber ? x.phoneNumber : t("table.noDataCell"),
                },
                {
                  title: t("table.motherName"),
                  value: x.motherName ? x.motherName : t("table.noDataCell"),
                },
                {
                  title: t("table.note"),
                  value: x.note ? x.note : t("table.noDataCell"),
                  isPreviewable: x.note && x.note.length > 3 ? true : false,
                  onNoteClick: () => handleOpenInfoModal(x.note),
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
          dataSource={dataState.babies}
          rowKey="babyId"
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
