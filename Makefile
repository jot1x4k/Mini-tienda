# Makefile — mini-tienda (Spring Boot API + Angular CLI)
#
# Requisitos: Java 21+, Node 20+ (npm).
# Para la API se usa el Maven Wrapper (tienda-api/mvnw): no hace falta Maven instalado.
#
# Uso rápido:
#   make dev      -> levanta API y cliente a la vez (Ctrl-C detiene ambos)
#   make api      -> solo la API   (http://localhost:8080)
#   make cliente  -> solo el cliente (http://localhost:4200)

SHELL := /bin/bash
.SHELLFLAGS := -o pipefail -c
.DEFAULT_GOAL := help

# Directorios
API_DIR     := tienda-api
CLIENT_DIR  := tienda-cliente

# Herramientas
MVN         := ./mvnw
NPM         := npm

# Puertos / host (pueden sobreescribirse: make api API_PORT=9090)
API_PORT    ?= 8080
CLIENT_PORT ?= 4200
HOST        ?= localhost

# Argumentos extra para cada herramienta
MVN_ARGS    ?=
NPM_ARGS    ?=

# Spring Boot toma el puerto de la variable de entorno SERVER_PORT
export SERVER_PORT = $(API_PORT)

.PHONY: help dev api cliente install install-api install-cliente \
        test test-api test-cliente build build-api build-cliente \
        clean health check

help: ## Muestra los objetivos disponibles
	@echo "mini-tienda — Spring Boot API + Angular CLI"
	@echo ""
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""

check: ## Verifica que estén las herramientas necesarias
	@command -v java >/dev/null || { echo "Falta java (21+)"; exit 1; }
	@command -v node >/dev/null || { echo "Falta node (20+)"; exit 1; }
	@command -v npm  >/dev/null || { echo "Falta npm"; exit 1; }
	@test -x $(API_DIR)/mvnw || { echo "Falta $(API_DIR)/mvnw"; exit 1; }
	@test -d $(CLIENT_DIR)/node_modules || echo "Aviso: faltan node_modules en $(CLIENT_DIR) (ejecuta 'make install-cliente')"
	@echo "Herramientas OK"

# ------------------------------------------------------------------
# Ejecución
# ------------------------------------------------------------------

dev: ## Levanta la API y el cliente a la vez (Ctrl-C detiene ambos)
	@echo ">> API     : http://$(HOST):$(API_PORT)"
	@echo ">> CLIENTE : http://$(HOST):$(CLIENT_PORT)"
	@stop() { pkill -TERM -P $$1 2>/dev/null || true; kill -TERM $$1 2>/dev/null || true; }; \
	trap 'echo ""; echo ">> Deteniendo procesos..."; stop $$API_PID; stop $$CLIENT_PID' EXIT INT TERM; \
	( cd $(API_DIR) && exec $(MVN) spring-boot:run $(MVN_ARGS) ) & API_PID=$$!; \
	( cd $(CLIENT_DIR) && exec $(NPM) start -- --port $(CLIENT_PORT) --host $(HOST) $(NPM_ARGS) ) & CLIENT_PID=$$!; \
	wait

api: ## Levanta solo la API Spring Boot (http://localhost:8080)
	@echo ">> API en http://$(HOST):$(API_PORT)"
	@cd $(API_DIR) && $(MVN) spring-boot:run $(MVN_ARGS)

cliente: ## Levanta solo el cliente Angular (http://localhost:4200)
	@echo ">> Cliente en http://$(HOST):$(CLIENT_PORT)"
	@cd $(CLIENT_DIR) && $(NPM) start -- --port $(CLIENT_PORT) --host $(HOST) $(NPM_ARGS)

health: ## Consulta el health check de la API
	@curl -s -f "http://$(HOST):$(API_PORT)/api/health" && echo ""

# ------------------------------------------------------------------
# Dependencias
# ------------------------------------------------------------------

install: install-api install-cliente ## Instala las dependencias de API y cliente

install-api: ## Descarga las dependencias de Maven
	@cd $(API_DIR) && $(MVN) dependency:go-offline $(MVN_ARGS)

install-cliente: ## Instala las dependencias npm (npm ci si hay lockfile)
	@cd $(CLIENT_DIR) && if [ -f package-lock.json ]; then $(NPM) ci; else $(NPM) install; fi

# ------------------------------------------------------------------
# Pruebas y builds
# ------------------------------------------------------------------

test: test-api test-cliente ## Ejecuta las pruebas de API y cliente

test-api: ## Ejecuta las pruebas de la API
	@cd $(API_DIR) && $(MVN) test $(MVN_ARGS)

test-cliente: ## Ejecuta las pruebas del cliente
	@cd $(CLIENT_DIR) && $(NPM) test -- --watch=false $(NPM_ARGS)

build: build-api build-cliente ## Compila API y cliente

build-api: ## Compila el jar de la API
	@cd $(API_DIR) && $(MVN) clean package -DskipTests $(MVN_ARGS)

build-cliente: ## Compila el cliente para producción
	@cd $(CLIENT_DIR) && $(NPM) run build $(NPM_ARGS)

# ------------------------------------------------------------------
# Limpieza
# ------------------------------------------------------------------

clean: ## Limpia los artefactos de compilación
	@cd $(API_DIR) && $(MVN) clean $(MVN_ARGS)
	@rm -rf $(CLIENT_DIR)/dist $(CLIENT_DIR)/.angular/cache
	@echo ">> Limpio"
