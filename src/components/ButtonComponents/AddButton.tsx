import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import React from "react";

const AddButton = ({
  onButtonAction,
  buttonTitle,
  buttonStyle,
}: {
  onButtonAction: () => void;
  buttonTitle: string;
  buttonStyle?: React.CSSProperties;
}) => {
  return (
    <Button
      type="primary"
      onClick={onButtonAction}
      style={buttonStyle}
      icon={<PlusOutlined />}
    >
      {buttonTitle}
    </Button>
  );
};

export default AddButton;
