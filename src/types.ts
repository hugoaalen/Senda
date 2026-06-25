export type SubjectStatus = 'pending' | 'active' | 'passed';

export type SubjectType = 'Básica' | 'Obligatoria' | 'Optativa';

export interface Subject {
  id: string;
  name: string;
  type: SubjectType;
  credits: number;
  itinerary?: string;
  area?: string;
  semester: string;
  recommended?: string;
  status: SubjectStatus;
  grade?: number;
  weeklyHours?: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  priority: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface ScenarioItem {
  subjectId: string;
  plannedStatus: Exclude<SubjectStatus, 'passed'>;
}

export interface Scenario {
  id: string;
  name: string;
  period: string;
  weeklyCapacity: number;
  items: ScenarioItem[];
}

export interface AppState {
  subjects: Subject[];
  scenarios: Scenario[];
  selectedScenarioId: string;
  settings: {
    subjectsPerSemester: number;
  };
}

export interface ProgressStats {
  totalCredits: number;
  passedCredits: number;
  activeCredits: number;
  pendingCredits: number;
  remainingEquivalentSubjects: number;
  remainingSemesters: number;
  remainingYearsAtTwoSemesters: number;
  passedSubjects: number;
  activeSubjects: number;
  pendingSubjects: number;
  averageGrade: number | null;
}
