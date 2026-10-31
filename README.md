# 🌊 PH Flood Control Projects Dashboard

**A serverless analytics dashboard for Philippine flood control infrastructure projects. The database runs entirely in your browser.**

DuckDB-WASM loads a Parquet dataset straight into the browser and runs SQL analytics client-side. There is no backend, no API, and no database server, and filtered queries return in **under 100 ms**.

![React](https://img.shields.io/badge/React_18-0d1117?style=for-the-badge&logo=react&logoColor=dc2626)
![TypeScript](https://img.shields.io/badge/TypeScript-0d1117?style=for-the-badge&logo=typescript&logoColor=dc2626)
![DuckDB](https://img.shields.io/badge/DuckDB--WASM-0d1117?style=for-the-badge&logo=duckdb&logoColor=dc2626)
![Vite](https://img.shields.io/badge/Vite-0d1117?style=for-the-badge&logo=vite&logoColor=dc2626)

---

## ✨ Features

| | |
|---|---|
| **📊 KPI cards** | Total projects, total contract cost (₱ billions), average cost utilization, completed projects, regions covered |
| **🗺️ Region breakdown** | Bar chart of projects and spend per region |
| **📈 Yearly trend** | Line chart of project volume over the years |
| **🥧 Type of work** | Pie chart of the most common infrastructure work types |
| **🎛️ Live filters** | Filter by region, year, and type of work. Every chart and KPI re-queries instantly |
| **⚡ Performance audit** | Built-in benchmark that runs the dashboard's core SQL queries and checks each one stays under 100 ms |

## 🏗️ Architecture

```
public/data/flood_control_cleaned.parquet
              │  fetched once
              ▼
   ┌───────────────────────────┐
   │  DuckDB-WASM (in browser) │  ← DuckDBContext
   └─────────────┬─────────────┘
                 │  SQL (GROUP BY, filters, aggregates)
     ┌───────────┼─────────────┬──────────────┐
     ▼           ▼             ▼              ▼
 useKpiSummary useRegionSummary useYearlySummary useTypeSummary
     │           │             │              │
     ▼           ▼             ▼              ▼
  KpiCards  RegionBarChart  YearLineChart  TypePieChart   (Recharts)
```

- **`src/context/DuckDBContext.tsx`** boots DuckDB-WASM, registers the Parquet file as a `projects` table, and exposes a `query()` helper
- **`src/hooks/*`** has one hook per visualization. Each builds a filtered SQL query and returns typed rows
- **`src/components/*`** holds the presentational chart components (Recharts)

## 🚀 Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build
```

## 🧠 Why DuckDB-WASM?

- **Zero infrastructure.** Deploy as static files on any CDN.
- **Columnar Parquet + vectorized SQL** keeps aggregations over the full dataset fast.
- **Privacy by default.** The data never leaves the user's machine after download.

---

<sub>Built by <a href="https://github.com/n0zzzy">Russel Carlo</a> with Kiro.</sub>
