#!/bin/bash
# Script to create reconciliation-service structure
mkdir -p reconciliation-service/src/main/java/com/example/reconciliation/{mt940,controller,service,model,repository}
mkdir -p reconciliation-service/src/test/java/com/example/reconciliation
mkdir -p reconciliation-service/src/main/resources
# Copy relevant code (adjust as needed)
# cp -r ../src/main/java/com/example/paymentreconciliation/mt940/* reconciliation-service/src/main/java/com/example/reconciliation/mt940/
# cp -r ../src/main/java/com/example/paymentreconciliation/reconciliation/* reconciliation-service/src/main/java/com/example/reconciliation/
# Copy config files if needed
cp ../src/main/resources/application.yml reconciliation-service/src/main/resources/
