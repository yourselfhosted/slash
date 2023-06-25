import { Button, Link, Modal, ModalDialog } from "@mui/joy";
import Icon from "./Icon";

interface Props {
  onClose: () => void;
}

const AboutDialog: React.FC<Props> = (props: Props) => {
  const { onClose } = props;

  return (
    <Modal open={true}>
      <ModalDialog>
        <div className="w-full flex flex-row justify-between items-center">
          <span className="text-lg font-medium">About</span>
          <Button variant="plain" onClick={onClose}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div className="max-w-full w-80 sm:w-96">
          <p>
            <span className="font-medium">Shortify</span> is a free and open source project. It is a simple bookmarking tool that allows you
            to save your favorite links and access them from anywhere.
          </p>
          <div className="mt-1">
            <span className="mr-2">See more in:</span>
            <Link variant="plain" href="https://github.com/boojack/shortify">
              GitHub
            </Link>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default AboutDialog;
