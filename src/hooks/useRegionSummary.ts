/**
 * src/hooks/useRegionSummary.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * STEP 4-B · CLIENT-SIDE SQL AGGREGATION — Region Summary
 *
 * Aggregates total projects, cost, utilisation rate, and completion status
 * per region. Re-runs whenever the year or typeOfWork filter changes.
 *
 * 💡 Data Engineering Insight:
 *   Pushing GROUP BY aggregations into DuckDB-WASM means the browser engine
 *   reads only the relevant Parquet column chunks (predicate pushdown), so
 *   the JS heap never holds the full 1000-row dataset — only the ~15 result
 *   rows come back to React, keeping re-render cost near zero.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { useDuckDB } from '../context/DuckDBContext';
import type { RegionSummary, DashboardFilters } from '../types';

export function useRegionSummary(filters: DashboardFilters) {
  const { query, status } = useDuckDB();
  const [data,    setData]    = useState<RegionSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== 'ready') return;

    const whereClauses: string[] = ['contract_cost > 0'];
    if (filters.year)       whereClauses.push(`infra_year = ${filters.year}`);
    if (filters.typeOfWork) whereClauses.push(`type_of_work = '${filters.typeOfWork}'`);

    const where = `WHERE ${whereClauses.join(' AND ')}`;

    const sql = `
      SELECT
        region,
        COUNT(*)                                        AS projects,
        ROUND(SUM(contract_cost) / 1e9, 3)             AS total_cost_billion_php,
        ROUND(AVG(cost_utilization_pct), 1)            AS avg_utilization_pct,
        SUM(CASE WHEN completion_status = 'Completed'
                 THEN 1 ELSE 0 END)                    AS completed,
        SUM(CASE WHEN completion_status != 'Completed'
                 THEN 1 ELSE 0 END)                    AS ongoing
      FROM projects
      ${where}
      GROUP BY region
      ORDER BY total_cost_billion_php DESC
    `;

    setLoading(true);
    query<RegionSummary>(sql)
      .then(setData)
      .finally(() => setLoading(false));
  }, [status, filters.year, filters.typeOfWork, query]);

  return { data, loading };
}
