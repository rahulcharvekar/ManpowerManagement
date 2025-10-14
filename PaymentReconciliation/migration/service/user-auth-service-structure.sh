#!/bin/bash
# Script to create user-auth-service structure
mkdir -p user-auth-service/src/main/java/com/example/userauth/{controller,service,model,repository,config,security,dao,dto,entity}
mkdir -p user-auth-service/src/test/java/com/example/userauth
mkdir -p user-auth-service/src/main/resources
cp -r ../src/main/java/com/example/paymentreconciliation/auth/* user-auth-service/src/main/java/com/example/userauth/
# Copy config files if needed
cp ../src/main/resources/application.yml user-auth-service/src/main/resources/
