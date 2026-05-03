# Booking service — one image does everything: build the app, then run it.

# Base image: Java 17 (needed to compile and to run the app).
FROM eclipse-temurin:17-jdk

# Work inside the /app folder.
WORKDIR /app

# Copy Maven Wrapper and project file so we can run Maven the same way everywhere.
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Make the script runnable, then download dependencies (helps the next build go faster).
RUN chmod +x mvnw && ./mvnw dependency:go-offline

# Copy your Java code.
COPY src ./src

# Build the JAR, then add a non-root user and give that user the files. All in one step to keep the image smaller.
RUN ./mvnw clean package -DskipTests && \
    groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup --no-create-home --shell /usr/sbin/nologin appuser && \
    chown -R appuser:appgroup /app

# Run the app as the normal user, not root.
USER appuser

# Port the booking API uses (must match what Azure expects).
EXPOSE 8080

# Start command when the container runs.
CMD ["java", "-jar", "target/booking-service-0.0.1-SNAPSHOT.jar"]
