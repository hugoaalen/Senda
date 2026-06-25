# Senda

Planificador móvil-first para seguir la carrera de Ingeniería Informática: progreso, asignaturas y escenarios de carga.

## Stack

- Vite
- React
- TypeScript
- Firebase opcional
- Vercel-ready

## Desarrollo

```bash
pnpm install
pnpm run dev
```

## Firebase

La app funciona sin Firebase usando `localStorage`. Con Firebase activado, sincroniza el estado completo del usuario en Firestore.

Para activar sincronización:

1. En Firebase Console, entra en tu proyecto `Senda`.
2. Ve a Authentication > Comenzar.
3. En Sign-in method, activa Google.
4. Ve a Project settings > General.
5. En "Tus apps", crea app Web `Senda`.
6. Copia la config `firebaseConfig`.
7. Copia `.env.example` a `.env`.
8. Rellena:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

9. Ve a Firestore > Reglas y pega `firestore.rules`.
10. Reinicia Vite.
11. Añade esas variables también en Vercel.

Las claves Firebase Web son públicas. La seguridad real está en `firestore.rules`.

## Deploy

En Vercel:

- Framework Preset: `Vite`
- Build Command: `pnpm run build`
- Output Directory: `dist`
