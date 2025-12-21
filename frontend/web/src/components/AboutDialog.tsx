import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  onClose: () => void;
}

const AboutDialog: React.FC<Props> = (props: Props) => {
  const { onClose } = props;
  const { t } = useTranslation();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-80 sm:w-96">
        <DialogHeader>
          <DialogTitle>{t("common.about")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            <span className="font-medium">Slash</span> is an open source, self-hosted platform for sharing and managing your most frequently
            used links.
          </p>
          <div>
            <span className="mr-2">Source code:</span>
            <a
              className="text-primary hover:underline"
              href="https://github.com/yourselfhosted/slash"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AboutDialog;
