/**
 * src/components/KpiCards.tsx
 * Executive KPI stat cards — responsive flex, formatted numbers
 */
import type { KpiData } from '../hooks/useKpiSummary';

interface Props { data: KpiData | null; loading: boolean; }

const cards = (d: KpiData) => [
  { label: 'Total Projects',       value: d.total_projects.toLocaleString(),               color:'#60a5fa', icon:'📊' },
  { label: 'Total Cost',           value: `₱ ${d.total_cost_billion_php.toFixed(2)} B`,   color:'#34d399', icon:'💰' },
  { label: 'Avg Utilisation',      value: `${d.avg_utilization_pct ?? 0}%`,                color:'#fbbf24', icon:'📈' },
  { label: 'Completed',            value: d.completed_projects.toLocaleString(),            color:'#a78bfa', icon:'✅' },
  { label: 'Regions',              value: d.total_regions.toLocaleString(),                 color:'#f472b6', icon:'🗺️' },
];

export function KpiCards({ data, loading }: Props) {
  if (loading || !data) return (
    <div style={S.row}><p style={{ color:'#64748b', padding:16 }}>Loading KPIs…</p></div>
  );

  return (
    <div style={S.row}>
      {cards(data).map(c => (
        <div key={c.label} style={S.card}>
          <div style={S.iconRow}>
            <span style={{ fontSize:18 }}>{c.icon}</span>
            <span style={{ ...S.val, color: c.color }}>{c.value}</span>
          </div>
          <div style={S.lbl}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  row:     { display:'flex', gap:12, flexWrap:'wrap', padding:'16px 24px' },
  card:    { flex:'1 1 150px', background:'#1e293b', borderRadius:10, padding:'16px 18px',
             border:'1px solid #334155', transition:'border-color 0.2s' },
  iconRow: { display:'flex', alignItems:'center', gap:8, marginBottom:6 },
  val:     { fontSize:22, fontWeight:700 },
  lbl:     { fontSize:11, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.5 },
};
