import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaChild,
  FaBoxes,
  FaFileAlt,
  FaListUl,
  FaUser,
  FaSignOutAlt,
  FaUserPlus,
  FaUserEdit,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  Layout as AntLayout,
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Menu,
  Modal,
  Row,
  Select,
} from "antd";
import "./Layout.scss";
import { useAuth } from "../../context/Auth/useAuth";
import useMediaQuery from "../../hooks/useMediaQuery";
import { errorResponse, ROLES } from "../../util/const";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { RegisterOrUpdateUserInterface } from "../../interfaces/RegisterOrUpdateUserInterface";
import { toastSuccessNotification } from "../../util/toastNotification";
import { yupResolver } from "@hookform/resolvers/yup";
import { getUserValidationSchema } from "../../validations/RegisterOrUpdateUserValidationSchema";
import { editUser, registerUser } from "../../services/UserService";
import { convertRegisterOrUpdateUserToRegister } from "../../mappers/UserMapper";
const { Sider, Content } = AntLayout;
const { Option } = Select;

const Layout = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser, userRoles, getUserInfo } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  // const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] =
  //   useState<boolean>(false);
  const [isEditUser, setIsEditUser] = useState<boolean>(false);
  const schema = getUserValidationSchema(isEditUser);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterOrUpdateUserInterface>({
    resolver: yupResolver(schema),
  });

  //------------------METHODS----------------

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleOpenUserModal = (isEditUser: boolean) => {
    reset({
      username: isEditUser ? getUserInfo()?.username.split("@")[0] : "",
      firstName: isEditUser ? getUserInfo()?.firstName : "",
      lastName: isEditUser ? getUserInfo()?.lastName : "",
      email: isEditUser ? getUserInfo()?.email : "",
    });
    setIsEditUser(isEditUser);
    setIsUserModalOpen(true);
  };

  // const handleOpenAssignRoleModal = () => {
  //   setIsAssignRoleModalOpen(true);
  // };

  const handleUserModalClose = () => {
    reset({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
    });
    setIsEditUser(false);
    setIsUserModalOpen(false);
  };

  useEffect(() => {
    setHasAccess(
      [ROLES.ADMIN, ROLES.SUPER_ADMIN].some((role) =>
        userRoles().includes(role)
      )
    );
  }, [userRoles]);

  const menuItems = [
    {
      key: "/",
      icon: <FaHome />,
      label: (
        <NavLink to="/" end>
          Pregled rezervacija
        </NavLink>
      ),
    },
    {
      key: "/baby",
      icon: <FaChild />,
      label: <NavLink to="/baby">Bebe</NavLink>,
    },
    {
      key: "/service-package",
      icon: <FaBoxes />,
      label: <NavLink to="/service-package">Paketi usluga</NavLink>,
    },
    {
      key: "/arrangement",
      icon: <FaListUl />,
      label: <NavLink to="/arrangement">Aranžmani</NavLink>,
    },
    {
      key: "/report",
      icon: <FaFileAlt />,
      label: <NavLink to="/report">Izvještaji</NavLink>,
    },
  ];

  const userItems = [
    {
      key: "user",
      icon: <FaUser />,
      label: getUserInfo()?.username,
      children: [
        {
          key: "logout",
          label: <a onClick={handleLogout}>Odjavi se</a>,
          icon: <FaSignOutAlt />,
        },
        {
          key: "edit-user",
          label: <a onClick={() => handleOpenUserModal(true)}>Uredi nalog</a>,
          icon: <FaUserEdit />,
        },
        hasAccess && {
          key: "register",
          label: (
            <a onClick={() => handleOpenUserModal(false)}>Kreiraj nalog</a>
          ),
          icon: <FaUserPlus />,
        },
        // hasAccess && {
        //   key: "assign-role",
        //   label: <a onClick={handleOpenAssignRoleModal}>Dodijeli uloge</a>,
        //   icon: <FaUserShield />,
        // },
      ].filter(Boolean),
    },
  ];

  const onSubmit: SubmitHandler<RegisterOrUpdateUserInterface> = async (
    data
  ) => {
    try {
      if (isEditUser) {
        await editUser(data);
        setIsUserModalOpen(false);
        toastSuccessNotification("Ažurirano!");
        handleLogout();
      } else {
        await registerUser(convertRegisterOrUpdateUserToRegister(data));
        setIsUserModalOpen(false);
        toastSuccessNotification("Sačuvano!");
      }
    } catch (e) {
      errorResponse(e);
    }
  };

  //------------------RENDER------------------

  return (
    <>
      <Modal
        title={isEditUser ? "Uredi nalog" : "Kreiraj nalog"}
        maskClosable={false}
        open={isUserModalOpen}
        footer={null}
        onCancel={handleUserModalClose}
        width={isMobile ? 300 : 600}
        centered
      >
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
          <Form.Item
            label="Ime"
            validateStatus={errors.firstName ? "error" : ""}
            help={errors.firstName?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label="Prezime"
            validateStatus={errors.lastName ? "error" : ""}
            help={errors.lastName?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Email"
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Username"
            validateStatus={errors.username ? "error" : ""}
            help={errors.username?.message}
            style={{ marginBottom: 8 }}
          >
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} />
              )}
            />
          </Form.Item>

          {isEditUser && (
            <>
              <Form.Item
                label="Stari password"
                validateStatus={errors.oldPassword ? "error" : ""}
                help={errors.oldPassword?.message}
                style={{ marginBottom: 8 }}
              >
                <Controller
                  name="oldPassword"
                  control={control}
                  render={({ field }) => (
                    <Input.Password {...field} value={field.value ?? ""} />
                  )}
                />
              </Form.Item>
              <Form.Item
                label="Novi password"
                validateStatus={errors.newPassword ? "error" : ""}
                help={errors.newPassword?.message}
                style={{ marginBottom: 8 }}
              >
                <Controller
                  name="newPassword"
                  control={control}
                  render={({ field }) => (
                    <Input.Password {...field} value={field.value ?? ""} />
                  )}
                />
              </Form.Item>
            </>
          )}

          {!isEditUser && (
            <>
              <Form.Item
                label="Password"
                validateStatus={errors.password ? "error" : ""}
                help={errors.password?.message}
                style={{ marginBottom: 8 }}
              >
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input.Password {...field} value={field.value ?? ""} />
                  )}
                />
              </Form.Item>
              <Form.Item
                label="Ponovi password"
                validateStatus={errors.repeatPassword ? "error" : ""}
                help={errors.repeatPassword?.message}
                style={{ marginBottom: 8 }}
              >
                <Controller
                  name="repeatPassword"
                  control={control}
                  render={({ field }) => (
                    <Input.Password {...field} value={field.value ?? ""} />
                  )}
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            style={{ textAlign: "center", marginBottom: 8 }}
            wrapperCol={{ span: 24 }}
          >
            <Button type="primary" htmlType="submit">
              Sačuvaj
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
      // title="Dodijeli uloge"
      // maskClosable={false}
      // open={isAssignRoleModalOpen}
      // footer={null}
      // // onCancel={handleUserModalClose}
      // width={isMobile ? 300 : 600}
      // centered
      >
        <div style={{ padding: "20px" }}>
          {/* Select User */}
          <Select
            // value={selectedUser}
            // onChange={handleUserChange}
            placeholder="Select a user"
            style={{ width: "100%", marginBottom: "20px" }}
          >
            {[{ id: 1, name: "aco" }].map((user) => (
              <Option key={user.id} value={user.id}>
                {user.name}
              </Option>
            ))}
          </Select>

          {/* Display roles if a user is selected */}

          <div>
            <h3>Assign Roles:</h3>
            <Checkbox.Group
            // value={selectedRoles}
            // onChange={handleRoleChange}
            >
              <Row gutter={[16, 16]}>
                {["admin", "user"].map((role, index) => (
                  <Col span={12} key={index}>
                    <Checkbox value={role}>{role}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </div>
        </div>
      </Modal>
      <AntLayout>
        <Sider
          collapsible={isMobile ? false : true}
          collapsed={isMobile ? true : collapsed}
          onCollapse={toggleSidebar}
          width={220}
          collapsedWidth={40}
        >
          <div
            style={{ paddingTop: 15, paddingBottom: 15, textAlign: "center" }}
          >
            <img
              src="/logo.jpg"
              alt="Logo"
              style={{
                width: collapsed || isMobile ? "20px" : "100px",
                borderRadius: "50%",
              }}
            />
            {!collapsed && !isMobile && (
              <h1 style={{ color: "white" }}>Baby spa Sunshine</h1>
            )}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
          />

          <Menu
            style={{
              position: "absolute",
              bottom: isMobile ? 0 : 48,
              width: "100%",
            }}
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={userItems}
          />
        </Sider>
        <AntLayout
          style={{
            marginLeft: isMobile || collapsed ? 40 : 220,
            transition: "margin-left 0.3s ease",
          }}
        >
          <Content className="content">
            <Outlet />
          </Content>
        </AntLayout>
      </AntLayout>
    </>
  );
};

export default Layout;
