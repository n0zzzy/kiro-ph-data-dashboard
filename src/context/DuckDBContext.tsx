/**
 * src/context/DuckDBContext.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * STEP 4-A · DuckDB-WASM INITIALISATION & PARQUET LOADING
 *
 * This context:
 *   1. Boots DuckDB-WASM once when the app mounts (single WASM instance)
 *   2. Fetches the Parquet file from /public/data/ via the browser's Fetch API
 *   3. Registers the file buffer in DuckDB's virtual file system
 *   4. Creates a persistent VIEW so all hooks can query it with plain SQL
 *   5. Exposes the async `query<T>()` helper with built-in perf timing
 *
 * 💡 Data Engineering Insight:
 *   Initialising DuckDB-WASM once and sharing the connection through React
 *   Context avoids re-spinning the WASM runtime on every component mount —
 *   the ~2 MB WASM binary is parsed once and lives in the browser's memory
 *   for the session lifetime. All subsequent SQL queries execute against the
 *   in-memory Parquet data with zero network round-trips, delivering
 *   sub-100 ms analytical latency even on commodity hardware.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import type { QueryStatus } from '../types';

// ── Context shape ─────────────────────────────────────────────────────────────
interface DuckDBContextValue {
  status: QueryStatus;
  error:  string | null;
  /** Run any SQL and get typed rows back. Returns [] on error. */
  query: <T = Record<string, unknown>>(sql: string) => Promise<T[]>;
}

const DuckDBContext = createContext<DuckDBContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function DuckDBProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [error,  setError]  = useState<string | null>(null);

  // Keep the connection in a ref — stable across renders
  const connRef = useRef<duckdb.AsyncDuckDBConnection | null>(null);
  const dbRef   = useRef<duckdb.AsyncDuckDB | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setStatus('loading');

        // ── 1. Select the best WASM bundle for this browser ───────────────────
        const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

        const workerUrl = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker!}");`], {
            type: 'text/javascript',
          })
        );
        const worker = new Worker(workerUrl);
        const logger = new duckdb.ConsoleLogger();
        const db     = new duckdb.AsyncDuckDB(logger, worker);

        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(workerUrl);

        // ── 2. Fetch the Parquet file and register in DuckDB's VFS ────────────
        const response = await fetch('/data/flood_control_cleaned.parquet');
        if (!response.ok) throw new Error(`Failed to fetch Parquet: ${response.status}`);

        const buffer = await response.arrayBuffer();
        await db.registerFileBuffer(
          'flood_control.parquet',
          new Uint8Array(buffer)
        );

        // ── 3. Open a connection and create a persistent VIEW ─────────────────
        const conn = await db.connect();
        await conn.query(`
          CREATE OR REPLACE VIEW projects AS
          SELECT * FROM read_parquet('flood_control.parquet')
        `);

        // Quick sanity: log row count to the browser console
        const result = await conn.query(`SELECT COUNT(*) AS n FROM projects`);
        const rows   = result.toArray();
        console.log(
          `%c[DuckDB-WASM] ✔ Ready — ${rows[0]?.n?.toString() ?? '?'} rows loaded`,
          'color: #4ade80; font-weight: bold;'
        );

        if (!cancelled) {
          dbRef.current   = db;
          connRef.current = conn;
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error('[DuckDB-WASM] Init failed:', msg);
          setError(msg);
          setStatus('error');
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // ── query helper with performance timing ─────────────────────────────────
  async function query<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    if (!connRef.current) return [];

    // 💡 Performance audit — logs every query time to the browser console
    const t0     = performance.now();
    const result = await connRef.current.query(sql);
    const ms     = (performance.now() - t0).toFixed(2);

    console.log(
      `%c[DuckDB-WASM] ${ms} ms%c — ${sql.slice(0, 80).replace(/\s+/g, ' ')}…`,
      'color: #60a5fa; font-weight: bold;',
      'color: #94a3b8;'
    );

    // Convert Arrow table → plain JS objects
    return result.toArray().map((row) => {
      const obj: Record<string, unknown> = {};
      for (const key of Object.keys(row)) {
        const val = (row as Record<string, unknown>)[key];
        // BigInt → Number for JSON/Recharts compatibility
        obj[key] = typeof val === 'bigint' ? Number(val) : val;
      }
      return obj as T;
    });
  }

  return (
    <DuckDBContext.Provider value={{ status, error, query }}>
      {children}
    </DuckDBContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useDuckDB(): DuckDBContextValue {
  const ctx = useContext(DuckDBContext);
  if (!ctx) throw new Error('useDuckDB must be used inside <DuckDBProvider>');
  return ctx;
}
