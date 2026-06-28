import { useEffect, useMemo, useState } from 'react';
import type { AppState, Scenario, Subject, SubjectStatus } from '../types';
import { getProgressStats } from '../lib/stats';
import {
  firebaseReady,
  getBaseState,
  loadLocalState,
  loadRemoteState,
  saveLocalState,
  saveRemoteState,
  signInWithGoogle,
  signOutRemote,
  subscribeToAuth,
} from '../lib/storage';

export function useSendaState() {
  const [state, setState] = useState<AppState>(() => loadLocalState());
  const [userId, setUserId] = useState<string | null>(null);
  const [remoteHydrated, setRemoteHydrated] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [syncState, setSyncState] = useState<'local' | 'loading' | 'synced' | 'error'>(
    firebaseReady ? 'loading' : 'local',
  );

  useEffect(() => {
    saveLocalState(state);
    if (userId && remoteHydrated) {
      setSyncState('loading');
      void saveRemoteState(userId, state)
        .then(() => {
          setSyncState('synced');
          setSyncMessage('Sincronizado.');
        })
        .catch((error: Error) => {
          setSyncState('error');
          setSyncMessage(error.message);
        });
    }
  }, [state, userId, remoteHydrated]);

  useEffect(() => {
    if (!firebaseReady) return;

    return subscribeToAuth((user) => {
      setUserId(user?.uid ?? null);
      setRemoteHydrated(!user);
      setSyncState(user ? 'loading' : 'local');
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setRemoteHydrated(false);
    setSyncState('loading');

    void loadRemoteState(userId).then((remoteState) => {
      if (cancelled) return;
      if (remoteState) {
        setState(remoteState);
      }
      setRemoteHydrated(true);
      setSyncState('synced');
      setSyncMessage(remoteState ? 'Datos remotos cargados.' : 'Primer guardado remoto preparado.');
    }).catch((error: Error) => {
      if (cancelled) return;
      setRemoteHydrated(true);
      setSyncState('error');
      setSyncMessage(error.message);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const stats = useMemo(
    () => getProgressStats(state.subjects, state.settings.subjectsPerSemester),
    [state.subjects, state.settings.subjectsPerSemester],
  );
  const selectedScenario =
    state.scenarios.find((scenario) => scenario.id === state.selectedScenarioId) ?? state.scenarios[0];

  const updateSubject = (subjectId: string, patch: Partial<Subject>) => {
    setState((current) => ({
      ...current,
      subjects: current.subjects.map((subject) =>
        subject.id === subjectId ? { ...subject, ...patch } : subject,
      ),
    }));
  };

  const setSubjectStatus = (subjectId: string, status: SubjectStatus) => {
    updateSubject(subjectId, { status });
  };

  const updateScenario = (scenarioId: string, patch: Partial<Scenario>) => {
    setState((current) => ({
      ...current,
      scenarios: current.scenarios.map((scenario) =>
        scenario.id === scenarioId ? { ...scenario, ...patch } : scenario,
      ),
    }));
  };

  const toggleSubjectInScenario = (scenarioId: string, subjectId: string) => {
    setState((current) => ({
      ...current,
      scenarios: current.scenarios.map((scenario) => {
        if (scenario.id !== scenarioId) return scenario;
        const exists = scenario.items.some((item) => item.subjectId === subjectId);
        return {
          ...scenario,
          items: exists
            ? scenario.items.filter((item) => item.subjectId !== subjectId)
            : [...scenario.items, { subjectId, plannedStatus: 'active' }],
        };
      }),
    }));
  };

  const selectScenario = (scenarioId: string) => {
    setState((current) => ({ ...current, selectedScenarioId: scenarioId }));
  };

  const updateSubjectsPerSemester = (subjectsPerSemester: number) => {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        subjectsPerSemester: Math.max(1, subjectsPerSemester),
      },
    }));
  };

  const resetToBaseState = () => {
    setState(getBaseState());
    setSyncMessage(userId ? 'Datos base cargados. Sincronizando...' : 'Datos base cargados en este navegador.');
  };

  const signIn = async () => {
    if (!firebaseReady) return;

    try {
      await signInWithGoogle();
      setAuthMessage('');
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    }
  };

  const signOut = async () => {
    if (!firebaseReady) return;
    await signOutRemote();
    setUserId(null);
    setRemoteHydrated(false);
    setAuthMessage('');
    setSyncMessage('');
    setSyncState('local');
  };

  return {
    state,
    stats,
    selectedScenario,
    remoteReady: firebaseReady,
    userId,
    authMessage,
    syncMessage,
    syncState,
    remoteHydrated,
    setState,
    updateSubject,
    setSubjectStatus,
    updateScenario,
    toggleSubjectInScenario,
    selectScenario,
    updateSubjectsPerSemester,
    resetToBaseState,
    signIn,
    signOut,
  };
}
