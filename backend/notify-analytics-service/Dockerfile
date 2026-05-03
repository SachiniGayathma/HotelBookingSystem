# Notify / analytics service — this Dockerfile does NOT compile code.
# CI builds the .jar first (Maven). Docker only packages that file and runs it.

# Small Linux image with Java 17.
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Create a non-root user (Alpine uses slightly different commands than Ubuntu).
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

# Put the JAR you already built on your machine/CI into the image.
COPY target/notify-analytics-service-0.0.1-SNAPSHOT.jar app.jar

# The user must be allowed to read the JAR.
RUN chown appuser:appgroup /app/app.jar

USER appuser

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]
