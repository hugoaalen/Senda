import type { AppState, ProgressStats, Scenario } from '../types';

export const TOTAL_DEGREE_CREDITS = 240;

export function getProgressStats(subjects: AppState['subjects'], subjectsPerSemester: number): ProgressStats {
  const passed = subjects.filter((subject) => subject.status === 'passed');
  const active = subjects.filter((subject) => subject.status === 'active');
  const pending = subjects.filter((subject) => subject.status === 'pending');
  const graded = passed.filter((subject) => typeof subject.grade === 'number');
  const passedCredits = passed.reduce((sum, subject) => sum + subject.credits, 0);
  const pendingCredits = Math.max(0, TOTAL_DEGREE_CREDITS - passedCredits);
  const remainingEquivalentSubjects = pendingCredits / 6;
  const remainingSemesters = remainingEquivalentSubjects / Math.max(1, subjectsPerSemester);

  return {
    totalCredits: TOTAL_DEGREE_CREDITS,
    passedCredits,
    activeCredits: active.reduce((sum, subject) => sum + subject.credits, 0),
    pendingCredits,
    remainingEquivalentSubjects,
    remainingSemesters,
    remainingYearsAtTwoSemesters: remainingSemesters / 2,
    passedSubjects: passed.length,
    activeSubjects: active.length,
    pendingSubjects: pending.length,
    averageGrade: graded.length
      ? Number((graded.reduce((sum, subject) => sum + (subject.grade ?? 0), 0) / graded.length).toFixed(2))
      : null,
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
