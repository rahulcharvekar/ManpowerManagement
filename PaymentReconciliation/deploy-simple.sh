#!/bin/bash

# Simple Azure Container Apps deployment script for Payment Reconciliation Application
# Using Docker Hub public image

set -e

# Configuration variables - MODIFY THESE ACCORDING TO YOUR SETUP
RESOURCE_GROUP="payment-reconciliation-rg"
CONTAINER_APP="payment-reconciliation-app"
CONTAINER_APP_ENV="payment-reconciliation-env"
LOCATION="East US"
DOCKER_IMAGE="your-docker-username/payment-reconciliation:latest"  # Replace with your Docker image

# Database credentials - REPLACE WITH YOUR ACTUAL VALUES
DB_USERNAME="your_db_username"
DB_PASSWORD="your_db_password"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Azure Container Apps Deployment Script${NC}"
echo -e "${GREEN}Payment Reconciliation Application${NC}"
echo "=================================================="

# Function to check if Azure CLI is installed and user is logged in
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    if ! command -v az &> /dev/null; then
        echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    if ! az account show &> /dev/null; then
        echo -e "${RED}❌ Not logged in to Azure CLI. Please run 'az login' first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check completed${NC}"
}

# Function to create resource group if it doesn't exist
create_resource_group() {
    echo -e "${YELLOW}📦 Creating resource group if it doesn't exist...${NC}"
    
    if ! az group show --name ${RESOURCE_GROUP} &> /dev/null; then
        echo "Creating resource group: ${RESOURCE_GROUP}"
        az group create --name ${RESOURCE_GROUP} --location "${LOCATION}"
        echo -e "${GREEN}✅ Resource group created${NC}"
    else
        echo -e "${BLUE}ℹ️  Resource group ${RESOURCE_GROUP} already exists${NC}"
    fi
}

# Function to create Container Apps environment if it doesn't exist
create_container_env() {
    echo -e "${YELLOW}🌐 Creating Container Apps environment if it doesn't exist...${NC}"
    
    if ! az containerapp env show --name ${CONTAINER_APP_ENV} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
        echo "Creating Container Apps environment: ${CONTAINER_APP_ENV}"
        az containerapp env create \
            --name ${CONTAINER_APP_ENV} \
            --resource-group ${RESOURCE_GROUP} \
            --location "${LOCATION}"
        echo -e "${GREEN}✅ Container Apps environment created${NC}"
    else
        echo -e "${BLUE}ℹ️  Container Apps environment ${CONTAINER_APP_ENV} already exists${NC}"
    fi
}

# Function to deploy or update container app
deploy_container_app() {
    echo -e "${YELLOW}🚀 Deploying to Azure Container Apps...${NC}"
    
    # Check if container app exists
    if az containerapp show --name ${CONTAINER_APP} --resource-group ${RESOURCE_GROUP} &> /dev/null; then
        echo "Updating existing container app..."
        az containerapp update \
            --name ${CONTAINER_APP} \
            --resource-group ${RESOURCE_GROUP} \
            --image ${DOCKER_IMAGE}
    else
        echo "Creating new container app..."
        az containerapp create \
            --name ${CONTAINER_APP} \
            --resource-group ${RESOURCE_GROUP} \
            --environment ${CONTAINER_APP_ENV} \
            --image ${DOCKER_IMAGE} \
            --target-port 8080 \
            --ingress external \
            --min-replicas 1 \
            --max-replicas 3 \
            --cpu 1.0 \
            --memory 2Gi \
            --secrets \
                db-username="${DB_USERNAME}" \
                db-password="${DB_PASSWORD}" \
            --env-vars \
                SPRING_PROFILES_ACTIVE=prod \
                DB_USERNAME=secretref:db-username \
                DB_PASSWORD=secretref:db-password \
                FILE_UPLOAD_DIR=/tmp/uploads \
                MT940_STATEMENTS_PATH=/tmp/mt940-statements \
                LOG_FILE=/tmp/logs/payment-reconciliation.log
    fi
    
    echo -e "${GREEN}✅ Container app deployed successfully${NC}"
}

# Function to get container app URL
get_app_url() {
    echo -e "${YELLOW}🔗 Getting application URL...${NC}"
    
    APP_URL=$(az containerapp show \
        --name ${CONTAINER_APP} \
        --resource-group ${RESOURCE_GROUP} \
        --query "properties.configuration.ingress.fqdn" \
        --output tsv)
    
    echo -e "${GREEN}🌐 Application URL: https://${APP_URL}${NC}"
    echo -e "${GREEN}🏥 Health check: https://${APP_URL}/actuator/health${NC}"
    echo -e "${GREEN}📊 Swagger UI: https://${APP_URL}/swagger-ui/index.html${NC}"
}

# Function to show post-deployment instructions
show_instructions() {
    echo
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo
    echo -e "${YELLOW}📝 Important Next Steps:${NC}"
    echo -e "${BLUE}1. Update Database Credentials:${NC}"
    echo "   If you need to update the database credentials, run:"
    echo "   az containerapp secret set --name ${CONTAINER_APP} --resource-group ${RESOURCE_GROUP} --secrets db-username=YOUR_USERNAME db-password=YOUR_PASSWORD"
    echo
    echo -e "${BLUE}2. Monitor Application Logs:${NC}"
    echo "   az containerapp logs show --name ${CONTAINER_APP} --resource-group ${RESOURCE_GROUP} --follow"
    echo
    echo -e "${BLUE}3. Scale Application (if needed):${NC}"
    echo "   az containerapp update --name ${CONTAINER_APP} --resource-group ${RESOURCE_GROUP} --min-replicas 2 --max-replicas 5"
    echo
    echo -e "${BLUE}4. Check Application Status:${NC}"
    echo "   az containerapp show --name ${CONTAINER_APP} --resource-group ${RESOURCE_GROUP} --query 'properties.runningStatus'"
    echo
    echo -e "${BLUE}5. View Resource Usage:${NC}"
    echo "   az containerapp show --name ${CONTAINER_APP} --resource-group ${RESOURCE_GROUP} --query 'properties.template.containers[0].resources'"
    echo
}

# Main execution
main() {
    echo
    echo -e "${RED}⚠️  IMPORTANT: Before running this script, make sure to:${NC}"
    echo -e "   1. Update DOCKER_IMAGE variable with your actual Docker image"
    echo -e "   2. Update DB_USERNAME and DB_PASSWORD with your database credentials"
    echo -e "   3. Ensure your Docker image is publicly accessible or add registry credentials"
    echo
    read -p "Have you updated the configuration variables? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Please update the configuration variables first${NC}"
        exit 1
    fi
    
    check_prerequisites
    create_resource_group
    create_container_env
    deploy_container_app
    get_app_url
    show_instructions
}

# Run main function
main "$@"
