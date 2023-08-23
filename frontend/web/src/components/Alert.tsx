import { Button, Modal, ModalDialog } from "@mui/joy";
import { createRoot } from "react-dom/client";
import Icon from "./Icon";

type AlertStyle = "primary" | "warning" | "danger";

interface Props {
  title: string;
  content: string;
  style?: AlertStyle;
  closeBtnText?: string;
  confirmBtnText?: string;
  onClose?: () => void;
  onConfirm?: () => void;
}

const defaultProps: Props = {
  title: "",
  content: "",
  style: "primary",
  closeBtnText: "Close",
  confirmBtnText: "Confirm",
  onClose: () => null,
  onConfirm: () => null,
};

const Alert: React.FC<Props> = (props: Props) => {
  const { title, content, closeBtnText, confirmBtnText, onClose, onConfirm, style } = {
    ...defaultProps,
    ...props,
  };

  const handleCloseBtnClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleConfirmBtnClick = async () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Modal open={true}>
      <ModalDialog>
        <div className="flex flex-row justify-between items-center w-80 mb-4">
          <span className="text-lg font-medium">{title}</span>
          <Button variant="plain" onClick={handleCloseBtnClick}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div className="w-80">
          <p className="content-text mb-4">{content}</p>
          <div className="w-full flex flex-row justify-end items-center space-x-2">
            <Button variant="plain" color="neutral" onClick={handleCloseBtnClick}>
              {closeBtnText}
            </Button>
            <Button color={style} onClick={handleConfirmBtnClick}>
              {confirmBtnText}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
};

export const showCommonDialog = (props: Props) => {
  const tempDiv = document.createElement("div");
  const dialog = createRoot(tempDiv);
  document.body.append(tempDiv);

  const destory = () => {
    dialog.unmount();
    tempDiv.remove();
  };

  const onClose = () => {
    if (props.onClose) {
      props.onClose();
    }
    destory();
  };

  const onConfirm = () => {
    if (props.onConfirm) {
      props.onConfirm();
    }
    destory();
  };

  dialog.render(<Alert {...props} onClose={onClose} onConfirm={onConfirm} />);
};
