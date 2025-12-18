import classNames from "classnames";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { shortcutServiceClient } from "@/grpcweb";
import { GetShortcutAnalyticsResponse } from "@/types/proto/api/v1/shortcut_service";
import Icon from "./Icon";

interface Props {
  shortcutId: number;
  className?: string;
}

const AnalyticsView: React.FC<Props> = (props: Props) => {
  const { shortcutId, className } = props;
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<GetShortcutAnalyticsResponse | null>(null);
  const [selectedDeviceTab, setSelectedDeviceTab] = useState<"os" | "browser">("browser");

  useEffect(() => {
    shortcutServiceClient.getShortcutAnalytics({ id: shortcutId }).then((response) => {
      setAnalytics(response);
    });
  }, []);

  return (
    <div className={classNames("relative w-full", className)}>
      {analytics ? (
        <>
          <div className="w-full">
            <p className="w-full h-8 px-2 text-muted-foreground">{t("analytics.top-sources")}</p>
            <div className="w-full mt-1 overflow-hidden shadow ring-1 ring-border rounded-lg">
              <div className="w-full divide-y divide-border">
                <div className="w-full flex flex-row justify-between items-center">
                  <span className="py-2 px-2 text-left font-semibold text-sm text-muted-foreground">{t("analytics.source")}</span>
                  <span className="py-2 pr-2 text-right font-semibold text-sm text-muted-foreground">{t("analytics.visitors")}</span>
                </div>
                <div className="w-full divide-y divide-border">
                  {analytics.references.length === 0 && (
                    <div className="w-full flex flex-row justify-center items-center py-6 text-muted-foreground">
                      <Icon.PackageOpen className="w-6 h-auto" />
                      <p className="ml-2">No data found.</p>
                    </div>
                  )}
                  {analytics.references.map((reference) => (
                    <div key={reference.name} className="w-full flex flex-row justify-between items-center">
                      <span className="whitespace-nowrap py-2 px-2 text-sm truncate text-foreground">
                        {reference.name ? (
                          <a className="hover:underline hover:text-primary" href={reference.name} target="_blank">
                            {reference.name}
                          </a>
                        ) : (
                          "Direct"
                        )}
                      </span>
                      <span className="whitespace-nowrap py-2 pr-2 text-sm text-muted-foreground text-right shrink-0">
                        {reference.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="w-full h-8 px-2 flex flex-row justify-between items-center">
              <span className="text-muted-foreground">{t("analytics.devices")}</span>
              <div>
                <button
                  className={`whitespace-nowrap border-b-2 px-1 text-sm font-medium ${
                    selectedDeviceTab === "browser"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                  onClick={() => setSelectedDeviceTab("browser")}
                >
                  {t("analytics.browser")}
                </button>
                <span className="text-muted-foreground font-mono mx-1">/</span>
                <button
                  className={`whitespace-nowrap border-b-2 px-1 text-sm font-medium ${
                    selectedDeviceTab === "os"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                  onClick={() => setSelectedDeviceTab("os")}
                >
                  OS
                </button>
              </div>
            </div>

            <div className="w-full mt-1 overflow-hidden shadow ring-1 ring-border rounded-lg">
              {selectedDeviceTab === "browser" ? (
                <div className="w-full divide-y divide-border">
                  <div className="w-full flex flex-row justify-between items-center">
                    <span className="py-2 px-2 text-left text-sm font-semibold text-muted-foreground">{t("analytics.browsers")}</span>
                    <span className="py-2 pr-2 text-right text-sm font-semibold text-muted-foreground">{t("analytics.visitors")}</span>
                  </div>
                  <div className="w-full divide-y divide-border">
                    {analytics.browsers.length === 0 && (
                      <div className="w-full flex flex-row justify-center items-center py-6 text-muted-foreground">
                        <Icon.PackageOpen className="w-6 h-auto" />
                        <p className="ml-2">No data found.</p>
                      </div>
                    )}
                    {analytics.browsers.map((reference) => (
                      <div key={reference.name} className="w-full flex flex-row justify-between items-center">
                        <span className="whitespace-nowrap py-2 px-2 text-sm text-foreground truncate">{reference.name || "Unknown"}</span>
                        <span className="whitespace-nowrap py-2 pr-2 text-sm text-muted-foreground text-right shrink-0">
                          {reference.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full divide-y divide-border">
                  <div className="w-full flex flex-row justify-between items-center">
                    <span className="py-2 px-2 text-left text-sm font-semibold text-muted-foreground">
                      {t("analytics.operating-system")}
                    </span>
                    <span className="py-2 pr-2 text-right text-sm font-semibold text-muted-foreground">{t("analytics.visitors")}</span>
                  </div>
                  <div className="w-full divide-y divide-border">
                    {analytics.devices.length === 0 && (
                      <div className="w-full flex flex-row justify-center items-center py-6 text-muted-foreground">
                        <Icon.PackageOpen className="w-6 h-auto" />
                        <p className="ml-2">No data found.</p>
                      </div>
                    )}
                    {analytics.devices.map((device) => (
                      <div key={device.name} className="w-full flex flex-row justify-between items-center">
                        <span className="whitespace-nowrap py-2 px-2 text-sm text-foreground truncate">{device.name || "Unknown"}</span>
                        <span className="whitespace-nowrap py-2 pr-2 text-sm text-muted-foreground text-right shrink-0">
                          {device.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="absolute py-12 w-full flex flex-row justify-center items-center opacity-80">
          <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
          {t("common.loading")}
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
