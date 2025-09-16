import { Form, Input, Button, Card, Row, Col, FloatButton } from "antd";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import "./LoginComponent.scss";
import { LoginInterface } from "../../interfaces/LoginInterface";
import { loginUser } from "../../services/UserService";
import { useAuth } from "../../context/Auth/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { getLoginValidationSchema } from "../../validations/LoginValidationSchema";
import { toastErrorNotification } from "../../util/toastNotification";
import { handleApiError } from "../../util/const";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { FaGlobe } from "react-icons/fa";

const LoginComponent = () => {
  const { t } = useTranslation();
  const schema = getLoginValidationSchema(t);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginInterface>({
    resolver: yupResolver(schema),
  });
  const { tokenExists, isTokenExpired } = useAuth();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit: SubmitHandler<LoginInterface> = async (data) => {
    try {
      const result = await loginUser(data);
      login(result.data.data.jwt);
      navigate("/");
    } catch (e) {
      toastErrorNotification(handleApiError(e));
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    if (tokenExists() && !isTokenExpired()) {
      navigate("/");
    }
  }, [tokenExists(), isTokenExpired]);

  if (tokenExists() && !isTokenExpired()) {
    return null;
  }

  return (
    <>
      <Row justify="center" align="middle" className="main-container">
        <Col xs={24} sm={16} md={12} lg={8} xl={6}>
          <Card
            title={t("common.login")}
            bordered={false}
            style={{ padding: "20px" }}
          >
            <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
              <Form.Item
                label={t("modal.username")}
                validateStatus={errors.username ? "error" : ""}
                help={errors.username?.message}
              >
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder={t("modal.username")} />
                  )}
                />
              </Form.Item>

              <Form.Item
                label={t("modal.password")}
                validateStatus={errors.password ? "error" : ""}
                help={errors.password?.message}
              >
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      placeholder={t("modal.password")}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  {t("button.login")}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
      <FloatButton.Group
        trigger="click"
        icon={<FaGlobe color="#1677FF" />}
        style={{ right: 24, bottom: 8 }}
      >
        <FloatButton description="EN" onClick={() => changeLanguage("en")} />
        <FloatButton description="BHS" onClick={() => changeLanguage("bhs")} />
      </FloatButton.Group>
    </>
  );
};

export default LoginComponent;
