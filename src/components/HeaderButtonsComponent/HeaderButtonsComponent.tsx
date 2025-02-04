import { Button } from "antd";
import AddButton from "../ButtonComponents/AddButton";
import { IoFilterOutline } from "react-icons/io5";

const HeaderButtonsComponent = ({
  onButtonAction,
  buttonTitle,
  onFilterAction,
}: {
  onButtonAction: () => void;
  onFilterAction: () => void;
  buttonTitle: string;
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 16,
        justifyContent: "space-between",
      }}
    >
      <AddButton buttonTitle={buttonTitle} onButtonAction={onButtonAction} />
      <Button
        type="primary"
        icon={<IoFilterOutline />}
        onClick={onFilterAction}
      >
        Filter
      </Button>
    </div>
  );
};

export default HeaderButtonsComponent;
