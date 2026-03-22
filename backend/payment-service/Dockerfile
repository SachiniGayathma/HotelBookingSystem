FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY src ./src

RUN ./mvnw clean package -DskipTests

EXPOSE 8082

CMD ["java", "-jar", "target/payment-service-0.0.1-SNAPSHOT.jar"]