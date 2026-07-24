/**
 * src/App.tsx
 * Executive-grade dashboard layout — responsive grid, polished styling
 */
import { useState } from 'react';
import { useDuckDB } from './context/DuckDBContext';
import { FilterBar } from './components/FilterBar';
import { KpiCards } from './components/KpiCards';
import { RegionBarChart } from './components/RegionBarChart';
import { YearLineChart } from './components/YearLineChart';
import { TypePieChart } from './components/TypePieChart';
import { PerformanceAudit } from './components/PerformanceAudit';
import { useFilterOptions } from './hooks/useFilterOptions';
import { useKpiSummary } from './hooks/useKpiSummary';
import { useRegionSummary } from './hooks/useRegionSummary';
import { useYearlySummary } from './hooks/useYearlySummary';
import { useTypeSummary } from './hooks/useTypeSummary';
import type { DashboardFilters } from './types';

export default function App() {
  const { status, error } = useDuckDB();
  const [filters, setFilters] = useState<DashboardFilters>({
    region: '', year: '', typeOfWork: '',
  });

  const options     = useFilterOptions();
  const kpi         = useKpiSummary(filters);
  const regionData  = useRegionSummary(filters);
  const yearlyData  = useYearlySummary(filters);
  const typeData    = useTypeSummary(filters);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (status === 'loading' || status === 'idle') return (
    <div style={styles.center}>
      <div style={{ fontSize:48, marginBottom:16 }}>🌊</div>
      <p style={{ fontSize:18, color:'#60a5fa', fontWeight:600 }}>
        Initialising DuckDB-WASM…
      </p>
      <p style={{ fontSize:13, color:'#64748b', marginTop:8 }}>
        Loading Parquet data into your browser. No server required.
      </p>
    </div>
  );

  // ── Error state ─────────────────────────────────────────────────────────────
  if (status === 'error') return (
    <div style={styles.center}>
      <div style={{ fontSize:48, marginBottom:16 }}>❌</div>
      <p style={{ fontSize:18, color:'#f87171' }}>DuckDB-WASM failed</p>
      <code style={{ fontSize:12, color:'#94a3b8', marginTop:8, maxWidth:500, wordBreak:'break-all' }}>
        {error}
      </code>
    </div>
  );

  // ── Dashboard ───────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:28 }}>🌊</span>
          <div>
            <h1 style={styles.title}>PH Flood Control Projects</h1>
            <p style={styles.subtitle}>
              Executive Dashboard · {kpi.data?.total_projects.toLocaleString() ?? '…'} projects
              · DuckDB-WASM · All queries client-side
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <FilterBar filters={filters} options={options} onChange={setFilters} />

      {/* KPI Row */}
      <KpiCards data={kpi.data} loading={kpi.loading} />

      {/* Row 1: Region bar chart (full width) */}
      <div style={styles.section}>
        <RegionBarChart data={regionData.data} loading={regionData.loading} />
      </div>

      {/* Row 2: Yearly trend + Type breakdown */}
      <div style={styles.grid2}>
        <YearLineChart data={yearlyData.data} loading={yearlyData.loading} />
        <TypePieChart  data={typeData.data}   loading={typeData.loading} />
      </div>

      {/* Performance audit */}
      <div style={styles.section}>
        <PerformanceAudit />
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>
          Built with Vite + React + DuckDB-WASM + Recharts · Data from&nbsp;
          <a href="https://bettergov.ph/flood-control-projects"
            target="_blank" rel="noopener" style={{ color:'#60a5fa' }}>
            bettergov.ph
          </a>
        </p>
      </footer>
    </div>
  );
}

// ── Inline styles (responsive-friendly) ─────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page:    { minHeight:'100vh', background:'#0f172a', paddingBottom:40 },
  center:  { display:'flex', flexDirection:'column', alignItems:'center',
             justifyContent:'center', height:'100vh', textAlign:'center', padding:20 },
  header:  { padding:'20px 24px', borderBottom:'1px solid #1e293b' },
  title:   { color:'#f1f5f9', fontSize:22, fontWeight:800, letterSpacing:-0.5 },
  subtitle:{ color:'#64748b', fontSize:12, marginTop:2 },
  section: { padding:'0 24px', marginBottom:16 },
  grid2:   { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))',
             gap:16, padding:'0 24px', marginBottom:16 },
  footer:  { textAlign:'center', padding:'24px', color:'#475569', fontSize:12,
             borderTop:'1px solid #1e293b' },
};
