import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  initializeFirestore,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import { initialState, initialSubjects } from '../data/seed';
import type { AppState, Subject } from '../types';

const STORAGE_KEY = 'senda:v1';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

export const firebaseApp: FirebaseApp | null = hasFirebaseConfig
  ? initializeApp(firebaseConfig)
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db: Firestore | null = firebaseApp
  ? initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true })
  : null;
export const firebaseReady = Boolean(firebaseApp && auth && db);

export function getBaseState(): AppState {
  return normalizeState(structuredClone(initialState));
}

function normalizeSubjects(subjects: Subject[] | undefined): Subject[] {
  const sourceSubjects = subjects?.length ? subjects : initialSubjects;
  const defaultsById = new Map(initialSubjects.map((subject) => [subject.id, subject]));

  return sourceSubjects.map((subject) => {
    const defaultSubject = defaultsById.get(subject.id);

    return {
      ...subject,
      convalidated: subject.convalidated ?? defaultSubject?.convalidated ?? false,
    };
  });
}

export function normalizeState(state: Partial<AppState> | null | undefined): AppState {
  return {
    subjects: normalizeSubjects(state?.subjects),
    scenarios: state?.scenarios?.length ? state.scenarios : initialState.scenarios,
    selectedScenarioId: state?.selectedScenarioId ?? initialState.selectedScenarioId,
    settings: {
      subjectsPerSemester:
        state?.settings?.subjectsPerSemester && state.settings.subjectsPerSemester > 0
          ? state.settings.subjectsPerSemester
          : initialState.settings.subjectsPerSemester,
    },
  };
}

export function loadLocalState(): AppState {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return getBaseState();
  }

  try {
    const parsed = JSON.parse(raw) as AppState;
    return normalizeState(parsed);
  } catch {
    return getBaseState();
  }
}

export function saveLocalState(state: AppState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  if (!auth) return () => undefined;
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  if (!auth) return;
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function signOutRemote() {
  if (!auth) return;
  await firebaseSignOut(auth);
}

export async function loadRemoteState(userId: string): Promise<AppState | null> {
  if (!db) return null;

  const snapshot = await getDoc(doc(db, 'users', userId));
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as { state?: Partial<AppState> };
  return normalizeState(data.state);
}

export async function saveRemoteState(userId: string, state: AppState) {
  if (!db) return;

  await setDoc(
    doc(db, 'users', userId),
    {
      state,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
