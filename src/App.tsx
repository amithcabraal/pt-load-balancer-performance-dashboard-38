import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { SlowQueriesDashboard } from './components/SlowQueriesDashboard';
import { ErrorSummaryDashboard } from './components/ErrorSummaryDashboard';
import { LoadRunnerDashboard } from './components/LoadRunnerDashboard';
import { CloudFrontStatsDashboard } from './components/CloudFrontStatsDashboard';
import { CloudFrontObjectsDashboard } from './components/CloudFrontObjectsDashboard';
import { CloudFrontMetricsDashboard } from './components/CloudFrontMetricsDashboard';
import { SplunkAPMDashboard } from './components/SplunkAPMDashboard';
import { PatternsDashboard } from './components/PatternsDashboard';
import { BurgerMenu } from './components/BurgerMenu';
import { InstructionsModal } from './components/InstructionsModal';
import { AWSMetricsDashboard } from './components/AWSMetricsDashboard';
import { LoadBalancerEntry, PerformanceMetricsEntry, SlowQueryEntry, ErrorSummaryEntry, CloudFrontStatsEntry, CloudFrontObjectEntry, DataFormat, DataState, TabType, SplunkWorkflow, SplunkMetric, SplunkDataState } from './types';
import { BarChart, LayoutDashboard, Activity, Clock, AlertTriangle, LineChart, Cloud, Activity as SplunkIcon } from 'lucide-react';

