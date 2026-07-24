/**
 * src/hooks/useFilterOptions.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Loads the distinct dropdown values for region, year, and typeOfWork.
 * Runs once when DuckDB is ready — these rarely change.
 *
 * 💡 Data Engineering Insight:
 *   Fetching filter options with a single DISTINCT query on startup means
 *   the dropdown UI is always consistent with the actual data — no hardcoded
 *   lists that go stale when the Parquet is updated and redeployed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { useDuckDB } from '../context/DuckDBContext';

interface FilterOptions {
  regions:      string[];
  years:        number[];
  typesOfWork:  string[];
}

export function useFilterOptions(): FilterOptions {
  const { query, status } = useDuckDB();
  const [options, setOptions] = useState<FilterOptions>({
    regions: [], years: [], typesOfWork: [],
  });

  useEffect(() => {
    if (status !== 'ready') return;

    Promise.all([
      query<{ region: string }>(
        `SELECT DISTINCT region FROM projects WHERE region != 'Unknown' ORDER BY region`
      ),
      query<{ infra_year: number }>(
        `SELECT DISTINCT infra_year FROM projects WHERE infra_year > 0 ORDER BY infra_year`
      ),
      query<{ type_of_work: string }>(
        `SELECT DISTINCT type_of_work FROM projects WHERE type_of_work != 'UNKNOWN' ORDER BY type_of_work`
      ),
    ]).then(([regions, years, types]) => {
      setOptions({
        regions:     regions.map((r) => r.region),
        years:       years.map((y) => y.infra_year),
        typesOfWork: types.map((t) => t.type_of_work),
      });
    });
  }, [status, query]);

  return options;
}
