import classNames from "classnames";
import { useEffect, useState } from "react";
import * as api from "../helpers/api";
import Icon from "./Icon";

interface Props {
  shortcutId: ShortcutId;
  className?: string;
}

const AnalyticsView: React.FC<Props> = (props: Props) => {
  const { shortcutId, className } = props;
  const [analytics, setAnalytics] = useState<AnalysisData | null>(null);
  const [selectedDeviceTab, setSelectedDeviceTab] = useState<"os" | "browser">("browser");

  useEffect(() => {
    api.getShortcutAnalytics(shortcutId).then(({ data }) => {
      setAnalytics(data);
    });
  }, []);

  return (
    <div className={classNames("w-full", className)}>
      {analytics ? (
        <>
          <div className="w-full">
            <p className="w-full h-8 px-2">Top Sources</p>
            <div className="w-full mt-1 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <div className="w-full divide-y divide-gray-300">
                <div className="w-full flex flex-row justify-between items-center">
                  <span className="py-2 px-2 text-left font-semibold text-sm text-gray-500">Source</span>
                  <span className="py-2 pr-2 text-right font-semibold text-sm text-gray-500">Visitors</span>
                </div>
                <div className="w-full divide-y divide-gray-200">
                  {analytics.referenceData.map((reference) => (
                    <div key={reference.name} className="w-full flex flex-row justify-between items-center">
                      <span className="whitespace-nowrap py-2 px-2 text-sm truncate text-gray-900">
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
              <span>Devices</span>
              <div>
                <button
                  className={`whitespace-nowrap border-b-2 px-1 text-sm font-medium ${
                    selectedDeviceTab === "browser"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                  onClick={() => setSelectedDeviceTab("browser")}
                >
                  Browser
                </button>
                <span className="text-gray-200 font-mono mx-1">/</span>
                <button
                  className={`whitespace-nowrap border-b-2 px-1 text-sm font-medium ${
                    selectedDeviceTab === "os"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                  onClick={() => setSelectedDeviceTab("os")}
                >
                  OS
                </button>
              </div>
            </div>

            <div className="w-full mt-1 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              {selectedDeviceTab === "browser" ? (
                <div className="w-full divide-y divide-gray-300">
                  <div className="w-full flex flex-row justify-between items-center">
                    <span className="py-2 px-2 text-left text-sm font-semibold text-gray-500">Browsers</span>
                    <span className="py-2 pr-2 text-right text-sm font-semibold text-gray-500">Visitors</span>
                  </div>
                  <div className="w-full divide-y divide-gray-200">
                    {analytics.browserData.map((reference) => (
                      <div key={reference.name} className="w-full flex flex-row justify-between items-center">
                        <span className="whitespace-nowrap py-2 px-2 text-sm text-gray-900 truncate">{reference.name || "Unknown"}</span>
                        <span className="whitespace-nowrap py-2 pr-2 text-sm text-gray-500 text-right shrink-0">{reference.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full divide-y divide-gray-300">
                  <div className="w-full flex flex-row justify-between items-center">
                    <span className="py-2 px-2 text-left text-sm font-semibold text-gray-500">Operating system</span>
                    <span className="py-2 pr-2 text-right text-sm font-semibold text-gray-500">Visitors</span>
                  </div>
                  <div className="w-full divide-y divide-gray-200">
                    {analytics.deviceData.map((device) => (
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
          loading
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
