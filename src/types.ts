export interface SplunkWorkflow {
  sf_id: string;
  sf_workflow: string;
  sf_error: string;
  sf_metric: string;
}

export interface SplunkMetric {
  timestamp: number;
  value: number;
}

export interface CloudFrontMetricsEntry {
  Id: string;
  Label: string;
  Timestamps: string[];
  Values: number[];
  StatusCode: string;
}

export interface CloudFrontMetricsData {
  MetricDataResults: CloudFrontMetricsEntry[];
  Messages: string[];
}

export interface DataState {
  loadBalancerData: LoadBalancerEntry[] | null;
  performanceData: PerformanceMetricsEntry[] | null;
  slowQueriesData: SlowQueryEntry[] | null;
  errorSummaryData: ErrorSummaryEntry[] | null;
  loadRunnerData: LoadRunnerEntry[] | null;
  cfStatsData: CloudFrontStatsEntry[] | null;
  cfObjectsData: CloudFrontObjectEntry[] | null;
  cfMetricsData: CloudFrontMetricsData | null;
  patternsData: PatternEntry[] | null;
  awsMetricsData: AWSMetricsData | null;
  fileNames: {
    loadBalancer?: string;
    performance?: string;
    slowQueries?: string;
    errorSummary?: string;
    loadRunner?: string;
    cfStats?: string;
    cfObjects?: string;
    cfMetrics?: string;
    splunkWorkflows?: string;
    splunkMetrics?: string;
    patterns?: string;
    awsMetrics?: string;
  };
}

export interface SplunkDataState {
  workflows: SplunkWorkflow[] | null;
  metrics: Record<string, SplunkMetric[]> | null;
  fileNames?: {
    splunkWorkflows?: string;
    splunkMetrics?: string;
  };
}

export interface AWSMetricsData {
  MetricDataResults: AWSMetricResult[];
  Messages: string[];
  Queries?: AWSMetricQuery[];
}

export interface AWSMetricResult {
  Id: string;
  Label: string;
  Timestamps: string[];
  Values: number[];
  StatusCode: string;
}

export interface AWSMetricQuery {
  Id: string;
  MetricStat: {
    Metric: {
      Namespace: string;
      MetricName: string;
      Dimensions: {
        Name: string;
        Value: string;
      }[];
    };
    Period: number;
    Stat: string;
  };
  Label: string;
  ReturnData: boolean;
}

export interface PatternEntry {
  "@visualization": string;
  "@ratio": string;
  "@relatedPattern": string;
  "@PatternId": string;
  "@regexString": string;
  "@sampleCount": string;
  "@tokens": string;
  "@logSamples": string;
  "@pattern": string;
  "@severityLabel": string;
}

export interface Token {
  dynamicTokenPosition: number;
  tokenType: string;
  tokenString: string;
  isNumeric: boolean;
  isErrorCode: boolean;
  enumerations: Record<string, number>;
  inferredTokenName?: string;
}

export interface SeriesConfigs {
  [key: string]: {
    visible: boolean;
    color: {
      light: string;
      dark: string;
    };
    label: string;
  };
}

export type DataFormat = 'loadbalancer' | 'performance' | 'slowqueries' | 'errorsummary' | 'loadrunner' | 'cfstats' | 'cfobjects' | 'cfmetrics' | 'splunk-workflows' | 'splunk-metrics' | 'patterns' | 'aws-metrics';

export type TabType = 'summary' | 'stats' | 'slow' | 'errors' | 'loadrunner' | 'cfstats' | 'cfobjects' | 'cfmetrics' | 'patterns' | 'splunk' | 'aws-metrics' | null;

export interface LoadBalancerEntry {
  normalized_url: string;
  elb_status_code: string;
  request_verb: string;
  processing_time_bucket: string;
  count: number;
  total_requests: number;
  percentage: number;
}

export interface PerformanceMetricsEntry {
  base_url: string;
  request_verb: string;
  min_rt: number;
  max_rt: number;
  avg_rt: number;
  P25: number;
  P50: number;
  P60: number;
  P75: number;
  P90: number;
  P95: number;
  total: number;
  requests: number;
}

export interface SlowQueryEntry {
  time: string;
  processing_time: number;
  request_url: string;
  pid: string;
  elb_status_code: string;
}

export interface ErrorSummaryEntry {
  count: number;
  message: string;
}

export interface LoadRunnerEntry {
  clock_time: string;
  metric: string;
  transaction?: string;
  val: string;
  time_stamp: number;
}

export interface CloudFrontStatsEntry {
  DistributionID: string;
  FriendlyName: string;
  ViewerLocation: string;
  TimeBucket: string;
  RequestCount: number;
  HitCount: number;
  MissCount: number;
  ErrorCount: number;
  IncompleteDownloadCount: number;
  Http2xx: number;
  Http3xx: number;
  Http4xx: number;
  Http5xx: number;
  TotalBytes: number;
  BytesFromMisses: number;
  StartDateUTC?: string;
  EndDateUTC?: string;
}

export interface CloudFrontObjectEntry {
  Object: string;
  RequestCount: number;
  HitCount: number;
  MissCount: number;
  HitCountPct: string;
  BytesFromMisses: number;
  TotalBytes: number;
  Http2xx: number;
  Http3xx: number;
  Http4xx: number;
  Http5xx: number;
  StartDateUTC: string;
  EndDateUTC: string;
}

export interface DependentFileState {
  awsMetrics: {
    query?: {
      data: AWSMetricQuery[];
      fileName: string;
    };
    result?: {
      data: AWSMetricsData;
      fileName: string;
    };
  };
  splunk: {
    workflows?: {
      data: SplunkWorkflow[];
      fileName: string;
    };
    metrics?: {
      data: Record<string, SplunkMetric[]>;
      fileName: string;
    };
  };
}