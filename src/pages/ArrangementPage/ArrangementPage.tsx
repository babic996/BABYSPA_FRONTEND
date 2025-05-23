import { useEffect, useRef, useState } from "react";
import {
  CreateOrUpdateArrangementInterface,
  DataStateArrangement,
  DropDownDataInterface,
  TableArrangementInterface,
} from "../../interfaces/ArrangementInterface";
import { useForm, useWatch } from "react-hook-form";
import {
  getArrangements,
  getArrangementsPrice,
} from "../../services/ArrangementService";
import { toastErrorNotification } from "../../util/toastNotification";

import { Modal } from "antd";
import FilterComponent from "../../components/FilterComponent/FilterComponent";
import { getServicePackagesList } from "../../services/ServicePackageService";
import { getBabiesList } from "../../services/BabyService";
import { ShortDetailsInterface } from "../../interfaces/ShortDetails";
import { StatusInterface } from "../../interfaces/StatusInterface";
import { getStatusList } from "../../services/StatusService";
import { DiscountInterface } from "../../interfaces/DiscountInterface";
import { getDiscountList } from "../../services/DiscountService";
import { PaymentTypeInterface } from "../../interfaces/PaymentTypeInterface";
import { getPaymentTypeList } from "../../services/PaymentTypeService";
import { useFilter } from "../../context/Filter/useFilter";
import { yupResolver } from "@hookform/resolvers/yup";
import { getArrangementValidationSchema } from "../../validations/ArrangementValidationSchema";
import HeaderButtonsComponent from "../../components/HeaderButtonsComponent/HeaderButtonsComponent";
import useMediaQuery from "../../hooks/useMediaQuery";
import "./ArrangementPage.scss";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import { getGiftCardList } from "../../services/GiftCardService";
import { GiftCardInterface } from "../../interfaces/GiftCardInterface";
import ArrangementModalContent from "../../components/ArrangementModalContent/ArrangementModalContent";
import TableComponent from "./TableComponent";
import { handleApiError } from "../../util/const";

const ArrangementPage = () => {
  const isModalOpen = useRef<boolean>(false);
  const [dataState, setDataState] = useState<DataStateArrangement>({
    cursor: 1,
    arrangements: [] as TableArrangementInterface[],
    totalElements: undefined as number | undefined,
    totalSum: 0,
    loading: true,
  });
  const [dropdownData, setDropdownData] = useState<DropDownDataInterface>({
    babies: [] as ShortDetailsInterface[],
    servicePackages: [] as ShortDetailsInterface[],
    discounts: [] as DiscountInterface[],
    giftCards: [] as GiftCardInterface[],
    status: [] as StatusInterface[],
    paymentTypes: [] as PaymentTypeInterface[],
  });
  const [isEditArrangement, setIsEditArrangement] = useState<boolean>(false);
  const [hidePaymentType, setHidePaymentType] = useState<boolean>(false);
  const [disableEditField, setDisableEditField] = useState<boolean>(false);
  const schema = getArrangementValidationSchema(
    isEditArrangement,
    dropdownData.paymentTypes
  );
  const { filter, showFilters, setShowFilters, onResetFilter } = useFilter();
  const isMobile = useMediaQuery("(max-width: 1280px)");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateOrUpdateArrangementInterface>({
    resolver: yupResolver(schema),
  });

  const selectedPaymentType = useWatch({
    control,
    name: "paymentTypeId",
  });

  const selectedArrangementId = useWatch({
    control,
    name: "arrangementId",
  });

  //------------------LIFECYCLE------------------

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [servicePackages, babies, status, discounts, paymentTypes] =
          await Promise.all([
            getServicePackagesList(),
            getBabiesList(),
            getStatusList("arrangement"),
            getDiscountList(),
            getPaymentTypeList(),
          ]);

        setDropdownData((prev) => ({
          ...prev,
          servicePackages: servicePackages,
          babies: babies,
          discounts: discounts,
          status: status,
          paymentTypes: paymentTypes,
        }));
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        onResetFilter();
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchGiftCards = async () => {
      if (!selectedArrangementId) return;

      try {
        const res = await getGiftCardList(false, selectedArrangementId);
        setDropdownData((prev) => ({
          ...prev,
          giftCards: res,
        }));
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        onResetFilter();
      }
    };

    fetchGiftCards();
  }, [selectedArrangementId, isEditArrangement]);

  useEffect(() => {
    if (!filter) return;
    const fetchData = async () => {
      try {
        const [arrangements, arrangementsPrice] = await Promise.all([
          getArrangements(dataState.cursor - 1, filter),
          getArrangementsPrice(filter),
        ]);

        setDataState((prev) => ({
          ...prev,
          arrangements: arrangements.data.content,
          totalSum: arrangementsPrice.data,
          totalElements: arrangements.data.totalElements,
        }));
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        setDataState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [filter, dataState.cursor]);

  useUpdateEffect(() => {
    if (dataState.cursor > 1) {
      setDataState((prev) => ({ ...prev, cursor: 1 }));
    }
  }, [filter]);

  //------------------METHODS----------------

  const handleModal = (open: boolean) => {
    reset({
      arrangementId: null,
      discountId: null,
      giftCardId: null,
      babyId: 0,
      statusId: null,
      paymentTypeId: null,
      servicePackageId: 0,
      note: "",
    });

    setIsEditArrangement(false);
    setDisableEditField(false);
    isModalOpen.current = open;
  };

  //------------------RENDER------------------

  return (
    <>
      <Modal
        title={
          isEditArrangement ? (
            <div style={{ textAlign: "center" }}>Uredi aranžman</div>
          ) : (
            <div style={{ textAlign: "center" }}>Dodaj novi aranžman</div>
          )
        }
        maskClosable={false}
        open={isModalOpen.current}
        footer={null}
        onCancel={() => handleModal(false)}
        width={isMobile ? 300 : 600}
        centered
      >
        <ArrangementModalContent
          control={control}
          dataState={dataState}
          disableEditField={disableEditField}
          dropdownData={dropdownData}
          errors={errors}
          handleSubmit={handleSubmit}
          hidePaymentType={hidePaymentType}
          isEditArrangement={isEditArrangement}
          isModalOpen={isModalOpen}
          selectedPaymentType={selectedPaymentType}
          setDataState={setDataState}
          setHidePaymentType={setHidePaymentType}
          setValue={setValue}
        />
      </Modal>
      <div style={{ padding: "16px" }}>
        <HeaderButtonsComponent
          buttonTitle="Dodaj aranžman"
          onButtonAction={() => handleModal(true)}
          onFilterAction={() => setShowFilters((prev) => !prev)}
        />
        {showFilters && (
          <FilterComponent
            showSelectBebies={true}
            showPriceSlider={true}
            showSelectServicePackages={true}
            showPaymentTypeSelect={true}
            showStatusSelect={true}
            showArrangementIdSearch={true}
            showGiftCards={true}
            statusTypeCode="arrangement"
            showRemainingTerm={true}
            showRangePicker={true}
          />
        )}

        <TableComponent
          dataState={dataState}
          dropdownData={dropdownData}
          isMobile={isMobile}
          isModalOpen={isModalOpen}
          reset={reset}
          setDataState={setDataState}
          setDisableEditField={setDisableEditField}
          setHidePaymentType={setHidePaymentType}
          setIsEditArrangement={setIsEditArrangement}
        />
      </div>
    </>
  );
};

export default ArrangementPage;
