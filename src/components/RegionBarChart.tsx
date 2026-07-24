/**
 * src/components/RegionBarChart.tsx
 * Executive horizontal bar chart — Contract Cost by Region
 * Corporate palette: Deep Navy #1E3A8A base, Top performer highlighted in Teal #0F766E
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { RegionSummary } from '../types';

interface Props { data: RegionSummary[]; loading: boolean; }

const TOP_COLOR  = '#0F766E';
const BASE_COLOR = '#1E3A8A';

const S: React.CSSProperties = {
  background:'#1e293b', borderRadius:10, padding:'20px',
  border:'1px solid #334155',
};

export function RegionBarChart({ data, loading }: Props) {
  return (
    <div style={S}>
      <h3 style={{ color:'#f1f5f9', marginBottom:4, fontSize:15, fontWeight:700 }}>
        Top Allocations by Region
      </h3>
      <p style={{ color:'#64748b', fontSize:11, marginBottom:16 }}>
        Total contract cost (₱ Billion) — sorted descending
      </p>
      {loading ? <p style={{ color:'#64748b' }}>Loading…</p> : (
        <ResponsiveContainer width='100%' height={Math.max(280, data.length * 32)}>
          <BarChart data={data} layout='vertical' margin={{ left:10, right:30 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='#334155' horizontal={false} />
            <XAxis type='number' dataKey='total_cost_billion_php'
              tickFormatter={v => `₱${v}B`} stroke='#475569'
              tick={{ fill:'#94a3b8', fontSize:11 }} />
            <YAxis type='category' dataKey='region' width={180}
              stroke='#475569' tick={{ fill:'#cbd5e1', fontSize:11 }} />
            <Tooltip
              contentStyle={{ background:'#0f172a', border:'1px solid #334155', borderRadius:8 }}
              labelStyle={{ color:'#f1f5f9', fontWeight:600 }}
              formatter={(v: number) => [`₱ ${v.toFixed(3)} Billion`, 'Contract Cost']}
            />
            <Bar dataKey='total_cost_billion_php' radius={[0,4,4,0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === 0 ? TOP_COLOR : BASE_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
