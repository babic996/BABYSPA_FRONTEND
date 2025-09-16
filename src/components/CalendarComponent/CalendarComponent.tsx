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
import { Modal, Tag, Typography } from "antd";
import "./CalendarComponent.scss";
import useMediaQuery from "../../hooks/useMediaQuery";
import { TFunction } from "i18next";
import i18n from "../../i18n";
const { Paragraph, Title } = Typography;

interface CalendarComponentProps {
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

const CalendarComponent: React.FC<CalendarComponentProps> = ({
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

  return (
    <>
      <Modal
        title={
          <div style={{ textAlign: "center" }}>{t("modal.information")}</div>
        }
        maskClosable={false}
        open={openInfoModal}
        onCancel={handleCancelInfoModal}
        width={isMobile ? 300 : 600}
        centered
        footer={null}
      >
        <Typography
          style={{
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
          }}
        >
          <Title level={5} style={{ color: "#333" }}>
            {t("table.arrangementId")}
          </Title>
          <Paragraph
            style={{
              fontSize: "14px",
              lineHeight: "0.5",
            }}
          >
            {reservationInfo?.arrangement.arrangementId}
          </Paragraph>
          <Title level={5} style={{ color: "#333" }}>
            {t("table.babyDetails")}
          </Title>
          <Paragraph
            style={{
              fontSize: "14px",
              lineHeight: "0.5",
            }}
          >
            {reservationInfo?.arrangement.babyDetails.value}
          </Paragraph>

          <Title level={5} style={{ color: "#333" }}>
            {t("table.servicePackage")}
          </Title>
          <Paragraph
            style={{
              fontSize: "14px",
              lineHeight: "0.5",
            }}
          >
            {reservationInfo?.arrangement.servicePackage.value}
          </Paragraph>

          <Title level={5} style={{ color: "#333" }}>
            {t("table.status")}
          </Title>
          <Paragraph style={{ fontSize: "14px", lineHeight: "0.5" }}>
            {reservationInfo?.status.statusCode === "term_reserved" ? (
              <Tag color="#16c9d3">{t("common.reservedTerm")}</Tag>
            ) : reservationInfo?.status.statusCode === "term_canceled" ? (
              <Tag color="#f40511">{t("common.canceledTerm")}</Tag>
            ) : reservationInfo?.status.statusCode === "term_not_used" ? (
              <Tag color="#ff660d">{t("common.notUsedTerm")}</Tag>
            ) : reservationInfo?.status.statusCode === "term_used" ? (
              <Tag color="#4caf50">{t("common.usedTerm")}</Tag>
            ) : (
              t("table.noDataCell")
            )}
          </Paragraph>

          <Title level={5} style={{ color: "#333" }}>
            {t("table.remainingTerm")}
          </Title>
          <Paragraph
            style={{
              fontSize: "14px",
              lineHeight: "0.5",
            }}
          >
            {reservationInfo?.arrangement.remainingTerm}
          </Paragraph>
        </Typography>
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

export default CalendarComponent;
