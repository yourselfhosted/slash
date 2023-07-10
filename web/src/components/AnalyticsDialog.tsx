import { Button, Modal, ModalDialog } from "@mui/joy";
import { useEffect, useState } from "react";
import * as api from "../helpers/api";
import Icon from "./Icon";

interface Props {
  shortcutId: ShortcutId;
  onClose: () => void;
}

const AnalyticsDialog: React.FC<Props> = (props: Props) => {
  const { shortcutId, onClose } = props;
  const [analytics, setAnalytics] = useState<AnalysisData | null>(null);
  const [selectedDeviceTab, setSelectedDeviceTab] = useState<"os" | "browser">("os");

  useEffect(() => {
    api.getShortcutAnalytics(shortcutId).then(({ data }) => {
      setAnalytics(data);
    });
  }, []);

  return (
    <Modal open={true}>
      <ModalDialog>
        <div className="w-full flex flex-row justify-between items-center">
          <span className="text-lg font-medium">Analytics</span>
          <Button variant="plain" onClick={onClose}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div className="max-w-full w-80 sm:w-96">
          {analytics ? (
            <>
              <p className="w-full py-1 px-2">Top Sources</p>
              <div className="mt-1 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-1 px-2 text-left font-semibold text-sm text-gray-500">
                        Source
                      </th>
                      <th scope="col" className="py-1 pr-2 text-right font-semibold text-sm text-gray-500">
                        Visitors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analytics.referenceData.map((reference) => (
                      <tr key={reference.name}>
                        <td className="whitespace-nowrap py-2 px-2 text-sm text-gray-900">
                          {reference.name ? (
                            <a className="hover:underline hover:text-blue-600" href={reference.name} target="_blank">
                              {reference.name}
                            </a>
                          ) : (
                            "Direct"
                          )}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-2 text-sm text-gray-500 text-right">{reference.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="w-full mt-4 py-1 px-2 flex flex-row justify-between items-center">
                <span>Devices</span>
                <div>
                  <button className={`text-sm ${selectedDeviceTab === "os" && "text-blue-600"}`} onClick={() => setSelectedDeviceTab("os")}>
                    OS
                  </button>
                  <span className="text-gray-200 font-mono mx-1">/</span>
                  <button
                    className={`text-sm ${selectedDeviceTab === "browser" && "text-blue-600"}`}
                    onClick={() => setSelectedDeviceTab("browser")}
                  >
                    Browser
                  </button>
                </div>
              </div>

              <div className="mt-1 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                {selectedDeviceTab === "os" ? (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-2 px-2 text-left text-sm font-semibold text-gray-500">
                          Operating system
                        </th>
                        <th scope="col" className="py-2 pr-2 text-right text-sm font-semibold text-gray-500">
                          Visitors
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.deviceData.map((reference) => (
                        <tr key={reference.name}>
                          <td className="whitespace-nowrap py-2 px-2 text-sm text-gray-900">{reference.name || "Unknown"}</td>
                          <td className="whitespace-nowrap py-2 pr-2 text-sm text-gray-500 text-right">{reference.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-2 px-2 text-left text-sm font-semibold text-gray-500">
                          Browsers
                        </th>
                        <th scope="col" className="py-2 pr-2 text-right text-sm font-semibold text-gray-500">
                          Visitors
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.browserData.map((reference) => (
                        <tr key={reference.name}>
                          <td className="whitespace-nowrap py-2 px-2 text-sm text-gray-900">{reference.name || "Unknown"}</td>
                          <td className="whitespace-nowrap py-2 pr-2 text-sm text-gray-500 text-right">{reference.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : null}
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default AnalyticsDialog;
