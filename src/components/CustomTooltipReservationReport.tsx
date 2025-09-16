import { useTranslation } from "react-i18next";

interface ReservationTooltipData {
  date: string;
  numberOfReservation: number;
}

interface ReservationTooltipPayload {
  payload: ReservationTooltipData;
}

const CustomTooltipReservationReport = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReservationTooltipPayload[];
}) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p style={{ color: "#fff" }}>{`${t("common.date")}: ${data.date}`}</p>
        <p style={{ color: "#fff" }}>{`${t("common.numberOfReservation")}: ${
          data.numberOfReservation
        }`}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltipReservationReport;
