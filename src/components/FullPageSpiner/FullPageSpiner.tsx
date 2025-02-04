import { Spin } from "antd";
import "./FullPageSpiner.scss";

const FullPageSpiner = () => {
  return (
    <div className="full-page-spinner">
      <Spin size="large" />
    </div>
  );
};

export default FullPageSpiner;
