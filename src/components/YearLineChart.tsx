/**
 * src/components/YearLineChart.tsx
 * Dual-axis line chart — projects count + cost trend by year
 */
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { YearlySummary } from '../types';

interface Props { data: YearlySummary[]; loading: boolean; }

const S: React.CSSProperties = {
  background:'#1e293b', borderRadius:10, padding:'20px',
  border:'1px solid #334155',
};

export function YearLineChart({ data, loading }: Props) {
  const chartData = data.map(d => ({
    ...d,
    cost_billion: +(d.total_cost / 1e9).toFixed(3),
  }));

  return (
    <div style={S}>
      <h3 style={{ color:'#f1f5f9', marginBottom:4, fontSize:15, fontWeight:700 }}>
        Yearly Investment Trend
      </h3>
      <p style={{ color:'#64748b', fontSize:11, marginBottom:16 }}>
        Project count and cost allocation over time
      </p>
      {loading ? <p style={{ color:'#64748b' }}>Loading…</p> : (
        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={chartData} margin={{ right:20, left:0 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
            <XAxis dataKey='infra_year' stroke='#475569'
              tick={{ fill:'#94a3b8', fontSize:11 }} />
            <YAxis yAxisId='left' stroke='#60a5fa'
              tick={{ fill:'#94a3b8', fontSize:11 }} label={{ value:'Projects', angle:-90, position:'insideLeft', fill:'#64748b', fontSize:10 }} />
            <YAxis yAxisId='right' orientation='right' stroke='#34d399'
              tick={{ fill:'#94a3b8', fontSize:11 }}
              tickFormatter={v => `₱${v}B`} />
            <Tooltip
              contentStyle={{ background:'#0f172a', border:'1px solid #334155', borderRadius:8 }}
              labelStyle={{ color:'#f1f5f9' }}
            />
            <Legend wrapperStyle={{ color:'#94a3b8', fontSize:12, paddingTop:8 }} />
            <Line yAxisId='left' type='monotone' dataKey='projects'
              stroke='#60a5fa' strokeWidth={2.5} dot={{ r:4, fill:'#60a5fa' }}
              activeDot={{ r:6 }} name='Projects' />
            <Line yAxisId='right' type='monotone' dataKey='cost_billion'
              stroke='#34d399' strokeWidth={2.5} dot={{ r:4, fill:'#34d399' }}
              activeDot={{ r:6 }} name='Cost (₱B)' />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
