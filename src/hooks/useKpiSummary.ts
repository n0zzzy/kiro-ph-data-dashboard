/**
 * src/hooks/useKpiSummary.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single-row KPI query — powers the stat cards at the top of the dashboard.
 * Respects all active filters.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { useDuckDB } from '../context/DuckDBContext';
import type { DashboardFilters } from '../types';

export interface KpiData {
  total_projects:         number;
  total_cost_billion_php: number;
  avg_utilization_pct:    number;
  completed_projects:     number;
  total_regions:          number;
}

export function useKpiSummary(filters: DashboardFilters) {
  const { query, status } = useDuckDB();
  const [data,    setData]    = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== 'ready') return;

    const whereClauses: string[] = ['1=1'];
    if (filters.region)     whereClauses.push(`region = '${filters.region}'`);
    if (filters.year)       whereClauses.push(`infra_year = ${filters.year}`);
    if (filters.typeOfWork) whereClauses.push(`type_of_work = '${filters.typeOfWork}'`);

    const where = `WHERE ${whereClauses.join(' AND ')}`;

    const sql = `
      SELECT
        COUNT(*)                                      AS total_projects,
        ROUND(SUM(contract_cost) / 1e9, 2)           AS total_cost_billion_php,
        ROUND(AVG(cost_utilization_pct), 1)          AS avg_utilization_pct,
        SUM(CASE WHEN completion_status = 'Completed'
                 THEN 1 ELSE 0 END)                  AS completed_projects,
        COUNT(DISTINCT region)                        AS total_regions
      FROM projects
      ${where}
    `;

    setLoading(true);
    query<KpiData>(sql)
      .then((rows) => setData(rows[0] ?? null))
      .finally(() => setLoading(false));
  }, [status, filters.region, filters.year, filters.typeOfWork, query]);

  return { data, loading };
}
