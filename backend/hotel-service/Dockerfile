# Hotel service — two steps: (1) build the app, (2) run it in a small image.

# --- Part 1: build the JAR ---
# Start from an image that already has Java and Maven.
FROM maven:3.9-eclipse-temurin-17 AS build
# We name this part "build" so we can copy from it later.

# Use /app as the folder for our project files.
WORKDIR /app

# Copy the project file first (lists libraries your app needs).
COPY pom.xml .
# Copy the Maven Wrapper — lets everyone build with the same Maven version.
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .

# Allow running the Maven script on Linux.
RUN chmod +x mvnw

# Copy your Java source code.
COPY src ./src

# Compile and pack everything into one runnable .jar file. Tests are skipped to save time in CI.
RUN ./mvnw clean package -DskipTests

# --- Part 2: run the app ---
# Start fresh from a smaller image that only has Java to run the app (no Maven).
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create a normal user so we do not run as root (safer).
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup --no-create-home --shell /usr/sbin/nologin appuser

# Copy only the .jar we built in Part 1. Call it app.jar so the start command is simple.
COPY --from=build /app/target/hotel-service-0.0.1-SNAPSHOT.jar app.jar

# Make sure our user owns the files it needs.
RUN chown -R appuser:appgroup /app

# From here on, commands run as this user, not as root.
USER appuser

# The app listens on this port (Azure will send web traffic to it).
EXPOSE 8081

# How the container starts: run the JAR with Java.
ENTRYPOINT ["java", "-jar", "app.jar"]
