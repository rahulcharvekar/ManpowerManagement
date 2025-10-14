# Microservices Migration Roadmap

This document outlines the step-by-step migration plan from the existing monolithic Payment Reconciliation system to a microservices-based architecture with the following services:

- **User Auth Service** (authentication, RBAC)
- **Payment Flow Service** (worker, employer, board)
- **Reconciliation Service** (reconciliation logic)
- **Shared Service/Library** (logger, file upload, directory reader)

---

## 1. Preparation & Assessment
- Document all current modules, data flows, and dependencies in the monolith.
- Identify business domains and map them to the new microservices.
- Decide on JWT secret-based authentication for all services.

## 2. Define Microservice Boundaries
- **User Auth Service:** Handles login, registration, JWT issuance, role/permission management.
- **Payment Flow Service:** Manages workers, employers, boards, and payment processes.
- **Reconciliation Service:** Handles MT940 ingestion, matching, and reconciliation logic.
- **Shared Service/Library:** Provides reusable utilities (logging, file upload, directory reading).

## 3. Set Up Repositories & Initial Structure
- Create a separate repository for each service (or use a mono-repo with clear subfolders).
- Scaffold each service with its own build file (pom.xml), Dockerfile, and `src/` structure.
- Set up a shared library repo for common utilities.

## 4. Extract & Refactor Code
- Move authentication and authorization code (e.g., `auth/` folder) to the User Auth Service.
- Move worker, employer, board, and payment logic to the Payment Flow Service.
- Move reconciliation logic and MT940 handling to the Reconciliation Service.
- Move shared utilities to the Shared Service/Library.
- Refactor package names and dependencies as needed.

## 5. Database Strategy
- Each service should have its own schema or database.
- For multi-board support, use a `board_id` column for multi-tenancy, or separate DBs per board if strict isolation is needed.

## 6. Implement JWT Authentication
- User Auth Service issues JWTs signed with a shared secret.
- All other services validate JWTs using the shared secret (configured in `application.yml`).
- Services extract user identity and roles/permissions from JWT claims for authorization.

## 7. Service Communication
- Use REST APIs for synchronous communication between services.
- For async/event-driven flows, consider a message broker (e.g., RabbitMQ, Kafka).
- Use service discovery (e.g., Eureka, Consul, Kubernetes DNS) for dynamic endpoint resolution.

## 8. CI/CD & Deployment
- Set up independent CI/CD pipelines for each service.
- Use Docker Compose or Kubernetes for local and cloud orchestration.
- Store secrets (e.g., JWT secret) securely (environment variables, Azure Key Vault, etc.).

## 9. Testing & Validation
- Write unit, integration, and contract tests for each service.
- Test JWT validation and RBAC enforcement in all services.
- Validate inter-service communication and data flows.

## 10. Gradual Migration & Cutover
- Use the Strangler Fig pattern: incrementally route traffic from the monolith to new services.
- Start with low-risk modules (e.g., reconciliation), then move core flows (auth, payment).
- Decommission monolith once all functionality is migrated.

---

## Example Folder Structure

```
/user-auth-service
/payment-flow-service
/reconciliation-service
/shared-lib
/docker-compose.yml
```

---

## Security & Best Practices
- Use HTTPS for all service communication.
- Validate JWTs in every service using the shared secret.
- Enforce RBAC in business logic using claims from JWT.
- Log all authentication and authorization events.
- Regularly rotate secrets and review access controls.

---

## References
- [Spring Security JWT Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)
- [Microservices Patterns](https://microservices.io/patterns/index.html)
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)
