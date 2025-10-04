# Azure Container Apps Deployment Guide

This guide explains how to deploy the Payment Reconciliation application to Azure Container Apps using Docker images and Azure MySQL Flexible Server.

## Prerequisites

1. **Azure CLI** installed and configured
2. **Docker** installed locally
3. **Azure subscription** with appropriate permissions
4. **Azure MySQL Flexible Server** already set up
5. **Docker Hub account** or another Docker registry

## Configuration Changes Made

### 1. Dockerfile Updates
- ✅ **Ephemeral Storage**: Uses `/tmp` directory for uploads, logs, and MT940 files
- ✅ **Azure Container Apps Optimization**: Optimized for container environment
- ✅ **Health Checks**: Built-in health check endpoint
- ✅ **Non-root User**: Runs as non-root user for security

### 2. Application Configuration (application-prod.yml)
- ✅ **Azure MySQL Flexible Server**: Configured for `paymentreconciliation.mysql.database.azure.com`
- ✅ **SSL Required**: Configured with `sslMode=REQUIRED`
- ✅ **Ephemeral Storage Paths**: All file operations use `/tmp` directory
- ✅ **Container Optimizations**: Reduced thread pools and connections for container environment

## Deployment Options

### Option 1: Using Docker Hub (Recommended for Public Images)

#### Step 1: Build and Push Docker Image

```bash
# 1. Build the Docker image
docker build -t your-docker-username/payment-reconciliation:latest .

# 2. Login to Docker Hub
docker login

# 3. Push the image
docker push your-docker-username/payment-reconciliation:latest
```

#### Step 2: Deploy to Azure Container Apps

Use the provided deployment script:

```bash
# 1. Edit the deploy-simple.sh script and update:
#    - DOCKER_IMAGE="your-docker-username/payment-reconciliation:latest"
#    - DB_USERNAME="your_mysql_username"
#    - DB_PASSWORD="your_mysql_password"

# 2. Run the deployment script
./deploy-simple.sh
```

### Option 2: Manual Azure CLI Deployment

#### Step 1: Create Resource Group and Environment

```bash
# Create resource group
az group create --name payment-reconciliation-rg --location "East US"

# Create Container Apps environment
az containerapp env create \
  --name payment-reconciliation-env \
  --resource-group payment-reconciliation-rg \
  --location "East US"
```

#### Step 2: Deploy Container App

```bash
az containerapp create \
  --name payment-reconciliation-app \
  --resource-group payment-reconciliation-rg \
  --environment payment-reconciliation-env \
  --image your-docker-username/payment-reconciliation:latest \
  --target-port 8080 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 1.0 \
  --memory 2Gi \
  --secrets \
    db-username="your_mysql_username" \
    db-password="your_mysql_password" \
  --env-vars \
    SPRING_PROFILES_ACTIVE=prod \
    DB_USERNAME=secretref:db-username \
    DB_PASSWORD=secretref:db-password \
    FILE_UPLOAD_DIR=/tmp/uploads \
    MT940_STATEMENTS_PATH=/tmp/mt940-statements \
    LOG_FILE=/tmp/logs/payment-reconciliation.log
```

## Azure MySQL Flexible Server Configuration

Your MySQL server should be configured with:

```
Hostname: paymentreconciliation.mysql.database.azure.com
Port: 3306
Database: paymentreconciliation_prod
SSL Mode: Required
```

### Database Connection String
The application will use:
```
jdbc:mysql://paymentreconciliation.mysql.database.azure.com:3306/paymentreconciliation_prod?useSSL=true&requireSSL=true&sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=utf8&useUnicode=true
```

## Ephemeral Storage Usage

The application uses Azure Container Apps ephemeral storage for:

| Purpose | Path | Description |
|---------|------|-------------|
| File Uploads | `/tmp/uploads` | Temporary storage for uploaded worker payment files |
| MT940 Files | `/tmp/mt940-statements` | Bank statement files for reconciliation |
| Log Files | `/tmp/logs` | Application log files |

> **Note**: Ephemeral storage is temporary and will be lost when the container restarts. For persistent storage, consider using Azure File Shares or Azure Blob Storage.

## Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `SPRING_PROFILES_ACTIVE` | Spring profile | `prod` |
| `DB_USERNAME` | MySQL username | `secretref:db-username` |
| `DB_PASSWORD` | MySQL password | `secretref:db-password` |
| `FILE_UPLOAD_DIR` | Upload directory | `/tmp/uploads` |
| `MT940_STATEMENTS_PATH` | MT940 files path | `/tmp/mt940-statements` |
| `LOG_FILE` | Log file path | `/tmp/logs/payment-reconciliation.log` |

## Post-Deployment Tasks

### 1. Verify Deployment
```bash
# Check application status
az containerapp show --name payment-reconciliation-app --resource-group payment-reconciliation-rg --query 'properties.runningStatus'

# Get application URL
az containerapp show --name payment-reconciliation-app --resource-group payment-reconciliation-rg --query 'properties.configuration.ingress.fqdn'
```

### 2. Monitor Application
```bash
# View logs
az containerapp logs show --name payment-reconciliation-app --resource-group payment-reconciliation-rg --follow

# Check health endpoint
curl https://your-app-url.azurecontainerapps.io/actuator/health
```

### 3. Scale Application (if needed)
```bash
az containerapp update \
  --name payment-reconciliation-app \
  --resource-group payment-reconciliation-rg \
  --min-replicas 2 \
  --max-replicas 5
```

### 4. Update Secrets (if needed)
```bash
az containerapp secret set \
  --name payment-reconciliation-app \
  --resource-group payment-reconciliation-rg \
  --secrets db-username=new_username db-password=new_password
```

## Application Endpoints

Once deployed, your application will be available at:

- **Main Application**: `https://your-app-url.azurecontainerapps.io`
- **Health Check**: `https://your-app-url.azurecontainerapps.io/actuator/health`
- **Swagger UI**: `https://your-app-url.azurecontainerapps.io/swagger-ui/index.html`
- **Metrics**: `https://your-app-url.azurecontainerapps.io/actuator/metrics`

## Troubleshooting

### Common Issues

1. **Container not starting**: Check logs using `az containerapp logs show`
2. **Database connection failed**: Verify MySQL server firewall allows Azure services
3. **Application timeout**: Increase memory or CPU allocation
4. **File upload issues**: Ensure `/tmp` directory has proper permissions

### Debugging Commands

```bash
# View detailed container app configuration
az containerapp show --name payment-reconciliation-app --resource-group payment-reconciliation-rg

# Check container logs
az containerapp logs show --name payment-reconciliation-app --resource-group payment-reconciliation-rg --tail 50

# Test database connectivity
az mysql flexible-server show --name your-mysql-server --resource-group your-mysql-rg
```

## Security Considerations

1. **Secrets Management**: Database credentials are stored as Container App secrets
2. **SSL/TLS**: All database connections use SSL/TLS encryption
3. **Non-root User**: Container runs as non-root user (UID 1001)
4. **Network Security**: Consider using VNet integration for additional security

## Cost Optimization

1. **Auto-scaling**: Configure appropriate min/max replicas based on usage
2. **Resource Allocation**: Start with 1.0 CPU and 2Gi memory, adjust as needed
3. **Regional Deployment**: Deploy in the same region as your MySQL server

## Support

For issues related to:
- **Azure Container Apps**: Check Azure documentation or Azure support
- **Application Issues**: Review application logs and Spring Boot documentation
- **Database Issues**: Check Azure MySQL Flexible Server documentation
