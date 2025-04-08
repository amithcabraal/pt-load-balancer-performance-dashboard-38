# Performance Test Load Balancer Responses Analyser

A comprehensive dashboard for analyzing load balancer responses, performance metrics, and various other performance testing data.

## Features

- **Multi-format Support**
  - Load Balancer Analysis
  - Performance Metrics
  - Slow Requests Analysis
  - Error Summary Analysis
  - LoadRunner Metrics
  - CloudFront Statistics
  - CloudFront Popular Objects
  - Log Patterns Analysis
  - AWS ALB Metrics
  - Splunk APM Integration

- **Interactive Visualizations**
  - Real-time data processing
  - Interactive charts and graphs
  - Detailed metric breakdowns
  - Custom filtering and sorting
  - Time-based analysis

- **Advanced Features**
  - Dark/Light mode support
  - Configurable thresholds
  - Multi-file upload support
  - ZIP file processing
  - Error handling and validation
  - Responsive design

## Supported File Formats

### Load Balancer Data (CSV)
```csv
normalized_url,elb_status_code,request_verb,processing_time_bucket,count,total_requests,percentage
/api/v1/games,200,GET,0-0.3,1000,5000,20
```

### Performance Metrics (CSV)
```csv
base_url,request_verb,min_rt,max_rt,avg_rt,P25,P50,P60,P75,P90,P95,total,requests
/api/v1/games,GET,0.1,2.5,0.8,0.3,0.7,0.9,1.2,1.8,2.1,800,1000
```

### Slow Queries (CSV)
```csv
time,processing_time,request_url,elb_status_code
2024-01-01T12:00:00Z,5.2,/api/v1/games/123,200
```

### LoadRunner Metrics (CSV)
```csv
clock_time,metric,transaction,val,time_stamp
2024-01-01 12:00:00,percentile 95,API_GetGame,1.5,1704110400000
```

### Error Summary (TXT)
```
100 "Error message here"
50 {"error": "Detailed error message"}
```

### CloudFront Reports (CSV)
Two types:
- Cache Statistics Report
- Popular Objects Report

### Log Patterns (JSON)
```json
[{
  "@pattern": "Pattern string with <*> tokens",
  "@tokens": "[{\"tokenType\": \"STATIC\", ...}]",
  "@severityLabel": "ERROR"
}]
```

### AWS ALB Metrics (JSON)
Two files required:
- Query file: Contains metric definitions
- Results file: Contains metric data points

### Splunk APM (JSON)
Two files required:
- Workflows file: Contains workflow definitions
- Metrics file: Contains time-series metrics data

## Usage

1. Click the upload button or drag & drop your files
2. Select the appropriate data files
3. View the analysis in the corresponding dashboard tab
4. Use the filters and controls to analyze the data
5. Export or share results as needed

## Features

### Data Analysis
- Response time distribution
- Error rate analysis
- Performance patterns
- Cache hit/miss ratios
- Request volume trends
- Custom metric tracking

### Visualization
- Time series charts
- Distribution graphs
- Heat maps
- Error breakdowns
- Performance comparisons

### Configuration
- Custom thresholds
- Chart customization
- Dark/Light mode
- Data filtering options
- View preferences

## Development

Built with:
- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide Icons

## License

MIT License