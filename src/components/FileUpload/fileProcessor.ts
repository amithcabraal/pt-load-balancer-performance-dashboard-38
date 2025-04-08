import Papa from 'papaparse';

export class FileProcessor {
  private onDataLoaded: any;
  private updateProcessingStatus: (fileName: string, status: string, progress?: number) => void;
  private removeProcessingStatus: (fileName: string) => void;
  private showError: (message: string, fileName: string) => void;
  private debugLog: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
  private awsMetricsState: any = {};

  constructor(
    onDataLoaded: any,
    updateProcessingStatus: (fileName: string, status: string, progress?: number) => void,
    removeProcessingStatus: (fileName: string) => void,
    showError: (message: string, fileName: string) => void,
    debugLog: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void
  ) {
    this.onDataLoaded = onDataLoaded;
    this.updateProcessingStatus = updateProcessingStatus;
    this.removeProcessingStatus = removeProcessingStatus;
    this.showError = showError;
    this.debugLog = debugLog;
  }

  private detectFileType(fileName: string, content: string): string | null {
    const lowerFileName = fileName.toLowerCase();
    this.debugLog(`🔍 Analyzing file name: ${fileName}`, 'info');
    this.updateProcessingStatus(fileName, '🔍 Detecting file type...', 25);

    // Check file naming conventions first
    if (lowerFileName.includes('summary-results') && lowerFileName.endsWith('.csv')) {
      this.debugLog('✓ Detected as Load Balancer Summary', 'success');
      this.updateProcessingStatus(fileName, '✓ Detected as Load Balancer Summary', 50);
      return 'loadbalancer';
    }
    if (lowerFileName.includes('stats-results') && lowerFileName.endsWith('.csv')) {
      this.debugLog('✓ Detected as Load Balancer Stats', 'success');
      this.updateProcessingStatus(fileName, '✓ Detected as Load Balancer Stats', 50);
      return 'performance';
    }
    if (lowerFileName.includes('slow-results') && lowerFileName.endsWith('.csv')) {
      this.debugLog('✓ Detected as Load Balancer Slow Queries', 'success');
      this.updateProcessingStatus(fileName, '✓ Detected as Load Balancer Slow Queries', 50);
      return 'slowqueries';
    }
    if (lowerFileName.includes('errors.summary') && lowerFileName.endsWith('.txt')) {
      this.debugLog('✓ Detected as Error Summary', 'success');
      this.updateProcessingStatus(fileName, '✓ Detected as Error Summary', 50);
      return 'errorsummary';
    }
    if (lowerFileName.includes('report-run') && lowerFileName.endsWith('.csv')) {
      this.debugLog('✓ Detected as LoadRunner Metrics', 'success');
      this.updateProcessingStatus(fileName, '✓ Detected as LoadRunner Metrics', 50);
      return 'loadrunner';
    }
    if (lowerFileName.includes('cachestatistics') && lowerFileName.endsWith('.csv')) {
      this.debugLog('✓ Detected as CloudFront Statistics', 'success');
      this.updateProcessingStatus(fileName, '✓ Detected as CloudFront Statistics', 50);
      return 'cfstats';
    }
    if (lowerFileName.includes('popularobjects') && lowerFileName.endsWith('.csv')) {
      this.debugLog('✓ Detected as CloudFront Objects', 'success');
      this.updateProcessingStatus(fileName, '✓ Detected as CloudFront Objects', 50);
      return 'cfobjects';
    }
    if (lowerFileName.startsWith('cfstats') && lowerFileName.endsWith('.json')) {
      this.debugLog('✓ Detected as CloudFront Metrics', 'success');
      this.updateProcessingStatus(fileName, '✓ Detected as CloudFront Metrics', 50);
      return 'cfmetrics';
    }
    if (lowerFileName.includes('patterns') && lowerFileName.endsWith('.json')) {
      this.debugLog('✓ Detected as Log Patterns', 'success');
      this.updateProcessingStatus(fileName, '✓ Detected as Log Patterns', 50);
      return 'patterns';
    }
    if (lowerFileName.includes('aws-metrics')) {
      if (lowerFileName.includes('query')) {
        this.debugLog('✓ Detected as AWS Metrics Query', 'success');
        this.updateProcessingStatus(fileName, '✓ Detected as AWS Metrics Query', 50);
        return 'aws-metrics-query';
      }
      if (lowerFileName.includes('results')) {
        this.debugLog('✓ Detected as AWS Metrics Results', 'success');
        this.updateProcessingStatus(fileName, '✓ Detected as AWS Metrics Results', 50);
        return 'aws-metrics-results';
      }
    }
    if (lowerFileName.includes('splunk-workflows') && lowerFileName.endsWith('.json')) {
      this.debugLog('✓ Detected as Splunk Workflows', 'success');
      this.updateProcessingStatus(fileName, '✓ Detected as Splunk Workflows', 50);
      return 'splunk-workflows';
    }
    if (lowerFileName.includes('splunk-metrics') && lowerFileName.endsWith('.json')) {
      this.debugLog('✓ Detected as Splunk Metrics', 'success');
      this.updateProcessingStatus(fileName, '✓ Detected as Splunk Metrics', 50);
      return 'splunk-metrics';
    }

    this.debugLog('❌ No matching file type found', 'error');
    this.updateProcessingStatus(fileName, '❌ Unknown file type', 100);
    return null;
  }

