import { Modal } from "antd";
import React from "react";
import { ReservationShortDetailsInterface } from "../../interfaces/ReservationShortDetailsInterface";
import dayjs from "dayjs";
import useMediaQuery from "../../hooks/useMediaQuery";
import { TFunction } from "i18next";

interface ReservationInfoModalProps {
  visible: boolean;
  onClose: () => void;
  reservations: ReservationShortDetailsInterface[];
  t: TFunction;
}

const ReservationInfoModal: React.FC<ReservationInfoModalProps> = ({
  visible,
  onClose,
  reservations,
  t,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>{t("modal.reservations")}</div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMobile ? 300 : 600}
      centered
    >
      <div>
        {reservations.length > 0 ? (
          reservations.map((reservation, index) => {
            const startDateFormatted = dayjs(reservation.startDate).format(
              "HH:mm"
            );
            const endDateFormatted = dayjs(reservation.endDate).format("HH:mm");
            const dateOnlyFormatted = dayjs(reservation.startDate).format(
              "DD.MM.YYYY."
            );

            return (
              <div key={index}>
                {dateOnlyFormatted} {t("common.from")} {startDateFormatted}{" "}
                {t("common.to")} {endDateFormatted}{" "}
                {` ${t("common.hours")} - (`}
                {reservation.statusCode === "term_canceled"
                  ? t("common.canceledTerm")
                  : reservation.statusCode === "term_used"
                  ? t("common.usedTerm")
                  : reservation.statusCode === "term_not_used"
                  ? t("common.notUsedTerm")
                  : reservation.statusCode === "term_reserved"
                  ? t("common.reservedTerm")
                  : ""}
                {")"}
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center" }}>
            {t("modal.noReservationsTitle")}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default ReservationInfoModal;
