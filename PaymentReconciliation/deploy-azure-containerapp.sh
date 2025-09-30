#!/bin/bash

# Azure Container Apps deployment script for Payment Reconciliation Application
# This script deploys the application to Azure Container Apps with ephemeral storage

set -e

# Configuration variables
RESOURCE_GROUP="payment-reconciliation-rg"
CONTAINER_APP="payment-reconciliation-app"
CONTAINER_APP_ENV="payment-reconciliation-env"
LOCATION="East US"
DOCKER_REGISTRY="docker.io"  # Use Docker Hub or your preferred registry
DOCKER_USERNAME="your-docker-username"  # Replace with your Docker Hub username
IMAGE_NAME="payment-reconciliation"
IMAGE_TAG="latest"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Azure Container Apps deployment...${NC}"

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
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check completed${NC}"
}

# Function to build and push Docker image
build_and_push_image() {
    echo -e "${YELLOW}🏗️  Building and pushing Docker image...${NC}"
    
    # Build the Docker image
    echo "Building Docker image..."
    docker build -t ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} .
    
    # Log in to Docker registry
    echo "Logging in to Docker registry..."
    docker login ${DOCKER_REGISTRY}
    
    # Push the image
    echo "Pushing image to Docker registry..."
    docker push ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
    
    echo -e "${GREEN}✅ Docker image built and pushed successfully${NC}"
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
            --image ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
    else
        echo "Creating new container app..."
        az containerapp create \
            --name ${CONTAINER_APP} \
            --resource-group ${RESOURCE_GROUP} \
            --environment ${CONTAINER_APP_ENV} \
            --image ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} \
            --target-port 8080 \
            --ingress external \
            --min-replicas 1 \
            --max-replicas 3 \
            --cpu 1.0 \
            --memory 2Gi \
            --secrets \
                db-username=REPLACE_WITH_YOUR_DB_USERNAME \
                db-password=REPLACE_WITH_YOUR_DB_PASSWORD \
            --env-vars \
                SPRING_PROFILES_ACTIVE=prod \
                DB_USERNAME=secretref:db-username \
                DB_PASSWORD=secretref:db-password \
                FILE_UPLOAD_DIR=/tmp/uploads \
                MT940_STATEMENTS_PATH=/tmp/mt940-statements \
                LOG_FILE=/tmp/logs/payment-reconciliation.log \
            --registry-server ${DOCKER_REGISTRY}
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

# Main execution
main() {
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           Azure Container Apps Deployment Script          ║${NC}"
    echo -e "${GREEN}║              Payment Reconciliation Application           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    check_prerequisites
    build_and_push_image
    deploy_container_app
    get_app_url
    
    echo
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo -e "   1. Update the secrets with actual database credentials using:"
    echo -e "      az containerapp secret set --name ${CONTAINER_APP} --resource-group ${RESOURCE_GROUP} --secrets db-username=YOUR_USERNAME db-password=YOUR_PASSWORD"
    echo -e "   2. Monitor the application logs using:"
    echo -e "      az containerapp logs show --name ${CONTAINER_APP} --resource-group ${RESOURCE_GROUP} --follow"
    echo -e "   3. Scale the application if needed using:"
    echo -e "      az containerapp update --name ${CONTAINER_APP} --resource-group ${RESOURCE_GROUP} --min-replicas 2 --max-replicas 5"
}

# Run main function
main "$@"