  private extractPlayerId(url: string): string {
    const match = url.match(/\/(\d+)(?:\/[^\/]+)?$/);
    return match ? match[1] : '';
  }

  private tryParseJSON(str: string): { isValid: boolean; data?: any; error?: string } {
    try {
      if (!str.trim()) {
        return { isValid: false, error: 'Empty JSON string' };
      }

      const cleanStr = str.replace(/^\uFEFF/, '');
      const parsed = JSON.parse(cleanStr);
      
      if (parsed === null || typeof parsed !== 'object') {
        return { isValid: false, error: 'Invalid JSON: Must be an object or array' };
      }

      return { isValid: true, data: parsed };
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown JSON parsing error';
      return { isValid: false, error };
    }
  }

  private isSplunkWorkflow(data: any): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.sf_workflow === 'string' &&
      typeof data.sf_metric === 'string' &&
      typeof data.sf_id === 'string' &&
      typeof data.sf_error === 'string'
    );
  }

  private isSplunkMetricPair(data: any): boolean {
    return (
      Array.isArray(data) && 
      data.length === 2 && 
      typeof data[0] === 'number' && 
      typeof data[1] === 'number'
    );
  }

  private isAWSMetricsData(data: any): boolean {
    try {
      if (!data || typeof data !== 'object') return false;
      if (!Array.isArray(data.MetricDataResults)) return false;

      return data.MetricDataResults.every((result: any) => {
        if (!result || typeof result !== 'object') return false;

        return (
          typeof result.Id === 'string' &&
          typeof result.Label === 'string' &&
          Array.isArray(result.Timestamps) &&
          Array.isArray(result.Values) &&
          typeof result.StatusCode === 'string'
        );
      });
    } catch (e) {
      this.debugLog('Error validating AWS Metrics data: ' + e, 'error');
      return false;
    }
  }

  private isAWSMetricsQuery(data: any): boolean {
    try {
      if (!Array.isArray(data)) return false;

      return data.every((query) => {
        if (!query || typeof query !== 'object') return false;

        const hasValidMetricStat = 
          query.MetricStat &&
          typeof query.MetricStat === 'object' &&
          query.MetricStat.Metric &&
          typeof query.MetricStat.Metric === 'object' &&
          typeof query.MetricStat.Metric.Namespace === 'string' &&
          typeof query.MetricStat.Metric.MetricName === 'string' &&
          Array.isArray(query.MetricStat.Metric.Dimensions);

        return typeof query.Id === 'string' && hasValidMetricStat;
      });
    } catch (e) {
      this.debugLog('Error validating AWS Metrics Query: ' + e, 'error');
      return false;
    }
  }

  private processAWSMetricsFiles(newState: any) {
    if (newState.query && newState.result) {
      const combinedData = {
        ...newState.result.data,
        Queries: newState.query.data
      };

      const combinedFileName = `${newState.query.fileName}, ${newState.result.fileName}`;
      this.onDataLoaded(combinedData, 'aws-metrics', combinedFileName);
      this.awsMetricsState = {};
    }
  }

  private async processCSV(content: string, fileName: string, type: string) {
    this.debugLog(`Processing CSV file as ${type}`, 'info');
    
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => value.trim(),
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          this.debugLog('No valid data found in file', 'error');
          this.showError('No valid data found in file', fileName);
          return;
        }

        const firstRow = results.data[0] as any;
        
        if (type === 'loadrunner' && firstRow.clock_time && firstRow.metric) {
          this.debugLog('Processing LoadRunner data', 'info');
          this.onDataLoaded(results.data, 'loadrunner', fileName);
        }
        else if (type === 'slowqueries' && firstRow.time && firstRow.processing_time && firstRow.request_url) {
          this.debugLog('Processing Slow Queries data', 'info');
          const data = results.data
            .filter((row: any) => 
              row.time && 
              !isNaN(row.processing_time) && 
              row.request_url && 
              row.elb_status_code
            )
            .map((row: any) => ({
              time: row.time,
              processing_time: Number(row.processing_time),
              request_url: row.request_url,
              pid: this.extractPlayerId(row.request_url),
              elb_status_code: row.elb_status_code
            }));
          this.onDataLoaded(data, 'slowqueries', fileName);
        }
        else if (type === 'performance' && firstRow.base_url && firstRow.min_rt) {
          this.debugLog('Processing Performance data', 'info');
          const data = results.data
            .filter((row: any) => 
              row.base_url && 
              !isNaN(row.min_rt) && 
              !isNaN(row.max_rt) && 
              !isNaN(row.avg_rt)
            )
            .map((row: any) => ({
              base_url: row.base_url,
              request_verb: row.request_verb,
              min_rt: Number(row.min_rt),
              max_rt: Number(row.max_rt),
              avg_rt: Number(row.avg_rt),
              P25: Number(row.P25),
              P50: Number(row.P50),
              P60: Number(row.P60),
              P75: Number(row.P75),
              P90: Number(row.P90),
              P95: Number(row.P95),
              total: Number(row.total),
              requests: Number(row.requests)
            }));
          this.onDataLoaded(data, 'performance', fileName);
        }
        else if (type === 'loadbalancer') {
          this.debugLog('Processing Load Balancer data', 'info');
          const data = results.data
            .filter((row: any) => 
              row.normalized_url && 
              row.elb_status_code && 
              row.request_verb && 
              row.processing_time_bucket && 
              !isNaN(row.count) && 
              !isNaN(row.total_requests) && 
              !isNaN(row.percentage)
            )
            .map((row: any) => ({
              normalized_url: row.normalized_url,
              elb_status_code: row.elb_status_code,
              request_verb: row.request_verb,
              processing_time_bucket: row.processing_time_bucket,
              count: Number(row.count),
              total_requests: Number(row.total_requests),
              percentage: Number(row.percentage)
            }));
          this.onDataLoaded(data, 'loadbalancer', fileName);
        }
      },
      error: (error) => {
        this.debugLog(`Failed to parse CSV: ${error.message}`, 'error');
        this.showError(`Failed to parse CSV: ${error.message}`, fileName);
      }
    });
  }

  private async processErrorSummary(lines: string[], fileName: string) {
    this.debugLog('Processing Error Summary data', 'info');
    const data = lines.map(line => {
      const match = line.match(/^\s*(\d+)\s+(?:"([^"]+)"|({.*})|(.+))$/);
      if (match) {
        const [, count, quotedMessage, jsonMessage, plainMessage] = match;
        let message = quotedMessage || jsonMessage || plainMessage;
        if (!jsonMessage) {
          message = message.trim();
        }
        return {
          count: parseInt(count, 10),
          message: message
        };
      }
      return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);
    
    this.onDataLoaded(data, 'errorsummary', fileName);
  }

  private async processCloudFrontStats(content: string, fileName: string) {
    if (!content.includes('"Report","CacheStatistics"')) {
      this.debugLog('Invalid CloudFront Statistics format', 'error');
      this.showError('Invalid CloudFront Statistics format', fileName);
      return;
    }

    this.debugLog('Processing CloudFront Statistics data', 'info');
    const lines = content.split('\n');
    const startDate = lines[3].split(',')[1].replace(/"/g, '');
    const endDate = lines[4].split(',')[1].replace(/"/g, '');
    const csvData = lines.slice(9).join('\n');

    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => {
        if (/^\d+$/.test(value)) return parseInt(value, 10);
        if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
        return value.trim();
      },
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          this.debugLog('No valid data found in CloudFront Statistics file', 'error');
          this.showError('No valid data found in CloudFront Statistics file', fileName);
          return;
        }

        const data = results.data
          .filter((row: any) => row.TimeBucket && row.TimeBucket !== 'TimeBucket')
          .map((row: any) => ({
            ...row,
            StartDateUTC: startDate,
            EndDateUTC: endDate
          }));

        this.onDataLoaded(data, 'cfstats', fileName);
      }
    });
  }

  private async processCloudFrontObjects(content: string, fileName: string) {
    if (!content.includes('"Report","PopularObjects"')) {
      this.debugLog('Invalid CloudFront Objects format', 'error');
      this.showError('Invalid CloudFront Objects format', fileName);
      return;
    }

    this.debugLog('Processing CloudFront Objects data', 'info');
    const lines = content.split('\n');
    const startDate = lines[3].split(',')[1].replace(/"/g, '');
    const endDate = lines[4].split(',')[1].replace(/"/g, '');
    const csvData = lines.slice(7).join('\n');

    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => {
        if (value.endsWith('Pct')) return value;
        if (/^\d+$/.test(value)) return parseInt(value, 10);
        if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
        return value.trim();
      },
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          this.debugLog('No valid data found in CloudFront Objects file', 'error');
          this.showError('No valid data found in CloudFront Objects file', fileName);
          return;
        }

        const data = results.data
          .filter((row: any) => row.Object && row.Object !== 'Object')
          .map((row: any) => ({
            ...row,
            StartDateUTC: startDate,
            EndDateUTC: endDate
          }));

        this.onDataLoaded(data, 'cfobjects', fileName);
      }
    });
  }

  private async processPatterns(content: string, fileName: string) {
    try {
      this.debugLog('Processing Patterns data', 'info');
      const data = JSON.parse(content);
      if (!Array.isArray(data)) {
        this.debugLog('Invalid Patterns format: not an array', 'error');
        this.showError('Invalid Patterns format: not an array', fileName);
        return;
      }

      const isValid = data.every(item => 
        typeof item === 'object' &&
        item !== null &&
        typeof item['@pattern'] === 'string' &&
        typeof item['@tokens'] === 'string'
      );

      if (!isValid) {
        this.debugLog('Invalid Patterns format: missing required fields', 'error');
        this.showError('Invalid Patterns format: missing required fields', fileName);
        return;
      }

      this.onDataLoaded(data, 'patterns', fileName);
    } catch (error) {
      this.debugLog('Failed to parse Patterns JSON', 'error');
      this.showError('Failed to parse Patterns JSON', fileName);
    }
  }

  private async processAWSMetrics(content: string, fileName: string, type: string) {
    try {
      this.debugLog('Processing AWS Metrics data', 'info');
      const data = JSON.parse(content);

      if (type === 'aws-metrics-query') {
        if (this.isAWSMetricsQuery(data)) {
          const newState = {
            ...this.awsMetricsState,
            query: { data, fileName }
          };
          this.awsMetricsState = newState;
          this.processAWSMetricsFiles(newState);
        } else {
          this.debugLog('Invalid AWS Metrics Query format', 'error');
          this.showError('Invalid AWS Metrics Query format', fileName);
        }
      } else if (type === 'aws-metrics-results') {
        if (this.isAWSMetricsData(data)) {
          const newState = {
            ...this.awsMetricsState,
            result: { data, fileName }
          };
          this.awsMetricsState = newState;
          this.processAWSMetricsFiles(newState);
        } else {
          this.debugLog('Invalid AWS Metrics Results format', 'error');
          this.showError('Invalid AWS Metrics Results format', fileName);
        }
      }
    } catch (error) {
      this.debugLog('Failed to parse AWS Metrics JSON', 'error');
      this.showError('Failed to parse AWS Metrics JSON', fileName);
    }
  }

  private async processSplunkData(content: string, fileName: string, type: string) {
    try {
      this.debugLog('Processing Splunk data', 'info');
      const data = JSON.parse(content);

      if (type === 'splunk-workflows') {
        const workflowsData = 'rs' in data && Array.isArray(data.rs) ? data.rs : data;
        
        if (Array.isArray(workflowsData) && workflowsData.every(item => this.isSplunkWorkflow(item))) {
          this.onDataLoaded(workflowsData, 'splunk-workflows', fileName);
        } else {
          this.debugLog('Invalid Splunk Workflows format', 'error');
          this.showError('Invalid Splunk Workflows format', fileName);
        }
      } else if (type === 'splunk-metrics') {
        const metricsData = 'data' in data ? data.data : data;
        
        if (typeof metricsData === 'object' && !Array.isArray(metricsData)) {
          const isValid = Object.values(metricsData).every(value => 
            Array.isArray(value) && value.every(item => this.isSplunkMetricPair(item))
          );
          
          if (isValid) {
            this.onDataLoaded(metricsData, 'splunk-metrics', fileName);
          } else {
            this.debugLog('Invalid Splunk Metrics format', 'error');
            this.showError('Invalid Splunk Metrics format', fileName);
          }
        } else {
          this.debugLog('Invalid Splunk Metrics format', 'error');
          this.showError('Invalid Splunk Metrics format', fileName);
        }
      }
    } catch (error) {
      this.debugLog('Failed to parse Splunk data', 'error');
      this.showError('Failed to parse Splunk data', fileName);
    }
  }

  public async processContent(content: string, fileName: string) {
    this.debugLog(`🔍 Starting analysis of file: ${fileName}`, 'info');
    this.updateProcessingStatus(fileName, '🔍 Starting analysis...', 0);
    
    const fileType = this.detectFileType(fileName, content);
    if (!fileType) {
      this.debugLog(`❌ File type detection failed for: ${fileName}`, 'error');
      this.showError('Unrecognized file format or naming convention', fileName);
      return;
    }

    this.debugLog(`✓ Processing file as: ${fileType}`, 'success');
    this.updateProcessingStatus(fileName, `✓ Processing as ${fileType}...`, 75);

    try {
      switch (fileType) {
        case 'loadbalancer':
        case 'performance':
        case 'slowqueries':
        case 'loadrunner':
          await this.processCSV(content, fileName, fileType);
          break;

        case 'errorsummary':
          await this.processErrorSummary(content.trim().split('\n'), fileName);
          break;

        case 'cfstats':
          await this.processCloudFrontStats(content, fileName);
          break;

        case 'cfobjects':
          await this.processCloudFrontObjects(content, fileName);
          break;

        case 'cfmetrics':
          this.debugLog('🔄 Processing CloudFront Metrics data', 'info');
          const jsonData = JSON.parse(content);
          if (jsonData.MetricDataResults) {
            this.debugLog('✓ Valid CloudFront Metrics format detected', 'success');
            this.onDataLoaded(jsonData, 'cfmetrics', fileName);
          } else {
            this.debugLog('❌ Invalid CloudFront Metrics format', 'error');
            this.showError('Invalid CloudFront Metrics format', fileName);
          }
          break;

        case 'patterns':
          await this.processPatterns(content, fileName);
          break;

        case 'aws-metrics-query':
        case 'aws-metrics-results':
          await this.processAWSMetrics(content, fileName, fileType);
          break;

        case 'splunk-workflows':
        case 'splunk-metrics':
          await this.processSplunkData(content, fileName, fileType);
          break;

        default:
          this.debugLog(`❌ Unsupported file type: ${fileType}`, 'error');
          this.showError('Unsupported file type', fileName);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.debugLog(`❌ Error processing file: ${errorMessage}`, 'error');
      this.showError(`Error processing file: ${errorMessage}`, fileName);
    }
  }
}