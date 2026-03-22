# ---------- Stage 1: Build ----------
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .

# Give permission to mvnw
RUN chmod +x mvnw

# Copy source code
COPY src ./src

# Build the JAR
RUN ./mvnw clean package -DskipTests

# ---------- Stage 2: Run ----------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy built JAR from build stage
COPY --from=build /app/target/hotel-service-0.0.1-SNAPSHOT.jar app.jar

# Expose correct port
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]