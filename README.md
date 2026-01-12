# Biblia Question

Plataforma de torneos biblicos interactivos donde los participantes responden preguntas diarias, ven videos de YouTube y compiten por estrellas.

## Stack Tecnologico

| Componente | Tecnologia |
|------------|------------|
| Frontend | Angular 19 (standalone components) |
| Backend | FastAPI (Python) |
| Base de datos | Firebase Firestore |
| Autenticacion | Firebase Auth |
| Almacenamiento | Firebase Storage |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |

## Estructura del Proyecto

```
biblia-question/
├── apps/
│   ├── frontend/          # Angular 19 app
│   └── backend/           # FastAPI app
├── docs/
│   ├── GUIA_USUARIO_WILLIAM.md    # Documentacion para el admin
│   └── GUIA_DESPLIEGUE_TECNICA.md # Documentacion de despliegue
├── firebase/
│   ├── firestore.rules    # Reglas de Firestore
│   └── storage.rules      # Reglas de Storage
└── package.json
```

## Inicio Rapido

### Requisitos

- Node.js 18+
- Python 3.11+
- Cuenta de Firebase

### Frontend

```bash
cd apps/frontend
npm install
npm start
# Abre http://localhost:4200
```

### Backend

```bash
cd apps/backend
pip install -r requirements.txt
cp .env.example .env
# Edita .env con tus credenciales de Firebase
uvicorn src.main:app --reload
# API en http://localhost:8000
```

## Documentacion

- [Guia para William (Admin)](docs/GUIA_USUARIO_WILLIAM.md) - Flujos de usuario y administrador
- [Guia de Despliegue](docs/GUIA_DESPLIEGUE_TECNICA.md) - Como desplegar en produccion

## Caracteristicas Principales

- **Preguntas Diarias**: 4 preguntas normales + 1 extra por dia
- **Videos Embebidos**: YouTube Shorts antes de cada pregunta
- **Retos con Video**: Subida de videos para ganar estrellas extra
- **Ranking en Tiempo Real**: Clasificacion actualizada al instante
- **Panel de Admin**: Gestion de torneos, preguntas y revision de videos

## Licencia

MIT
