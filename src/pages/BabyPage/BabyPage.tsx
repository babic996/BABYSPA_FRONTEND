import { useForm } from "react-hook-form";
import { Modal } from "antd";
import "./BabyPage.scss";
import { BabyInterface, DataStateBaby } from "../../interfaces/BabyInterface";
import { useEffect, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { getBabyValidationSchema } from "../../validations/BabyValidationSchema";
import { getBabies } from "../../services/BabyService";
import { toastErrorNotification } from "../../util/toastNotification";
import FilterComponent from "../../components/FilterComponent/FilterComponent";
import { useFilter } from "../../context/Filter/useFilter";
import HeaderButtonsComponent from "../../components/HeaderButtonsComponent/HeaderButtonsComponent";
import useMediaQuery from "../../hooks/useMediaQuery";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import BabyModalContent from "../../components/BabyModalContent/BabyModalContent";
import TableComponent from "./TableComponent";
import { handleApiError } from "../../util/const";

const BabyPage = () => {
  const isModalOpen = useRef<boolean>(false);
  const [dataState, setDataState] = useState<DataStateBaby>({
    cursor: 1,
    babies: [] as BabyInterface[],
    totalElements: undefined as number | undefined,
    loading: true,
  });
  const [isEditBaby, setIsEditBaby] = useState<boolean>(false);
  const schema = getBabyValidationSchema(isEditBaby);
  const { filter, showFilters, setShowFilters, onResetFilter } = useFilter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BabyInterface>({
    resolver: yupResolver(schema),
  });

  //------------------LIFECYCLE------------------

  useEffect(() => {
    onResetFilter();
  }, []);

  useUpdateEffect(() => {
    if (!filter) return;

    const fetchData = async () => {
      try {
        setDataState((prev) => ({ ...prev, loading: true }));
        const result = await getBabies(dataState.cursor - 1, filter);
        setDataState((prev) => ({
          ...prev,
          babies: result.data.content,
          totalElements: result.data.totalElements,
        }));
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      } finally {
        setDataState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [dataState.cursor, filter]);

  useUpdateEffect(() => {
    if (dataState.cursor > 1) {
      setDataState((prev) => ({ ...prev, cursor: 1 }));
    }
  }, [filter]);

  //------------------METOHDS------------------

  const handleModalCancel = () => {
    reset({
      babyId: null,
      babyName: "",
      babySurname: "",
      birthDate: null,
      numberOfMonths: 0,
      phoneNumber: "",
      motherName: "",
      note: "",
    });
    setIsEditBaby(false);
    isModalOpen.current = false;
  };

  const handleCreateModal = () => {
    reset({
      babyId: null,
      babyName: "",
      babySurname: "",
      birthDate: null,
      numberOfMonths: 0,
      phoneNumber: "",
      motherName: "",
      note: "",
    });
    setIsEditBaby(false);
    isModalOpen.current = true;
  };

  //------------------RENDER------------------

  return (
    <>
      <Modal
        title={
          isEditBaby ? (
            <div style={{ textAlign: "center" }}>Uredi bebu</div>
          ) : (
            <div style={{ textAlign: "center" }}>Dodaj novu bebu</div>
          )
        }
        maskClosable={false}
        open={isModalOpen.current}
        footer={null}
        onCancel={handleModalCancel}
        width={isMobile ? 300 : 600}
        centered
      >
        <BabyModalContent
          control={control}
          dataState={dataState}
          errors={errors}
          handleSubmit={handleSubmit}
          isEditBaby={isEditBaby}
          isModalOpen={isModalOpen}
          setDataState={setDataState}
        />
      </Modal>
      <div style={{ padding: "16px" }}>
        <HeaderButtonsComponent
          buttonTitle="Dodaj bebu"
          onButtonAction={handleCreateModal}
          onFilterAction={() => setShowFilters((prev) => !prev)}
        />
        {showFilters && (
          <FilterComponent
            showSearch={true}
            showRangePicker={true}
            showTimeInRangePicker={false}
          />
        )}

        <TableComponent
          dataState={dataState}
          isMobile={isMobile}
          isModalOpen={isModalOpen}
          reset={reset}
          setDataState={setDataState}
          setIsEditBaby={setIsEditBaby}
        />
      </div>
    </>
  );
};

export default BabyPage;
