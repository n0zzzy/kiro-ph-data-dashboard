/**
 * src/components/TypePieChart.tsx
 * Clean horizontal bar chart — project count by type of work
 * Executive donut removed in favor of readable bar layout
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { TypeSummary } from '../types';

interface Props { data: TypeSummary[]; loading: boolean; }

const COLORS = ['#0F766E','#1E3A8A','#7C3AED','#B45309','#BE185D',
                '#0369A1','#A16207','#15803D','#6D28D9','#9F1239'];

const S: React.CSSProperties = {
  background:'#1e293b', borderRadius:10, padding:'20px',
  border:'1px solid #334155',
};

// Truncate long type-of-work labels
function shorten(text: string, max = 30): string {
  if (!text) return 'Unknown';
  // Remove common prefixes to save space
  const cleaned = text
    .replace(/^CONSTRUCTION OF /i, '')
    .replace(/^REHABILITATION \/ MAJOR REPAIR OF /i, 'Rehab: ');
  return cleaned.length > max ? cleaned.slice(0, max) + '…' : cleaned;
}

export function TypePieChart({ data, loading }: Props) {
  const chartData = data.map(d => ({
    ...d,
    short_label: shorten(d.type_of_work),
  }));

  return (
    <div style={S}>
      <h3 style={{ color:'#f1f5f9', marginBottom:4, fontSize:15, fontWeight:700 }}>
        Composition by Type of Work
      </h3>
      <p style={{ color:'#64748b', fontSize:11, marginBottom:16 }}>
        Project count per category — top 10
      </p>
      {loading ? <p style={{ color:'#64748b' }}>Loading…</p> : (
        <ResponsiveContainer width='100%' height={Math.max(260, chartData.length * 30)}>
          <BarChart data={chartData} layout='vertical' margin={{ left:10, right:30 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='#334155' horizontal={false} />
            <XAxis type='number' dataKey='projects'
              stroke='#475569' tick={{ fill:'#94a3b8', fontSize:11 }} />
            <YAxis type='category' dataKey='short_label' width={180}
              stroke='#475569' tick={{ fill:'#cbd5e1', fontSize:10 }} />
            <Tooltip
              contentStyle={{ background:'#0f172a', border:'1px solid #334155', borderRadius:8 }}
              labelStyle={{ color:'#f1f5f9', fontWeight:600 }}
              labelFormatter={(_: unknown, payload: Array<{ payload?: { type_of_work?: string } }>) =>
                payload?.[0]?.payload?.type_of_work ?? ''
              }
              formatter={(v: number) => [v.toLocaleString(), 'Projects']}
            />
            <Bar dataKey='projects' radius={[0,4,4,0]}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
