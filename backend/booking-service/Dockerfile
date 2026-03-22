# Use Eclipse Temurin 17 JDK as base image
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw

# Download dependencies (for faster builds)
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/booking-service-0.0.1-SNAPSHOT.jar"]