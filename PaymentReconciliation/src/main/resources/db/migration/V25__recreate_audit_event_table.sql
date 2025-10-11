-- Drop and recreate audit_event table with response_hash column
DROP TABLE IF EXISTS audit_event;

CREATE TABLE audit_event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    occurred_at DATETIME(6) NOT NULL,
    trace_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128),
    outcome VARCHAR(16) NOT NULL,
    client_ip VARCHAR(64),
    user_agent VARCHAR(256),
    details JSON,
    old_values JSON,
    new_values JSON,
    prev_hash VARCHAR(64) NOT NULL,
    hash VARCHAR(64) NOT NULL,
    response_hash VARCHAR(64),
    CONSTRAINT uq_audit_event UNIQUE (id)
);
