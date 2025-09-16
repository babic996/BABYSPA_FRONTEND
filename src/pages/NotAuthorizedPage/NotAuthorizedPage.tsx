import { Result } from "antd";
import { useTranslation } from "react-i18next";

const NotAuthorizedPage = () => {
  const { t } = useTranslation();
  return (
    <Result
      status="403"
      title={<span className="error-title">403</span>}
      subTitle={
        <span className="error-description">
          {t("common.notAuthPageTitle")}
        </span>
      }
    />
  );
};

export default NotAuthorizedPage;
