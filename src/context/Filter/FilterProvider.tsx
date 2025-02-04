import React, { createContext, useState, ReactNode } from "react";
import { FilterInterface } from "../../interfaces/FilterInterface";
import { groupDataReportType } from "../../util/const";

interface FilterContextType {
  filter: FilterInterface;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  setFilter: React.Dispatch<React.SetStateAction<FilterInterface>>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  onResetFilter: () => void;
}

export const FilterContext = createContext<FilterContextType | undefined>(
  undefined
);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [filter, setFilter] = useState<FilterInterface>({});
  const [searchText, setSearchText] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const onResetFilter = () => {
    setSearchText("");
    setFilter({
      arrangementId: null,
      babyId: null,
      date: null,
      endPrice: null,
      startPrice: null,
      startRangeDate: null,
      endRangeDate: null,
      groupDataType: groupDataReportType.find((x) => (x.value = "day"))?.value,
      paymentTypeId: null,
      remainingTerm: null,
      servicePackageId: null,
      searchText: "",
      statusId: null,
    });
  };

  return (
    <FilterContext.Provider
      value={{
        filter,
        setFilter,
        searchText,
        setSearchText,
        onResetFilter,
        showFilters,
        setShowFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
