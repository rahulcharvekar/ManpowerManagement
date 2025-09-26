import { STATEMENT_ENDPOINTS } from "../config";
import {
  SearchScope,
  StatementFormat,
  StatementSearchRequest,
  StatementSearchResponse,
} from "../types/mt940";

interface UploadSearchParams {
  format: StatementFormat;
  reference: string;
  statementFile: File;
  limit?: number | null;
  caseInsensitive?: boolean;
  searchIn?: SearchScope;
}

async function parseError(response: Response): Promise<Error> {
  try {
    const data = await response.json();
    if (data?.detail) {
      if (Array.isArray(data.detail)) {
        return new Error(data.detail.map((item: unknown) => String(item)).join(", "));
      }
      return new Error(String(data.detail));
    }
    return new Error(JSON.stringify(data));
  } catch (error) {
    return new Error(response.statusText || "Unknown error");
  }
}

export async function searchStatement(
  format: StatementFormat,
  payload: StatementSearchRequest
): Promise<StatementSearchResponse> {
  const endpoint = STATEMENT_ENDPOINTS[format].search;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as StatementSearchResponse;
}

export async function searchStatementFromUpload(
  params: UploadSearchParams
): Promise<StatementSearchResponse> {
  const { format } = params;
  const formData = new FormData();
  formData.append("reference", params.reference);
  formData.append("statement_file", params.statementFile);
  formData.append("case_insensitive", String(params.caseInsensitive ?? true));
  if (params.searchIn) {
    formData.append("search_in", params.searchIn);
  }
  if (params.limit !== undefined && params.limit !== null) {
    formData.append("limit", String(params.limit));
  }

  const endpoint = STATEMENT_ENDPOINTS[format].upload;
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as StatementSearchResponse;
}
