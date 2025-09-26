import { FormEvent, useMemo, useState } from "react";
import { searchStatement, searchStatementFromUpload } from "./api/statements";
import { ResultTable } from "./components/ResultTable";
import {
  SearchScope,
  StatementFormat,
  StatementSearchRequest,
  StatementSearchResponse,
} from "./types/mt940";

const DEFAULT_SCOPE: SearchScope = "all";
const DEFAULT_FORMAT: StatementFormat = "mt940";

type ActiveTab = "paste" | "upload";

type StatementConfig = {
  label: string;
  description: string;
  uploadAccept: string;
  placeholder: string;
  referenceHint: string;
};

const STATEMENT_CONFIG: Record<StatementFormat, StatementConfig> = {
  mt940: {
    label: "MT940 Statement",
    description: "Standard end-of-day bank statement (MT940).",
    uploadAccept: ".txt,.mt940,.sta",
    placeholder: "Paste the raw MT940 statement here",
    referenceHint: "e.g. BANKREF001",
  },
  mt942: {
    label: "MT942 Interim Statement",
    description: "Intraday interim bank statement (MT942).",
    uploadAccept: ".txt,.mt942,.sta",
    placeholder: "Paste the raw MT942 interim statement here",
    referenceHint: "e.g. BANKREF001",
  },
  camt52: {
    label: "CAMT.052 Account Report",
    description: "ISO 20022 bank-to-customer account report (camt.052).",
    uploadAccept: ".xml",
    placeholder: "Paste the CAMT.052 XML payload here",
    referenceHint: "e.g. END_TO_END_ID",
  },
  camt53: {
    label: "CAMT.053 Statement",
    description: "ISO 20022 bank-to-customer statement (camt.053).",
    uploadAccept: ".xml",
    placeholder: "Paste the CAMT.053 XML payload here",
    referenceHint: "e.g. END_TO_END_ID",
  },
};

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("paste");
  const [statementFormat, setStatementFormat] = useState<StatementFormat>(DEFAULT_FORMAT);
  const [reference, setReference] = useState("");
  const [statement, setStatement] = useState("");
  const [limit, setLimit] = useState<number | "">("");
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [searchScope, setSearchScope] = useState<SearchScope>(DEFAULT_SCOPE);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [result, setResult] = useState<StatementSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const statementConfig = useMemo(
    () => STATEMENT_CONFIG[statementFormat],
    [statementFormat]
  );

  const resetState = () => {
    setResult(null);
    setErrorMessage(null);
  };

  const resolveLimit = () => {
    if (limit === "" || limit === null) {
      return undefined;
    }
    return Number(limit);
  };

  const buildPayload = (): StatementSearchRequest => ({
    statement,
    reference,
    case_insensitive: caseInsensitive,
    limit: resolveLimit(),
    search_in: searchScope,
  });

  const validateCommonInputs = ({ requireStatement, requireFile }: { requireStatement?: boolean; requireFile?: boolean; }) => {
    if (!reference.trim()) {
      setErrorMessage("Please provide a transaction reference to search for.");
      return false;
    }
    if (requireStatement && !statement.trim()) {
      setErrorMessage("Please provide statement contents before searching.");
      return false;
    }
    if (requireFile && !uploadFile) {
      setErrorMessage("Please choose a statement file to upload.");
      return false;
    }
    return true;
  };

  const handlePasteSubmit = async (event: FormEvent) => {
    event.preventDefault();
    resetState();

    if (!validateCommonInputs({ requireStatement: true })) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchStatement(statementFormat, buildPayload());
      setResult(response);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to search the statement. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = async (event: FormEvent) => {
    event.preventDefault();
    resetState();

    if (!validateCommonInputs({ requireFile: true })) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchStatementFromUpload({
        format: statementFormat,
        reference,
        statementFile: uploadFile as File,
        caseInsensitive,
        limit: resolveLimit(),
        searchIn: searchScope,
      });
      setResult(response);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to search the uploaded statement. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderSummary = () => {
    if (!result) {
      return null;
    }

    return (
      <div className="summary-grid">
        <div className="summary-item">
          <strong>Matches returned</strong>
          <span>{result.matched_count}</span>
        </div>
        <div className="summary-item">
          <strong>Total matches</strong>
          <span>
            {result.total_matches}
            {result.has_more && <span className="badge">More available</span>}
          </span>
        </div>
        <div className="summary-item">
          <strong>Total transactions scanned</strong>
          <span>{result.total_transactions}</span>
        </div>
      </div>
    );
  };

  const handleFormatChange = (value: StatementFormat) => {
    setStatementFormat(value);
    setStatement("");
    setUploadFile(null);
    resetState();
  };

  return (
    <div>
      <h1>Statement Search Toolkit</h1>
      <p>
        Search MT940/MT942 SWIFT statements and ISO 20022 CAMT.052 / CAMT.053
        messages against a transaction reference. The frontend calls the FastAPI
        backend under <code>/statements</code>. Set the backend URL via the
        <code> VITE_API_BASE_URL</code> environment variable if required.
      </p>

      <div className="card">
        <fieldset>
          <label htmlFor="statement-format">Statement type</label>
          <select
            id="statement-format"
            value={statementFormat}
            onChange={(event) => handleFormatChange(event.target.value as StatementFormat)}
          >
            {Object.entries(STATEMENT_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
          <p style={{ marginTop: "0.5rem", color: "#475569" }}>{statementConfig.description}</p>
        </fieldset>

        <div className="tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === "paste" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("paste");
              resetState();
            }}
          >
            Paste Statement
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("upload");
              resetState();
            }}
          >
            Upload File
          </button>
        </div>

        {errorMessage && <div className="error-banner">{errorMessage}</div>}

        {activeTab === "paste" ? (
          <form onSubmit={handlePasteSubmit}>
            <fieldset>
              <label htmlFor="reference">Transaction reference</label>
              <input
                id="reference"
                type="text"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder={statementConfig.referenceHint}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="statement">Statement content</label>
              <textarea
                id="statement"
                value={statement}
                onChange={(event) => setStatement(event.target.value)}
                placeholder={statementConfig.placeholder}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="limit">Maximum matches (optional)</label>
              <input
                id="limit"
                type="number"
                min={1}
                value={limit}
                onChange={(event) => {
                  const value = event.target.value;
                  setLimit(value === "" ? "" : Number(value));
                }}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="search-scope">Search in</label>
              <select
                id="search-scope"
                value={searchScope}
                onChange={(event) => setSearchScope(event.target.value as SearchScope)}
              >
                <option value="all">All fields</option>
                <option value="bank_reference">Bank reference only</option>
              </select>
            </fieldset>

            <fieldset>
              <label>
                <input
                  type="checkbox"
                  checked={caseInsensitive}
                  onChange={(event) => setCaseInsensitive(event.target.checked)}
                />
                Case-insensitive matching
              </label>
            </fieldset>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUploadSubmit}>
            <fieldset>
              <label htmlFor="reference-upload">Transaction reference</label>
              <input
                id="reference-upload"
                type="text"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder={statementConfig.referenceHint}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="statement-file">Statement file</label>
              <input
                id="statement-file"
                type="file"
                accept={statementConfig.uploadAccept}
                onChange={(event) => {
                  const files = event.target.files;
                  setUploadFile(files && files.length > 0 ? files[0] : null);
                }}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="limit-upload">Maximum matches (optional)</label>
              <input
                id="limit-upload"
                type="number"
                min={1}
                value={limit}
                onChange={(event) => {
                  const value = event.target.value;
                  setLimit(value === "" ? "" : Number(value));
                }}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="search-scope-upload">Search in</label>
              <select
                id="search-scope-upload"
                value={searchScope}
                onChange={(event) => setSearchScope(event.target.value as SearchScope)}
              >
                <option value="all">All fields</option>
                <option value="bank_reference">Bank reference only</option>
              </select>
            </fieldset>

            <fieldset>
              <label>
                <input
                  type="checkbox"
                  checked={caseInsensitive}
                  onChange={(event) => setCaseInsensitive(event.target.checked)}
                />
                Case-insensitive matching
              </label>
            </fieldset>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Uploading..." : "Search"}
            </button>
          </form>
        )}
      </div>

      {isLoading && <p>Scanning statement...</p>}

      {result && (
        <div className="card">
          <h2>Search results</h2>
          {renderSummary()}
          <ResultTable matches={result.matches} />
        </div>
      )}
    </div>
  );
}

export default App;
