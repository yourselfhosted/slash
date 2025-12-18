import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { userServiceClient } from "@/grpcweb";
import useLoading from "@/hooks/useLoading";
import { useUserStore } from "@/stores";
import Icon from "./Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  onClose: () => void;
  onConfirm?: () => void;
}

const expirationOptions = [
  {
    label: "8 hours",
    value: 3600 * 8,
  },
  {
    label: "1 month",
    value: 3600 * 24 * 30,
  },
  {
    label: "Never",
    value: 0,
  },
];

interface State {
  description: string;
  expiration: number;
}

const CreateAccessTokenDialog: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm } = props;
  const { t } = useTranslation();
  const currentUser = useUserStore().getCurrentUser();
  const [state, setState] = useState({
    description: "",
    expiration: 3600 * 8,
  });
  const requestState = useLoading(false);

  const setPartialState = (partialState: Partial<State>) => {
    setState({
      ...state,
      ...partialState,
    });
  };

  const handleDescriptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      description: e.target.value,
    });
  };

  const handleExpirationChange = (value: string) => {
    setPartialState({
      expiration: Number(value),
    });
  };

  const handleSaveBtnClick = async () => {
    if (!state.description) {
      toast.error("Description is required");
      return;
    }

    try {
      await userServiceClient.createUserAccessToken({
        id: currentUser.id,
        description: state.description,
        expiresAt: state.expiration ? new Date(Date.now() + state.expiration * 1000) : undefined,
      });

      if (onConfirm) {
        onConfirm();
      }
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.details);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-80 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-row justify-between items-center">
            <span>Create Access Token</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon.X className="w-5 h-auto" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Some description"
              value={state.description}
              onChange={handleDescriptionInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label>
              Expiration <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={String(state.expiration)} onValueChange={handleExpirationChange}>
              <div className="flex flex-col space-y-2">
                {expirationOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(option.value)} id={`expiration-${option.value}`} />
                    <Label htmlFor={`expiration-${option.value}`} className="font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={requestState.isLoading} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button disabled={requestState.isLoading} onClick={handleSaveBtnClick}>
            {requestState.isLoading ? "Creating..." : t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccessTokenDialog;
