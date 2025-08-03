# Detecta entorno operativo
ifeq ($(OS),Windows_NT)
    PYTHON=venv\Scripts\python.exe
    PIP=venv\Scripts\pip.exe
else
    PYTHON=venv/bin/python
    PIP=venv/bin/pip
endif

# Crea entorno virtual e instala dependencias
venv:
	python -m venv venv && $(PIP) install -r backend/requirements.txt

# Ejecuta el backend localmente (sin Docker)
run:
	$(PYTHON) -m uvicorn backend.main:app --reload

# Levanta Docker Compose
docker-up:
	docker-compose up --build

# Apaga Docker
docker-down:
	docker-compose down

# Corre tests (ajustá ruta si usás pytest)
test:
	$(PYTHON) -m pytest backend/tests

# Linter (recomendado: flake8 o ruff)
lint:
	$(PYTHON) -m flake8 backend

# Formatea código (black)
format:
	$(PYTHON) -m black backend

# Limpia __pycache__ y archivos temporales
clean:
	find . -type d -name '__pycache__' -exec rm -r {} + || true
