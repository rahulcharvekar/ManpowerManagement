import { StatementFormat } from "./types/mt940";

const DEFAULT_API_BASE_URL = "http://localhost:8000";

const configuredBaseUrl = (
  (import.meta.env?.VITE_API_URL as string | undefined) ??
  (import.meta.env?.VITE_API_BASE_URL as string | undefined)
);

export const API_BASE_URL = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/$/, "")
  : DEFAULT_API_BASE_URL;

const STATEMENT_BASE = `${API_BASE_URL}/statements`;

export const STATEMENT_ENDPOINTS: Record<StatementFormat, {
  search: string;
  upload: string;
}> = {
  mt940: {
    search: `${STATEMENT_BASE}/mt940/search`,
    upload: `${STATEMENT_BASE}/mt940/search/upload`,
  },
  mt942: {
    search: `${STATEMENT_BASE}/mt942/search`,
    upload: `${STATEMENT_BASE}/mt942/search/upload`,
  },
  camt52: {
    search: `${STATEMENT_BASE}/iso20022/camt52/search`,
    upload: `${STATEMENT_BASE}/iso20022/camt52/search/upload`,
  },
  camt53: {
    search: `${STATEMENT_BASE}/iso20022/camt53/search`,
    upload: `${STATEMENT_BASE}/iso20022/camt53/search/upload`,
  },
};
