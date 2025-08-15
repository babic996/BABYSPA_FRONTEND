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

interface TableComponentProps {
  setIsEditBaby: React.Dispatch<React.SetStateAction<boolean>>;
  setDataState: React.Dispatch<React.SetStateAction<DataStateBaby>>;
  dataState: DataStateBaby;
  isModalOpen: MutableRefObject<boolean>;
  reset: UseFormReset<BabyInterface>;
  isMobile: boolean;
}

const TableComponent: React.FC<TableComponentProps> = ({
  dataState,
  setDataState,
  setIsEditBaby,
  isModalOpen,
  reset,
  isMobile,
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
        toastSuccessNotification("Obrisano!");
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
      {isMobile && (
        <>
          {dataState.babies.map((x) => (
            <TableCard
              key={x.babyId}
              loading={dataState.loading}
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
                  value: x.numberOfMonths ? x.numberOfMonths : "Nema podataka",
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
          dataSource={dataState.babies}
          rowKey="babyId"
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
