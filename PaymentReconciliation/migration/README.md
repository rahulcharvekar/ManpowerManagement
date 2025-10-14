# Migration Scripts and Roadmap

This folder contains scripts and documentation to migrate from the monolithic Payment Reconciliation system to a microservices-based architecture.

## Contents
- `create_schemas.sql`: Creates new schemas for each microservice.
- `move_user_auth_tables.sql`: Moves user auth tables to the new schema.
- `move_payment_flow_tables.sql`: Moves payment flow tables to the new schema.
- `move_reconciliation_tables.sql`: Moves reconciliation tables to the new schema.
- `microservices-migration-roadmap.md`: Step-by-step migration plan.
- `microservices-db-schema-mapping.md`: Table-to-service mapping.

## Usage
1. Run `create_schemas.sql` to create new schemas.
2. Run the move scripts to copy tables and data to the new schemas.
3. Update your microservices to use the new schemas.
4. Refer to the roadmap and mapping files for guidance.
