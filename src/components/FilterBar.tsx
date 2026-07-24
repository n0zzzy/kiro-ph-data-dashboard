/**
 * src/components/FilterBar.tsx
 * Responsive dropdown filters — Region, Year, Type of Work + Reset
 */
import type { DashboardFilters } from '../types';

interface Props {
  filters:  DashboardFilters;
  options:  { regions: string[]; years: number[]; typesOfWork: string[] };
  onChange: (f: DashboardFilters) => void;
}

export function FilterBar({ filters, options, onChange }: Props) {
  const set = (key: keyof DashboardFilters, val: string) =>
    onChange({ ...filters, [key]: val });

  const hasFilters = filters.region || filters.year || filters.typeOfWork;

  return (
    <div style={S.bar} role="toolbar" aria-label="Dashboard filters">
      <div style={S.group}>
        <label style={S.label} htmlFor="f-region">Region</label>
        <select id="f-region" style={S.select} value={filters.region}
          onChange={e => set('region', e.target.value)}>
          <option value=''>All Regions</option>
          {options.regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div style={S.group}>
        <label style={S.label} htmlFor="f-year">Year</label>
        <select id="f-year" style={S.select} value={filters.year}
          onChange={e => set('year', e.target.value)}>
          <option value=''>All Years</option>
          {options.years.map(y => <option key={y} value={String(y)}>{y}</option>)}
        </select>
      </div>
      <div style={S.group}>
        <label style={S.label} htmlFor="f-type">Type</label>
        <select id="f-type" style={{ ...S.select, minWidth:200 }} value={filters.typeOfWork}
          onChange={e => set('typeOfWork', e.target.value)}>
          <option value=''>All Types</option>
          {options.typesOfWork.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {hasFilters && (
        <button style={S.reset}
          onClick={() => onChange({ region:'', year:'', typeOfWork:'' })}>
          ✕ Reset
        </button>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  bar:    { display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end',
            padding:'12px 24px', background:'#1e293b', borderBottom:'1px solid #334155' },
  group:  { display:'flex', flexDirection:'column', gap:3 },
  label:  { color:'#94a3b8', fontSize:10, textTransform:'uppercase', letterSpacing:0.5 },
  select: { background:'#0f172a', color:'#e2e8f0', border:'1px solid #475569',
            borderRadius:6, padding:'7px 12px', fontSize:13, cursor:'pointer',
            minWidth:140 },
  reset:  { background:'#dc2626', color:'#fff', border:'none', borderRadius:6,
            padding:'7px 16px', fontSize:12, cursor:'pointer', fontWeight:600,
            alignSelf:'flex-end' },
};
