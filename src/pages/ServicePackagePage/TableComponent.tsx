import React, { MutableRefObject, useRef, useState } from "react";
import InfoModal from "../../components/InfoModal/InfoModal";
import TableCard from "../../components/TableCard/TableCard";
import { Pagination, Popconfirm, Table } from "antd";
import { DEFAULT_PAGE_SIZE, handleApiError } from "../../util/const";
import {
  DataStateServicePackage,
  ServicePackageInterface,
} from "../../interfaces/ServicePackageInterface";
import { ColumnsType } from "antd/es/table";
import { UseFormReset } from "react-hook-form";
import { existsByServicePackageId } from "../../services/ArrangementService";
import {
  toastErrorNotification,
  toastSuccessNotification,
} from "../../util/toastNotification";
import {
  deleteServicePackage,
  getServicePackages,
} from "../../services/ServicePackageService";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface TableComponentProps {
  setIsEditServicePackage: React.Dispatch<React.SetStateAction<boolean>>;
  setExistsByServicePackage: React.Dispatch<React.SetStateAction<boolean>>;
  setDataState: React.Dispatch<React.SetStateAction<DataStateServicePackage>>;
  dataState: DataStateServicePackage;
  isModalOpen: MutableRefObject<boolean>;
  reset: UseFormReset<ServicePackageInterface>;
  isMobile: boolean;
}

const TableComponent: React.FC<TableComponentProps> = ({
  dataState,
  isMobile,
  isModalOpen,
  reset,
  setDataState,
  setIsEditServicePackage,
  setExistsByServicePackage,
}) => {
  const isInfoModalVisible = useRef<boolean>(false);
  const [currentNote, setCurrentNote] = useState<string>("");

  //------------------METHODS----------------

  const nextPage = (page: number) => {
    setDataState((prev) => ({ ...prev, cursor: page }));
  };

  const handleEdit = async (record: ServicePackageInterface) => {
    setIsEditServicePackage(true);
    try {
      if (record.servicePackageId) {
        const res = await existsByServicePackageId(record.servicePackageId);
        setExistsByServicePackage(res);
      }
    } catch (e) {
      toastErrorNotification(handleApiError(e));
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
      setDataState((prev) => ({ ...prev, loading: true }));
      try {
        await deleteServicePackage(servicePackageId);
        const result = await getServicePackages(dataState.cursor - 1, null);
        setDataState((prev) => ({
          ...prev,
          servicePackages: result.data.content,
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

  //------------------RENDER----------------

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
      {isMobile && (
        <>
          {dataState.servicePackages.map((x) => (
            <TableCard
              key={x.servicePackageId}
              loading={dataState.loading}
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
          dataSource={dataState.servicePackages}
          rowKey="servicePackageId"
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
