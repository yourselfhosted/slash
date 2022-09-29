import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { createRoot } from "react-dom/client";
import Icon from "./Icon";

type DialogStyle = "info" | "warning";

interface Props {
  title: string;
  content: string;
  style?: DialogStyle;
  closeBtnText?: string;
  confirmBtnText?: string;
  onClose?: () => void;
  onConfirm?: () => void;
}

const defaultProps = {
  title: "",
  content: "",
  style: "info",
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
    onClose();
  };

  const handleConfirmBtnClick = async () => {
    onConfirm();
  };

  return (
    <Dialog open={true}>
      <DialogTitle className="flex flex-row justify-between items-center w-80">
        <p className="text-base">{title}</p>
        <button className="rounded p-1 hover:bg-gray-100" onClick={handleCloseBtnClick}>
          <Icon.X className="w-5 h-auto text-gray-600" />
        </button>
      </DialogTitle>
      <DialogContent className="w-80">
        <p className="content-text mb-4">{content}</p>
        <div className="w-full flex flex-row justify-end items-center">
          <button className="rounded px-3 py-2 mr-2 hover:opacity-80" onClick={handleCloseBtnClick}>
            {closeBtnText}
          </button>
          <button
            className={`rounded px-3 py-2 shadow bg-green-600 text-white hover:opacity-80 ${
              style === "warning" ? "border-red-600 text-red-600 bg-red-100" : ""
            }`}
            onClick={handleConfirmBtnClick}
          >
            {confirmBtnText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
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
