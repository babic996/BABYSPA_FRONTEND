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
import { useFilter } from "../../context/Filter/useFilter";
import { TFunction } from "i18next";

interface TableComponentProps {
  setIsEditServicePackage: React.Dispatch<React.SetStateAction<boolean>>;
  setExistsByServicePackage: React.Dispatch<React.SetStateAction<boolean>>;
  setDataState: React.Dispatch<React.SetStateAction<DataStateServicePackage>>;
  dataState: DataStateServicePackage;
  isModalOpen: MutableRefObject<boolean>;
  reset: UseFormReset<ServicePackageInterface>;
  isMobile: boolean;
  t: TFunction;
}

const TableComponent: React.FC<TableComponentProps> = ({
  dataState,
  isMobile,
  isModalOpen,
  reset,
  setDataState,
  setIsEditServicePackage,
  setExistsByServicePackage,
  t,
}) => {
  const isInfoModalVisible = useRef<boolean>(false);
  const [currentNote, setCurrentNote] = useState<string>("");
  const { onResetFilter } = useFilter();

  //------------------METHODS----------------

  const nextPage = (page: number) => {
    setDataState((prev) => ({ ...prev, cursor: page, loading: true }));
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
        toastSuccessNotification(t("common.succesfullyDeleted"));
        onResetFilter();
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
      title: t("table.servicePackageId"),
      dataIndex: "servicePackageId",
      key: "servicePackageId",
    },
    {
      title: t("table.servicePackageName"),
      dataIndex: "servicePackageName",
      key: "servicePackageName",
    },
    {
      title: t("table.termNumber"),
      dataIndex: "termNumber",
      key: "termNumber",
      render: (value) => (value ? value : t("table.noDataCell")),
    },
    {
      title: t("table.servicePackageDurationDays"),
      dataIndex: "servicePackageDurationDays",
      key: "servicePackageDurationDays",
      render: (value) => (value ? value : t("table.noDataCell")),
    },
    {
      title: t("table.servicePackagePrice"),
      dataIndex: "price",
      key: "price",
      render: (value) => (value ? value.toFixed(2) : t("table.noDataCell")),
    },
    {
      title: t("table.servicePackageNote"),
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
            title={t("table.deleteConfirmServicePackage")}
            onConfirm={() => handleDelete(record.servicePackageId)}
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
          {dataState.servicePackages.map((x) => (
            <TableCard
              key={x.servicePackageId}
              loading={dataState.loading}
              handleEdit={() => handleEdit(x)}
              handleDelete={() => handleDelete(x.servicePackageId)}
              deleteTitle={t("table.deleteConfirmServicePackage")}
              columns={[
                {
                  title: t("table.servicePackageId"),
                  value: x.servicePackageId,
                },
                {
                  title: t("table.servicePackageName"),
                  value: x.servicePackageName
                    ? x.servicePackageName
                    : t("table.noDataCell"),
                },
                {
                  title: t("table.termNumber"),
                  value: x.termNumber ? x.termNumber : t("table.noDataCell"),
                },
                {
                  title: t("table.servicePackageDurationDays"),
                  value: x.servicePackageDurationDays
                    ? x.servicePackageDurationDays
                    : t("table.noDataCell"),
                },
                {
                  title: t("table.price"),
                  value: x.price ? x.price.toFixed(2) : t("table.noDataCell"),
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
          dataSource={dataState.servicePackages}
          rowKey="servicePackageId"
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
