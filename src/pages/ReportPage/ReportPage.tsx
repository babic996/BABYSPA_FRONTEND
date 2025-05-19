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
// import dayjs, { Dayjs } from "dayjs";
// import type { CheckboxProps } from "antd";
// import { toastSuccessNotification } from "../../util/toastNotification";
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
  // const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<string>(
    "reservationReportTab"
  );
  // const [generateAllDays, setGenerateAllDays] = useState<boolean>(false);
  // const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
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

  // useUpdateEffect(() => {
  //   if (filter?.groupDataType) {
  //     if (activeTabKey === "reservationReportTab") {
  //       getReservationDailyReports(filter).then((res) => {
  //         setReservationDailyReport(res);
  //       });
  //     }
  //     if (activeTabKey === "servicePackageReportTab") {
  //       getServicePackageDailyReports(filter).then((res) => {
  //         setServicePackageDailyReport(res);
  //       });
  //     }
  //   }
  // }, [filter, activeTabKey]);

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

  // const showModal = () => {
  //   setIsModalVisible(true);
  // };

  // const handleCancelReportModal = () => {
  //   setIsModalVisible(false);
  //   setGenerateAllDays(false);
  //   setSelectedDate(null);
  // };

  // const handleCheckboxChange: CheckboxProps["onChange"] = (e) => {
  //   setGenerateAllDays(e.target.checked);
  //   if (e.target.checked == true) {
  //     setSelectedDate(null);
  //   }
  // };

  // const handleDateChange = (date: Dayjs | null) => {
  //   setSelectedDate(date);
  // };

  // const handleSubmitReportModal = () => {
  //   generateReport(
  //     generateAllDays,
  //     selectedDate?.format("YYYY-MM-DDTHH:mm:ss")
  //   ).then(() => {
  //     toastSuccessNotification("Generisani izvještaji spremni za prikaz!");
  //     setFilter({
  //       groupDataType: groupDataReportType.find((x) => (x.value = "day"))
  //         ?.value,
  //     });
  //     getReservationDailyReports(null).then((res) =>
  //       setReservationDailyReport(res)
  //     );
  //     getServicePackageDailyReports(null).then((res) =>
  //       setServicePackageDailyReport(res)
  //     );
  //   });
  //   setGenerateAllDays(false);
  //   setSelectedDate(null);
  //   handleCancelReportModal();
  // };

  // const disableTodayAndFuture = (current: Dayjs) => {
  //   return current.isSame(dayjs(), "day") || current.isAfter(dayjs(), "day");
  // };

  //------------------RENDER------------------

  return (
    <>
      {/* <Modal
        title={<div style={{ textAlign: "center" }}>Generiši izvještaje</div>}
        maskClosable={false}
        open={isModalVisible}
        onCancel={handleCancelReportModal}
        width={400}
        footer={[
          <Button key="back" onClick={handleCancelReportModal}>
            Odustani
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmitReportModal}
            disabled={!generateAllDays && !selectedDate}
          >
            Generiši
          </Button>,
        ]}
      >
        <Checkbox
          checked={generateAllDays}
          onChange={handleCheckboxChange}
          style={{ width: "100%" }}
        >
          Generiši izvještaje za sve dane
        </Checkbox>
        <br />
        <DatePicker
          onChange={handleDateChange}
          value={selectedDate}
          format={"DD.MM.YYYY."}
          style={{ marginTop: "16px", width: "100%" }}
          disabled={generateAllDays}
          disabledDate={disableTodayAndFuture}
        />
      </Modal> */}
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
      {/* ovaj button sam ukinuo jer ce se izvjestaji sami generisati */}
      {/* <FloatButton
          onClick={showModal}
          tooltip={<div>Generiši izvještaje</div>}
          type="primary"
          style={{ width: "50px", height: "50px" }}
        /> */}
    </>
  );
};

export default ReportPage;
