import { BookOpenCheck, CalendarDays, Check, Circle, Gauge, GraduationCap, ListFilter, WifiOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSendaState } from './hooks/useSendaState';
import { getScenarioLoad } from './lib/stats';
import type { Subject, SubjectStatus, SubjectType } from './types';

type Tab = 'dashboard' | 'subjects' | 'scenarios';
type Filter = 'all' | SubjectStatus;
type TypeFilter = 'all' | SubjectType;
type ConvalidatedFilter = 'all' | 'convalidated' | 'not-convalidated';

const statusLabel: Record<SubjectStatus, string> = {
  pending: 'Pendiente',
  active: 'Cursando',
  passed: 'Aprobada',
};

const statusIcon: Record<SubjectStatus, typeof Circle> = {
  pending: Circle,
  active: BookOpenCheck,
  passed: Check,
};

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const formatDecimal = (value: number) =>
  new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(value);

function App() {
  const {
    state,
    stats,
    selectedScenario,
    remoteReady,
    userId,
    authMessage,
    syncMessage,
    syncState,
    remoteHydrated,
    setSubjectStatus,
    updateSubject,
    updateScenario,
    toggleSubjectInScenario,
    selectScenario,
    updateSubjectsPerSemester,
    signIn,
    signOut,
  } = useSendaState();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [filter, setFilter] = useState<Filter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [convalidatedFilter, setConvalidatedFilter] = useState<ConvalidatedFilter>('all');
  const [query, setQuery] = useState('');

  const scenarioLoad = selectedScenario ? getScenarioLoad(state, selectedScenario) : null;
  const progressPercent = Math.round((stats.passedCredits / stats.totalCredits) * 100);

  const filteredSubjects = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return state.subjects.filter((subject) => {
      const matchesFilter = filter === 'all' || subject.status === filter;
      const matchesType = typeFilter === 'all' || subject.type === typeFilter;
      const matchesConvalidated =
        convalidatedFilter === 'all' ||
        (convalidatedFilter === 'convalidated' && subject.convalidated) ||
        (convalidatedFilter === 'not-convalidated' && !subject.convalidated);
      const haystack = normalizeSearch(
        `${subject.name} ${subject.type} ${subject.itinerary ?? ''} ${subject.area ?? ''}`,
      );
      return matchesFilter && matchesType && matchesConvalidated && haystack.includes(normalizedQuery);
    });
  }, [convalidatedFilter, filter, query, state.subjects, typeFilter]);

  const convalidatedSubjects = useMemo(
    () => state.subjects.filter((subject) => subject.convalidated),
    [state.subjects],
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Ingeniería Informática</p>
          <h1>Senda</h1>
        </div>
        <div className={`sync-pill ${syncState}`} title={remoteReady ? 'Firebase configurado' : 'Guardado local'}>
          {remoteReady ? <Gauge size={16} /> : <WifiOff size={16} />}
          {userId ? 'Sync activo' : remoteReady ? 'Login listo' : 'Local'}
        </div>
      </header>

      <nav className="tabs" aria-label="Vistas">
        <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
          <Gauge size={18} /> Progreso
        </button>
        <button className={tab === 'subjects' ? 'active' : ''} onClick={() => setTab('subjects')}>
          <GraduationCap size={18} /> Asignaturas
        </button>
        <button className={tab === 'scenarios' ? 'active' : ''} onClick={() => setTab('scenarios')}>
          <CalendarDays size={18} /> Escenarios
        </button>
      </nav>

      {tab === 'dashboard' && (
        <section className="stack">
          <section className="hero-panel">
            <div>
              <p className="eyebrow">Créditos superados</p>
              <div className="progress-number">{stats.passedCredits}</div>
              <p>de {stats.totalCredits} créditos</p>
            </div>
            <div className="radial" style={{ '--progress': `${progressPercent}%` } as React.CSSProperties}>
              <span>{progressPercent}%</span>
            </div>
          </section>

          <section className="metric-grid">
            <Metric label="Aprobadas" value={stats.passedSubjects} />
            <Metric label="Cursando" value={stats.activeSubjects} />
            <Metric label="Pendientes" value={stats.pendingSubjects} />
            <Metric label="Convalidadas" value={stats.convalidatedSubjects} />
            <Metric label="Media" value={stats.averageGrade ?? '-'} />
          </section>

          <section className="panel">
            <div className="section-title">
              <div>
                <p className="eyebrow">Informativo</p>
                <h2>Asignaturas convalidadas</h2>
              </div>
            </div>
            <div className="planned-list convalidated-list">
              {convalidatedSubjects.map((subject) => (
                <span key={subject.id}>{subject.name}</span>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-title">
              <div>
                <p className="eyebrow">Para acabar</p>
                <h2>Lo que queda de carrera</h2>
              </div>
              <label className="pace-control">
                <span>Asignaturas/semestre</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={state.settings.subjectsPerSemester}
                  onChange={(event) => updateSubjectsPerSemester(Number(event.target.value))}
                />
              </label>
            </div>
            <div className="remaining-grid">
              <Metric label="Créditos restantes" value={stats.pendingCredits} />
              <Metric label="Asignaturas aprox." value={formatDecimal(stats.remainingEquivalentSubjects)} />
              <Metric
                label={`Semestres a ${state.settings.subjectsPerSemester} asignaturas`}
                value={formatDecimal(stats.remainingSemesters)}
              />
              <Metric label="Años a ese ritmo" value={formatDecimal(stats.remainingYearsAtTwoSemesters)} />
            </div>
          </section>

          {selectedScenario && scenarioLoad && (
            <section className="panel">
              <div className="section-title">
                <div>
                  <p className="eyebrow">Plan activo</p>
                  <h2>{selectedScenario.name}</h2>
                </div>
                <button className="ghost-button" onClick={() => setTab('scenarios')}>
                  Editar
                </button>
              </div>
              <div className="load-row">
                <div>
                  <strong>{scenarioLoad.hours} h/sem</strong>
                  <span>capacidad {selectedScenario.weeklyCapacity} h</span>
                </div>
                <div className="load-track">
                  <span className={scenarioLoad.overload ? 'danger' : ''} style={{ width: `${scenarioLoad.fitPercent}%` }} />
                </div>
              </div>
              <div className="planned-list">
                {scenarioLoad.subjects.map((subject) => (
                  <span key={subject.id}>{subject.name}</span>
                ))}
              </div>
            </section>
          )}

          <section className="panel account-panel">
            <div>
              <p className="eyebrow">Datos</p>
              <h2>{userId ? 'Sincronización activada' : remoteReady ? 'Firebase disponible' : 'Guardado local'}</h2>
              <p>
                {userId
                  ? remoteHydrated
                    ? syncState === 'error'
                      ? `Error de sync: ${syncMessage}`
                      : 'Tus cambios se guardan en este navegador y en Firebase.'
                    : 'Cargando datos remotos.'
                  : remoteReady
                    ? 'Inicia sesión para sincronizar entre dispositivos.'
                    : 'Añade variables Firebase para activar sincronización.'}
              </p>
            </div>
            {remoteReady && !userId && (
              <button className="ghost-button" onClick={() => void signIn()}>
                Entrar con Google
              </button>
            )}
            {userId && (
              <button className="ghost-button" onClick={() => void signOut()}>
                Salir
              </button>
            )}
            {authMessage && <p className="auth-message">{authMessage}</p>}
            {userId && syncMessage && <p className="auth-message">{syncMessage}</p>}
          </section>
        </section>
      )}

      {tab === 'subjects' && (
        <section className="stack">
          <div className="toolbar">
            <div className="search-box">
              <ListFilter size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar asignatura"
              />
            </div>
            <select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="active">Cursando</option>
              <option value="passed">Aprobadas</option>
            </select>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}>
              <option value="all">Todos los tipos</option>
              <option value="Básica">Básicas</option>
              <option value="Obligatoria">Obligatorias</option>
              <option value="Optativa">Optativas</option>
              <option value="Sin asignar">Sin asignar</option>
            </select>
            <select
              value={convalidatedFilter}
              onChange={(event) => setConvalidatedFilter(event.target.value as ConvalidatedFilter)}
            >
              <option value="all">Todas</option>
              <option value="convalidated">Convalidadas</option>
              <option value="not-convalidated">No convalidadas</option>
            </select>
          </div>

          <div className="subject-list">
            {filteredSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onStatusChange={(status) => setSubjectStatus(subject.id, status)}
                onUpdate={(patch) => updateSubject(subject.id, patch)}
              />
            ))}
          </div>
        </section>
      )}

      {tab === 'scenarios' && selectedScenario && scenarioLoad && (
        <section className="stack">
          <section className="panel">
            <div className="section-title">
              <div>
                <p className="eyebrow">Escenario</p>
                <h2>{selectedScenario.name}</h2>
              </div>
              <select value={selectedScenario.id} onChange={(event) => selectScenario(event.target.value)}>
                {state.scenarios.map((scenario) => (
                  <option value={scenario.id} key={scenario.id}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="field">
              <span>Periodo</span>
              <input
                value={selectedScenario.period}
                onChange={(event) => updateScenario(selectedScenario.id, { period: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Capacidad semanal</span>
              <input
                type="number"
                min="1"
                value={selectedScenario.weeklyCapacity}
                onChange={(event) =>
                  updateScenario(selectedScenario.id, { weeklyCapacity: Number(event.target.value) })
                }
              />
            </label>

            <div className="scenario-summary">
              <Metric label="Asignaturas" value={scenarioLoad.subjects.length} />
              <Metric label="Créditos" value={scenarioLoad.credits} />
              <Metric label="Horas/sem" value={scenarioLoad.hours} />
            </div>
          </section>

          <section className="panel">
            <div className="section-title">
              <h2>Elegir asignaturas</h2>
            </div>
            <div className="picker-list">
              {state.subjects
                .filter((subject) => subject.status !== 'passed')
                .map((subject) => {
                  const checked = selectedScenario.items.some((item) => item.subjectId === subject.id);
                  return (
                    <button
                      key={subject.id}
                      className={checked ? 'picker selected' : 'picker'}
                      onClick={() => toggleSubjectInScenario(selectedScenario.id, subject.id)}
                    >
                      <span>{subject.name}</span>
                      <small>{subject.credits} cr · {subject.weeklyHours} h/sem</small>
                    </button>
                  );
                })}
            </div>
          </section>
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SubjectCard({
  subject,
  onStatusChange,
  onUpdate,
}: {
  subject: Subject;
  onStatusChange: (status: SubjectStatus) => void;
  onUpdate: (patch: Partial<Subject>) => void;
}) {
  const Icon = statusIcon[subject.status];

  return (
    <article className={`subject-card ${subject.status} ${subject.convalidated ? 'convalidated' : ''}`}>
      <div className="subject-main">
        <div className="status-mark">
          <Icon size={18} />
        </div>
        <div>
          <h3>{subject.name}</h3>
          <p>
            {subject.type} · {subject.credits} créditos · {subject.semester}
          </p>
          {subject.convalidated && <small className="convalidated-note">Convalidada · no cuenta como superada</small>}
          {subject.recommended && <small>Recomendado: {subject.recommended}</small>}
        </div>
      </div>
      <div className="subject-controls">
        <select value={subject.status} onChange={(event) => onStatusChange(event.target.value as SubjectStatus)}>
          <option value="pending">Pendiente</option>
          <option value="active">Cursando</option>
          <option value="passed">Aprobada</option>
        </select>
        <label>
          <span>Horas</span>
          <input
            type="number"
            min="0"
            value={subject.weeklyHours ?? 0}
            onChange={(event) => onUpdate({ weeklyHours: Number(event.target.value) })}
          />
        </label>
        <label>
          <span>Nota</span>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={subject.grade ?? ''}
            onChange={(event) =>
              onUpdate({ grade: event.target.value === '' ? undefined : Number(event.target.value) })
            }
          />
        </label>
        <label className="toggle-field">
          <span>Convalidada</span>
          <input
            type="checkbox"
            checked={Boolean(subject.convalidated)}
            onChange={(event) => onUpdate({ convalidated: event.target.checked })}
          />
        </label>
      </div>
      <div className="status-text">{statusLabel[subject.status]}</div>
    </article>
  );
}

export default App;
