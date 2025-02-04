import React, { useCallback, useEffect, useState } from "react";
import {
  Input,
  DatePicker,
  Select,
  InputNumber,
  ConfigProvider,
  Row,
  Col,
} from "antd";
import { useFilter } from "../../context/Filter/useFilter";
import dayjs, { Dayjs } from "dayjs";
import debounce from "lodash/debounce";
import { getServicePackagesList } from "../../services/ServicePackageService";
import { getBabiesList } from "../../services/BabyService";
import { ShortDetailsInterface } from "../../interfaces/ShortDetails";
import { getPaymentTypeList } from "../../services/PaymentTypeService";
import { PaymentTypeInterface } from "../../interfaces/PaymentTypeInterface";
import { getStatusList } from "../../services/StatusService";
import { StatusInterface } from "../../interfaces/StatusInterface";
import { AiOutlineArrowRight } from "react-icons/ai";
import { groupDataReportType } from "../../util/const";
import FilterButton from "../ButtonComponents/FilterButton";
const { RangePicker } = DatePicker;

interface FilterComponentProps {
  showSearch?: boolean;
  showDatePicker?: boolean;
  showSelectBebies?: boolean;
  showSelectServicePackages?: boolean;
  showRangePicker?: boolean;
  showTimeInRangePicker?: boolean;
  showPriceSlider?: boolean;
  showRemainingTerm?: boolean;
  showStatusSelect?: boolean;
  showPaymentTypeSelect?: boolean;
  showArrangementIdSearch?: boolean;
  showGroupReportData?: boolean;
  statusTypeCode?: string;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  showSearch = false,
  showDatePicker = false,
  showSelectBebies = false,
  showRangePicker = false,
  showTimeInRangePicker = false,
  showPriceSlider = false,
  showSelectServicePackages = false,
  showRemainingTerm = false,
  showStatusSelect = false,
  showPaymentTypeSelect = false,
  showGroupReportData = false,
  showArrangementIdSearch = false,
  statusTypeCode,
}) => {
  const { filter, setFilter, searchText, setSearchText, onResetFilter } =
    useFilter();
  const [babies, setBabies] = useState<ShortDetailsInterface[]>([]);
  const [servicePackages, setServicePackages] = useState<
    ShortDetailsInterface[]
  >([]);
  const [paymentType, setPaymentType] = useState<PaymentTypeInterface[]>([]);
  const [statuses, setStatuses] = useState<StatusInterface[]>([]);

  useEffect(() => {
    getBabiesList().then((res) => setBabies(res));
    getServicePackagesList().then((res) => setServicePackages(res));
    getPaymentTypeList().then((res) => setPaymentType(res));
    if (statusTypeCode) {
      getStatusList(statusTypeCode).then((res) => setStatuses(res));
    }
  }, [showGroupReportData]);

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      const [start, end] = dates;
      setFilter((prev) => ({
        ...prev,
        startRangeDate: start ? start.format("YYYY-MM-DDTHH:mm:ss") : null,
        endRangeDate: end ? end.format("YYYY-MM-DDTHH:mm:ss") : null,
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        startRangeDate: null,
        endRangeDate: null,
      }));
    }
  };

  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setFilter((prev) => ({ ...prev, searchText: value }));
    }, 500),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    handleSearchChange(value);
  };

  const handleStartPriceChange = (value: number | null) => {
    setFilter((prev) => ({
      ...prev,
      startPrice: value,
    }));
  };

  const handleArrangementIdInput = (value: number | null) => {
    setFilter((prev) => ({
      ...prev,
      arrangementId: value,
    }));
  };

  const handleEndPriceChange = (value: number | null) => {
    if (filter.startPrice && value && value >= filter.startPrice) {
      setFilter((prev) => ({
        ...prev,
        endPrice: value,
      }));
    }
  };

  const handleRemainingTermInputChange = (value: number | null) => {
    setFilter((prev) => ({ ...prev, remainingTerm: value }));
  };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
      {showSearch && (
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Input
            placeholder="Pretraži..."
            status="warning"
            value={searchText}
            onChange={handleInputChange}
          />
        </Col>
      )}
      {showArrangementIdSearch && (
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <InputNumber
            placeholder="ID aranžmana..."
            status="warning"
            min={1}
            step={1}
            onChange={handleArrangementIdInput}
            value={filter?.arrangementId}
            style={{ width: "100%" }}
          />
        </Col>
      )}
      {showRemainingTerm && (
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <InputNumber
            placeholder="Preostalo termina..."
            status="warning"
            min={0}
            style={{ width: "100%" }}
            value={filter?.remainingTerm}
            onChange={handleRemainingTermInputChange}
          />
        </Col>
      )}
      {showDatePicker && (
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <DatePicker
            status="warning"
            style={{ width: "100%" }}
            value={filter.date ? dayjs(filter.date) : null}
          />
        </Col>
      )}
      {showRangePicker && (
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <ConfigProvider>
            <RangePicker
              showTime={showTimeInRangePicker ? true : false}
              format={
                showTimeInRangePicker ? "DD.MM.YYYY. HH:mm" : "DD.MM.YYYY."
              }
              status="warning"
              value={
                filter.startRangeDate && filter.endRangeDate
                  ? [dayjs(filter.startRangeDate), dayjs(filter.endRangeDate)]
                  : null
              }
              onChange={handleRangeChange}
              style={{ width: "100%" }}
            />
          </ConfigProvider>
        </Col>
      )}
      {showSelectBebies && (
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Select
            placeholder="Odaberi bebu"
            showSearch
            allowClear
            value={filter.babyId}
            status="warning"
            style={{ width: "100%" }}
            filterOption={(input, option) => {
              if (option && option.children) {
                const childrenString = Array.isArray(option.children)
                  ? option.children.join("")
                  : option.children;
                return (
                  typeof childrenString === "string" &&
                  childrenString.toLowerCase().includes(input.toLowerCase())
                );
              }
              return false;
            }}
            onChange={(value) =>
              setFilter((prev) => ({ ...prev, babyId: value }))
            }
          >
            {babies?.map((x) => (
              <Select.Option key={x.id} value={x.id}>
                {x.value}
              </Select.Option>
            ))}
          </Select>
        </Col>
      )}
      {showSelectServicePackages && (
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Select
            placeholder="Odaberi paket usluge"
            showSearch
            allowClear
            status="warning"
            value={filter.servicePackageId}
            style={{ width: "100%" }}
            filterOption={(input, option) => {
              if (option && option.children) {
                const childrenString = Array.isArray(option.children)
                  ? option.children.join("")
                  : option.children;
                return (
                  typeof childrenString === "string" &&
                  childrenString.toLowerCase().includes(input.toLowerCase())
                );
              }
              return false;
            }}
            onChange={(value) =>
              setFilter((prev) => ({ ...prev, servicePackageId: value }))
            }
          >
            {servicePackages?.map((x) => (
              <Select.Option key={x.id} value={x.id}>
                {x.value}
              </Select.Option>
            ))}
          </Select>
        </Col>
      )}
      {showPaymentTypeSelect && (
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Select
            placeholder="Odaberi tip plaćanja"
            allowClear
            style={{ width: "100%" }}
            value={filter?.paymentTypeId}
            status="warning"
            onChange={(value) =>
              setFilter((prev) => ({ ...prev, paymentTypeId: value }))
            }
          >
            {paymentType?.map((x) => (
              <Select.Option key={x.paymentTypeId} value={x.paymentTypeId}>
                {x.paymentTypeName}
              </Select.Option>
            ))}
          </Select>
        </Col>
      )}
      {showStatusSelect && (
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Select
            placeholder="Odaberi status"
            allowClear
            style={{ width: "100%" }}
            status="warning"
            value={filter.statusId}
            onChange={(value) =>
              setFilter((prev) => ({ ...prev, statusId: value }))
            }
          >
            {statuses?.map((x) => (
              <Select.Option key={x.statusId} value={x.statusId}>
                {x.statusName}
              </Select.Option>
            ))}
          </Select>
        </Col>
      )}
      {showGroupReportData && (
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Select
            placeholder="Odaberi način grupisanja podataka"
            style={{ width: "100%" }}
            value={filter?.groupDataType}
            status="warning"
            onChange={(value) =>
              setFilter((prev) => ({ ...prev, groupDataType: value }))
            }
          >
            {groupDataReportType?.map((x) => (
              <Select.Option key={x.value} value={x.value}>
                {x.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
      )}
      {showPriceSlider && (
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <InputNumber
              placeholder="Cijena od"
              status="warning"
              onChange={handleStartPriceChange}
              value={filter?.startPrice}
              step={0.1}
              style={{ flex: 1 }}
            />
            <AiOutlineArrowRight style={{ margin: "0 12px" }} />
            <InputNumber
              placeholder="Cijena do"
              status="warning"
              onChange={handleEndPriceChange}
              value={filter?.endPrice}
              min={
                filter.startPrice && filter.startPrice > 0
                  ? filter.startPrice
                  : 0
              }
              step={0.1}
              style={{ flex: 1 }}
            />
          </div>
        </Col>
      )}
      <Col xs={24} sm={12} md={8} lg={6} xl={4}>
        <FilterButton
          buttonTitle="Reset filtera"
          onButtonAction={onResetFilter}
        />
      </Col>
    </Row>
  );
};

export default FilterComponent;
