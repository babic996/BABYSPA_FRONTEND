import { Result } from "antd";
import "./PageNotFound.scss";

const PageNotFound = () => {
  return (
    <Result
      status="404"
      title={<span className="error-title">404</span>}
      subTitle={
        <span className="error-description">
          Ups! Stranica koju tražiš ne postoji.
        </span>
      }
    />
  );
};

export default PageNotFound;
