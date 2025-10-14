#!/bin/bash
# Script to create shared-lib structure
mkdir -p shared-lib/src/main/java/com/example/shared/{logging,file,directory,util}
mkdir -p shared-lib/src/test/java/com/example/shared
mkdir -p shared-lib/src/main/resources
# Copy shared utilities if needed
# cp -r ../src/main/java/com/example/paymentreconciliation/common/* shared-lib/src/main/java/com/example/shared/
