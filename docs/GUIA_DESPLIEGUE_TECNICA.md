# Guía Técnica de Despliegue - Biblia Question

## Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Firebase](#configuración-de-firebase)
3. [Despliegue del Frontend en Vercel](#despliegue-del-frontend-en-vercel)
4. [Despliegue del Backend en Render](#despliegue-del-backend-en-render)
5. [Variables de Entorno](#variables-de-entorno)
6. [Comandos Útiles](#comandos-útiles)
7. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### Herramientas Necesarias

```bash
# Node.js 18+ (recomendado 20 LTS)
node --version  # v20.x.x

# npm 9+
npm --version   # 9.x.x

# Angular CLI 19
npm install -g @angular/cli@19
ng version

# Python 3.11+
python --version  # 3.11.x

# pip
pip --version

# Git
git --version
```

### Cuentas Necesarias (Gratuitas)

1. **Firebase** - https://console.firebase.google.com
2. **Vercel** - https://vercel.com (login con GitHub)
3. **Render** - https://render.com (login con GitHub)
4. **GitHub** - Para el repositorio del código

---

## Configuración de Firebase

### Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Click en "Agregar proyecto"
3. Nombre: `biblia-question` (o el nombre que prefieras)
4. Desactiva Google Analytics (opcional para inicio)
5. Click en "Crear proyecto"

### Paso 2: Configurar Authentication

1. En el panel lateral, ve a **Build > Authentication**
2. Click en "Comenzar"
3. Pestaña "Sign-in method"
4. Habilita **Correo electrónico/contraseña**
5. Guarda los cambios

### Paso 3: Configurar Firestore Database

1. Ve a **Build > Firestore Database**
2. Click en "Crear base de datos"
3. Selecciona modo **Producción**
4. Selecciona ubicación: `us-central1` (o la más cercana)
5. Click en "Habilitar"

### Paso 4: Configurar Storage

1. Ve a **Build > Storage**
2. Click en "Comenzar"
3. Acepta las reglas por defecto (las cambiaremos después)
4. Selecciona ubicación (misma que Firestore)
5. Click en "Listo"

### Paso 5: Obtener Credenciales del Frontend

1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. Pestaña "General"
3. En "Tus apps", click en el ícono de **Web** (</>)
4. Registra la app con nombre: `biblia-question-web`
5. **NO** marques Firebase Hosting
6. Copia la configuración que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "biblia-question.firebaseapp.com",
  projectId: "biblia-question",
  storageBucket: "biblia-question.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Paso 6: Obtener Credenciales del Backend (Service Account)

1. Ve a **Configuración del proyecto > Cuentas de servicio**
2. Click en "Generar nueva clave privada"
3. Descarga el archivo JSON
4. **IMPORTANTE**: Este archivo contiene credenciales sensibles
5. Renómbralo a `firebase-credentials.json`

### Paso 7: Configurar Reglas de Firestore

1. Ve a **Firestore Database > Reglas**
2. Reemplaza con el contenido del archivo `firebase/firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return request.auth.token.admin == true;
    }

    // USUARIOS
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if isAdmin();
    }

    // TORNEOS
    match /tournaments/{tournamentId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();

      match /participants/{oderId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated() && isOwner(oderId);
        allow update: if isAuthenticated() && (isOwner(oderId) || isAdmin());
        allow delete: if isAdmin();
      }
    }

    // CONTENIDO DIARIO
    match /dailyContent/{contentId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // PREGUNTAS
    match /questions/{questionId} {
      allow read: if isAuthenticated() && resource.data.releaseDate <= request.time;
      allow read: if isAdmin();
      allow write: if isAdmin();
    }

    // RESPUESTAS
    match /answers/{answerId} {
      allow read: if isAuthenticated() && resource.data.oderId == request.auth.uid;
      allow read: if isAdmin();
      allow create: if isAuthenticated() && request.resource.data.oderId == request.auth.uid;
      allow update, delete: if false;
    }

    // RETOS
    match /challenges/{challengeId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();

      match /submissions/{submissionId} {
        allow read: if isAuthenticated() &&
          (resource.data.status == 'approved' ||
           resource.data.oderId == request.auth.uid ||
           isAdmin());
        allow create: if isAuthenticated() &&
          request.resource.data.oderId == request.auth.uid;
        allow update: if isAdmin();
        allow delete: if isAdmin();
      }
    }

    // LEADERBOARDS
    match /leaderboards/{leaderboardId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }
  }
}
```

3. Click en "Publicar"

### Paso 8: Configurar Reglas de Storage

1. Ve a **Storage > Reglas**
2. Reemplaza con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return request.auth.token.admin == true;
    }

    // Videos de retos
    match /challenges/{challengeId}/videos/{fileName} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated()
                    && request.resource.size < 50 * 1024 * 1024
                    && request.resource.contentType.matches('video/.*');
      allow delete: if isAdmin();
    }

    // Fotos de perfil
    match /profiles/{userId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated()
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

3. Click en "Publicar"

### Paso 9: Crear Usuario Admin

Para hacer admin a un usuario, necesitas usar Firebase Admin SDK. Ejecuta este script después de configurar el backend:

```python
# scripts/make_admin.py
import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate('firebase-credentials.json')
firebase_admin.initialize_app(cred)

# Reemplaza con el UID del usuario que quieres hacer admin
user_uid = 'USER_UID_AQUI'

# Agregar claim de admin
auth.set_custom_user_claims(user_uid, {'admin': True})

print(f'Usuario {user_uid} ahora es admin')
```

---

## Despliegue del Frontend en Vercel

### Paso 1: Preparar el Proyecto

1. Asegúrate de que el frontend compila correctamente:

```bash
cd apps/frontend
npm install
npm run build
```

### Paso 2: Configurar Variables de Entorno

Crea el archivo `apps/frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "biblia-question.firebaseapp.com",
    projectId: "biblia-question",
    storageBucket: "biblia-question.appspot.com",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
  },
  apiUrl: 'https://biblia-question-api.onrender.com/api/v1'
};
```

### Paso 3: Desplegar en Vercel

**Opción A: Desde CLI**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar (desde la carpeta apps/frontend)
cd apps/frontend
vercel

# Seguir las instrucciones:
# - Set up and deploy: Y
# - Scope: tu cuenta
# - Link to existing project: N
# - Project name: biblia-question
# - Directory: ./
# - Override settings: N
```

**Opción B: Desde Dashboard de Vercel**

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa tu repositorio de GitHub
3. Configura:
   - **Framework Preset**: Angular
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/biblia-question-frontend/browser`

4. Agrega las variables de entorno en Vercel:
   - Ve a Settings > Environment Variables
   - Agrega cada variable del archivo environment

5. Click en "Deploy"

### Paso 4: Configurar Dominio Personalizado (Opcional)

1. En Vercel, ve a Settings > Domains
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones de Vercel

---

## Despliegue del Backend en Render

### Paso 1: Preparar el Proyecto

1. Asegúrate de que el backend funciona localmente:

```bash
cd apps/backend
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### Paso 2: Configurar Credenciales de Firebase

**IMPORTANTE**: Para Render, NO subimos el archivo JSON al repositorio.

En su lugar, convertimos el JSON a una variable de entorno:

```bash
# En tu terminal local
cat firebase-credentials.json | base64
```

Copia el resultado (será una cadena larga).

### Paso 3: Crear Servicio en Render

1. Ve a [render.com/new](https://dashboard.render.com/new)
2. Selecciona "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: biblia-question-api
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Root Directory**: apps/backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

5. Selecciona plan **Free**

### Paso 4: Configurar Variables de Entorno en Render

En la sección "Environment Variables", agrega:

| Key | Value |
|-----|-------|
| `FIREBASE_PROJECT_ID` | biblia-question |
| `FIREBASE_CREDENTIALS_BASE64` | (el base64 del paso 2) |
| `CORS_ORIGINS` | https://biblia-question.vercel.app |
| `ENVIRONMENT` | production |

### Paso 5: Desplegar

1. Click en "Create Web Service"
2. Espera a que termine el build (3-5 minutos)
3. Tu API estará disponible en: `https://biblia-question-api.onrender.com`

### Paso 6: Verificar el Despliegue

```bash
# Verificar que la API responde
curl https://biblia-question-api.onrender.com/health

# Debería responder:
# {"status": "healthy", "version": "1.0.0"}
```

---

## Variables de Entorno

### Frontend (Vercel)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `FIREBASE_API_KEY` | API Key de Firebase | AIza... |
| `FIREBASE_AUTH_DOMAIN` | Dominio de Auth | proyecto.firebaseapp.com |
| `FIREBASE_PROJECT_ID` | ID del proyecto | biblia-question |
| `FIREBASE_STORAGE_BUCKET` | Bucket de Storage | proyecto.appspot.com |
| `FIREBASE_MESSAGING_SENDER_ID` | ID de Messaging | 123456789 |
| `FIREBASE_APP_ID` | ID de la App | 1:123...:web:abc... |
| `API_URL` | URL del backend | https://api.ejemplo.com |

### Backend (Render)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `FIREBASE_PROJECT_ID` | ID del proyecto | biblia-question |
| `FIREBASE_CREDENTIALS_BASE64` | Credenciales en base64 | eyJ0eXBlIjoi... |
| `CORS_ORIGINS` | URLs permitidas (separadas por coma) | https://app.com |
| `ENVIRONMENT` | Entorno actual | production |

---

## Comandos Útiles

### Desarrollo Local

```bash
# Frontend
cd apps/frontend
npm install
npm start                    # http://localhost:4200

# Backend
cd apps/backend
pip install -r requirements.txt
uvicorn src.main:app --reload  # http://localhost:8000

# Ver documentación de API
open http://localhost:8000/docs
```

### Build para Producción

```bash
# Frontend
cd apps/frontend
npm run build -- --configuration production

# Backend (no requiere build, es Python)
```

### Tests

```bash
# Frontend
cd apps/frontend
npm test
npm run test:coverage

# Backend
cd apps/backend
pytest
pytest --cov=src
```

### Actualizar Dependencias

```bash
# Frontend
cd apps/frontend
npm update
npm audit fix

# Backend
cd apps/backend
pip install --upgrade -r requirements.txt
```

---

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"

**Causa**: API Key incorrecta o no configurada.

**Solución**:
1. Verifica que copiaste correctamente la API Key de Firebase Console
2. Asegúrate de que las variables de entorno están configuradas en Vercel

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Causa**: El backend no tiene configurado CORS correctamente.

**Solución**:
1. Verifica la variable `CORS_ORIGINS` en Render
2. Asegúrate de incluir la URL completa del frontend (con https://)
3. Reinicia el servicio en Render después de cambiar variables

### Error: "Firebase Admin SDK could not auto-discover"

**Causa**: Credenciales de Firebase no configuradas en el backend.

**Solución**:
1. Verifica que `FIREBASE_CREDENTIALS_BASE64` está configurado
2. Asegúrate de que el base64 es correcto (sin saltos de línea)

### Error: "Cold start timeout" en Render

**Causa**: El plan gratuito de Render tiene "cold starts" de ~30 segundos.

**Solución**:
- Es normal en el plan gratuito
- La primera request después de 15 minutos de inactividad será lenta
- Considera upgrade a plan pago si es crítico

### Error: "Build failed" en Vercel

**Causa**: Posible error en el código o configuración incorrecta.

**Solución**:
1. Revisa los logs de build en Vercel
2. Asegúrate de que `npm run build` funciona localmente
3. Verifica que la estructura de carpetas es correcta

### Error: "Permission denied" en Firestore

**Causa**: Reglas de seguridad bloquean la operación.

**Solución**:
1. Verifica las reglas en Firebase Console
2. Asegúrate de que el usuario está autenticado
3. Para operaciones admin, verifica que el claim `admin: true` está configurado

### Video no se reproduce en la plataforma

**Causa**: ID de YouTube incorrecto o video privado/eliminado.

**Solución**:
1. Verifica que el ID de YouTube es correcto
2. Asegúrate de que el video es público o no listado
3. Prueba el ID en: `https://www.youtube.com/watch?v=ID_AQUI`

---

## Monitoreo y Logs

### Vercel

- Dashboard > tu proyecto > Deployments
- Click en cualquier deployment para ver logs

### Render

- Dashboard > tu servicio > Logs
- Logs en tiempo real disponibles

### Firebase

- Console > Firestore Database > Uso
- Console > Authentication > Usage
- Console > Storage > Usage

---

## Costos Estimados (Plan Gratuito)

| Servicio | Límite Gratuito | Notas |
|----------|-----------------|-------|
| Vercel | 100GB bandwidth/mes | Suficiente para ~10K usuarios |
| Render | 750 horas/mes | Cold starts después de 15min |
| Firebase Auth | 50K usuarios/mes | Más que suficiente |
| Firestore | 1GB storage, 50K lecturas/día | Monitoreae uso |
| Firebase Storage | 5GB | Suficiente para videos iniciales |

### Cuándo Escalar

Considera upgrade cuando:
- Más de 1000 usuarios activos diarios
- Necesitas eliminar cold starts del backend
- Necesitas más storage para videos
- Llegas a límites de lectura de Firestore

---

## Checklist de Despliegue

### Pre-despliegue

- [ ] Firebase proyecto creado
- [ ] Authentication habilitado
- [ ] Firestore creado con reglas
- [ ] Storage creado con reglas
- [ ] Credenciales del frontend copiadas
- [ ] Credenciales del backend descargadas
- [ ] Código compila sin errores

### Despliegue

- [ ] Frontend desplegado en Vercel
- [ ] Backend desplegado en Render
- [ ] Variables de entorno configuradas
- [ ] CORS configurado correctamente

### Post-despliegue

- [ ] Login funciona
- [ ] Registro funciona
- [ ] API responde correctamente
- [ ] Firebase conecta correctamente
- [ ] Videos de YouTube cargan
- [ ] Usuario admin creado

---

## Soporte

Para problemas técnicos:
1. Revisa esta documentación
2. Revisa los logs del servicio correspondiente
3. Busca el error específico en la documentación de Firebase/Vercel/Render
