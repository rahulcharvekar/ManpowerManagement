# Azure Container Apps Deployment Guide

This guide explains how to deploy the Payment Reconciliation application to Azure Container Apps with production-ready configuration.

## 🏗️ Architecture Overview

### Azure Resources
- **Azure Container Apps**: Serverless container hosting
- **Azure Container Registry (ACR)**: Container image storage
- **Azure Database for MySQL**: Production database
- **Log Analytics Workspace**: Application monitoring and logging
- **Azure Key Vault**: Secure secrets management (optional)

### Container Configuration
- **Base Image**: `eclipse-temurin:17-jre-alpine` (Production optimized)
- **Security**: Non-root user execution
- **Monitoring**: Health checks and probes
- **Scaling**: Auto-scaling based on HTTP requests
- **Logging**: Structured JSON logging to Azure Monitor

## 🚀 Deployment Options

### Option 1: Automated Deployment Script

```bash
# Make script executable
chmod +x deploy-azure.sh

# Run deployment
./deploy-azure.sh
```

### Option 2: Manual Azure CLI Deployment

```bash
# 1. Create resource group
az group create --name payment-reconciliation-rg --location eastus

# 2. Create Container Registry
az acr create \
  --name paymentreconciliationacr \
  --resource-group payment-reconciliation-rg \
  --sku Basic \
  --admin-enabled true

# 3. Build and push image
az acr login --name paymentreconciliationacr
docker build -t paymentreconciliationacr.azurecr.io/payment-reconciliation:latest .
docker push paymentreconciliationacr.azurecr.io/payment-reconciliation:latest

# 4. Deploy using Bicep
az deployment group create \
  --resource-group payment-reconciliation-rg \
  --template-file infra/containerapp.bicep \
  --parameters @infra/containerapp.parameters.json
```

### Option 3: GitHub Actions CI/CD

1. **Set up GitHub Secrets:**
   ```
   AZURE_CREDENTIALS: Service Principal JSON
   DB_CONNECTION_STRING: MySQL connection string
   DB_USERNAME: Database username
   DB_PASSWORD: Database password
   ```

2. **Trigger Deployment:**
   - Push to `main` branch
   - Manual workflow dispatch

## ⚙️ Configuration Parameters

### Environment Variables (Production)

| Variable | Description | Example |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `prod` |
| `DB_URL` | Database connection string | `jdbc:mysql://server:3306/db` |
| `DB_USERNAME` | Database username | `adminuser@server` |
| `DB_PASSWORD` | Database password | `SecurePassword123!` |
| `FILE_UPLOAD_DIR` | File upload directory | `/app/uploads` |
| `JAVA_OPTS` | JVM optimization flags | `-Xms512m -Xmx768m -XX:+UseG1GC` |
| `SERVER_PORT` | Application port | `8080` |

### Resource Allocation

| Resource | Development | Production |
|----------|-------------|------------|
| CPU | 0.25 cores | 0.5 cores |
| Memory | 512 Mi | 1 Gi |
| Min Replicas | 1 | 1 |
| Max Replicas | 3 | 10 |

### Scaling Configuration

- **HTTP Concurrent Requests**: 10 per replica
- **Scale-out**: Automatic based on request load
- **Scale-in**: Gradual scale-down after load decreases

## 🗄️ Database Setup

### Azure Database for MySQL

```sql
-- Create production database
CREATE DATABASE paymentreconciliation_prod;

-- Create application user
CREATE USER 'appuser'@'%' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON paymentreconciliation_prod.* TO 'appuser'@'%';

-- Enable SSL (recommended)
ALTER USER 'appuser'@'%' REQUIRE SSL;
FLUSH PRIVILEGES;
```

### Connection String Format

```
jdbc:mysql://servername.mysql.database.azure.com:3306/paymentreconciliation_prod?useSSL=true&requireSSL=true&serverTimezone=UTC
```

## 📊 Monitoring and Logging

