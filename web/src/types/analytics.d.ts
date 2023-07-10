interface ReferenceInfo {
  name: string;
  count: number;
}

interface DeviceInfo {
  name: string;
  count: number;
}

interface BrowserInfo {
  name: string;
  count: number;
}

interface AnalysisData {
  referenceData: ReferenceInfo[];
  deviceData: DeviceInfo[];
  browserData: BrowserInfo[];
}
