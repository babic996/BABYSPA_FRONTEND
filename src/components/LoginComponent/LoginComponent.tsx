import { Form, Input, Button, Card, Row, Col } from "antd";
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

const LoginComponent = () => {
  const schema = getLoginValidationSchema();
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

  useEffect(() => {
    if (tokenExists() && !isTokenExpired()) {
      navigate("/");
    }
  }, [tokenExists(), isTokenExpired]);

  if (tokenExists() && !isTokenExpired()) {
    return null;
  }

  return (
    <Row justify="center" align="middle" className="main-container">
      <Col xs={24} sm={16} md={12} lg={8} xl={6}>
        <Card title="Prijava" bordered={false} style={{ padding: "20px" }}>
          <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
            <Form.Item
              label="Username"
              validateStatus={errors.username ? "error" : ""}
              help={errors.username?.message}
            >
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Unesi username" />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              validateStatus={errors.password ? "error" : ""}
              help={errors.password?.message}
            >
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password {...field} placeholder="Unesi password" />
                )}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Prijavi se
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginComponent;
