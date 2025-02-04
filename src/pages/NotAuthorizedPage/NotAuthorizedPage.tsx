import { Result } from "antd";

const NotAuthorizedPage = () => {
  return (
    <Result
      status="403"
      title={<span className="error-title">403</span>}
      subTitle={
        <span className="error-description">
          Niste autorizovani za pristup ovoj stranici.
        </span>
      }
    />
  );
};

export default NotAuthorizedPage;
