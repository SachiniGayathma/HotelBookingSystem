FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

COPY target/notify-analytics-service-0.0.1-SNAPSHOT.jar app.jar

RUN chown appuser:appgroup /app/app.jar

USER appuser

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]