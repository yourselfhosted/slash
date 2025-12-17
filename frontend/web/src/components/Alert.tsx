import { createRoot } from "react-dom/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AlertStyle = "default" | "destructive";

interface Props {
  title: string;
  content: string;
  style?: AlertStyle;
  closeBtnText?: string;
  confirmBtnText?: string;
  onClose?: () => void;
  onConfirm?: () => void;
}

const defaultProps: Partial<Props> = {
  style: "default",
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
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCloseBtnClick}>
            {closeBtnText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmBtnClick}
            className={style === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {confirmBtnText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const showCommonDialog = (props: Props) => {
  const tempDiv = document.createElement("div");
  const dialog = createRoot(tempDiv);
  document.body.append(tempDiv);

  const destroy = () => {
    dialog.unmount();
    tempDiv.remove();
  };

  const onClose = () => {
    if (props.onClose) {
      props.onClose();
    }
    destroy();
  };

  const onConfirm = () => {
    if (props.onConfirm) {
      props.onConfirm();
    }
    destroy();
  };

  dialog.render(<Alert {...props} onClose={onClose} onConfirm={onConfirm} />);
};

export default Alert;
