# Payment service — same pattern as booking: build here, run as a normal user.

# Java 17 on Ubuntu Jammy (a common Linux base).
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

# Maven Wrapper + pom.xml so every machine builds the same way.
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Download libraries once (speeds up rebuilds).
RUN chmod +x mvnw && ./mvnw dependency:go-offline

COPY src ./src

# Build JAR, create user appuser, give them the files.
RUN ./mvnw clean package -DskipTests && \
    groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup --no-create-home --shell /usr/sbin/nologin appuser && \
    chown -R appuser:appgroup /app

USER appuser

# Payment service port (match Azure / your app).
EXPOSE 8082

CMD ["java", "-jar", "target/payment-service-0.0.1-SNAPSHOT.jar"]
