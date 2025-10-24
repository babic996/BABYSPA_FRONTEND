import React, { useState, useEffect } from "react";
import { Drawer, Typography, Tag, Flex, Card, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/bs";
import "dayjs/locale/en";
import { OverviewReservationInterface } from "../../interfaces/ReservationInterface";
import { TFunction } from "i18next";
import {
  LeftOutlined,
  RightOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import "./MobileMonthCalendar.scss";

interface MobileMonthCalendarProps {
  reservations?: OverviewReservationInterface[];
  onEventClick: (reservation: OverviewReservationInterface) => void;
  t: TFunction;
  currentLang: string;
}

const MobileMonthCalendar: React.FC<MobileMonthCalendarProps> = ({
  reservations,
  onEventClick,
  t,
  currentLang,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Postavi locale kad se currentLang promijeni
  useEffect(() => {
    dayjs.locale(currentLang === "en" ? "en" : "bs");
  }, [currentLang]);

  // Grupisanje rezervacija po datumu
  const reservationsByDate = React.useMemo(() => {
    if (!reservations) return {};

    const grouped: Record<string, OverviewReservationInterface[]> = {};

    reservations.forEach((reservation) => {
      const startDate = dayjs(reservation.startDate);
      const endDate = dayjs(reservation.endDate);

      let current = startDate;
      while (
        current.isBefore(endDate, "day") ||
        current.isSame(endDate, "day")
      ) {
        const dateKey = current.format("YYYY-MM-DD");
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(reservation);
        current = current.add(1, "day");
      }
    });

    Object.keys(grouped).forEach((dateKey) => {
      grouped[dateKey].sort((a, b) => {
        const timeA = dayjs(a.startDate).valueOf();
        const timeB = dayjs(b.startDate).valueOf();
        return timeA - timeB;
      });
    });

    return grouped;
  }, [reservations]);

  const getDaysInMonth = () => {
    const firstDay = currentMonth.startOf("month");
    const daysInMonth = currentMonth.daysInMonth();
    const startWeekday = firstDay.day();

    const days: (Dayjs | null)[] = [];

    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(currentMonth.date(i));
    }

    return days;
  };

  const getStatusColor = (statusCode: string) => {
    switch (statusCode) {
      case "term_reserved":
        return "#16c9d3";
      case "term_canceled":
        return "#f40511";
      case "term_not_used":
        return "#ff660d";
      case "term_used":
        return "#4caf50";
      default:
        return "default";
    }
  };

  const getStatusText = (statusCode: string) => {
    switch (statusCode) {
      case "term_reserved":
        return t("common.reservedTerm");
      case "term_canceled":
        return t("common.canceledTerm");
      case "term_not_used":
        return t("common.notUsedTerm");
      case "term_used":
        return t("common.usedTerm");
      default:
        return t("table.noDataCell");
    }
  };

  const handleDateClick = (date: Dayjs) => {
    const dateKey = date.format("YYYY-MM-DD");
    if (reservationsByDate[dateKey]) {
      setSelectedDate(date);
      setDrawerVisible(true);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  const handleToday = () => {
    setCurrentMonth(dayjs());
  };

  const days = getDaysInMonth();
  const weekDays =
    currentLang === "en"
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

  const selectedDayReservations = selectedDate
    ? reservationsByDate[selectedDate.format("YYYY-MM-DD")] || []
    : [];

  return (
    <div className="mobile-month-calendar">
      {/* Header sa navigacijom */}
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-button">
          <LeftOutlined />
        </button>
        <div className="month-title">
          <Typography.Title level={4}>
            {currentMonth
              .locale(currentLang === "en" ? "en" : "bs")
              .format("MMMM YYYY")}
          </Typography.Title>
          <button onClick={handleToday} className="today-button">
            {t("common.today")}
          </button>
        </div>
        <button onClick={handleNextMonth} className="nav-button">
          <RightOutlined />
        </button>
      </div>

      <div className="weekdays">
        {weekDays.map((day, index) => (
          <div key={index} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="days-grid">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="day empty" />;
          }

          const dateKey = day.format("YYYY-MM-DD");
          const hasReservations = !!reservationsByDate[dateKey];
          const isToday = day.isSame(dayjs(), "day");
          const isCurrentMonth = day.month() === currentMonth.month();

          const uniqueStatuses = hasReservations
            ? [
                ...new Set(
                  reservationsByDate[dateKey].map((r) => r.status.statusCode)
                ),
              ].slice(0, 3)
            : [];

          return (
            <div
              key={day.format("YYYY-MM-DD")}
              className={`day ${isToday ? "today" : ""} ${
                hasReservations ? "has-events" : ""
              } ${!isCurrentMonth ? "other-month" : ""}`}
              onClick={() => hasReservations && handleDateClick(day)}
            >
              <div className="day-number">{day.date()}</div>
              {hasReservations && (
                <div className="event-markers">
                  {uniqueStatuses.map((status, idx) => (
                    <span
                      key={idx}
                      className="marker"
                      style={{ backgroundColor: getStatusColor(status) }}
                    />
                  ))}
                  {reservationsByDate[dateKey].length > 3 && (
                    <span className="marker-more">+</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Drawer
        title={
          <Typography.Text strong style={{ fontSize: 16 }}>
            {selectedDate
              ?.locale(currentLang === "en" ? "en" : "bs")
              .format("DD. MMMM YYYY")}
          </Typography.Text>
        }
        placement="bottom"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        closable={true}
        height="70vh"
        style={{ maxHeight: "70vh" }}
        styles={{
          body: {
            padding: "8px 16px 16px",
            overflowY: "auto",
            height: "100%",
          },
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {selectedDayReservations.map((reservation) => {
            const startTime = dayjs(reservation.startDate).format("HH:mm");
            const endTime = dayjs(reservation.endDate).format("HH:mm");

            return (
              <Card
                key={reservation.reservationId}
                hoverable
                onClick={() => {
                  onEventClick(reservation);
                  setDrawerVisible(false);
                }}
                style={{
                  width: "100%",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                }}
                styles={{
                  body: { padding: 0 },
                }}
              >
                <Flex
                  align="center"
                  gap={6}
                  style={{
                    background:
                      "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                    color: "white",
                    padding: "8px 12px",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  <ClockCircleOutlined />
                  <Typography.Text style={{ color: "white", fontWeight: 600 }}>
                    {startTime} - {endTime}
                  </Typography.Text>
                </Flex>

                <Flex vertical gap={8} style={{ padding: "12px" }}>
                  <Typography.Text strong style={{ fontSize: 15 }}>
                    {reservation.arrangement.babyDetails.value}
                  </Typography.Text>

                  <Tag
                    color={getStatusColor(reservation.status.statusCode)}
                    style={{ width: "fit-content" }}
                  >
                    {getStatusText(reservation.status.statusCode)}
                  </Tag>

                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    {reservation.arrangement.servicePackage.value}
                  </Typography.Text>

                  {reservation.arrangement.remainingTerm !== undefined && (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {t("table.remainingTerm")}:{" "}
                      {reservation.arrangement.remainingTerm}
                    </Typography.Text>
                  )}
                </Flex>
              </Card>
            );
          })}
        </Space>
      </Drawer>
    </div>
  );
};

export default MobileMonthCalendar;
