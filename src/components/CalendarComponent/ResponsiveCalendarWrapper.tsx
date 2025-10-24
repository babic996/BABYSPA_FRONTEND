import React from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  CreateOrUpdateReservationInterface,
  OverviewReservationInterface,
} from "../../interfaces/ReservationInterface";
import dayjs from "dayjs";
import "dayjs/locale/bs";
import { convertOverviewReservationInterfaceToCreateOrUpdateReservationInterface } from "../../mappers/ReservationMapper";
import { calendarMessages } from "../../util/const";
import { FaInfoCircle } from "react-icons/fa";
import { useState } from "react";
import { List, Modal, Space, Tag, Typography } from "antd";
import "./CalendarComponent.scss";
import useMediaQuery from "../../hooks/useMediaQuery";
import { TFunction } from "i18next";
import i18n from "../../i18n";
import MobileMonthCalendar from "./MobileMonthCalendar";

interface ResponsiveCalendarWrapperProps {
  reservations?: OverviewReservationInterface[];
  onEventClick: (record: CreateOrUpdateReservationInterface) => void;
  t: TFunction;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  reservation: OverviewReservationInterface;
  id: number;
}

const ResponsiveCalendarWrapper: React.FC<ResponsiveCalendarWrapperProps> = ({
  reservations,
  onEventClick,
  t,
}) => {
  const [openInfoModal, setIsOpenInfoModal] = useState<boolean>(false);
  const [reservationInfo, setReservationInfo] =
    useState<OverviewReservationInterface | null>();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const currentLang = i18n.language;

  dayjs.locale(currentLang === "en" ? "en" : "bs");
  const localizer = dayjsLocalizer(dayjs);

  const events =
    reservations?.map((reservation) => ({
      title:
        reservation.arrangement.babyDetails.value +
        " - " +
        reservation.status.statusName,
      start: dayjs(reservation.startDate).toDate(),
      end: dayjs(reservation.endDate).toDate(),
      reservation: reservation,
      id: reservation.reservationId,
    })) || [];

  const handleEventClick = (event: CalendarEvent) => {
    onEventClick(
      convertOverviewReservationInterfaceToCreateOrUpdateReservationInterface(
        event.reservation
      )
    );
  };

  const handleMobileEventClick = (
    reservation: OverviewReservationInterface
  ) => {
    onEventClick(
      convertOverviewReservationInterfaceToCreateOrUpdateReservationInterface(
        reservation
      )
    );
  };

  const handleOpenInfoModal = () => {
    setIsOpenInfoModal(true);
  };

  const handleCancelInfoModal = () => {
    setIsOpenInfoModal(false);
    setReservationInfo(null);
  };

  const eventRender = ({ event }: { event: CalendarEvent }) => {
    const handleIconClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setReservationInfo(event.reservation);
      handleOpenInfoModal();
    };

    const statusClass = event.reservation.status.statusCode;

    return (
      <div
        className={`custom-event ${
          statusClass == "term_canceled"
            ? "canceled"
            : statusClass == "term_used"
            ? "used"
            : statusClass == "term_not_used"
            ? "not-used"
            : statusClass == "term_reserved"
            ? "reserved"
            : ""
        }`}
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          onClick={handleIconClick}
          style={{
            marginRight: "4px",
          }}
        >
          <FaInfoCircle />
        </span>
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {event.title}
        </span>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div
        style={{
          backgroundColor: "#fff",
        }}
      >
        <MobileMonthCalendar
          reservations={reservations}
          onEventClick={handleMobileEventClick}
          t={t}
          currentLang={currentLang}
        />
      </div>
    );
  }

  return (
    <>
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <Typography.Text strong style={{ fontSize: "18px" }}>
              {t("modal.information")}
            </Typography.Text>
          </div>
        }
        maskClosable={true}
        open={openInfoModal}
        onCancel={handleCancelInfoModal}
        width={500}
        centered
        footer={null}
      >
        <List
          size="small"
          dataSource={[
            {
              label: t("table.arrangementId"),
              value: reservationInfo?.arrangement.arrangementId,
            },
            {
              label: t("table.babyDetails"),
              value: reservationInfo?.arrangement.babyDetails.value,
            },
            {
              label: t("table.servicePackage"),
              value: reservationInfo?.arrangement.servicePackage.value,
            },
            {
              label: t("table.remainingTerm"),
              value: reservationInfo?.arrangement.remainingTerm,
            },
            {
              label: t("table.status"),
              value: reservationInfo?.status.statusCode,
              isStatus: true,
            },
          ]}
          renderItem={(item) => (
            <List.Item>
              <Space
                direction="horizontal"
                align="center"
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  padding: "8px 0",
                }}
              >
                <Typography.Text type="secondary" style={{ minWidth: "120px" }}>
                  {item.label}:
                </Typography.Text>
                {item.isStatus ? (
                  <div>
                    {item.value === "term_reserved" ? (
                      <Tag color="#16c9d3">{t("common.reservedTerm")}</Tag>
                    ) : item.value === "term_canceled" ? (
                      <Tag color="#f40511">{t("common.canceledTerm")}</Tag>
                    ) : item.value === "term_not_used" ? (
                      <Tag color="#ff660d">{t("common.notUsedTerm")}</Tag>
                    ) : item.value === "term_used" ? (
                      <Tag color="#4caf50">{t("common.usedTerm")}</Tag>
                    ) : (
                      <Tag color="default">{t("table.noDataCell")}</Tag>
                    )}
                  </div>
                ) : (
                  <Typography.Text
                    strong
                    style={{ textAlign: "right", flex: 1 }}
                  >
                    {item.value || "0"}
                  </Typography.Text>
                )}
              </Space>
            </List.Item>
          )}
        />
      </Modal>
      <div style={{ height: "calc(100vh - 50px)", backgroundColor: "#fff" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={["month", "week", "day"]}
          defaultView="month"
          onSelectEvent={handleEventClick}
          messages={currentLang === "en" ? undefined : calendarMessages}
          components={{
            event: eventRender,
          }}
        />
      </div>
    </>
  );
};

export default ResponsiveCalendarWrapper;
