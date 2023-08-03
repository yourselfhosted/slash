import { Button, Modal, ModalDialog } from "@mui/joy";
import AnalyticsView from "./AnalyticsView";
import Icon from "./Icon";

interface Props {
  shortcutId: ShortcutId;
  onClose: () => void;
}

const AnalyticsDialog: React.FC<Props> = (props: Props) => {
  const { shortcutId, onClose } = props;

  return (
    <Modal open={true}>
      <ModalDialog>
        <div className="w-full flex flex-row justify-between items-center">
          <span className="text-lg font-medium">Analytics</span>
          <Button variant="plain" onClick={onClose}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div className="max-w-full w-80 sm:w-96">
          <AnalyticsView className="grid grid-cols-1 gap-2" shortcutId={shortcutId} />
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default AnalyticsDialog;
