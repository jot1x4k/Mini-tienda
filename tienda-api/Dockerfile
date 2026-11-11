
# Etapa 1: Construcción
FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /app

# Copiar Maven Wrapper y dependencias
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

RUN chmod +x mvnw

RUN ./mvnw dependency:go-offline -DskipTests

# Copiar código fuente
COPY src ./src

# Construir aplicación
RUN ./mvnw clean package -DskipTests \
    && cp target/*.jar app.jar

# Etapa 2: Ejecución
FROM eclipse-temurin:21-jre-jammy AS final

WORKDIR /app

RUN useradd --system --uid 10001 appuser \
    && mkdir -p /app/data \
    && chown -R appuser:appuser /app

COPY --from=build --chown=appuser:appuser /app/app.jar app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

