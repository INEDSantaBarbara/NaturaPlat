.DEFAULT_GOAL := help

SHELL := /bin/bash
PORT  ?= 4173
HOST  ?= 127.0.0.1
NPM   ?= npm
NPX   ?= npx

# Identidad git de este repo. En el plan Hobby de Vercel, con repositorio
# privado, solo se despliegan los commits cuyo autor sea el dueño de la cuenta:
# Vercel compara el email verificado, no el permiso de push. Ver docs/despliegue.md.
# El nombre es solo la firma visible del commit; el correo es el que valida Vercel.
GIT_NAME  := MILAB INED Santa Bárbara
GIT_EMAIL := inedsantabarbaramilab@gmail.com

.PHONY: help install git-config check-identity serve dev run lint lint-html lint-css lint-js \
        format format-check test test-static test-e2e test-e2e-ui deploy ci clean

help: ## Muestra esta ayuda
	@echo "NaturaPlát · vajilla biodegradable de hoja de plátano"
	@echo
	@grep -hE '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "} {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "Overrides: PORT=8080 HOST=0.0.0.0 NPM=npm NPX=npx"

install: ## Instala las dependencias de desarrollo con el lockfile
	$(NPM) ci

git-config: ## Configura la identidad git del repo (requerida por Vercel Hobby)
	@git config --local user.name "$(GIT_NAME)"
	@git config --local user.email "$(GIT_EMAIL)"
	@printf "Identidad de este repo: %s <%s>\n" "$(GIT_NAME)" "$(GIT_EMAIL)"

check-identity: ## Verifica que la identidad git sea la de la cuenta de Vercel
	@if [ "$$(git config --local user.email 2>/dev/null)" != "$(GIT_EMAIL)" ]; then \
		echo "✗ Identidad git incorrecta: $$(git config --local user.email 2>/dev/null || echo 'sin configurar')."; \
		echo "  Ejecuta 'make git-config' antes de commitear."; \
		exit 1; \
	fi
	@echo "✓ Identidad git correcta: $(GIT_EMAIL)"

serve: ## Sirve el sitio en http://127.0.0.1:4173 (server.js, sin caché)
	HOST="$(HOST)" PORT="$(PORT)" node server.js

dev run: serve ## Alias de 'serve'

lint: lint-html lint-css lint-js ## Ejecuta todos los linters

lint-html: ## Valida el HTML con html-validate
	$(NPX) html-validate public/index.html

lint-css: ## Lint del CSS con Stylelint
	$(NPX) stylelint "public/css/**/*.css"

lint-js: ## Lint del JavaScript con ESLint (incluye server.js y tests)
	$(NPX) eslint .

format: ## Formatea el código con Prettier
	$(NPX) prettier --write .

format-check: ## Verifica el formato sin escribir
	$(NPX) prettier --check .

test: test-static test-e2e ## Ejecuta toda la batería de tests

test-static: ## Tests estáticos con node:test (sin navegador)
	node --test tests/static/*.test.js

test-e2e: ## Tests end-to-end con Playwright (levanta server.js)
	PORT="$(PORT)" $(NPX) playwright test

test-e2e-ui: ## Playwright en modo UI (interactivo)
	PORT="$(PORT)" $(NPX) playwright test --ui

deploy: ## Despliega a producción en Vercel (requiere Vercel CLI)
	$(NPX) vercel --prod

ci: install format-check lint test ## Pipeline completo: instala, formatea, lintea y testea

clean: ## Elimina dependencias y artefactos generados
	rm -rf node_modules playwright-report test-results blob-report coverage .vercel
