import { Button, Card, Checkbox, Col, Flex, Row, Select, Space } from "antd";
import { descriptionRole, handleApiError } from "../../util/const";
import {
  AssignRoleInterface,
  UserInfoInterface,
} from "../../interfaces/UserInterface";
import { RoleInterface } from "../../interfaces/RoleInterface";
import { toastErrorNotification } from "../../util/toastNotification";
import { assignRolesToUser } from "../../services/UserService";
import { useTranslation } from "react-i18next";

interface AssignRoleModalProps {
  selectedUser: UserInfoInterface | null;
  selectedRoles: number[];
  roles: RoleInterface[];
  setSelectedUser: React.Dispatch<
    React.SetStateAction<UserInfoInterface | null>
  >;
  setIsAssignRoleModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedRoles: React.Dispatch<React.SetStateAction<number[]>>;
  users: UserInfoInterface[];
}

const AssignRoleModalComponent: React.FC<AssignRoleModalProps> = ({
  roles,
  selectedRoles,
  selectedUser,
  setIsAssignRoleModalOpen,
  setSelectedRoles,
  setSelectedUser,
  users,
}) => {
  const { t } = useTranslation();
  const handleUserChange = (value: number) => {
    const selected = users.find((user) => user.userId === value) ?? null;
    setSelectedUser(selected);
    setSelectedRoles(selected?.roles?.map((role) => role.roleId) || []);
  };

  const handleAssignRoles = async () => {
    try {
      if (selectedUser) {
        const data: AssignRoleInterface = {
          roleIds: selectedRoles,
          userId: selectedUser.userId,
        };
        await assignRolesToUser(data);
        setIsAssignRoleModalOpen((prev) => !prev);
        setSelectedRoles([]);
        setSelectedUser(null);
      }
    } catch (e) {
      toastErrorNotification(handleApiError(e));
    }
  };
  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ display: "flex", padding: "20px" }}
    >
      <Select
        placeholder={t("modal.selectUser")}
        style={{ width: "100%" }}
        value={selectedUser?.userId}
        onChange={handleUserChange}
        allowClear
        options={users.map((user) => ({
          value: user.userId,
          label: user.username,
        }))}
      />
      {selectedUser && (
        <Card size="small" title={t("modal.assign_roles")}>
          <Checkbox.Group
            value={selectedRoles}
            onChange={setSelectedRoles}
            style={{ width: "100%" }}
          >
            <Row gutter={[16, 16]}>
              {roles
                ?.filter(
                  (role) =>
                    role.roleName !== "ROLE_ADMIN" &&
                    role.roleName !== "ROLE_SUPER_ADMIN"
                )
                .map((role) => (
                  <Col
                    key={role.roleId}
                    span={12}
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox value={role.roleId}>
                      {descriptionRole(role.roleName)}
                    </Checkbox>
                  </Col>
                ))}
            </Row>
          </Checkbox.Group>
        </Card>
      )}

      <Flex justify="center" gap="small">
        <Button type="primary" onClick={handleAssignRoles}>
          {t("button.save")}
        </Button>
      </Flex>
    </Space>
  );
};

export default AssignRoleModalComponent;
