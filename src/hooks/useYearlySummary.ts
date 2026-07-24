/**
 * src/hooks/useYearlySummary.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Aggregates project count and total cost per year.
 * Filters by region and typeOfWork when set.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { useDuckDB } from '../context/DuckDBContext';
import type { YearlySummary, DashboardFilters } from '../types';

export function useYearlySummary(filters: DashboardFilters) {
  const { query, status } = useDuckDB();
  const [data,    setData]    = useState<YearlySummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== 'ready') return;

    const whereClauses: string[] = ['infra_year > 0', 'contract_cost > 0'];
    if (filters.region)     whereClauses.push(`region = '${filters.region}'`);
    if (filters.typeOfWork) whereClauses.push(`type_of_work = '${filters.typeOfWork}'`);

    const where = `WHERE ${whereClauses.join(' AND ')}`;

    const sql = `
      SELECT
        infra_year,
        COUNT(*)              AS projects,
        SUM(contract_cost)    AS total_cost
      FROM projects
      ${where}
      GROUP BY infra_year
      ORDER BY infra_year ASC
    `;

    setLoading(true);
    query<YearlySummary>(sql)
      .then(setData)
      .finally(() => setLoading(false));
  }, [status, filters.region, filters.typeOfWork, query]);

  return { data, loading };
}
