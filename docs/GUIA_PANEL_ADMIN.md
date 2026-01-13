# Guia del Panel de Administracion - Biblia Question

## Acceso al Panel de Admin

### Requisitos
- Tener una cuenta con rol de **admin**
- Estar logueado en la plataforma

### Como acceder
1. Inicia sesion con tu cuenta de admin
2. En el menu superior, veras la opcion **"Admin"**
3. Click en **"Admin"** para acceder al panel de administracion

---

## Funciones del Panel de Admin

### 1. Dashboard Principal
**Ruta:** `/admin`

Vista general con:
- Torneo activo actual
- Numero de participantes
- Semana actual del torneo
- Videos pendientes de revision
- Preguntas cargadas

---

### 2. Gestion de Torneos
**Ruta:** `/admin/tournaments`

#### Crear nuevo torneo:
1. Click en **"Crear Torneo"**
2. Completa los campos:
   - **Nombre del torneo**: Ej. "Torneo Enero 2026"
   - **Descripcion**: Breve descripcion del torneo
   - **Fecha de inicio**: Cuando inicia el torneo
   - **Duracion**: Numero de semanas (por defecto 15)
3. Click en **"Crear"**

#### Editar torneo:
- Click en el icono de editar junto al torneo
- Modifica los campos necesarios
- Click en **"Guardar"**

---

### 3. Importar Preguntas
**Ruta:** `/admin/questions/import`

#### Formato del Excel:
El archivo Excel debe tener las siguientes columnas:

| Columna | Nombre | Descripcion | Ejemplo |
|---------|--------|-------------|---------|
| A | Semana | Numero de semana (1-15) | 1 |
| B | Dia | Numero de dia (1-7) | 1 |
| C | Numero | Numero de pregunta (1-5) | 1 |
| D | Pregunta | Texto de la pregunta | ¿Que significa...? |
| E | Referencia | Cita biblica | Juan 3:16 |
| F | Versiculo | Texto completo del versiculo | "Porque de tal manera..." |
| G | OpcionA | Primera opcion | Unico creado |
| H | OpcionB | Segunda opcion | Unico engendrado |
| I | OpcionC | Tercera opcion | Primero de muchos |
| J | OpcionD | Cuarta opcion | El mas amado |
| K | Correcta | Letra de respuesta correcta (A, B, C o D) | B |
| L | YouTubeShort | ID del video short de YouTube | abc123xyz |
| M | Extra | Es pregunta extra? (SI/NO) | NO |
| N | YouTubeLargo | ID del video largo del dia | VIDEO_LARGO_1 |

#### Como importar:
1. Selecciona el **torneo** destino
2. Arrastra o selecciona el archivo **Excel**
3. Revisa la **vista previa** de las preguntas
4. Verifica que no haya **errores**
5. Click en **"Importar"**

#### Notas importantes:
- La pregunta 5 de cada dia es la **pregunta extra** (marca "SI" en columna Extra)
- El video largo solo se pone en la ultima fila de cada dia
- Los IDs de YouTube NO incluyen la URL completa, solo el ID

---

### 4. Gestion de Contenido Diario
**Ruta:** `/admin/daily-content`

Configura el contenido de cada dia:
- **Cita biblica del dia**: Referencia y texto del versiculo
- **Videos de YouTube**: IDs de los shorts para cada pregunta
- **Video largo del dia**: ID del video de estudio
- **Reto del dia**: Descripcion del reto y duracion maxima

---

### 5. Revision de Videos
**Ruta:** `/admin/videos`

Los participantes suben videos cumpliendo retos diarios.

#### Como revisar:
1. Filtra por **semana** y **dia** si es necesario
2. Reproduce el video del participante
3. Opciones:
   - **Aprobar**: El participante recibe 5 estrellas
   - **Rechazar**: El participante puede volver a subir
   - **Comentar**: Dejar feedback al participante

---

### 6. Estadisticas
**Ruta:** `/admin/statistics`

Visualiza:
- **Participacion por semana**: Porcentaje de usuarios activos
- **Top 10 ranking**: Mejores participantes
- **Total de estrellas**: Estrellas otorgadas en el torneo
- **Exportar a Excel**: Descarga las estadisticas

---

## Sistema de Puntuacion

### Estrellas por actividad:

| Actividad | Estrellas | Condicion |
|-----------|-----------|-----------|
| Pregunta normal (1-4) | 1 estrella | Respuesta correcta |
| Pregunta extra (5) | 3 estrellas | Respuesta correcta |
| Reto diario (video) | 5 estrellas | Video aprobado por admin |

### Maximo por dia: 12 estrellas
- 4 preguntas normales = 4 estrellas
- 1 pregunta extra = 3 estrellas
- 1 reto diario = 5 estrellas

### Maximo por torneo (15 semanas): 1,260 estrellas

---

## Obtencion de IDs de YouTube

### Video normal:
```
URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
ID:  dQw4w9WgXcQ
```

### YouTube Short:
```
URL: https://www.youtube.com/shorts/abc123xyz
ID:  abc123xyz
```

---

## Flujo Recomendado para Iniciar un Torneo

```
1. Crear Torneo
      |
      v
2. Preparar Excel con preguntas (105 preguntas = 15 semanas x 7 dias x 5 preguntas)
      |
      v
3. Importar preguntas al torneo
      |
      v
4. Configurar contenido diario (opcional, se puede hacer dia a dia)
      |
      v
5. Publicar URL a participantes
      |
      v
6. Revisar videos de retos diariamente
```

---

## Solucion de Problemas

### "No veo la opcion Admin"
- Verifica que tu cuenta tenga rol de admin
- Cierra sesion y vuelve a entrar

### "Error al importar preguntas"
- Verifica el formato del Excel
- Asegurate de que las columnas tengan los nombres correctos
- Revisa que no haya celdas vacias en campos obligatorios

### "Los videos de YouTube no cargan"
- Verifica que el ID sea correcto
- Asegurate de que el video sea publico o no listado
- Prueba el ID directamente en YouTube

---

## Contacto

Para soporte tecnico, contactar al desarrollador.

Para dudas sobre contenido, contactar a William Pardo.

---

*Documento actualizado: Enero 2026*
