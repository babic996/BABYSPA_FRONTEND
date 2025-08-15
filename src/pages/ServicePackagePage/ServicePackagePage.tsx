import { useEffect, useRef, useState } from "react";
import {
  DataStateServicePackage,
  ServicePackageInterface,
} from "../../interfaces/ServicePackageInterface";
import { getServicePackages } from "../../services/ServicePackageService";
import { toastErrorNotification } from "../../util/toastNotification";
import { Modal } from "antd";
import FilterComponent from "../../components/FilterComponent/FilterComponent";
import { handleApiError } from "../../util/const";
import { getServicePackageValidationSchema } from "../../validations/ServicePackageValidationSchema";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFilter } from "../../context/Filter/useFilter";
import HeaderButtonsComponent from "../../components/HeaderButtonsComponent/HeaderButtonsComponent";
import useMediaQuery from "../../hooks/useMediaQuery";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import ServicePackageModalContent from "../../components/ServicePackageModalContent/ServicePackageModalContent";
import TableComponent from "./TableComponent";

const ServicePackagePage = () => {
  const isModalOpen = useRef<boolean>(false);
  const [dataState, setDataState] = useState<DataStateServicePackage>({
    cursor: 1,
    servicePackages: [] as ServicePackageInterface[],
    totalElements: undefined as number | undefined,
    loading: true,
  });
  const [isEditServicePackage, setIsEditServicePackage] =
    useState<boolean>(false);
  const [existsByServicePackage, setExistsByServicePackage] =
    useState<boolean>(false);
  const schema = getServicePackageValidationSchema(isEditServicePackage);
  const { filter, showFilters, setShowFilters, onResetFilter } = useFilter();
  const [canFetch, setCanFetch] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServicePackageInterface>({
    resolver: yupResolver(schema),
  });

  //------------------LIFECYCLE------------------

  useEffect(() => {
    onResetFilter();
    setCanFetch(true);
  }, []);

  useUpdateEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setDataState((prev) => ({ ...prev, loading: true }));
        const result = await getServicePackages(
          dataState.cursor - 1,
          filter,
          abortController.signal
        );
        setDataState((prev) => ({
          ...prev,
          servicePackages: result.data.content,
          totalElements: result.data.totalElements,
        }));
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        setDataState((prev) => ({ ...prev, loading: false }));
      }
    };

    if (canFetch) fetchData();

    return () => {
      abortController.abort();
    };
  }, [dataState.cursor, filter, canFetch]);

  useUpdateEffect(() => {
    if (dataState.cursor > 1) {
      setDataState((prev) => ({ ...prev, cursor: 1 }));
    }
  }, [filter]);

  //------------------METHODS----------------

  const handleModalCancel = () => {
    reset({
      servicePackageId: null,
      servicePackageName: "",
      termNumber: 0,
      servicePackageDurationDays: 0,
      price: 0,
      note: "",
    });
    setIsEditServicePackage(false);
    setExistsByServicePackage(false);
    isModalOpen.current = false;
  };

  const handleCreateModal = () => {
    reset({
      servicePackageId: null,
      servicePackageName: "",
      termNumber: 0,
      servicePackageDurationDays: 0,
      price: 0,
      note: "",
    });
    setIsEditServicePackage(false);
    isModalOpen.current = true;
  };

  //------------------RENDER------------------

  return (
    <>
      <Modal
        title={
          isEditServicePackage ? (
            <div style={{ textAlign: "center" }}>Uredi paket usluge</div>
          ) : (
            <div style={{ textAlign: "center" }}>Dodaj novi paket usluge</div>
          )
        }
        maskClosable={false}
        open={isModalOpen.current}
        footer={null}
        onCancel={handleModalCancel}
        width={isMobile ? 300 : 600}
        centered
      >
        <ServicePackageModalContent
          control={control}
          dataState={dataState}
          errors={errors}
          existsByServicePackage={existsByServicePackage}
          handleSubmit={handleSubmit}
          isEditServicePackage={isEditServicePackage}
          isModalOpen={isModalOpen}
          setDataState={setDataState}
        />
      </Modal>
      <div style={{ padding: "16px" }}>
        <HeaderButtonsComponent
          buttonTitle="Dodaj paket usluge"
          onButtonAction={handleCreateModal}
          onFilterAction={() => setShowFilters((prev) => !prev)}
        />
        {showFilters && (
          <FilterComponent showSearch={true} showPriceSlider={true} />
        )}
        <TableComponent
          dataState={dataState}
          isMobile={isMobile}
          isModalOpen={isModalOpen}
          reset={reset}
          setDataState={setDataState}
          setExistsByServicePackage={setExistsByServicePackage}
          setIsEditServicePackage={setIsEditServicePackage}
        />
      </div>
    </>
  );
};

export default ServicePackagePage;
