interface ServicePackageTooltipData {
  date: string;
  numberOfUsedPackages: number;
}

interface ServicePackageTooltipPayload {
  payload: ServicePackageTooltipData;
}

const CustomTooltipServicePackageReport = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ServicePackageTooltipPayload[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p style={{ color: "#fff" }}>{`Datum: ${data.date}`}</p>
        <p
          style={{ color: "#fff" }}
        >{`Broj paketa usluge: ${data.numberOfUsedPackages}`}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltipServicePackageReport;
