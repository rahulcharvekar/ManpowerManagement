# Manpower Management API

FastAPI service providing statement search utilities for MT940, MT942, and ISO 20022 CAMT.052 / CAMT.053 messages.

## Requirements

- Python 3.11+
- Install dependencies:

```bash
pip install -r requirements.txt
# or
pip install .
```

Optional:
- `swift-parser` – leveraged when present for richer MT942 parsing (the application falls back to the built-in parser if the package is missing).

## Running locally

```bash
uvicorn app.main:app --reload
```

The service exposes OpenAPI docs at `http://localhost:8000/docs`.

## Available endpoints

All API routes are grouped under `/statements`:

- `POST /statements/mt940/search` – search within MT940 payload supplied in the request body.
- `POST /statements/mt940/search/upload` – search MT940 content uploaded as a file.
- `POST /statements/mt942/search` – search MT942 interim statements.
- `POST /statements/mt942/search/upload` – upload + search MT942 statements.
- `POST /statements/iso20022/camt52/search` – search CAMT.052 XML payloads.
- `POST /statements/iso20022/camt52/search/upload` – upload + search CAMT.052 XML.
- `POST /statements/iso20022/camt53/search` – search CAMT.053 XML payloads.
- `POST /statements/iso20022/camt53/search/upload` – upload + search CAMT.053 XML.

Each search endpoint accepts the same options: transaction reference, optional result limit, case-insensitive toggle, and a selector to restrict matching to bank references only.
