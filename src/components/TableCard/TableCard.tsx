import { Card, Popconfirm, Divider } from "antd";
import React from "react";
import {
  EditOutlined,
  DeleteOutlined,
  ContactsOutlined,
} from "@ant-design/icons";
import "./TableCard.scss";
import { useTranslation } from "react-i18next";

interface ColumnData {
  title: string;
  value: React.ReactNode;
  isPreviewable?: boolean;
  onNoteClick?: () => void;
}

interface TableCardProps {
  columns: ColumnData[];
  handleEdit?: (item: unknown) => void;
  handleDelete?: (item: unknown) => void;
  handleReservationPreview?: (item: unknown) => void;
  deleteTitle?: string;
  loading: boolean;
}

const TableCard: React.FC<TableCardProps> = ({
  columns,
  handleEdit,
  handleDelete,
  handleReservationPreview,
  deleteTitle,
  loading,
}) => {
  const { t } = useTranslation();
  const actions: React.ReactNode[] = [
    handleEdit && (
      <EditOutlined key="edit" onClick={handleEdit} style={{ color: "#fff" }} />
    ),
    handleDelete && (
      <Popconfirm
        title={deleteTitle}
        onConfirm={handleDelete}
        okText={t("button.confirm")}
        cancelText={t("button.cancel")}
        key="delete"
      >
        <DeleteOutlined style={{ color: "#fff" }} title={t("button.delete")} />
      </Popconfirm>
    ),
    handleReservationPreview && (
      <ContactsOutlined
        key="reservationPreview"
        onClick={handleReservationPreview}
        style={{ color: "#fff" }}
      />
    ),
  ].filter(Boolean);

  return (
    <Card
      loading={loading}
      actions={actions}
      style={{
        marginBottom: "6px",
      }}
      className="table-card"
    >
      <Card.Meta
        description={
          <>
            {columns.map((column, index) => (
              <div key={index} style={{ marginBottom: "4px" }}>
                <div style={{ fontWeight: "bold" }}>{column.title}</div>
                {column.isPreviewable ? (
                  <span
                    onClick={column.onNoteClick}
                    style={{ color: "#1890ff" }}
                  >
                    {typeof column.value === "string" && column.value.length > 3
                      ? column.value.slice(0, 3) + "..."
                      : column.value}
                  </span>
                ) : (
                  column.value
                )}

                {index !== columns.length - 1 && (
                  <Divider style={{ margin: "4px 0" }} />
                )}
              </div>
            ))}
          </>
        }
      />
    </Card>
  );
};

export default TableCard;
