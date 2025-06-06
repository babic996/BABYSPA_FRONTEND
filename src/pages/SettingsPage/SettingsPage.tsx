import React from "react";
import { Tabs, Layout } from "antd";
import type { TabsProps } from "antd";
import useMediaQuery from "../../hooks/useMediaQuery";
import GiftCardComponent from "../../components/GiftCardComponent/GiftCardComponent";

const { Content } = Layout;

const SettingsPage: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const tabItems: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span style={{ fontSize: `${isMobile} 12px : 30px` }}>
          Poklon kartice
        </span>
      ),
      children: <GiftCardComponent />,
    },
  ];

  return (
    <Content>
      <Tabs defaultActiveKey="1" items={tabItems} style={{ padding: 16 }} />
    </Content>
  );
};

export default SettingsPage;
