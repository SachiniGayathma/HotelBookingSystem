FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw && ./mvnw dependency:go-offline

COPY src ./src

RUN ./mvnw clean package -DskipTests && \
    groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup --no-create-home --shell /usr/sbin/nologin appuser && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8082

CMD ["java", "-jar", "target/payment-service-0.0.1-SNAPSHOT.jar"]