# Senda

Senda es una app personal para llevar el seguimiento de una carrera universitaria de forma mas comoda que con una hoja de Excel, especialmente desde el movil.

La idea principal es tener una vision clara del progreso real de la titulacion, las asignaturas aprobadas, pendientes o en curso, y poder planificar escenarios del tipo: "si este semestre cojo estas asignaturas, cuanto me cargo de horas y como queda el avance?".

## Para que sirve

- Consultar el progreso de la carrera por creditos y asignaturas.
- Ver cuanto queda para terminar segun el ritmo de asignaturas por semestre.
- Gestionar asignaturas por estado: pendiente, cursando o aprobada.
- Marcar asignaturas convalidadas de forma informativa, sin contarlas automaticamente como superadas.
- Filtrar y buscar asignaturas por texto, tipo, estado o convalidacion.
- Crear escenarios de planificacion para probar combinaciones de asignaturas.
- Guardar los datos en local o sincronizarlos con una cuenta mediante Firebase.
- Usarla comodamente en movil, con soporte de modo claro, oscuro y tema del sistema.

## Tecnologias

- **React 18** para la interfaz.
- **TypeScript** para tipado y mantenimiento del codigo.
- **Vite** como entorno de desarrollo y build.
- **Firebase Authentication** para iniciar sesion con Google.
- **Cloud Firestore** para sincronizar los datos por usuario.
- **localStorage** como modo local cuando Firebase no esta configurado o no hay sesion.
- **Lucide React** para iconos.
- **CSS propio** con variables de tema, responsive design y soporte claro/oscuro.
- **Vercel** como plataforma prevista de despliegue.

## Modelo de datos

La app parte de una plantilla base de asignaturas, pero los datos modificados por cada persona se guardan en su propia cuenta.

Cuando hay sesion iniciada, Senda guarda el estado completo en Firestore dentro de:

```txt
users/{uid}
```

Asi, cada usuario ve solo sus propios datos. Las reglas de Firestore estan en:

```txt
firestore.rules
```

## Desarrollo

Instalar dependencias:

```bash
pnpm install
```

Arrancar entorno local:

```bash
pnpm run dev
```

Compilar para produccion:

```bash
pnpm run build
```

Previsualizar la build:

```bash
pnpm run preview
```

## Firebase

La app puede funcionar sin Firebase usando `localStorage`. Para sincronizar entre dispositivos hay que configurar Firebase.

Pasos:

1. Crear un proyecto en Firebase.
2. Activar Authentication con Google.
3. Crear una app web dentro del proyecto.
4. Copiar la configuracion web de Firebase.
5. Crear un archivo `.env` a partir de `.env.example`.
6. Rellenar las variables:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

7. Publicar las reglas de `firestore.rules` en Cloud Firestore.
8. Reiniciar Vite.

Las claves web de Firebase no son secretas. La proteccion de los datos depende de las reglas de Firestore y de guardar cada estado bajo el `uid` del usuario autenticado.

## Despliegue en Vercel

Configuracion recomendada:

- **Framework Preset:** Vite
- **Build Command:** `pnpm run build`
- **Output Directory:** `dist`

Tambien hay que añadir en Vercel las mismas variables `VITE_FIREBASE_*` usadas en local.

## Estado del proyecto

Senda esta pensada como una herramienta personal, pero preparada para que otra persona pueda entrar con su propia cuenta y empezar desde la plantilla inicial sin ver datos ajenos.
