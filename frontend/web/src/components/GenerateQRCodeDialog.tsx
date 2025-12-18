import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { absolutifyLink } from "@/helpers/utils";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import Icon from "./Icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  shortcut: Shortcut;
  onClose: () => void;
}

const GenerateQRCodeDialog: React.FC<Props> = (props: Props) => {
  const { shortcut, onClose } = props;
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shortcutLink = absolutifyLink(`/s/${shortcut.name}`);

  const handleCloseBtnClick = () => {
    onClose();
  };

  const handleDownloadQRCodeClick = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("Failed to get QR code canvas");
      return;
    }

    const link = document.createElement("a");
    link.download = `${shortcut.title || shortcut.name}-qrcode.png`;
    link.href = canvas.toDataURL();
    link.click();
    handleCloseBtnClick();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-64 sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex flex-row justify-between items-center">
            <span>QR Code</span>
            <Button variant="ghost" size="icon" onClick={handleCloseBtnClick}>
              <Icon.X className="w-5 h-auto" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div ref={containerRef} className="w-full flex flex-row justify-center items-center">
            <QRCodeCanvas value={shortcutLink} size={180} bgColor={"#ffffff"} fgColor={"#000000"} includeMargin={false} level={"L"} />
          </div>
          <div className="w-full flex flex-row justify-center items-center">
            <Button className="w-full" variant="secondary" onClick={handleDownloadQRCodeClick}>
              <Icon.Download className="w-4 h-auto mr-1" />
              {t("common.download")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateQRCodeDialog;
