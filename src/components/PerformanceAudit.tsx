/**
 * src/components/PerformanceAudit.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * STEP 4-D · PERFORMANCE AUDIT
 *
 * Runs 4 benchmark queries on-demand and displays their execution times.
 * Confirms sub-100ms DuckDB-WASM performance for workshop participants.
 *
 * 💡 Data Engineering Insight:
 *   DuckDB-WASM executes SQL on columnar Parquet data using vectorised
 *   processing — aggregations over 1000 rows typically complete in 1–5 ms,
 *   proving that zero-server analytics is viable even for million-row datasets
 *   once the Parquet is pre-loaded into the browser's ArrayBuffer.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState } from 'react';
import { useDuckDB } from '../context/DuckDBContext';

interface BenchResult { label: string; ms: number; rows: number; pass: boolean; }

const BENCHMARKS = [
  {
    label: 'Region aggregation (GROUP BY)',
    sql:   `SELECT region, COUNT(*), SUM(contract_cost) FROM projects GROUP BY region`,
  },
  {
    label: 'Yearly trend (filter + GROUP BY)',
    sql:   `SELECT infra_year, COUNT(*) FROM projects WHERE contract_cost > 0 GROUP BY infra_year ORDER BY infra_year`,
  },
  {
    label: 'Type of work TOP 10',
    sql:   `SELECT type_of_work, COUNT(*) AS n FROM projects GROUP BY type_of_work ORDER BY n DESC LIMIT 10`,
  },
  {
    label: 'KPI single-row aggregation',
    sql:   `SELECT COUNT(*), SUM(contract_cost), AVG(cost_utilization_pct) FROM projects`,
  },
];

const S: Record<string, React.CSSProperties> = {
  box:  { background:'#1e293b', borderRadius:10, padding:'20px', marginBottom:16 },
  btn:  { background:'#3b82f6', color:'#fff', border:'none', borderRadius:6,
          padding:'8px 20px', fontSize:14, cursor:'pointer', marginBottom:16 },
  row:  { display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'8px 12px', borderRadius:6, marginBottom:6, fontSize:13 },
  pass: { background:'#052e16', border:'1px solid #166534', color:'#4ade80' },
  fail: { background:'#450a0a', border:'1px solid #7f1d1d', color:'#f87171' },
};

export function PerformanceAudit() {
  const { query, status } = useDuckDB();
  const [results, setResults] = useState<BenchResult[]>([]);
  const [running, setRunning] = useState(false);

  async function runBench() {
    if (status !== 'ready') return;
    setRunning(true);
    const out: BenchResult[] = [];

    for (const b of BENCHMARKS) {
      const t0   = performance.now();
      const rows = await query(b.sql);
      const ms   = +(performance.now() - t0).toFixed(2);
      out.push({ label: b.label, ms, rows: rows.length, pass: ms < 100 });
    }

    setResults(out);
    setRunning(false);
  }

  return (
    <div style={S.box}>
      <h3 style={{ color:'#e2e8f0', marginBottom:12, fontSize:15 }}>
        ⚡ Performance Audit — Sub-100 ms DuckDB-WASM Queries
      </h3>
      <button style={S.btn} onClick={runBench} disabled={running || status !== 'ready'}>
        {running ? 'Running…' : 'Run Benchmarks'}
      </button>

      {results.map((r) => (
        <div key={r.label} style={{ ...S.row, ...(r.pass ? S.pass : S.fail) }}>
          <span>{r.label}</span>
          <span style={{ fontWeight:700 }}>
            {r.ms} ms &nbsp;·&nbsp; {r.rows} rows &nbsp;
            {r.pass ? '✅ PASS' : '❌ > 100 ms'}
          </span>
        </div>
      ))}

      {results.length > 0 && (
        <p style={{ color:'#64748b', fontSize:12, marginTop:8 }}>
          All times measured with <code>performance.now()</code> in the browser.
          Open DevTools Console to see per-query logs from DuckDBContext.
        </p>
      )}
    </div>
  );
}
