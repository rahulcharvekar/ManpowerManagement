# Environment Configuration Guide

This application supports multiple environment configurations using Spring Boot profiles.

## Available Profiles

### 1. Development (`dev`) - Default
- **Database**: `paymentreconciliation_dev`
- **Logging**: Debug level with SQL logging
- **File Upload**: Local development directory
- **Management Endpoints**: All endpoints exposed

### 2. Staging (`staging`)
- **Database**: `paymentreconciliation_staging`
- **Logging**: Info level with file logging
- **File Upload**: Staging directory
- **Management Endpoints**: Limited endpoints

### 3. Production (`prod`)
- **Database**: `paymentreconciliation_prod`
- **Logging**: Warn level with file logging
- **File Upload**: Production directory
- **Management Endpoints**: Minimal endpoints
- **Security**: Enhanced connection pooling and compression

## How to Use

### 1. Command Line
```bash
# Run with development profile (default)
mvn spring-boot:run

# Run with staging profile
mvn spring-boot:run -Dspring-boot.run.profiles=staging

# Run with production profile
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### 2. JAR Execution
```bash
# Development
java -jar payment-reconciliation-0.0.1-SNAPSHOT.jar

# Staging
java -jar payment-reconciliation-0.0.1-SNAPSHOT.jar --spring.profiles.active=staging

# Production
java -jar payment-reconciliation-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### 3. Environment Variables
```bash
# Set profile via environment variable
export SPRING_PROFILES_ACTIVE=prod
java -jar payment-reconciliation-0.0.1-SNAPSHOT.jar
```

### 4. Docker
```bash
# Development
docker run -e SPRING_PROFILES_ACTIVE=dev payment-reconciliation

# Production with custom database URL
docker run -e SPRING_PROFILES_ACTIVE=prod \
           -e DB_URL=jdbc:mysql://prod-db:3306/paymentdb \
           -e DB_USERNAME=produser \
           -e DB_PASSWORD=prodpass \
           -e FILE_UPLOAD_DIR=/app/uploads \
           payment-reconciliation
```

## Environment Variables

### Production Environment Variables
- `DB_URL`: Database connection URL
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `FILE_UPLOAD_DIR`: File upload directory path
- `SERVER_PORT`: Server port (default: 8080)

### Staging Environment Variables
- `DB_URL`: Database connection URL
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `FILE_UPLOAD_DIR`: File upload directory path
- `SERVER_PORT`: Server port (default: 8080)

## Database Setup

### Development
```sql
CREATE DATABASE paymentreconciliation_dev;
```

### Staging
```sql
CREATE DATABASE paymentreconciliation_staging;
```

### Production
```sql
CREATE DATABASE paymentreconciliation_prod;
CREATE USER 'produser'@'%' IDENTIFIED BY 'prodpassword';
GRANT ALL PRIVILEGES ON paymentreconciliation_prod.* TO 'produser'@'%';
FLUSH PRIVILEGES;
```

## Log Files
- **Development**: Console only
- **Staging**: `logs/payment-reconciliation-staging.log`
- **Production**: `logs/payment-reconciliation.log`

## Management Endpoints
Access at `http://localhost:8080/actuator/`

### Development
- health, info, beans, env, metrics, loggers

### Staging  
- health, info, metrics, env

### Production
- health, info, metrics (minimal exposure)
