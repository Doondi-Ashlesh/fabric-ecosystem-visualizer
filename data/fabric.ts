/**
 * Microsoft Fabric Ecosystem Data
 *
 * All service descriptions sourced exclusively from official Microsoft
 * documentation (learn.microsoft.com, microsoft.com/fabric).
 * Source URLs noted per entry.
 */

import type { Service, Workflow } from '@/types/ecosystem';

// ---------------------------------------------------------------------------
// SERVICES
// ---------------------------------------------------------------------------

export const FABRIC_SERVICES: Service[] = [

  // ── FOUNDATION ────────────────────────────────────────────────────────────

  {
    id: 'onelake',
    name: 'OneLake',
    shortDescription: 'The unified data lake foundation for all of Microsoft Fabric.',
    // Source: learn.microsoft.com/en-us/fabric/onelake/onelake-overview
    fullDescription:
      'OneLake is the single, unified, logical data lake built into Microsoft Fabric. All Fabric data items — lakehouses, warehouses, eventhouse databases, and more — automatically store their data in OneLake in open Delta Parquet format. Eliminates data silos by providing one copy of data accessible across all Fabric workloads without duplication or movement. Built on Azure Data Lake Storage Gen2, supports ADLS, S3-compatible APIs, and shortcuts to external storage.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview',
    layer: 'foundation',
    tags: ['storage', 'delta', 'open format', 'unified', 'ADLS'],
    connections: ['lakehouse', 'warehouse', 'eventhouse', 'notebook'],
  },

  // ── INGESTION ─────────────────────────────────────────────────────────────

  {
    id: 'data-factory',
    name: 'Data Factory',
    shortDescription: 'Enterprise-grade data integration with 150+ connectors.',
    // Source: learn.microsoft.com/en-us/fabric/data-factory/data-factory-overview
    fullDescription:
      'The data integration workload in Microsoft Fabric providing enterprise-grade data movement and transformation. Offers 150+ native connectors for cloud and on-premises sources. Includes Data Pipelines for orchestrated ETL/ELT workflows and visual drag-and-drop authoring. Supports Copy Activity, incremental load patterns, fault tolerance, and monitoring. Integrates natively with OneLake, Lakehouse, and Warehouse as destinations.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/data-factory/data-factory-overview',
    layer: 'ingestion',
    tags: ['ETL', 'ELT', 'connectors', 'pipelines', 'integration'],
    connections: ['onelake', 'lakehouse', 'warehouse', 'dataflows-gen2'],
  },
  {
    id: 'dataflows-gen2',
    name: 'Dataflows Gen2',
    shortDescription: 'Low-code Power Query data transformation and loading.',
    // Source: learn.microsoft.com/en-us/fabric/data-factory/dataflows-gen2-overview
    fullDescription:
      'A low-code, self-service data preparation experience built on Power Query Online. Enables data engineers and analysts to connect to 150+ sources, apply M-language transformations, and load results directly into Fabric destinations including Lakehouse, Warehouse, and other outputs. Features fast copy mode for high-throughput loading, incremental refresh, and native integration with Data Factory pipelines as an activity.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/data-factory/dataflows-gen2-overview',
    layer: 'ingestion',
    tags: ['Power Query', 'low-code', 'ETL', 'M language', 'self-service'],
    connections: ['lakehouse', 'warehouse', 'data-factory'],
  },
  {
    id: 'eventstream',
    name: 'Eventstream',
    shortDescription: 'Real-time event capture, transformation, and routing.',
    // Source: learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/overview
    fullDescription:
      'A no-code, real-time event streaming capability in Microsoft Fabric for capturing, transforming, and routing live event data to multiple destinations. Connects to Azure Event Hubs, IoT Hub, Kafka, CDC sources, and custom apps. Supports real-time transformations including filter, aggregate, join, and group-by operations. Routes processed streams to Eventhouse, Lakehouse, Warehouse, or Activator for downstream analytics and alerting.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/event-streams/overview',
    layer: 'ingestion',
    tags: ['streaming', 'real-time', 'IoT', 'Kafka', 'event-driven'],
    connections: ['eventhouse', 'lakehouse', 'data-activator'],
  },

  // ── STORAGE ───────────────────────────────────────────────────────────────

  {
    id: 'lakehouse',
    name: 'Lakehouse',
    shortDescription: 'Unified Delta Lake storage with built-in SQL and Spark access.',
    // Source: learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-overview
    fullDescription:
      'Microsoft Fabric Lakehouse combines the flexibility of a data lake with the performance of a data warehouse. Stores data in OneLake using open Delta Parquet format, automatically exposing a SQL Analytics Endpoint for T-SQL queries without data movement. Supports Apache Spark for big data processing via Notebooks and Spark Job Definitions. Provides ACID transactions, time travel, schema enforcement, and unified governance through Purview.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-overview',
    layer: 'storage',
    tags: ['Delta Lake', 'Spark', 'SQL', 'ACID', 'open format'],
    connections: ['onelake', 'notebook', 'warehouse', 'power-bi', 'purview'],
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    shortDescription: 'Fully managed T-SQL serverless analytics warehouse.',
    // Source: learn.microsoft.com/en-us/fabric/data-warehouse/data-warehousing
    fullDescription:
      'A fully managed, serverless T-SQL analytics data warehouse built into Microsoft Fabric. Supports full DML and DDL statements, stored procedures, views, and functions. Data is stored in OneLake in Delta Parquet format, enabling cross-workspace querying and Zero-copy table cloning. Includes built-in query optimization, automatic statistics, and workload management. Connects natively to Power BI semantic models and supports cross-database joins with Lakehouses.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/data-warehousing',
    layer: 'storage',
    tags: ['T-SQL', 'serverless', 'analytics', 'DWH', 'Delta'],
    connections: ['onelake', 'lakehouse', 'power-bi', 'purview'],
  },
  {
    id: 'eventhouse',
    name: 'Eventhouse',
    shortDescription: 'High-performance real-time analytics store for time-series data.',
    // Source: learn.microsoft.com/en-us/fabric/real-time-intelligence/eventhouse
    fullDescription:
      'Eventhouse is a managed workspace of KQL (Kusto Query Language) databases optimized for ingesting and analyzing high-volume time-series, telemetry, and log data in real time. Designed for scenarios requiring sub-second query response on billions of rows. Supports automatic indexing, data compression, and tiered storage. Integrates with Eventstream for real-time ingestion and exposes data to OneLake for cross-workload access. Powers Real-Time Dashboards and KQL Querysets.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/eventhouse',
    layer: 'storage',
    tags: ['KQL', 'time-series', 'telemetry', 'real-time', 'sub-second'],
    connections: ['onelake', 'eventstream', 'real-time-dashboard', 'data-activator'],
  },

  // ── PROCESSING ────────────────────────────────────────────────────────────

  {
    id: 'notebook',
    name: 'Notebook',
    shortDescription: 'Apache Spark notebooks for data engineering, science, and ML.',
    // Source: learn.microsoft.com/en-us/fabric/data-engineering/how-to-use-notebook
    fullDescription:
      'Interactive web-based notebooks in Microsoft Fabric supporting Python, Scala, R, and Spark SQL. Directly access Lakehouse files and tables without configuration. Features include Copilot-assisted code generation, variable explorer, data wrangler for visual data profiling, native MLflow integration for experiment tracking, and rich visualization with built-in chart rendering. Runs on optimized Spark compute with auto-scaling and session management.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/data-engineering/how-to-use-notebook',
    layer: 'processing',
    tags: ['Spark', 'Python', 'Scala', 'R', 'interactive', 'ML'],
    connections: ['lakehouse', 'onelake', 'ml-experiment', 'copilot'],
  },
  {
    id: 'spark-job',
    name: 'Spark Job Definition',
    shortDescription: 'Scheduled and on-demand batch Spark workloads.',
    // Source: learn.microsoft.com/en-us/fabric/data-engineering/spark-job-definition
    fullDescription:
      'Spark Job Definition allows packaging and running Apache Spark applications (Python, Scala, Java, R) as scheduled or on-demand batch jobs in Microsoft Fabric. Supports .jar, .py, and wheel files with configurable Spark properties, retry policies, and parameterization. Runs on the same optimized Spark compute as Notebooks with access to Lakehouse and OneLake. Integrates with Data Factory pipelines for orchestrated batch processing workflows.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/data-engineering/spark-job-definition',
    layer: 'processing',
    tags: ['batch', 'Spark', 'scheduled', 'Python', 'Scala'],
    connections: ['lakehouse', 'onelake', 'data-factory'],
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    shortDescription: 'Workflow orchestration for end-to-end data pipeline automation.',
    // Source: learn.microsoft.com/en-us/fabric/data-factory/data-factory-overview
    fullDescription:
      'Data Pipelines in Microsoft Fabric provide visual workflow orchestration for sequencing and automating data integration tasks. Supports 30+ activity types including Copy Data, Notebook, Spark Job, Stored Procedure, Dataflow, and conditional logic (If/Until/ForEach). Features schedule triggers, event triggers, parameterization, and monitoring dashboards. Built on Azure Data Factory engine, enabling enterprise-grade reliability and retry policies.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/data-factory/create-first-pipeline-with-sample-data',
    layer: 'processing',
    tags: ['orchestration', 'scheduling', 'automation', 'workflow', 'triggers'],
    connections: ['data-factory', 'notebook', 'spark-job', 'dataflows-gen2'],
  },

  // ── ANALYTICS & AI ────────────────────────────────────────────────────────

  {
    id: 'ml-experiment',
    name: 'ML Experiment',
    shortDescription: 'Track, compare, and manage machine learning training runs.',
    // Source: learn.microsoft.com/en-us/fabric/data-science/machine-learning-experiment
    fullDescription:
      'ML Experiments in Microsoft Fabric provide MLflow-based tracking for machine learning training runs. Log parameters, metrics, artifacts, and model versions across multiple runs to compare performance. Integrated directly into Fabric Notebooks, enabling seamless logging without additional configuration. Supports experiment comparison views, run filtering, and artifact storage in OneLake. Works alongside ML Models for the full model lifecycle from experiment to deployment.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/data-science/machine-learning-experiment',
    layer: 'analytics',
    tags: ['MLflow', 'experiment tracking', 'model comparison', 'ML', 'logging'],
    connections: ['notebook', 'ml-model', 'lakehouse'],
  },
  {
    id: 'ml-model',
    name: 'ML Model',
    shortDescription: 'Register, version, and manage production ML models.',
    // Source: learn.microsoft.com/en-us/fabric/data-science/machine-learning-model
    fullDescription:
      'ML Models in Microsoft Fabric provide a MLflow Model Registry for managing the full lifecycle of machine learning models. Register models from training runs, track versions, add metadata and descriptions, and promote models through staging to production. Stored in OneLake with lineage tracked in Purview. Supports ONNX, scikit-learn, PyTorch, TensorFlow, and custom Python function models. Enables batch scoring via Notebooks and Spark Job Definitions.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/data-science/machine-learning-model',
    layer: 'analytics',
    tags: ['MLflow', 'model registry', 'versioning', 'deployment', 'ONNX'],
    connections: ['ml-experiment', 'notebook', 'onelake', 'purview'],
  },
  {
    id: 'real-time-dashboard',
    name: 'Real-Time Dashboard',
    shortDescription: 'Live KQL-powered dashboards with sub-second auto-refresh.',
    // Source: learn.microsoft.com/en-us/fabric/real-time-intelligence/dashboard-real-time-create
    fullDescription:
      'Real-Time Dashboards in Microsoft Fabric provide live, auto-refreshing visualizations powered by KQL queries against Eventhouse databases. Designed for operational monitoring, IoT telemetry, and time-series analytics requiring continuous data updates. Supports multiple visual types including time charts, scatter plots, maps, and stat tiles. Features parameterized queries, cross-filter interactions, and sharing. Refreshes on a configurable interval from seconds to minutes.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/real-time-intelligence/dashboard-real-time-create',
    layer: 'analytics',
    tags: ['KQL', 'real-time', 'dashboard', 'monitoring', 'IoT'],
    connections: ['eventhouse', 'data-activator'],
  },
  {
    id: 'copilot',
    name: 'Copilot in Fabric',
    shortDescription: 'AI assistant for code generation, data exploration, and insights.',
    // Source: learn.microsoft.com/en-us/fabric/fundamentals/copilot-fabric-overview
    fullDescription:
      'Copilot is the AI assistant built into Microsoft Fabric, available across all workloads. In Notebooks, generates and explains PySpark and SQL code. In Power BI, creates reports and measures from natural language. In Data Factory, suggests pipeline configurations. In Real-Time Intelligence, helps write KQL queries. Powered by Azure OpenAI, with data processed within the Microsoft trust boundary. Requires Fabric capacity F64 or higher or a trial.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/fundamentals/copilot-fabric-overview',
    layer: 'analytics',
    tags: ['AI', 'code generation', 'natural language', 'Azure OpenAI', 'assistant'],
    connections: ['notebook', 'power-bi', 'data-factory', 'eventhouse'],
  },
  {
    id: 'data-activator',
    name: 'Data Activator',
    shortDescription: 'Event-driven alerts and automated actions on live data.',
    // Source: learn.microsoft.com/en-us/fabric/data-activator/data-activator-introduction
    fullDescription:
      'Data Activator (formerly Reflex) is a no-code, event-driven automation capability in Microsoft Fabric. Monitor live data streams from Eventstream, Power BI reports, or Real-Time Dashboards and automatically trigger actions when defined conditions are met. Actions include Teams notifications, email alerts, Power Automate flows, and Fabric pipeline runs. No coding required — configure conditions and actions through a visual designer. Ideal for operational alerting and automated data-driven workflows.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/data-activator/data-activator-get-started',
    layer: 'analytics',
    tags: ['alerting', 'automation', 'no-code', 'event-driven', 'Power Automate'],
    connections: ['eventstream', 'real-time-dashboard', 'power-bi'],
  },

  // ── DELIVERY ──────────────────────────────────────────────────────────────

  {
    id: 'power-bi',
    name: 'Power BI',
    shortDescription: 'Interactive business intelligence reports and dashboards.',
    // Source: learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-overview
    fullDescription:
      'Power BI is Microsoft\'s business intelligence platform, fully integrated into Microsoft Fabric. Create interactive reports, dashboards, and semantic models (datasets) that connect directly to Lakehouse, Warehouse, and Eventhouse via DirectLake mode for near-real-time analytics without data import. Features drag-and-drop report building, 100+ visuals, AI-powered insights, natural language Q&A, and row-level security. Publish to workspaces for organization-wide sharing and collaboration.',
    officialUrl: 'https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-overview',
    layer: 'delivery',
    tags: ['BI', 'reports', 'dashboards', 'DirectLake', 'semantic model'],
    connections: ['lakehouse', 'warehouse', 'purview', 'data-activator'],
  },
  {
    id: 'paginated-report',
    name: 'Paginated Report',
    shortDescription: 'Pixel-perfect formatted reports designed for print and export.',
    // Source: learn.microsoft.com/en-us/power-bi/paginated-reports/paginated-reports-report-builder-power-bi
    fullDescription:
      'Paginated Reports in Microsoft Fabric are highly formatted, print-ready reports built on SQL Server Reporting Services (SSRS) technology. Designed for operational reporting scenarios requiring precise layout control — invoices, financial statements, regulatory filings, and multi-page documents. Connect to Fabric Warehouse, Lakehouse SQL endpoint, and Azure sources. Export to PDF, Excel, Word, CSV, and XML. Authored in Power BI Report Builder and published to Fabric workspaces.',
    officialUrl: 'https://learn.microsoft.com/en-us/power-bi/paginated-reports/paginated-reports-report-builder-power-bi',
    layer: 'delivery',
    tags: ['SSRS', 'print', 'export', 'PDF', 'formatted', 'operational'],
    connections: ['warehouse', 'lakehouse', 'power-bi'],
  },
  {
    id: 'purview',
    name: 'Microsoft Purview',
    shortDescription: 'Unified data governance, catalog, lineage, and compliance.',
    // Source: learn.microsoft.com/en-us/fabric/governance/microsoft-purview-fabric
    fullDescription:
      'Microsoft Purview is the unified data governance solution built into Microsoft Fabric, providing data catalog, lineage, classification, and compliance capabilities across the entire Fabric estate. Automatically scans and catalogs all Fabric items including Lakehouses, Warehouses, and Semantic Models. Tracks end-to-end data lineage from ingestion through delivery. Applies sensitivity labels for data protection. Enables data access policies and compliance reporting for regulated industries.',
    officialUrl: 'https://learn.microsoft.com/en-us/fabric/governance/microsoft-purview-fabric',
    layer: 'delivery',
    tags: ['governance', 'catalog', 'lineage', 'compliance', 'sensitivity labels'],
    connections: ['onelake', 'lakehouse', 'warehouse', 'power-bi', 'ml-model'],
  },

];

