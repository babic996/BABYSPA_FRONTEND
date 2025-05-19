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
  FaUserShield,
  FaCog,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { Layout as AntLayout, Menu, Modal } from "antd";
import "./Layout.scss";
import { useAuth } from "../../context/Auth/useAuth";
import useMediaQuery from "../../hooks/useMediaQuery";
import { handleApiError, ROLES } from "../../util/const";
import { useForm } from "react-hook-form";
import { RegisterOrUpdateUserInterface } from "../../interfaces/RegisterOrUpdateUserInterface";
import { toastErrorNotification } from "../../util/toastNotification";
import { yupResolver } from "@hookform/resolvers/yup";
import { getUserValidationSchema } from "../../validations/RegisterOrUpdateUserValidationSchema";
import { getUsersInfo } from "../../services/UserService";
import { RoleInterface } from "../../interfaces/RoleInterface";
import { getRoles } from "../../services/RoleService";
import { UserInfoInterface } from "../../interfaces/UserInterface";
import AssignRoleModalComponent from "../AssignRoleModalComponent/AssignRoleModalComponent";
import CreateAndEditUserComponent from "../CreateAndEditUserComponent/CreateAndEditUserComponent";
const { Sider, Content } = AntLayout;

const Layout = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser, userRoles, getUserInfo } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] =
    useState<boolean>(false);
  const [isEditUser, setIsEditUser] = useState<boolean>(false);
  const schema = getUserValidationSchema(isEditUser);
  const [roles, setRoles] = useState<RoleInterface[]>([]);
  const [users, setUsers] = useState<UserInfoInterface[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfoInterface | null>(
    null
  );
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

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

  const handleAssignRoleModal = () => {
    setIsAssignRoleModalOpen((prev) => !prev);
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          getUsersInfo(["ROLE_ADMIN", "ROLE_SUPER_ADMIN"]),
          getRoles(),
        ]);

        setUsers(usersRes);
        setRoles(rolesRes);
      } catch (e) {
        toastErrorNotification(handleApiError(e));
      }
    };

    fetchData();
  }, [isAssignRoleModalOpen]);

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
        hasAccess && {
          key: "settings",
          label: <NavLink to="/settings">Podešavanja</NavLink>,
          icon: <FaCog />,
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
        hasAccess && {
          key: "assign-role",
          label: <a onClick={handleAssignRoleModal}>Dodijeli uloge</a>,
          icon: <FaUserShield />,
        },
      ].filter(Boolean),
    },
  ];

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
        <CreateAndEditUserComponent
          handleLogout={handleLogout}
          isEditUser={isEditUser}
          setIsUserModalOpen={setIsUserModalOpen}
          control={control}
          handleSubmit={handleSubmit}
          errors={errors}
        />
      </Modal>

      <Modal
        title="Dodijeli uloge"
        maskClosable={false}
        open={isAssignRoleModalOpen}
        footer={null}
        onCancel={handleAssignRoleModal}
        width={isMobile ? 300 : 600}
        centered
      >
        <AssignRoleModalComponent
          roles={roles}
          selectedRoles={selectedRoles}
          selectedUser={selectedUser}
          setIsAssignRoleModalOpen={setIsAssignRoleModalOpen}
          setSelectedRoles={setSelectedRoles}
          setSelectedUser={setSelectedUser}
          users={users}
        />
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
