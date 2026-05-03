# Use Eclipse Temurin 17 JDK as base image
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (for faster builds)
RUN chmod +x mvnw && ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Build the application, then create non-root user and fix ownership
RUN ./mvnw clean package -DskipTests && \
    groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup --no-create-home --shell /usr/sbin/nologin appuser && \
    chown -R appuser:appgroup /app

USER appuser

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/booking-service-0.0.1-SNAPSHOT.jar"]