function App() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [dataState, setDataState] = useState<DataState>({
    loadBalancerData: null,
    performanceData: null,
    slowQueriesData: null,
    errorSummaryData: null,
    loadRunnerData: null,
    cfStatsData: null,
    cfObjectsData: null,
    cfMetricsData: null,
    patternsData: null,
    awsMetricsData: null,
    fileNames: {}
  });
  const [splunkDataState, setSplunkDataState] = useState<SplunkDataState>({
    workflows: null,
    metrics: null
  });
  const [activeTab, setActiveTab] = useState<TabType>(null);

  const handleDataLoaded = (
    newData: LoadBalancerEntry[] | PerformanceMetricsEntry[] | SlowQueryEntry[] | ErrorSummaryEntry[] | CloudFrontStatsEntry[] | CloudFrontObjectEntry[] | SplunkWorkflow[] | Record<string, SplunkMetric[]>,
    format: DataFormat,
    fileName: string
  ) => {
    if (format === 'splunk-workflows') {
      setSplunkDataState(prev => ({
        ...prev,
        workflows: newData as SplunkWorkflow[],
        fileNames: {
          ...prev.fileNames,
          splunkWorkflows: fileName
        }
      }));
      
      setDataState(prev => ({
        ...prev,
        fileNames: {
          ...prev.fileNames,
          splunkWorkflows: fileName
        }
      }));
    } else if (format === 'splunk-metrics') {
      setSplunkDataState(prev => ({
        ...prev,
        metrics: newData as Record<string, SplunkMetric[]>,
        fileNames: {
          ...prev.fileNames,
          splunkMetrics: fileName
        }
      }));
      
      setDataState(prev => ({
        ...prev,
        fileNames: {
          ...prev.fileNames,
          splunkMetrics: fileName
        }
      }));
    } else {
      setDataState(prev => ({
        ...prev,
        [format === 'loadbalancer' ? 'loadBalancerData' :
         format === 'performance' ? 'performanceData' :
         format === 'slowqueries' ? 'slowQueriesData' :
         format === 'loadrunner' ? 'loadRunnerData' :
         format === 'cfstats' ? 'cfStatsData' :
         format === 'cfobjects' ? 'cfObjectsData' :
         format === 'cfmetrics' ? 'cfMetricsData' :
         format === 'patterns' ? 'patternsData' :
         format === 'aws-metrics' ? 'awsMetricsData' : 'errorSummaryData']: newData,
        fileNames: {
          ...prev.fileNames,
          [format === 'loadbalancer' ? 'loadBalancer' :
           format === 'performance' ? 'performance' :
           format === 'slowqueries' ? 'slowQueries' :
           format === 'loadrunner' ? 'loadRunner' :
           format === 'cfstats' ? 'cfStats' :
           format === 'cfobjects' ? 'cfObjects' :
           format === 'cfmetrics' ? 'cfMetrics' :
           format === 'patterns' ? 'patterns' :
           format === 'aws-metrics' ? 'awsMetrics' : 'errorSummary']: fileName
        }
      }));

      if (!activeTab) {
        setActiveTab(
          format === 'loadbalancer' ? 'summary' :
          format === 'performance' ? 'stats' :
          format === 'slowqueries' ? 'slow' :
          format === 'loadrunner' ? 'loadrunner' :
          format === 'cfstats' ? 'cfstats' :
          format === 'cfobjects' ? 'cfobjects' :
          format === 'cfmetrics' ? 'cfmetrics' :
          format === 'patterns' ? 'patterns' :
          format === 'aws-metrics' ? 'aws-metrics' :
          format === 'splunk-workflows' || format === 'splunk-metrics' ? 'splunk' : 'errors'
        );
      }
    }
  };

  const handleClear = (format?: DataFormat) => {
    if (!format) {
      setDataState({
        loadBalancerData: null,
        performanceData: null,
        slowQueriesData: null,
        errorSummaryData: null,
        loadRunnerData: null,
        cfStatsData: null,
        cfObjectsData: null,
        cfMetricsData: null,
        patternsData: null,
        awsMetricsData: null,
        fileNames: {}
      });
      setSplunkDataState({
        workflows: null,
        metrics: null,
        fileNames: {}
      });
      setActiveTab(null);
    } else if (format === 'splunk-workflows') {
      setSplunkDataState(prev => ({
        ...prev,
        workflows: null,
        fileNames: {
          ...prev.fileNames,
          splunkWorkflows: undefined
        }
      }));
      
      setDataState(prev => ({
        ...prev,
        fileNames: {
          ...prev.fileNames,
          splunkWorkflows: undefined
        }
      }));
      
      if (activeTab === 'splunk' && !splunkDataState.metrics) {
        if (dataState.loadBalancerData) setActiveTab('summary');
        else if (dataState.performanceData) setActiveTab('stats');
        else if (dataState.slowQueriesData) setActiveTab('slow');
        else if (dataState.loadRunnerData) setActiveTab('loadrunner');
        else if (dataState.cfStatsData) setActiveTab('cfstats');
        else if (dataState.cfObjectsData) setActiveTab('cfobjects');
        else if (dataState.cfMetricsData) setActiveTab('cfmetrics');
        else if (dataState.patternsData) setActiveTab('patterns');
        else if (dataState.awsMetricsData) setActiveTab('aws-metrics');
        else if (dataState.errorSummaryData) setActiveTab('errors');
        else setActiveTab(null);
      }
    } else if (format === 'splunk-metrics') {
      setSplunkDataState(prev => ({
        ...prev,
        metrics: null,
        fileNames: {
          ...prev.fileNames,
          splunkMetrics: undefined
        }
      }));
      
      setDataState(prev => ({
        ...prev,
        fileNames: {
          ...prev.fileNames,
          splunkMetrics: undefined
        }
      }));
      
      if (activeTab === 'splunk' && !splunkDataState.workflows) {
        if (dataState.loadBalancerData) setActiveTab('summary');
        else if (dataState.performanceData) setActiveTab('stats');
        else if (dataState.slowQueriesData) setActiveTab('slow');
        else if (dataState.loadRunnerData) setActiveTab('loadrunner');
        else if (dataState.cfStatsData) setActiveTab('cfstats');
        else if (dataState.cfObjectsData) setActiveTab('cfobjects');
        else if (dataState.cfMetricsData) setActiveTab('cfmetrics');
        else if (dataState.patternsData) setActiveTab('patterns');
        else if (dataState.awsMetricsData) setActiveTab('aws-metrics');
        else if (dataState.errorSummaryData) setActiveTab('errors');
        else setActiveTab(null);
      }
    } else {
      setDataState(prev => ({
        ...prev,
        [format === 'loadbalancer' ? 'loadBalancerData' :
         format === 'performance' ? 'performanceData' :
         format === 'slowqueries' ? 'slowQueriesData' :
         format === 'loadrunner' ? 'loadRunnerData' :
         format === 'cfstats' ? 'cfStatsData' :
         format === 'cfobjects' ? 'cfObjectsData' :
         format === 'cfmetrics' ? 'cfMetricsData' :
         format === 'patterns' ? 'patternsData' :
         format === 'aws-metrics' ? 'awsMetricsData' : 'errorSummaryData']: null,
        fileNames: {
          ...prev.fileNames,
          [format === 'loadbalancer' ? 'loadBalancer' :
           format === 'performance' ? 'performance' :
           format === 'slowqueries' ? 'slowQueries' :
           format === 'loadrunner' ? 'loadRunner' :
           format === 'cfstats' ? 'cfStats' :
           format === 'cfobjects' ? 'cfObjects' :
           format === 'cfmetrics' ? 'cfMetrics' :
           format === 'patterns' ? 'patterns' :
           format === 'aws-metrics' ? 'awsMetrics' : 'errorSummary']: undefined
        }
      }));

      if (
        (format === 'loadbalancer' && activeTab === 'summary') ||
        (format === 'performance' && activeTab === 'stats') ||
        (format === 'slowqueries' && activeTab === 'slow') ||
        (format === 'loadrunner' && activeTab === 'loadrunner') ||
        (format === 'cfstats' && activeTab === 'cfstats') ||
        (format === 'cfobjects' && activeTab === 'cfobjects') ||
        (format === 'cfmetrics' && activeTab === 'cfmetrics') ||
        (format === 'patterns' && activeTab === 'patterns') ||
        (format === 'aws-metrics' && activeTab === 'aws-metrics') ||
        (format === 'errorsummary' && activeTab === 'errors')
      ) {
        if (format !== 'loadbalancer' && dataState.loadBalancerData) setActiveTab('summary');
        else if (format !== 'performance' && dataState.performanceData) setActiveTab('stats');
        else if (format !== 'slowqueries' && dataState.slowQueriesData) setActiveTab('slow');
        else if (format !== 'loadrunner' && dataState.loadRunnerData) setActiveTab('loadrunner');
        else if (format !== 'cfstats' && dataState.cfStatsData) setActiveTab('cfstats');
        else if (format !== 'cfobjects' && dataState.cfObjectsData) setActiveTab('cfobjects');
        else if (format !== 'cfmetrics' && dataState.cfMetricsData) setActiveTab('cfmetrics');
        else if (format !== 'patterns' && dataState.patternsData) setActiveTab('patterns');
        else if (format !== 'aws-metrics' && dataState.awsMetricsData) setActiveTab('aws-metrics');
        else if (format !== 'errorsummary' && dataState.errorSummaryData) setActiveTab('errors');
        else if (splunkDataState.workflows && splunkDataState.metrics) setActiveTab('splunk');
        else setActiveTab(null);
      }
    }
  };

  const hasData = dataState.loadBalancerData || dataState.performanceData ||
                  dataState.slowQueriesData || dataState.errorSummaryData ||
                  dataState.loadRunnerData || dataState.cfStatsData ||
                  dataState.cfObjectsData || dataState.cfMetricsData ||
                  dataState.patternsData || dataState.awsMetricsData ||
                  splunkDataState.workflows;

  const hasMultipleDataTypes = [
    dataState.loadBalancerData,
    dataState.performanceData,
    dataState.slowQueriesData,
    dataState.errorSummaryData,
    dataState.loadRunnerData,
    dataState.cfStatsData,
    dataState.cfObjectsData,
    dataState.cfMetricsData,
    dataState.patternsData,
    dataState.awsMetricsData,
    splunkDataState.workflows
  ].filter(Boolean).length > 1;

  // Define the order of tabs
  const orderedTabs = [
    {
      condition: dataState.loadRunnerData,
      onClick: () => setActiveTab('loadrunner'),
      isActive: activeTab === 'loadrunner',
      icon: <LineChart className="w-4 h-4" />,
      label: "LoadRunner"
    },
    {
      condition: dataState.cfObjectsData,
      onClick: () => setActiveTab('cfobjects'),
      isActive: activeTab === 'cfobjects',
      icon: <Cloud className="w-4 h-4" />,
      label: "CF Objects"
    },
    {
      condition: dataState.cfStatsData,
      onClick: () => setActiveTab('cfstats'),
      isActive: activeTab === 'cfstats',
      icon: <Cloud className="w-4 h-4" />,
      label: "CF Stats"
    },
    {
      condition: dataState.cfMetricsData,
      onClick: () => setActiveTab('cfmetrics'),
      isActive: activeTab === 'cfmetrics',
      icon: <Cloud className="w-4 h-4" />,
      label: "CF Metrics"
    },
    {
      condition: dataState.loadBalancerData,
      onClick: () => setActiveTab('summary'),
      isActive: activeTab === 'summary',
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: "LB Summary"
    },
    {
      condition: dataState.performanceData,
      onClick: () => setActiveTab('stats'),
      isActive: activeTab === 'stats',
      icon: <Activity className="w-4 h-4" />,
      label: "LB Stats"
    },
    {
      condition: dataState.slowQueriesData,
      onClick: () => setActiveTab('slow'),
      isActive: activeTab === 'slow',
      icon: <Clock className="w-4 h-4" />,
      label: "LB Slow Requests"
    },
    {
      condition: dataState.patternsData,
      onClick: () => setActiveTab('patterns'),
      isActive: activeTab === 'patterns',
      icon: <Activity className="w-4 h-4" />,
      label: "LB Errors"
    },
    {
      condition: splunkDataState.workflows && splunkDataState.metrics,
      onClick: () => setActiveTab('splunk'),
      isActive: activeTab === 'splunk',
      icon: <SplunkIcon className="w-4 h-4" />,
      label: "Splunk APM"
    },
    {
      condition: dataState.awsMetricsData,
      onClick: () => setActiveTab('aws-metrics'),
      isActive: activeTab === 'aws-metrics',
      icon: <Activity className="w-4 h-4" />,
      label: "AWS Metrics"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart className="w-8 h-8 text-blue-500" />
              Performance Analysis Dashboard
            </h1>
            <BurgerMenu onShowInstructions={() => setShowInstructions(true)} />
          </div>
        </div>
      </header>

      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <FileUpload
          onDataLoaded={handleDataLoaded}
          dataState={dataState}
          onClear={handleClear}
        />

        {hasData && (
          <div className="mt-6">
            {hasMultipleDataTypes && (
              <div className="mb-6 flex gap-2 flex-wrap">
                {orderedTabs.map((tab, index) => (
                  tab.condition && (
                    <button
                      key={index}
                      onClick={tab.onClick}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        tab.isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  )
                ))}
              </div>
            )}

            {(activeTab === 'summary' || (!hasMultipleDataTypes && dataState.loadBalancerData)) && (
              <Dashboard data={dataState.loadBalancerData!} />
            )}
            
            {(activeTab === 'stats' || (!hasMultipleDataTypes && dataState.performanceData)) && (
              <PerformanceDashboard data={dataState.performanceData!} />
            )}

            {(activeTab === 'slow' || (!hasMultipleDataTypes && dataState.slowQueriesData)) && (
              <SlowQueriesDashboard data={dataState.slowQueriesData!} />
            )}

            {(activeTab === 'errors' || (!hasMultipleDataTypes && dataState.errorSummaryData)) && (
              <ErrorSummaryDashboard data={Array.isArray(dataState.errorSummaryData) ? dataState.errorSummaryData : []} />
            )}

            {(activeTab === 'loadrunner' || (!hasMultipleDataTypes && dataState.loadRunnerData)) && (
              <LoadRunnerDashboard data={dataState.loadRunnerData!} />
            )}

            {(activeTab === 'cfstats' || (!hasMultipleDataTypes && dataState.cfStatsData)) && (
              <CloudFrontStatsDashboard data={dataState.cfStatsData!} />
            )}

            {(activeTab === 'cfobjects' || (!hasMultipleDataTypes && dataState.cfObjectsData)) && (
              <CloudFrontObjectsDashboard data={dataState.cfObjectsData!} />
            )}

            {(activeTab === 'cfmetrics' || (!hasMultipleDataTypes && dataState.cfMetricsData)) && (
              <CloudFrontMetricsDashboard data={dataState.cfMetricsData!} />
            )}

            {(activeTab === 'patterns' || (!hasMultipleDataTypes && dataState.patternsData)) && (
              <PatternsDashboard data={dataState.patternsData!} />
            )}

            {(activeTab === 'aws-metrics' || (!hasMultipleDataTypes && dataState.awsMetricsData)) && (
              <AWSMetricsDashboard data={dataState.awsMetricsData!} />
            )}

            {(activeTab === 'splunk' || (!hasMultipleDataTypes && splunkDataState.workflows)) && 
             splunkDataState.workflows && splunkDataState.metrics && (
              <SplunkAPMDashboard 
                workflows={splunkDataState.workflows} 
                metrics={splunkDataState.metrics} 
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;