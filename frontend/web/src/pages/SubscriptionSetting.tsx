import { useState } from "react";
import { toast } from "sonner";
import { showCommonDialog } from "@/components/Alert";
import Icon from "@/components/Icon";
import SubscriptionFAQ from "@/components/SubscriptionFAQ";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { subscriptionServiceClient } from "@/grpcweb";
import { useUserStore, useWorkspaceStore } from "@/stores";
import { stringifyPlanType } from "@/stores/subscription";
import { PlanType } from "@/types/proto/api/v1/subscription_service";
import { Role } from "@/types/proto/api/v1/user_service";

const SubscriptionSetting: React.FC = () => {
  const workspaceStore = useWorkspaceStore();
  const currentUser = useUserStore().getCurrentUser();
  const [licenseKey, setLicenseKey] = useState<string>("");
  const isAdmin = currentUser.role === Role.ADMIN;
  const subscription = workspaceStore.getSubscription();

  const handleDeleteLicenseKey = async () => {
    if (!isAdmin) {
      toast.error("Only admin can upload license key");
      return;
    }

    showCommonDialog({
      title: "Reset licence key",
      content: `Are you sure to reset the license key? You cannot undo this action.`,
      style: "danger",
      onConfirm: async () => {
        try {
          await subscriptionServiceClient.deleteSubscription({});
          toast.success("License key has been reset");
        } catch (error: any) {
          toast.error(error.details);
        }
        await workspaceStore.fetchWorkspaceProfile();
      },
    });
  };

  const handleUpdateLicenseKey = async () => {
    if (!isAdmin) {
      toast.error("Only admin can upload license key");
      return;
    }

    try {
      const subscription = await subscriptionServiceClient.updateSubscription({
        licenseKey,
      });
      toast.success(`Welcome to Slash ${stringifyPlanType(subscription.plan)}🎉`);
    } catch (error: any) {
      toast.error(error.details);
    }
    setLicenseKey("");
    await workspaceStore.fetchWorkspaceProfile();
  };

  return (
    <div className="mx-auto max-w-8xl w-full px-4 sm:px-6 md:px-12 pt-8 pb-24 flex flex-col justify-start items-start gap-y-12">
      <div className="w-full">
        <p className="text-2xl shrink-0 font-semibold text-foreground">Subscription</p>
        <div className="mt-2">
          <span className="text-muted-foreground mr-2">Current plan:</span>
          <span className="text-2xl mr-4 text-foreground">{stringifyPlanType(subscription.plan)}</span>
        </div>
        <Textarea
          className="w-full mt-2"
          rows={2}
          placeholder="Enter your license key here - write only"
          value={licenseKey}
          onChange={(event) => setLicenseKey(event.target.value)}
        />
        <div className="w-full flex justify-between items-center mt-4">
          <div>
            {subscription.plan === PlanType.FREE && (
              <a
                href="https://yourselfhosted.gumroad.com/l/slash-pro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center"
              >
                Buy a license key
                <Icon.ExternalLink className="w-4 h-auto ml-1" />
              </a>
            )}
          </div>
          <div className="flex justify-end items-center gap-2">
            {subscription.plan !== PlanType.FREE && (
              <Button variant="outline" onClick={handleDeleteLicenseKey}>
                Reset
              </Button>
            )}
            <Button disabled={licenseKey === ""} onClick={handleUpdateLicenseKey}>
              Upload license
            </Button>
          </div>
        </div>
      </div>
      <Separator />
      <section className="w-full pb-8 bg-background flex items-center justify-center">
        <div className="w-full px-6">
          <div className="max-w-4xl mx-auto mb-12">
            <Alert className="inline-block mb-12">
              <AlertDescription>
                Slash is an open source, self-hosted platform for sharing and managing your most frequently used links. Easily create
                customizable, human-readable shortcuts to streamline your link management. Our source code is available and accessible on{" "}
                <a
                  href="https://github.com/yourselfhosted/slash"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub
                </a>{" "}
                so anyone can get it, inspect it and review it.
              </AlertDescription>
            </Alert>
          </div>
          <div className="w-full grid grid-cols-1 gap-6 lg:gap-12 mt-8 md:grid-cols-3 md:max-w-4xl mx-auto">
            <div className="flex flex-col p-6 bg-card shadow-lg rounded-lg justify-between border border-border">
              <div>
                <h3 className="text-2xl font-bold text-center text-card-foreground">Free</h3>
                <div className="mt-3 text-center text-muted-foreground">
                  <span className="text-4xl font-bold">$0</span>/ month
                </div>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center text-card-foreground">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Full API access
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Browser extension
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Basic analytics
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.AlertCircle className="w-5 h-auto text-muted-foreground mr-1 shrink-0" />
                    Up to 100 shortcuts
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.AlertCircle className="w-5 h-auto text-muted-foreground mr-1 shrink-0" />
                    Up to 5 collections
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.AlertCircle className="w-5 h-auto text-muted-foreground mr-1 shrink-0" />
                    Up to 5 members
                  </li>
                </ul>
              </div>
            </div>
            <div className="relative flex flex-col p-6 bg-card shadow-lg rounded-lg justify-between border border-purple-500">
              <div className="px-3 py-1 text-sm text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full inline-block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                Popular
              </div>
              <div>
                <h3 className="text-2xl font-bold text-center text-card-foreground">Pro</h3>
                <div className="mt-3 text-center text-muted-foreground">
                  <span className="text-4xl font-bold">$4</span>/ month
                </div>
                <p className="mt-3 font-medium text-card-foreground">Everything in Free, and</p>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center text-card-foreground">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Unlimited members
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Unlimited shortcuts
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Unlimited collections
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    High-priority in roadmap
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Email support
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <a className="w-full block" href="https://yourselfhosted.gumroad.com/l/slash-pro" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 shadow hover:opacity-80">Get Pro License</Button>
                </a>
              </div>
            </div>
            <div className="flex flex-col p-6 bg-card shadow-lg rounded-lg justify-between border border-border">
              <div>
                <span className="block text-2xl text-center text-card-foreground opacity-80">Team</span>
                <div className="mt-3 text-center text-muted-foreground">
                  <span className="mr-2">start with</span>
                  <span>
                    <span className="text-4xl font-bold">$10</span>/ month
                  </span>
                </div>
                <p className="mt-3 font-medium text-card-foreground">Everything in Pro, and</p>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center text-card-foreground">
                    <Icon.BadgeCheck className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Custom branding
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.BarChart3 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.Shield className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Single Sign-On(SSO)
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.Building2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Priority support
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <Icon.Sparkles className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    More coming soon
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <a
                  className="w-full block"
                  href="mailto:yourselfhosted@gmail.com?subject=Inquiry about Slash Team Plan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full">Contact us</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SubscriptionFAQ />
    </div>
  );
};

export default SubscriptionSetting;
