# PROJECT_SPEC.md — Microsoft Fabric Ecosystem Visualizer

## Usecase Summary
An interactive web app that maps all 18 Microsoft Fabric services across their pipeline layers in a single graph. Users describe a data or analytics goal in natural language and get a step-by-step workflow showing exactly which Fabric services to use and in what order. An Explore Mode lets users click any service node to read its official description instantly.

---

## Chosen Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Framework | Next.js 16 App Router | Same product type as NVIDIA visualizer — proven architecture. SSR for API routes, static for UI. |
| Styling | Tailwind CSS v4 | Utility-first, fast iteration, dark theme support matches Fabric's dark UI aesthetic |
| Visualization | @xyflow/react v12 (React Flow) | Proven for node-graph ecosystem maps. Custom node types, fitView, onNodeClick all required. |
| AI/LLM | Groq SDK + llama-3.3-70b-versatile | Speed-critical (sub-second workflow gen), structured JSON output, temperature 0.1 for determinism |
| Font | Inter | Clean, modern, close to Segoe UI which Fabric uses natively |
| Language | TypeScript | Full type safety across data, UI, and API layers |

**Ruled out:**
- Vite + React: no colocated API routes, needs separate backend for Groq
- D3.js: too low-level for node-graph interaction, React Flow handles this better
- OpenAI: slower inference than Groq for this structured use case, higher cost

**Brand colors:**
- Primary: `#0078D4` (Microsoft Blue)
- Accent: `#00B7C3` (Fabric Teal)
- Background: `#0a0a0a` (near-black, matches Fabric dark mode)
- Text: `#ffffff` + `#94a3b8` (slate)

---

## Service Data Schema

```typescript
interface Service {
  id: string
  name: string
  shortDescription: string
  fullDescription: string
  officialUrl: string
  layer: Layer
  tags: string[]
  connections: string[] // other service IDs
}

interface Workflow {
  id: string
  goal: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: WorkflowStep[]
}

interface WorkflowStep {
  serviceId: string
  action: string
  detail: string
}

type Layer = 'foundation' | 'ingestion' | 'storage' | 'processing' | 'analytics' | 'delivery'
type AppMode = 'initial' | 'workflow' | 'explore'
```

---

## The 18 Services

### Foundation
1. **OneLake** — unified storage layer underpinning all Fabric services

### Ingestion
2. **Data Factory** — enterprise data integration, 150+ connectors
3. **Dataflows Gen2** — low-code Power Query ETL/ELT
4. **Eventstream** — real-time event capture, routing, and transformation

### Storage
5. **Lakehouse** — unified data lake + SQL analytics in Delta format
6. **Warehouse** — T-SQL serverless analytics warehouse
7. **Eventhouse** — high-performance real-time analytics store (KQL)

### Processing
8. **Notebook** — Apache Spark notebooks for big data and ML
9. **Spark Job Definition** — scheduled and batch Spark workloads
10. **Data Pipeline** — orchestration, scheduling, and workflow automation

### Analytics & AI
11. **ML Experiment** — track, compare, and manage ML training runs
12. **ML Model** — register, version, and deploy machine learning models
13. **Real-Time Dashboard** — live KQL-powered dashboards with auto-refresh
14. **Copilot in Fabric** — AI assistant for code gen, data exploration, and insights
15. **Data Activator** — event-driven alerts and automated actions on live data

### Delivery
16. **Power BI** — interactive business intelligence reports and dashboards
17. **Paginated Report** — pixel-perfect formatted reports for print and export
18. **Microsoft Purview** — data catalog, lineage, governance, and compliance

---

## Layer Labels

| Layer ID | Display Label | Sublabel |
|----------|--------------|---------|
| foundation | Foundation | Unified storage |
| ingestion | Ingestion | Connect & move data |
| storage | Storage | Persist & organize |
| processing | Processing | Transform & compute |
| analytics | Analytics & AI | Analyze & predict |
| delivery | Delivery | Report & govern |

---

## Feature List

### P1 — Must Ship
- Full 18-node graph layout organized by layer
- Natural language goal → AI-generated step-by-step workflow
- Workflow mode: step navigation with node highlighting and fitView
- Explore mode: click any node to see official description in sidebar
- Mobile responsive (hamburger sidebar, touch-friendly graph)
- Official docs link per service

### P2 — Nice to Have
- Animated edge highlighting showing service connections in workflow
- Layer filter to focus on a single pipeline stage
- Copy workflow as text summary

### P3 — Future
- Vertical-specific workflows (Healthcare, Finance, Retail)
- Comparison mode (Fabric vs other platforms)
- User-saved workflows

---

## App Modes / States

| Mode | Trigger | Graph Behavior | Sidebar |
|------|---------|---------------|---------|
| `initial` | App load | All nodes visible, no highlight | Goal input + Explore button |
| `workflow` | Goal submitted | Active step node highlighted, fitView | Step-by-step navigator |
| `explore` | Explore button | All nodes visible, clickable | Clicked node description |

---

## Role Assignments

- **Full Stack Engineer:** Scaffold Next.js 16 App Router, define all types, create /data and /api structure, wire Groq API route
- **Frontend Engineer:** Build graph layout (EcosystemGraph, ServiceNode, Sidebar), implement all 3 modes, mobile responsive layout, animations
- **AI/ML Engineer:** Design Groq prompt with full service ID list, validate structured output, handle edge cases
- **Solutions Engineer:** Populate all 18 service entries with accurate names, descriptions, URLs sourced from learn.microsoft.com
- **DevOps:** .env.local setup (GROQ_API_KEY), verify /public assets, confirm clean build before ship
- **Test Engineer:** Pre-ship checklist, URL validation, 10 prompt tests, mobile layout verification

---

## Sources
- [Microsoft Fabric Overview](https://learn.microsoft.com/en-us/fabric/fundamentals/microsoft-fabric-overview)
- [Microsoft Fabric Official Site](https://www.microsoft.com/en-us/microsoft-fabric)
- [Fabric UX System](https://aka.ms/fabricux)
