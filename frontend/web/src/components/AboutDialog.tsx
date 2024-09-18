import { Button, Link, Modal, ModalDialog } from "@mui/joy";
import { useTranslation } from "react-i18next";
import Icon from "./Icon";

interface Props {
  onClose: () => void;
}

const AboutDialog: React.FC<Props> = (props: Props) => {
  const { onClose } = props;
  const { t } = useTranslation();

  return (
    <Modal open={true}>
      <ModalDialog>
        <div className="w-full flex flex-row justify-between items-center">
          <span className="text-lg font-medium">{t("common.about")}</span>
          <Button variant="plain" onClick={onClose}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div className="max-w-full w-80 sm:w-96">
          <p>
            <span className="font-medium">Slash</span> is an open source, self-hosted platform for sharing and managing your most frequently
            used links.
          </p>
          <div className="mt-1">
            <span className="mr-2">Source code:</span>
            <Link variant="plain" href="https://github.com/yourselfhosted/slash" target="_blank">
              GitHub
            </Link>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default AboutDialog;