### Health Endpoints

- **Liveness**: `/actuator/health` (Container restarts if unhealthy)
- **Readiness**: `/actuator/health/readiness` (Traffic routing control)

### Log Analytics Queries

```kql
// Application errors
ContainerAppConsoleLogs_CL
| where ContainerName_s == "payment-reconciliation-app"
| where Log_s contains "ERROR"
| order by TimeGenerated desc

// Performance metrics
ContainerAppConsoleLogs_CL
| where Log_s contains "Performance"
| project TimeGenerated, Log_s
```

### Monitoring Dashboards

- **Azure Monitor**: Built-in metrics and alerts
- **Application Insights**: APM and distributed tracing (optional)
- **Log Analytics**: Custom queries and dashboards

## 🔒 Security Configuration

### Container Security
- ✅ **Non-root user**: Application runs as `appuser` (UID 1001)
- ✅ **Minimal base image**: Alpine Linux for reduced attack surface
- ✅ **No package managers**: Runtime image contains only JRE
- ✅ **Health checks**: Automatic restart on failure

### Network Security
- ✅ **HTTPS only**: TLS termination at ingress
- ✅ **Private networking**: Container-to-database communication
- ✅ **Firewall rules**: Database access restricted to Azure services

### Secrets Management
- ✅ **Azure Key Vault**: Secure secrets storage (recommended)
- ✅ **Container Apps secrets**: Built-in secrets management
- ✅ **Environment variables**: Encrypted at rest

## 🚨 Troubleshooting

### Common Issues

1. **Container fails to start**
   ```bash
   # Check container logs
   az containerapp logs show \
     --name payment-reconciliation-app \
     --resource-group payment-reconciliation-rg
   ```

2. **Database connection issues**
   ```bash
   # Test connectivity
   az containerapp exec \
     --name payment-reconciliation-app \
     --resource-group payment-reconciliation-rg \
     --command "nc -zv mysql-server.mysql.database.azure.com 3306"
   ```

3. **Application not receiving traffic**
   ```bash
   # Check ingress configuration
   az containerapp ingress show \
     --name payment-reconciliation-app \
     --resource-group payment-reconciliation-rg
   ```

### Debug Commands

```bash
# View container app details
az containerapp show \
  --name payment-reconciliation-app \
  --resource-group payment-reconciliation-rg

# Scale manually
az containerapp update \
  --name payment-reconciliation-app \
  --resource-group payment-reconciliation-rg \
  --min-replicas 2 \
  --max-replicas 5

# Update environment variables
az containerapp update \
  --name payment-reconciliation-app \
  --resource-group payment-reconciliation-rg \
  --set-env-vars KEY=VALUE
```

## 💰 Cost Optimization

### Recommendations
- **Use consumption billing**: Pay only for actual usage
- **Configure appropriate scaling**: Avoid over-provisioning
- **Monitor resource utilization**: Adjust CPU/memory based on metrics
- **Use Azure Reserved Instances**: For predictable workloads

### Cost Monitoring
```bash
# View resource costs
az consumption usage list \
  --resource-group payment-reconciliation-rg \
  --start-date 2024-01-01 \
  --end-date 2024-01-31
```

## 🔄 CI/CD Pipeline

### GitHub Actions Features
- ✅ **Automated testing**: Run unit tests on every commit
- ✅ **Security scanning**: Container image vulnerability scanning
- ✅ **Multi-environment**: Support for dev/staging/prod deployments
- ✅ **Rollback capability**: Easy rollback to previous versions
- ✅ **Zero-downtime deployments**: Blue-green deployment strategy

### Deployment Process
1. Code push to `main` branch
2. Automated testing
3. Docker image build and push
4. Container app update with new image
5. Health check verification
6. Traffic routing to new version

This configuration ensures your Payment Reconciliation application runs reliably and securely in Azure Container Apps with production-grade monitoring and scaling capabilities.
