# syntax=docker/dockerfile:1

# Multi-stage build for production optimization
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy dependency files first for better layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn -B clean package spring-boot:repackage -DskipTests

# Production runtime image
FROM eclipse-temurin:17-jre-alpine AS runtime

# Install required packages for Azure Container Apps
RUN apk add --no-cache wget curl

# Create non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

# Set environment variables for Azure Container Apps
ENV APP_HOME=/app \
    SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8080 \
    JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication" \
    TZ=UTC \
    LANG=C.UTF-8 \
    FILE_UPLOAD_DIR=/tmp/uploads \
    MT940_STATEMENTS_PATH=/tmp/mt940-statements \
    LOG_FILE=/tmp/logs/payment-reconciliation.log

WORKDIR ${APP_HOME}

# Create ephemeral storage directories in /tmp (Azure Container Apps ephemeral storage)
RUN mkdir -p /tmp/uploads /tmp/logs /tmp/mt940-statements && \
    chown -R appuser:appuser /tmp/uploads /tmp/logs /tmp/mt940-statements && \
    chown -R appuser:appuser ${APP_HOME}

# Copy application jar
COPY --from=build --chown=appuser:appuser /workspace/target/payment-reconciliation-0.0.1-SNAPSHOT.jar app.jar

# Copy MT940 dummy files to ephemeral storage location
COPY --from=build --chown=appuser:appuser /workspace/src/main/resources/mt940-statements/* /tmp/mt940-statements/

# Switch to non-root user
USER appuser

# Health check for Azure Container Apps
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${SERVER_PORT}/actuator/health || exit 1

# Expose port
EXPOSE ${SERVER_PORT}

# Production-optimized entrypoint
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} -Dserver.port=${SERVER_PORT} -jar app.jar"]
