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
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p style={{ color: "#fff" }}>{`Datum: ${data.date}`}</p>
        <p
          style={{ color: "#fff" }}
        >{`Broj rezervacija: ${data.numberOfReservation}`}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltipReservationReport;
