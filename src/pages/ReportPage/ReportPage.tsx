import { useEffect, useMemo, useState } from "react";
import "./ReportPage.scss";
import {
  getReservationDailyReports,
  getServicePackageDailyReports,
} from "../../services/ReportService";
import { ReservationDailyReportInterface } from "../../interfaces/ReservationDailyReportInterface";
import { useFilter } from "../../context/Filter/useFilter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import FilterComponent from "../../components/FilterComponent/FilterComponent";
import { Tabs } from "antd";
import { ServicePackageDailyReportInterface } from "../../interfaces/ServicePackageDailyReportInterface";
import CustomTooltipReservationReport from "../../components/CustomTooltipReservationReport";
import CustomTooltipServicePackageReport from "../../components/CustomTooltipServicePackageReport";
import { groupDataReportType, handleApiError } from "../../util/const";
import useMediaQuery from "../../hooks/useMediaQuery";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import { toastErrorNotification } from "../../util/toastNotification";

const ReportPage = () => {
  const [reservationDailyReport, setReservationDailyReport] = useState<
    ReservationDailyReportInterface[]
  >([]);

  const [servicePackageDailyReport, setServicePackageDailyReport] = useState<
    ServicePackageDailyReportInterface[]
  >([]);
  const [activeTabKey, setActiveTabKey] = useState<string>(
    "reservationReportTab"
  );
  const { filter, setFilter, onResetFilter } = useFilter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  //------------------LIFECYCLE------------------

  useEffect(() => {
    onResetFilter();
  }, []);

  useUpdateEffect(() => {
    if (!filter) return;

    const fetchData = async () => {
      if (!filter?.groupDataType) return;

      try {
        if (activeTabKey === "reservationReportTab") {
          const res = await getReservationDailyReports(filter);
          setReservationDailyReport(res);
        }

        if (activeTabKey === "servicePackageReportTab") {
          const res = await getServicePackageDailyReports(filter);
          setServicePackageDailyReport(res);
        }
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      }
    };

    fetchData();
  }, [filter, activeTabKey]);

  const sumOnXAxesReservations = useMemo(() => {
    if (activeTabKey === "reservationReportTab") {
      return reservationDailyReport.reduce(
        (total, reservation) => total + reservation.numberOfReservation,
        0
      );
    }
    return 0;
  }, [reservationDailyReport, activeTabKey]);

  const sumOnXAxesServicePackages = useMemo(() => {
    if (activeTabKey === "servicePackageReportTab") {
      return servicePackageDailyReport.reduce(
        (total, pkg) => total + pkg.numberOfUsedPackages,
        0
      );
    }
    return 0;
  }, [servicePackageDailyReport, activeTabKey]);

  //------------------METHODS------------------

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
    setFilter({
      groupDataType: groupDataReportType.find((x) => (x.value = "day"))?.value,
    });
  };

  //------------------RENDER------------------

  return (
    <>
      <Tabs
        defaultActiveKey="reservationReportTab"
        activeKey={activeTabKey}
        onChange={handleTabChange}
        style={{ padding: 16 }}
        items={[
          {
            key: "reservationReportTab",
            label: (
              <span style={{ fontSize: `${isMobile} 12px : 30px` }}>
                Grafički izvještaj za rezervacije
              </span>
            ),
            children: (
              <>
                <FilterComponent
                  showSelectBebies={true}
                  showStatusSelect={true}
                  showRangePicker={true}
                  showTimeInRangePicker={false}
                  showGroupReportData={true}
                  statusTypeCode="reservation"
                />
                {reservationDailyReport.length > 0 ? (
                  <>
                    <div style={{ margin: "20px 0", textAlign: "center" }}>
                      <h3>Ukupno rezervacija: {sumOnXAxesReservations}</h3>
                      <p>
                        Ova cifra predstavlja ukupan broj rezervacija za
                        izabrani vremenski period.
                      </p>
                    </div>
                    <ResponsiveContainer height={300}>
                      <BarChart data={reservationDailyReport}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltipReservationReport />} />
                        <Bar dataKey="numberOfReservation" fill="#1890ff" />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <div className="no-data-message">
                    <p className="message-color">
                      Nema podataka za odabrani filter
                    </p>
                  </div>
                )}
              </>
            ),
          },
          {
            key: "servicePackageReportTab",
            label: (
              <span style={{ fontSize: `${isMobile} 12px : 30px` }}>
                Grafički izvještaj za pakete usluga
              </span>
            ),
            children: (
              <>
                <FilterComponent
                  showSelectServicePackages={true}
                  showRangePicker={true}
                  showTimeInRangePicker={false}
                  showGroupReportData={true}
                />
                {servicePackageDailyReport.length > 0 ? (
                  <>
                    <div style={{ margin: "20px 0", textAlign: "center" }}>
                      <h3>
                        Ukupno korištenih paketa: {sumOnXAxesServicePackages}
                      </h3>
                      <p>
                        Ova cifra predstavlja ukupan broj iskorištenih paketa
                        usluga za izabrani vremenski period.
                      </p>
                    </div>
                    <ResponsiveContainer height={300}>
                      <BarChart data={servicePackageDailyReport}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          content={<CustomTooltipServicePackageReport />}
                        />
                        <Bar dataKey="numberOfUsedPackages" fill="#1890ff" />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <div className="no-data-message">
                    <p className="message-color">
                      Nema podataka za odabrani filter
                    </p>
                  </div>
                )}
              </>
            ),
          },
        ]}
      />
    </>
  );
};

export default ReportPage;
