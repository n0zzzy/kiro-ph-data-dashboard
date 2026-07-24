// ── Shared TypeScript types for the dashboard ─────────────────────────────────

export interface RegionSummary {
  region:                  string;
  projects:                number;
  total_cost_billion_php:  number;
  avg_utilization_pct:     number;
  completed:               number;
  ongoing:                 number;
}

export interface YearlySummary {
  infra_year:   number;
  projects:     number;
  total_cost:   number;
}

export interface TypeSummary {
  type_of_work: string;
  projects:     number;
  total_cost:   number;
}

export interface ProjectRow {
  global_id:            string;
  project_id:           string;
  region:               string;
  province:             string;
  municipality:         string;
  type_of_work:         string;
  infra_year:           number;
  contract_cost:        number;
  abc:                  number;
  cost_utilization_pct: number | null;
  completion_status:    string;
  contractor:           string;
  longitude:            number;
  latitude:             number;
}

export interface DashboardFilters {
  region:    string;   // '' = all
  year:      string;   // '' = all
  typeOfWork: string;  // '' = all
}

export type QueryStatus = 'idle' | 'loading' | 'ready' | 'error';
