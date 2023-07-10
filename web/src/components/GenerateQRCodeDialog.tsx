import { Button, Modal, ModalDialog } from "@mui/joy";
import { useRef } from "react";
import { toast } from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import { absolutifyLink } from "../helpers/utils";
import Icon from "./Icon";

interface Props {
  shortcut: Shortcut;
  onClose: () => void;
}

const GenerateQRCodeDialog: React.FC<Props> = (props: Props) => {
  const { shortcut, onClose } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shortifyLink = absolutifyLink(`/s/${shortcut.name}`);

  const handleCloseBtnClick = () => {
    onClose();
  };

  const handleDownloadQRCodeClick = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("Failed to get qr code canvas");
      return;
    }

    const link = document.createElement("a");
    link.download = "filename.png";
    link.href = canvas.toDataURL();
    link.click();
    handleCloseBtnClick();
  };

  return (
    <Modal open={true}>
      <ModalDialog>
        <div className="flex flex-row justify-between items-center w-64 mb-4">
          <span className="text-lg font-medium">Download QR Code</span>
          <Button variant="plain" onClick={handleCloseBtnClick}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div>
          <div ref={containerRef} className="w-full flex flex-row justify-center items-center mt-2 mb-6">
            <QRCodeCanvas value={shortifyLink} size={128} bgColor={"#ffffff"} fgColor={"#000000"} includeMargin={false} level={"L"} />
          </div>
          <div className="w-full flex flex-row justify-center items-center px-4">
            <Button className="w-full" color="neutral" onClick={handleDownloadQRCodeClick}>
              <Icon.Download className="w-4 h-auto mr-1" />
              Download
            </Button>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default GenerateQRCodeDialog;
