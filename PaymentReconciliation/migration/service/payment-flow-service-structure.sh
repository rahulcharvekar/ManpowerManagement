#!/bin/bash
# Script to create payment-flow-service structure
mkdir -p payment-flow-service/src/main/java/com/example/paymentflow/{worker,employer,board,payment,controller,service,model,repository}
mkdir -p payment-flow-service/src/test/java/com/example/paymentflow
mkdir -p payment-flow-service/src/main/resources
# Copy relevant code (adjust as needed)
# cp -r ../src/main/java/com/example/paymentreconciliation/worker/* payment-flow-service/src/main/java/com/example/paymentflow/worker/
# cp -r ../src/main/java/com/example/paymentreconciliation/employer/* payment-flow-service/src/main/java/com/example/paymentflow/employer/
# cp -r ../src/main/java/com/example/paymentreconciliation/board/* payment-flow-service/src/main/java/com/example/paymentflow/board/
# cp -r ../src/main/java/com/example/paymentreconciliation/payment/* payment-flow-service/src/main/java/com/example/paymentflow/payment/
# Copy config files if needed
cp ../src/main/resources/application.yml payment-flow-service/src/main/resources/
