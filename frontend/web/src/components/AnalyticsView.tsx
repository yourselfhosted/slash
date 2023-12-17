import classNames from "classnames";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { shortcutServiceClient } from "@/grpcweb";
import { GetShortcutAnalyticsResponse } from "@/types/proto/api/v2/shortcut_service";
import Icon from "./Icon";

interface Props {
  shortcutName: string;
  className?: string;
}

const AnalyticsView: React.FC<Props> = (props: Props) => {
  const { shortcutName, className } = props;
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<GetShortcutAnalyticsResponse | null>(null);
  const [selectedDeviceTab, setSelectedDeviceTab] = useState<"os" | "browser">("browser");

  useEffect(() => {
    shortcutServiceClient.getShortcutAnalytics({ name: shortcutName }).then((response) => {
      setAnalytics(response);
    });
  }, []);

  return (
    <div className={classNames("w-full", className)}>
      {analytics ? (
        <>
          <div className="w-full">
            <p className="w-full h-8 px-2 dark:text-gray-500">{t("analytics.top-sources")}</p>
            <div className="w-full mt-1 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg dark:ring-zinc-800">
              <div className="w-full divide-y divide-gray-300 dark:divide-zinc-700">
                <div className="w-full flex flex-row justify-between items-center">
                  <span className="py-2 px-2 text-left font-semibold text-sm text-gray-500">{t("analytics.source")}</span>
                  <span className="py-2 pr-2 text-right font-semibold text-sm text-gray-500">{t("analytics.visitors")}</span>
                </div>
                <div className="w-full divide-y divide-gray-200 dark:divide-zinc-800">
                  {analytics.references.length === 0 && (
                    <div className="w-full flex flex-row justify-center items-center py-6 text-gray-400">
                      <Icon.PackageOpen className="w-6 h-auto" />
                      <p className="ml-2">No data found.</p>
                    </div>
                  )}
                  {analytics.references.map((reference) => (
                    <div key={reference.name} className="w-full flex flex-row justify-between items-center">
                      <span className="whitespace-nowrap py-2 px-2 text-sm truncate text-gray-900 dark:text-gray-500">
                        {reference.name ? (
                          <a className="hover:underline hover:text-blue-600" href={reference.name} target="_blank">
                            {reference.name}
                          </a>
                        ) : (
                          "Direct"
                        )}
                      </span>
                      <span className="whitespace-nowrap py-2 pr-2 text-sm text-gray-500 text-right shrink-0">{reference.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="w-full h-8 px-2 flex flex-row justify-between items-center">
              <span className="dark:text-gray-500">{t("analytics.devices")}</span>
              <div>
                <button
                  className={`whitespace-nowrap border-b-2 px-1 text-sm font-medium ${
                    selectedDeviceTab === "browser"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:hover:border-zinc-700"
                  }`}
                  onClick={() => setSelectedDeviceTab("browser")}
                >
                  {t("analytics.browser")}
                </button>
                <span className="text-gray-200 font-mono mx-1 dark:text-gray-500">/</span>
                <button
                  className={`whitespace-nowrap border-b-2 px-1 text-sm font-medium ${
                    selectedDeviceTab === "os"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:hover:border-zinc-700"
                  }`}
                  onClick={() => setSelectedDeviceTab("os")}
                >
                  OS
                </button>
              </div>
            </div>

            <div className="w-full mt-1 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg dark:ring-zinc-800">
              {selectedDeviceTab === "browser" ? (
                <div className="w-full divide-y divide-gray-300 dark:divide-zinc-700">
                  <div className="w-full flex flex-row justify-between items-center">
                    <span className="py-2 px-2 text-left text-sm font-semibold text-gray-500">{t("analytics.browsers")}</span>
                    <span className="py-2 pr-2 text-right text-sm font-semibold text-gray-500">{t("analytics.visitors")}</span>
                  </div>
                  <div className="w-full divide-y divide-gray-200 dark:divide-zinc-800">
                    {analytics.browsers.length === 0 && (
                      <div className="w-full flex flex-row justify-center items-center py-6 text-gray-400">
                        <Icon.PackageOpen className="w-6 h-auto" />
                        <p className="ml-2">No data found.</p>
                      </div>
                    )}
                    {analytics.browsers.map((reference) => (
                      <div key={reference.name} className="w-full flex flex-row justify-between items-center">
                        <span className="whitespace-nowrap py-2 px-2 text-sm text-gray-900 truncate dark:text-gray-500">
                          {reference.name || "Unknown"}
                        </span>
                        <span className="whitespace-nowrap py-2 pr-2 text-sm text-gray-500 text-right shrink-0">{reference.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full divide-y divide-gray-300">
                  <div className="w-full flex flex-row justify-between items-center">
                    <span className="py-2 px-2 text-left text-sm font-semibold text-gray-500">{t("analytics.operating-system")}</span>
                    <span className="py-2 pr-2 text-right text-sm font-semibold text-gray-500">{t("analytics.visitors")}</span>
                  </div>
                  <div className="w-full divide-y divide-gray-200">
                    {analytics.devices.length === 0 && (
                      <div className="w-full flex flex-row justify-center items-center py-6 text-gray-400">
                        <Icon.PackageOpen className="w-6 h-auto" />
                        <p className="ml-2">No data found.</p>
                      </div>
                    )}
                    {analytics.devices.map((device) => (
                      <div key={device.name} className="w-full flex flex-row justify-between items-center">
                        <span className="whitespace-nowrap py-2 px-2 text-sm text-gray-900 truncate">{device.name || "Unknown"}</span>
                        <span className="whitespace-nowrap py-2 pr-2 text-sm text-gray-500 text-right shrink-0">{device.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="py-12 w-full flex flex-row justify-center items-center opacity-80">
          <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
          {t("common.loading")}
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
