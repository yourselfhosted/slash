import { Button, Divider, Link, Textarea } from "@mui/joy";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Icon from "@/components/Icon";
import SubscriptionFAQ from "@/components/SubscriptionFAQ";
import { subscriptionServiceClient } from "@/grpcweb";
import { stringifyPlanType } from "@/stores/v1/subscription";
import useWorkspaceStore from "@/stores/v1/workspace";
import { PlanType } from "@/types/proto/api/v2/subscription_service";
import useUserStore from "../stores/v1/user";

const SubscriptionSetting: React.FC = () => {
  const workspaceStore = useWorkspaceStore();
  const currentUser = useUserStore().getCurrentUser();
  const [licenseKey, setLicenseKey] = useState<string>("");
  const isAdmin = currentUser.role === "ADMIN";
  const profile = workspaceStore.profile;

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = "/";
    }
  }, []);

  if (!isAdmin) {
    return null;
  }

  const handleUpdateLicenseKey = async () => {
    try {
      const { subscription } = await subscriptionServiceClient.updateSubscription({
        licenseKey,
      });
      if (subscription) {
        toast.success(`Welcome to Slash-${stringifyPlanType(subscription.plan)}🎉`);
      }
    } catch (error: any) {
      toast.error(error.details);
    }
    setLicenseKey("");
    await workspaceStore.fetchWorkspaceProfile();
  };

  return (
    <div className="mx-auto max-w-6xl w-full px-3 md:px-12 pt-8 pb-24 flex flex-col justify-start items-start gap-y-12">
      <div className="w-full">
        <p className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-500">Subscription</p>
        <div className="mt-2">
          <span className="text-gray-500 mr-2">Current plan:</span>
          <span className="text-2xl mr-4 dark:text-gray-400">{stringifyPlanType(profile.plan)}</span>
        </div>
        <Textarea
          className="w-full mt-2"
          minRows={2}
          maxRows={2}
          placeholder="Enter your license key here - write only"
          value={licenseKey}
          onChange={(event) => setLicenseKey(event.target.value)}
        />
        <div className="w-full flex justify-between items-center mt-4">
          <div>
            {profile.plan === PlanType.FREE && (
              <Link href="https://yourselfhosted.lemonsqueezy.com/checkout?cart=df958121-81ad-4815-8b28-3f2d8e9c8e51" target="_blank">
                Buy a license key
                <Icon.ExternalLink className="w-4 h-auto ml-1" />
              </Link>
            )}
          </div>
          <Button disabled={licenseKey === ""} onClick={handleUpdateLicenseKey}>
            Upload license
          </Button>
        </div>
      </div>
      <Divider />
      <section className="w-full pb-8 dark:bg-zinc-900 flex items-center justify-center">
        <div className="w-full px-6">
          <div className="w-full grid grid-cols-1 gap-12 mt-8 md:grid-cols-3">
            <div className="flex flex-col p-6 bg-white dark:bg-zinc-800 shadow-lg rounded-lg justify-between border border-gray-300 dark:border-zinc-700">
              <div>
                <h3 className="text-2xl font-bold text-center dark:text-gray-300">Free</h3>
                <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
                  <span className="text-4xl font-bold">$0</span>/ month
                </div>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Unlimited shortcuts
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Basic analytics
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Browser extension
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Full API access
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.AlertCircle className="w-5 h-auto text-gray-400 mr-1 shrink-0" />
                    Up to 5 members
                  </li>
                </ul>
              </div>
            </div>
            <div className="relative flex flex-col p-6 bg-white dark:bg-zinc-800 shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-purple-500">
              <div className="px-3 py-1 text-sm text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full inline-block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                Popular
              </div>
              <div>
                <h3 className="text-2xl font-bold text-center dark:text-gray-300">Pro</h3>
                <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
                  <span className="text-4xl font-bold">$4</span>/ month
                </div>
                <p className="mt-2 font-medium dark:text-gray-300">Everything in Free, and</p>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Unlimited members
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Custom styles
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.CheckCircle2 className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    High-priority in roadmap
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <Link
                  className="w-full"
                  underline="none"
                  href="https://yourselfhosted.lemonsqueezy.com/checkout?cart=df958121-81ad-4815-8b28-3f2d8e9c8e51"
                  target="_blank"
                >
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 shadow hover:opacity-80">Get Started</Button>
                </Link>
              </div>
            </div>
            <div className="flex flex-col p-6 bg-white dark:bg-zinc-800 shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300 dark:border-zinc-700">
              <div>
                <span className="block text-2xl text-center dark:text-gray-200 opacity-80">More</span>
                <div className="mt-4 text-center text-zinc-800 dark:text-zinc-400">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <p className="mt-2 font-medium dark:text-gray-300">Everything in Pro, and</p>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.Smile className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Custom branding
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.Shield className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Single Sign-On(SSO)
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.HeartHandshake className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    Dedicated support
                  </li>
                  <li className="flex items-center dark:text-gray-300">
                    <Icon.Sparkles className="w-5 h-auto text-green-600 mr-1 shrink-0" />
                    More Coming Soon
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <Link className="w-full" underline="none" href="mailto:stevenlgtm@gmail.com" target="_blank">
                  <Button className="w-full">Contact us</Button>
                </Link>
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