// ---------------------------------------------------------------------------
// LAYER ORDER (for graph layout)
// ---------------------------------------------------------------------------

export const INTRA_LAYER_ORDER: string[] = [
  'onelake',
  'data-factory', 'dataflows-gen2', 'eventstream',
  'lakehouse', 'warehouse', 'eventhouse',
  'notebook', 'spark-job', 'data-pipeline',
  'ml-experiment', 'ml-model', 'real-time-dashboard', 'copilot', 'data-activator',
  'power-bi', 'paginated-report', 'purview',
];

// ---------------------------------------------------------------------------
// SAMPLE WORKFLOWS (pre-built for initial state)
// ---------------------------------------------------------------------------

export const FABRIC_WORKFLOWS: Workflow[] = [
  {
    id: 'modern-data-warehouse',
    goal: 'Build a modern data warehouse for enterprise reporting',
    difficulty: 'intermediate',
    steps: [
      { serviceId: 'data-factory',    action: 'Ingest',    detail: 'Use Data Factory pipelines to pull data from ERP, CRM, and flat-file sources into Fabric.' },
      { serviceId: 'dataflows-gen2',  action: 'Transform', detail: 'Apply business logic and cleansing transforms using Power Query in Dataflows Gen2.' },
      { serviceId: 'warehouse',       action: 'Store',     detail: 'Load transformed data into the Fabric Warehouse using T-SQL stored procedures and fact/dimension tables.' },
      { serviceId: 'power-bi',        action: 'Report',    detail: 'Build DirectLake semantic models and interactive dashboards on top of the Warehouse.' },
      { serviceId: 'purview',         action: 'Govern',    detail: 'Apply sensitivity labels, track lineage, and enforce data policies across the warehouse estate.' },
    ],
  },
  {
    id: 'real-time-iot',
    goal: 'Build a real-time IoT monitoring and alerting platform',
    difficulty: 'advanced',
    steps: [
      { serviceId: 'eventstream',          action: 'Stream',   detail: 'Capture live IoT device telemetry from Azure IoT Hub via Eventstream.' },
      { serviceId: 'eventhouse',           action: 'Store',    detail: 'Route streams into Eventhouse KQL databases optimized for high-frequency time-series data.' },
      { serviceId: 'real-time-dashboard',  action: 'Visualize',detail: 'Build live operational dashboards with sub-second refresh from Eventhouse.' },
      { serviceId: 'data-activator',       action: 'Alert',    detail: 'Configure Data Activator rules to trigger Teams alerts or pipeline runs when thresholds are breached.' },
    ],
  },
];
