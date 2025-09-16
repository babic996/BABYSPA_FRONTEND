import { Result } from "antd";
import "./PageNotFound.scss";
import { useTranslation } from "react-i18next";

const PageNotFound = () => {
  const { t } = useTranslation();
  return (
    <Result
      status="404"
      title={<span className="error-title">404</span>}
      subTitle={
        <span className="error-description">
          {t("common.pageNotFoundTitle")}
        </span>
      }
    />
  );
};

export default PageNotFound;
