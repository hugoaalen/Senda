import type { AppState, ProgressStats, Scenario, SubjectType } from '../types';

export const TOTAL_DEGREE_CREDITS = 240;
const trackedTypes: SubjectType[] = ['Básica', 'Obligatoria', 'Optativa'];

export function getProgressStats(subjects: AppState['subjects'], subjectsPerSemester: number): ProgressStats {
  const passed = subjects.filter((subject) => subject.status === 'passed');
  const active = subjects.filter((subject) => subject.status === 'active');
  const pending = subjects.filter((subject) => subject.status === 'pending');
  const convalidated = subjects.filter((subject) => subject.convalidated);
  const graded = passed.filter((subject) => typeof subject.grade === 'number');
  const passedCredits = passed.reduce((sum, subject) => sum + subject.credits, 0);
  const convalidatedCredits = convalidated.reduce((sum, subject) => sum + subject.credits, 0);
  const convalidatedPassedCredits = convalidated
    .filter((subject) => subject.status === 'passed')
    .reduce((sum, subject) => sum + subject.credits, 0);
  const convalidatedActiveCredits = convalidated
    .filter((subject) => subject.status === 'active')
    .reduce((sum, subject) => sum + subject.credits, 0);
  const convalidatedPendingCredits = Math.max(
    0,
    convalidatedCredits - convalidatedPassedCredits - convalidatedActiveCredits,
  );
  const pendingCredits = Math.max(0, TOTAL_DEGREE_CREDITS - passedCredits);
  const remainingEquivalentSubjects = pendingCredits / 6;
  const remainingSemesters = remainingEquivalentSubjects / Math.max(1, subjectsPerSemester);
  const byType = trackedTypes.map((type) => {
    const typeSubjects = subjects.filter((subject) => subject.type === type);
    const passedTypeSubjects = typeSubjects.filter((subject) => subject.status === 'passed');
    const activeTypeSubjects = typeSubjects.filter((subject) => subject.status === 'active');
    const totalCredits = typeSubjects.reduce((sum, subject) => sum + subject.credits, 0);
    const typePassedCredits = passedTypeSubjects.reduce((sum, subject) => sum + subject.credits, 0);
    const typeActiveCredits = activeTypeSubjects.reduce((sum, subject) => sum + subject.credits, 0);

    return {
      type,
      totalSubjects: typeSubjects.length,
      passedSubjects: passedTypeSubjects.length,
      activeSubjects: activeTypeSubjects.length,
      totalCredits,
      passedCredits: typePassedCredits,
      activeCredits: typeActiveCredits,
      percentage: totalCredits ? Math.round((typePassedCredits / totalCredits) * 100) : 0,
      activePercentage: totalCredits ? Math.round((typeActiveCredits / totalCredits) * 100) : 0,
    };
  });

  return {
    totalCredits: TOTAL_DEGREE_CREDITS,
    passedCredits,
    activeCredits: active.reduce((sum, subject) => sum + subject.credits, 0),
    pendingCredits,
    convalidatedCredits,
    convalidatedPassedCredits,
    convalidatedActiveCredits,
    convalidatedPendingCredits,
    convalidatedProgress: convalidatedCredits
      ? Math.round((convalidatedPassedCredits / convalidatedCredits) * 100)
      : 0,
    convalidatedActiveProgress: convalidatedCredits
      ? Math.round((convalidatedActiveCredits / convalidatedCredits) * 100)
      : 0,
    remainingEquivalentSubjects,
    remainingSemesters,
    remainingYearsAtTwoSemesters: remainingSemesters / 2,
    passedSubjects: passed.length,
    activeSubjects: active.length,
    pendingSubjects: pending.length,
    convalidatedSubjects: convalidated.length,
    averageGrade: graded.length
      ? Number((graded.reduce((sum, subject) => sum + (subject.grade ?? 0), 0) / graded.length).toFixed(2))
      : null,
    byType,
  };
}

export function getScenarioLoad(state: AppState, scenario: Scenario) {
  const subjects = scenario.items
    .map((item) => state.subjects.find((subject) => subject.id === item.subjectId))
    .filter((subject): subject is AppState['subjects'][number] => Boolean(subject));

  const credits = subjects.reduce((sum, subject) => sum + (subject?.credits ?? 0), 0);
  const hours = subjects.reduce((sum, subject) => sum + (subject?.weeklyHours ?? subject?.credits ?? 0), 0);
  const difficulty = subjects.reduce((sum, subject) => sum + (subject?.difficulty ?? 0), 0);

  return {
    subjects,
    credits,
    hours,
    difficulty,
    overload: Math.max(0, hours - scenario.weeklyCapacity),
    fitPercent: Math.min(100, Math.round((hours / Math.max(1, scenario.weeklyCapacity)) * 100)),
  };
}
