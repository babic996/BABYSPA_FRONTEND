import { Button } from "antd";
import React from "react";

const FilterButton = ({
  onButtonAction,
  buttonTitle,
  buttonStyle,
}: {
  onButtonAction: () => void;
  buttonTitle: string;
  buttonStyle?: React.CSSProperties;
}) => {
  return (
    <Button type="primary" onClick={onButtonAction} style={buttonStyle}>
      {buttonTitle}
    </Button>
  );
};

export default FilterButton;
