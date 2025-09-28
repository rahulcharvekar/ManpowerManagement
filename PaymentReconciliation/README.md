# Payment Reconciliation Microservice

Spring Boot microservice scaffold ready for containerization and deployment to Azure Container Apps. Includes sample domain entities for worker, employer, and board payment records.

## Prerequisites

- Java 17+
- Maven 3.9+
- Docker 24+
- (Optional) Azure CLI with the `containerapp` extension installed
- (Optional) Bicep CLI or Azure CLI `bicep` support for IaC deployments

## Local Development

```bash
mvn spring-boot:run
```

Health endpoint: `GET http://localhost:8080/api/v1/health`

## Build & Test

```bash
mvn clean verify
```

An in-memory H2 database is preconfigured; domain-specific entities reside under packages like `com.example.paymentreconciliation.worker.entity`.

## API Documentation

Once the application is running, visit `http://localhost:8080/swagger-ui.html` for the interactive Swagger UI, or fetch the OpenAPI document from `http://localhost:8080/v3/api-docs`.

## Build Container Image

```bash
docker build -t payment-reconciliation:latest .
```

## Deploy to Azure Container Apps

1. Create an Azure Container Registry (ACR) or reuse an existing one and authenticate Docker.
2. Tag and push the image:
   ```bash
   docker tag payment-reconciliation:latest <acr-login-server>/payment-reconciliation:latest
   docker push <acr-login-server>/payment-reconciliation:latest
   ```
3. Create a Container Apps environment and app:
   ```bash
   az containerapp env create \
     --name payment-recon-env \
     --resource-group <resource-group> \
     --location <azure-region>

   az containerapp create \
     --name payment-reconciliation \
     --resource-group <resource-group> \
     --environment payment-recon-env \
     --image <acr-login-server>/payment-reconciliation:latest \
     --target-port 8080 \
     --ingress external \
     --cpu 0.5 \
     --memory 1Gi
   ```
4. Update the app with new images as needed:
   ```bash
   az containerapp update \
     --name payment-reconciliation \
     --resource-group <resource-group> \
     --image <acr-login-server>/payment-reconciliation:latest
   ```

### Optional: Deploy with Bicep

Use `infra/containerapp.bicep` to deploy the Azure Container App and its environment declaratively:

```bash
az deployment group create \
  --resource-group <resource-group> \
  --template-file infra/containerapp.bicep \
  --parameters \
      location=<azure-region> \
      environmentName=payment-recon-env \
      containerAppName=payment-reconciliation \
      registryServer=<acr-login-server> \
      registryUsername=<acr-username> \
      registryPassword=<acr-password> \
      containerImage=<acr-login-server>/payment-reconciliation:latest
```

## Configuration

Use environment variables or Azure Container App secrets to provide runtime configuration, for example database connection strings or API keys. Add additional Spring configuration in `src/main/resources/application.yml`.

## Utilities

- `FileUploadUtility` handles storing multipart uploads to disk with sanitised file names.
- `Mt940Parser` wraps the Prowide Core library for resilient SWIFT MT940 parsing.
- `LoggerFactoryProvider` centralises logger creation for reuse across modules.
