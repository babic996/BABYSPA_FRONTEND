import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p style={{ color: "#fff" }}>{`${t("common.date")}: ${data.date}`}</p>
        <p style={{ color: "#fff" }}>{`${t(
          "common.numberOfServicePackages"
        )}: ${data.numberOfUsedPackages}`}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltipServicePackageReport;
