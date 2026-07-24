/**
 * src/hooks/useTypeSummary.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Aggregates project count and total cost by type_of_work.
 * Filters by region and year when set.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { useDuckDB } from '../context/DuckDBContext';
import type { TypeSummary, DashboardFilters } from '../types';

export function useTypeSummary(filters: DashboardFilters) {
  const { query, status } = useDuckDB();
  const [data,    setData]    = useState<TypeSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== 'ready') return;

    const whereClauses: string[] = ['contract_cost > 0'];
    if (filters.region) whereClauses.push(`region = '${filters.region}'`);
    if (filters.year)   whereClauses.push(`infra_year = ${filters.year}`);

    const where = `WHERE ${whereClauses.join(' AND ')}`;

    const sql = `
      SELECT
        type_of_work,
        COUNT(*)           AS projects,
        SUM(contract_cost) AS total_cost
      FROM projects
      ${where}
      GROUP BY type_of_work
      ORDER BY projects DESC
      LIMIT 10
    `;

    setLoading(true);
    query<TypeSummary>(sql)
      .then(setData)
      .finally(() => setLoading(false));
  }, [status, filters.region, filters.year, query]);

  return { data, loading };
}
