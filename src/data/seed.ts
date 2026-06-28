import type { AppState, Subject } from '../types';

const difficultyByType = {
  Básica: 3,
  Obligatoria: 4,
  Optativa: 3,
  'Sin asignar': 3,
} as const;

const priorityByType = {
  Básica: 4,
  Obligatoria: 5,
  Optativa: 2,
  'Sin asignar': 2,
} as const;

const slug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const subject = (
  name: string,
  type: Subject['type'],
  credits: number,
  semester: string,
  recommended?: string,
  area?: string,
  itinerary?: string,
): Subject => ({
  id: slug(name),
  name,
  type,
  credits,
  semester,
  recommended: recommended && recommended !== '-' ? recommended : undefined,
  area: area ?? undefined,
  itinerary: itinerary ?? undefined,
  status: 'pending',
  weeklyHours: credits,
  difficulty: difficultyByType[type],
  priority: priorityByType[type],
});

const rawInitialSubjects: Subject[] = [
  subject('Fundamentos de programación', 'Básica', 6, 'Todos', undefined, 'Informática'),
  subject('Prácticas de programación', 'Básica', 6, 'Todos', 'Fundamentos de programación', 'Informática'),
  subject('Administración y gestión de organizaciones', 'Básica', 6, 'Todos', undefined, 'Empresa'),
  subject('Álgebra', 'Básica', 6, 'Todos', undefined, 'Matemáticas'),
  subject('Análisis matemático', 'Básica', 6, 'Todos', 'Álgebra', 'Matemáticas'),
  subject('Estadística', 'Básica', 6, 'Todos', 'Álgebra', 'Matemáticas'),
  subject('Fundamentos de computadores', 'Básica', 6, 'Todos', undefined, 'Informática'),
  subject('Fundamentos físicos de la informática', 'Básica', 6, 'Todos', 'Álgebra\nAnálisis matemático', 'Física'),
  subject('Lógica', 'Básica', 6, 'Todos', undefined, 'Matemáticas'),
  subject('Trabajo en equipo en la red', 'Básica', 6, 'Todos', 'Fundamentos de programación', 'Informática'),
  subject('Diseño de bases de datos', 'Obligatoria', 6, 'Todos', 'Uso de base de datos'),
  subject('Diseño y programación orientada a objetos', 'Obligatoria', 6, 'Todos', 'Ingeniería del software\nPrácticas de programación'),
  subject('Ingeniería del software', 'Obligatoria', 6, 'Todos'),
  subject('Uso de bases de datos', 'Obligatoria', 6, 'Todos', 'Diseño y programación OO'),
  subject('Administración de redes y sistemas operativos', 'Obligatoria', 6, 'Todos', 'Sistemas operativos'),
  subject('Competencia comunicativa para profesionales de las TIC', 'Obligatoria', 6, 'Todos'),
  subject('Estructura de computadores', 'Obligatoria', 6, 'Todos', 'Fundamentos de computadores\nFundamentos de programación'),
  subject('Gestión de proyectos', 'Obligatoria', 6, 'Todos', 'Administración y gestión de organizaciones'),
  subject('Grafos y complejidad', 'Obligatoria', 6, 'Todos', 'Álgebra\nLógica\nPrácticas de programación'),
  subject('Idioma moderno I: inglés', 'Obligatoria', 6, 'Todos'),
  subject('Idioma moderno II: inglés', 'Obligatoria', 6, 'Todos', 'Idioma moderno I: inglés'),
  subject('Inteligencia artificial', 'Obligatoria', 6, 'Todos', 'Grafos y complejidad'),
  subject('Interacción persona ordenador', 'Obligatoria', 6, 'Todos', 'Ingeniería del software'),
  subject('Sistemas distribuidos', 'Obligatoria', 6, 'Todos', 'Redes y aplicaciones Internet'),
  subject('Sistemas operativos', 'Obligatoria', 6, 'Todos', 'Estructura de computadores\nPrácticas de programación'),
  subject('Redes y aplicaciones Internet', 'Obligatoria', 6, 'Todos', 'Diseño y programación OO\nSistemas operativos'),
  subject('Trabajo final de grado', 'Obligatoria', 12, 'Todos', 'Asignaturas del itinerario correspondiente / Haber superado 180 créditos / Gestión de proyectos', undefined, 'Ingeniería de computadores\nIngeniería del software\nComputación\nTecnologías de la información\nSistemas de información'),
  subject('Iniciativa emprendedora', 'Sin asignar', 6, 'Septiembre-febrero', 'Gestión de Proyectos', undefined, 'Sistemas de información'),
  subject('Prácticas en empresa', 'Optativa', 12, 'Todos', 'Haber superado 120 créditos'),
  subject('Análisis y diseño de patrones', 'Optativa', 6, 'Todos', 'Diseño y programación OO\nIngeniería del Software', undefined, 'Ingeniería del software'),
  subject('Aprendizaje computacional', 'Optativa', 6, 'Febrero-junio', 'Inteligencia artificial', undefined, 'Computación'),
  subject('Arquitecturas de computadores avanzados', 'Optativa', 6, 'Febrero-junio', 'Arquitectura de computadores', undefined, 'Ingeniería de computadores'),
  subject('Arquitectura de bases de datos', 'Optativa', 6, 'Septiembre-febrero', 'Diseño de base de datos', undefined, 'Tecnologías de la información'),
  subject('Arquitectura de computadores', 'Optativa', 6, 'Septiembre-febrero', 'Sistemas operativos', undefined, 'Ingeniería de computadores'),
  subject('Autómatas y gramáticas', 'Optativa', 6, 'Febrero-junio', 'Álgebra\nGrafos y complejidad', undefined, 'Computación'),
  subject('Comercio electrónico', 'Optativa', 6, 'Septiembre-febrero', 'Uso de base de datos', undefined, 'Tecnologías de la información'),
  subject('Compiladores', 'Optativa', 6, 'Septiembre-febrero', 'Autómatas y gramáticas\nEstructura de computadores\nDiseño y programación orientada a objetos', undefined, 'Computación'),
  subject('Criptografía', 'Optativa', 6, 'Febrero-junio', 'Álgebra\nDiseño y programación OO\nGrafos y complejidad'),
  subject('Planificación y uso estratégico de SI', 'Optativa', 6, 'Septiembre-febrero', 'Gestión Funcional de servicios de SI/TI\nUso de sistemas de información en las organizaciones', undefined, 'Sistemas de información'),
  subject('Diseño de estructuras de datos', 'Optativa', 6, 'Todos', 'Diseño y programación OO\nGrafos y complejidad', undefined, 'Ingeniería del software\nComputación'),
  subject('Diseño de sistemas operativos', 'Optativa', 6, 'Septiembre-febrero', 'Sistemas operativos', undefined, 'Ingeniería de computadores'),
  subject('Diseño de redes de computadores', 'Optativa', 6, 'Febrero-junio', 'Administración de redes y sistemas operativos\nEstructura de redes de computadores', undefined, 'Tecnologías de la información'),
  subject('Ingeniería de requisitos', 'Optativa', 6, 'Septiembre-febrero', 'Ingeniería del Software', undefined, 'Ingeniería del software'),
  subject('Ingeniería del software de componentes y sistemas distribuidos', 'Optativa', 6, 'Febrero-junio', 'Análisis y diseño con patrones\nIngeniería del Software', undefined, 'Ingeniería del software'),
  subject('Estructura de redes de computadores', 'Optativa', 6, 'Febrero-junio', 'Redes y aplicaciones Internet', undefined, 'Ingeniería de computadores'),
  subject('Fundamentos de sistemas de información', 'Optativa', 6, 'Septiembre-febrero', 'Gestión de Proyectos', undefined, 'Tecnologías de la información\nSistemas de información'),
  subject('Gestión funcional de servicios de SI/TI', 'Optativa', 6, 'Febrero-junio', 'Fundamentos de sistemas de información', undefined, 'Sistemas de información'),
  subject('Iniciación a las matemáticas para la ingeniería', 'Optativa', 6, 'Todos'),
  subject('Integración de sistemas de información', 'Optativa', 6, 'Febrero-junio', 'Fundamentos de sistemas de información', undefined, 'Tecnologías de la información\nSistemas de información'),
  subject('Minería de datos', 'Optativa', 6, 'Todos', 'Estadística\nUso de base de datos\nFundamentos de programación', undefined, 'Computación'),
  subject('Proyecto de desarrollo del software', 'Optativa', 12, 'Septiembre-febrero', 'Diseño de base de datos\nIngeniería de requisitos\nIngeniería del software de componentes y sistemas distribuidos\nDiseño de estructuras de datos\nInteracción persona ordenador', undefined, 'Ingeniería del software'),
  subject('Representación del conocimiento', 'Optativa', 6, 'Febrero-junio', 'Inteligencia artificial', undefined, 'Computación'),
  subject('Seguridad en redes de computadores', 'Optativa', 6, 'Febrero-junio', 'Redes y aplicaciones Internet\nEstructura de redes de computadores', undefined, 'Ingeniería de computadores\nTecnologías de la información'),
  subject('Sistemas empotrados', 'Optativa', 6, 'Septiembre-febrero', 'Redes y aplicaciones Internet\nPrácticas de programación', undefined, 'Ingeniería de computadores'),
  subject('Uso de sistemas de información en las organizaciones', 'Optativa', 6, 'Febrero-junio', 'Fundamentos de sistemas de información', undefined, 'Sistemas de información'),
];

export const initialSubjects: Subject[] = rawInitialSubjects;

export const initialState: AppState = {
  subjects: initialSubjects,
  selectedScenarioId: 'realista-2026-1',
  settings: {
    subjectsPerSemester: 3,
    themeMode: 'system',
  },
  scenarios: [
    {
      id: 'realista-2026-1',
      name: 'Plan realista',
      period: '2026 S1',
      weeklyCapacity: 12,
      items: [],
    },
    {
      id: 'fuerte-2026-1',
      name: 'Plan fuerte',
      period: '2026 S1',
      weeklyCapacity: 18,
      items: [],
    },
  ],
};
