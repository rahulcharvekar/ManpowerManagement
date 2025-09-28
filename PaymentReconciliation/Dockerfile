# syntax=docker/dockerfile:1

FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN mvn -B clean package spring-boot:repackage -DskipTests

FROM eclipse-temurin:17-jre
ENV APP_HOME=/app \
    JAVA_OPTS=""
WORKDIR ${APP_HOME}
COPY --from=build /workspace/target/payment-reconciliation-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
