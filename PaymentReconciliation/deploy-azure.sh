#!/bin/bash

# Azure Container Apps Deployment Script
# This script deploys the Payment Reconciliation application to Azure Container Apps

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="payment-reconciliation-rg"
LOCATION="eastus"
ACR_NAME="paymentreconciliationacr"
CONTAINER_APP_ENV="payment-reconciliation-env"
CONTAINER_APP_NAME="payment-reconciliation-app"
IMAGE_TAG="latest"

# Functions
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    # Check if logged into Azure
    if ! az account show &> /dev/null; then
        print_error "Please login to Azure CLI first: az login"
        exit 1
    fi
    
    print_info "Prerequisites check passed"
}

create_resource_group() {
    print_header "Creating Resource Group"
    
    if az group show --name $RESOURCE_GROUP &> /dev/null; then
        print_info "Resource group $RESOURCE_GROUP already exists"
    else
        print_info "Creating resource group: $RESOURCE_GROUP"
        az group create \
            --name $RESOURCE_GROUP \
            --location $LOCATION
    fi
}

create_container_registry() {
    print_header "Setting up Azure Container Registry"
    
    if az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
        print_info "ACR $ACR_NAME already exists"
    else
        print_info "Creating Azure Container Registry: $ACR_NAME"
        az acr create \
            --name $ACR_NAME \
            --resource-group $RESOURCE_GROUP \
            --sku Basic \
            --admin-enabled true
    fi
}

build_and_push_image() {
    print_header "Building and Pushing Docker Image"
    
    # Get ACR login server
    ACR_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query loginServer -o tsv)
    
    # Login to ACR
    print_info "Logging into ACR..."
    az acr login --name $ACR_NAME
    
    # Build image
    print_info "Building Docker image..."
    docker build -t $ACR_SERVER/$CONTAINER_APP_NAME:$IMAGE_TAG .
    
    # Push image
    print_info "Pushing image to ACR..."
    docker push $ACR_SERVER/$CONTAINER_APP_NAME:$IMAGE_TAG
    
    print_info "Image pushed successfully: $ACR_SERVER/$CONTAINER_APP_NAME:$IMAGE_TAG"
}

deploy_container_app() {
    print_header "Deploying Container App"
    
    # Get ACR credentials
    ACR_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query loginServer -o tsv)
    ACR_USERNAME=$(az acr credential show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query username -o tsv)
    ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query passwords[0].value -o tsv)
    
    # Update parameters file
    print_info "Updating deployment parameters..."
    cat > infra/containerapp.parameters.json << EOF
{
  "\$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "location": {
      "value": "$LOCATION"
    },
    "environmentName": {
      "value": "$CONTAINER_APP_ENV"
    },
    "containerAppName": {
      "value": "$CONTAINER_APP_NAME"
    },
    "registryServer": {
      "value": "$ACR_SERVER"
    },
    "registryUsername": {
      "value": "$ACR_USERNAME"
    },
    "registryPassword": {
      "value": "$ACR_PASSWORD"
    },
    "containerImage": {
      "value": "$ACR_SERVER/$CONTAINER_APP_NAME:$IMAGE_TAG"
    },
    "dbConnectionString": {
      "value": "jdbc:mysql://localhost:3306/paymentreconciliation_prod?useSSL=false&serverTimezone=UTC"
    },
    "dbUsername": {
      "value": "root"
    },
    "dbPassword": {
      "value": "password123"
    }
  }
}
EOF
    
    # Deploy using Bicep
    print_info "Deploying Container App using Bicep template..."
    az deployment group create \
        --resource-group $RESOURCE_GROUP \
        --template-file infra/containerapp.bicep \
        --parameters @infra/containerapp.parameters.json
    
    # Get the FQDN
    FQDN=$(az deployment group show \
        --resource-group $RESOURCE_GROUP \
        --name containerapp \
        --query properties.outputs.fqdn.value -o tsv)
    
    print_info "Deployment completed!"
    print_info "Application URL: https://$FQDN"
    print_info "Health Check: https://$FQDN/actuator/health"
    print_info "API Documentation: https://$FQDN/swagger-ui.html"
}

# Main execution
main() {
    print_header "Azure Container Apps Deployment - Payment Reconciliation"
    
    check_prerequisites
    create_resource_group
    create_container_registry
    build_and_push_image
    deploy_container_app
    
    print_header "Deployment Complete!"
    print_info "Your Payment Reconciliation application has been deployed to Azure Container Apps."
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
