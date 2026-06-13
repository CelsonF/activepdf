export const LOCALES = ["pt", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABEL: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
};

export const LOCALE_FULL_LABEL: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

export const BASE_URL = "https://www.grifo-pdf.com";

/** Build URL prefix for a locale (PT = no prefix). */
export function localePrefix(locale: Locale): string {
  return locale === "pt" ? "" : `/${locale}`;
}

export function localePath(locale: Locale, path: "/" | "/dashboard" | "/tool"): string {
  const prefix = localePrefix(locale);
  if (path === "/") return prefix || "/";
  return `${prefix}${path}`;
}

export interface Dict {
  // Landing
  nav: { features: string; dashboard: string; editor: string; openEditor: string };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    bullets: string[];
  };
  features: {
    eyebrow: string;
    heading: string;
    items: { title: string; desc: string }[];
  };
  diff: {
    eyebrow: string;
    heading: string;
    sub: string;
    pillars: { title: string; desc: string; metric: string }[];
  };
  compare: {
    eyebrow: string;
    heading: string;
    sub: string;
    columns: { grifo: string; others: string };
    rows: { feature: string; grifo: string; others: string }[];
  };
  privacy: {
    eyebrow: string;
    heading: string;
    desc: string;
    points: string[];
    cta: string;
  };
  finalCta: {
    heading: string;
    sub: string;
    primary: string;
    secondary: string;
  };
  footer: string;
  // Dashboard
  dashboard: {
    menu: { overview: string; classes: string; ranking: string; skillMap: string; courses: string; certificates: string; messages: string; settings: string };
    upgrade: { title: string; desc: string; cta: string };
    topbar: { title: string; search: string; notifications: string };
    continue: { heading: string; viewAll: string; pages: string; remaining: string; cta: string };
    recommended: { heading: string; new: string; free: string };
    details: { close: string };
    profile: { role: string; points: string; daysRow: string; goals: string; rank: string };
    streak: { heading: string; daysOf: string; prev: string; next: string; days: string[] };
    stats: { inProgress: string; finished: string; cta: string };
  };
  // Meta
  meta: {
    homeTitle: string;
    homeDesc: string;
    homeOgTitle: string;
    homeOgDesc: string;
    dashboardTitle: string;
    dashboardDesc: string;
  };
}

const pt: Dict = {
  nav: { features: "Recursos", dashboard: "Dashboard", editor: "Editor", openEditor: "Abrir editor" },
  hero: {
    eyebrow: "Grifo — o editor é a capa · Solte um PDF nesta página",
    titleLine1: "Qualquer PDF vira",
    titleLine2: "prática que",
    titleHighlight: "engaja.",
    description:
      "Solte sua apostila aqui: crie campos sobre a própria página, responda e exporte o PDF preenchido — direto no navegador, sem criar conta.",
    ctaPrimary: "Enviar um PDF agora",
    ctaSecondary: "Abrir o editor",
    bullets: ["Sem cadastro", "Nada sai do seu navegador", "Conforme a LGPD"],
  },
  features: {
    eyebrow: "Como funciona",
    heading: "Três passos. Zero atrito.",
    items: [
      { title: "Solte qualquer PDF", desc: "Apostilas, formulários, provas. O editor abre a página como tela." },
      { title: "Campos sobre a página", desc: "Posicione inputs, caixas e marcações exatamente onde precisa." },
      { title: "Exporte preenchido", desc: "Baixe o PDF final com tudo no lugar — pronto para entregar." },
    ],
  },
  diff: {
    eyebrow: "O diferencial",
    heading: "Não é só mais um conversor de PDF.",
    sub: "iLovePDF, Smallpdf, PDFFiller resolvem tarefa. O Grifo transforma o PDF em algo vivo — sem subir arquivo pra servidor nenhum.",
    pillars: [
      { title: "Zero upload", desc: "Seu PDF é aberto e processado no próprio navegador. Nada trafega, nada fica em log.", metric: "0 KB enviados" },
      { title: "PDF interativo de verdade", desc: "Campos, marcações e respostas viram parte da página — não um overlay desalinhado.", metric: "Camadas vetoriais" },
      { title: "Sem cadastro, sem espera", desc: "Solta o arquivo e já tá editando. Sem fila, sem captcha, sem upsell.", metric: "< 2s pra abrir" },
      { title: "Pronto pro professor moderno", desc: "Apostila estática vira atividade preenchível. Aluno responde, exporta e entrega.", metric: "Compatível com qualquer LMS" },
    ],
  },
  compare: {
    eyebrow: "Comparativo honesto",
    heading: "Por que sair do iLovePDF e do PDFFiller.",
    sub: "Ferramentas tradicionais foram feitas pra rodar no servidor delas. O Grifo foi feito pra rodar no seu computador.",
    columns: { grifo: "Grifo", others: "iLovePDF / PDFFiller" },
    rows: [
      { feature: "Upload do arquivo pro servidor", grifo: "Nunca", others: "Sempre" },
      { feature: "Funciona offline depois de carregar", grifo: "Sim", others: "Não" },
      { feature: "Criar campos preenchíveis sobre a página", grifo: "Direto, com snap", others: "Wizard pago" },
      { feature: "Exporta PDF final preenchido", grifo: "Grátis e ilimitado", others: "Marca d'água ou paywall" },
      { feature: "Precisa criar conta", grifo: "Não", others: "Sim, com cartão depois" },
    ],
  },
  privacy: {
    eyebrow: "Privacidade por padrão",
    heading: "O PDF não sai do seu navegador. Nem o nosso servidor vê.",
    desc: "Todo o processamento — leitura, edição, exportação — acontece localmente. Ideal pra contrato, prontuário, prova e qualquer documento sensível.",
    points: [
      "Renderização local com WebAssembly",
      "Sem cookies de rastreamento de terceiros",
      "Compatível com LGPD e RGPD por design",
      "Código auditável — sem caixa preta",
    ],
    cta: "Testar com um PDF agora",
  },
  finalCta: {
    heading: "Solta um PDF aqui e veja a diferença.",
    sub: "Em menos de dois segundos você vai entender por que professor, advogado e RH tão migrando.",
    primary: "Abrir o editor",
    secondary: "Ver o painel",
  },
  footer: "Feito no navegador.",
  dashboard: {
    menu: { overview: "Visão geral", classes: "Aulas", ranking: "Ranking", skillMap: "Mapa de habilidades", courses: "Cursos", certificates: "Certificados", messages: "Mensagens", settings: "Configurações" },
    upgrade: { title: "Vire Premium", desc: "Desbloqueie exportações ilimitadas e turmas colaborativas.", cta: "Fazer upgrade" },
    topbar: { title: "Painel", search: "Buscar PDFs, aulas...", notifications: "Notificações" },
    continue: { heading: "Continue estudando", viewAll: "Ver todos →", pages: "páginas", remaining: "2h restantes", cta: "Continuar prática" },
    recommended: { heading: "Práticas recomendadas", new: "Novo", free: "Grátis" },
    details: { close: "Fechar detalhes" },
    profile: { role: "Estudante · Pré-vestibular", points: "876 pontos", daysRow: "Dias seguidos", goals: "Metas no mês", rank: "2º lugar" },
    streak: { heading: "Sequência semanal", daysOf: "3 de 7 dias", prev: "Semana anterior", next: "Próxima semana", days: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] },
    stats: { inProgress: "Em andamento", finished: "Finalizados", cta: "Soltar novo PDF" },
  },
  meta: {
    homeTitle: "Grifo — Qualquer PDF vira prática que engaja",
    homeDesc: "Solte sua apostila: crie campos sobre a própria página, responda e exporte o PDF preenchido — direto no navegador, sem cadastro.",
    homeOgTitle: "Grifo — O editor é a capa",
    homeOgDesc: "Transforme qualquer PDF em prática interativa, direto no navegador.",
    dashboardTitle: "Dashboard — Grifo",
    dashboardDesc: "Painel Grifo: continue suas práticas em PDF, acompanhe ofuscadas e sua sequência de estudo.",
  },
};

const en: Dict = {
  nav: { features: "Features", dashboard: "Dashboard", editor: "Editor", openEditor: "Open editor" },
  hero: {
    eyebrow: "Grifo — the editor is the cover · Drop a PDF on this page",
    titleLine1: "Turn any PDF into",
    titleLine2: "practice that",
    titleHighlight: "engages.",
    description:
      "Drop your worksheet here: add fields right on the page, fill them in, and export the completed PDF — in your browser, no account needed.",
    ctaPrimary: "Upload a PDF now",
    ctaSecondary: "Open the editor",
    bullets: ["No sign-up", "Nothing leaves your browser", "GDPR-friendly"],
  },
  features: {
    eyebrow: "How it works",
    heading: "Three steps. Zero friction.",
    items: [
      { title: "Drop any PDF", desc: "Worksheets, forms, exams. The editor opens the page as your canvas." },
      { title: "Fields on the page", desc: "Place inputs, checkboxes and notes exactly where you need them." },
      { title: "Export filled in", desc: "Download the finished PDF with everything in place — ready to send." },
    ],
  },
  diff: {
    eyebrow: "The difference",
    heading: "Not just another PDF converter.",
    sub: "iLovePDF, Smallpdf and PDFFiller process files for you. Grifo turns the PDF into something alive — without uploading anything to anyone.",
    pillars: [
      { title: "Zero upload", desc: "Your PDF is opened and processed inside your own browser. Nothing travels, nothing is logged.", metric: "0 KB sent" },
      { title: "Truly interactive PDFs", desc: "Fields, marks and answers become part of the page — not a misaligned overlay.", metric: "Vector layers" },
      { title: "No sign-up, no waiting", desc: "Drop the file and you are editing. No queue, no captcha, no upsell.", metric: "< 2s to open" },
      { title: "Built for modern teachers", desc: "Static worksheets become fillable activities. Students answer, export and submit.", metric: "Works in any LMS" },
    ],
  },
  compare: {
    eyebrow: "Honest comparison",
    heading: "Why leave iLovePDF and PDFFiller behind.",
    sub: "Legacy tools were built to run on their servers. Grifo was built to run on your computer.",
    columns: { grifo: "Grifo", others: "iLovePDF / PDFFiller" },
    rows: [
      { feature: "Upload file to a server", grifo: "Never", others: "Always" },
      { feature: "Works offline after first load", grifo: "Yes", others: "No" },
      { feature: "Create fillable fields on the page", grifo: "Direct, with snap", others: "Paid wizard" },
      { feature: "Export the filled PDF", grifo: "Free and unlimited", others: "Watermark or paywall" },
      { feature: "Account required", grifo: "No", others: "Yes, card later" },
    ],
  },
  privacy: {
    eyebrow: "Privacy by default",
    heading: "The PDF never leaves your browser. Our server never sees it.",
    desc: "All the work — reading, editing, exporting — runs locally. Ideal for contracts, medical records, exams and any sensitive document.",
    points: [
      "Local rendering with WebAssembly",
      "No third-party tracking cookies",
      "GDPR-friendly by design",
      "Auditable code — no black box",
    ],
    cta: "Try it with a PDF now",
  },
  finalCta: {
    heading: "Drop a PDF here and feel the difference.",
    sub: "In under two seconds you will see why teachers, lawyers and HR teams are switching.",
    primary: "Open the editor",
    secondary: "See the dashboard",
  },
  footer: "Built in the browser.",
  dashboard: {
    menu: { overview: "Overview", classes: "Classes", ranking: "Ranking", skillMap: "Skill map", courses: "Courses", certificates: "Certificates", messages: "Messages", settings: "Settings" },
    upgrade: { title: "Go Premium", desc: "Unlock unlimited exports and collaborative classes.", cta: "Upgrade" },
    topbar: { title: "Dashboard", search: "Search PDFs, classes...", notifications: "Notifications" },
    continue: { heading: "Keep studying", viewAll: "View all →", pages: "pages", remaining: "2h left", cta: "Continue practice" },
    recommended: { heading: "Recommended practices", new: "New", free: "Free" },
    details: { close: "Close details" },
    profile: { role: "Student · College prep", points: "876 points", daysRow: "Day streak", goals: "Monthly goals", rank: "2nd place" },
    streak: { heading: "Weekly streak", daysOf: "3 of 7 days", prev: "Previous week", next: "Next week", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    stats: { inProgress: "In progress", finished: "Finished", cta: "Drop a new PDF" },
  },
  meta: {
    homeTitle: "Grifo — Turn any PDF into practice that engages",
    homeDesc: "Drop your worksheet: add fields right on the page, fill them in, and export the completed PDF — in your browser, no sign-up.",
    homeOgTitle: "Grifo — The editor is the cover",
    homeOgDesc: "Turn any PDF into interactive practice, directly in your browser.",
    dashboardTitle: "Dashboard — Grifo",
    dashboardDesc: "Grifo dashboard: resume your PDF practice, follow recommendations, and track your study streak.",
  },
};

const es: Dict = {
  nav: { features: "Funciones", dashboard: "Panel", editor: "Editor", openEditor: "Abrir editor" },
  hero: {
    eyebrow: "Grifo — el editor es la portada · Suelta un PDF en esta página",
    titleLine1: "Cualquier PDF se vuelve",
    titleLine2: "práctica que",
    titleHighlight: "engancha.",
    description:
      "Suelta tu cuadernillo aquí: crea campos sobre la propia página, responde y exporta el PDF completado — en el navegador, sin crear cuenta.",
    ctaPrimary: "Subir un PDF ahora",
    ctaSecondary: "Abrir el editor",
    bullets: ["Sin registro", "Nada sale de tu navegador", "Cumple con el RGPD"],
  },
  features: {
    eyebrow: "Cómo funciona",
    heading: "Tres pasos. Cero fricción.",
    items: [
      { title: "Suelta cualquier PDF", desc: "Cuadernillos, formularios, exámenes. El editor abre la página como lienzo." },
      { title: "Campos sobre la página", desc: "Coloca inputs, casillas y notas exactamente donde los necesitas." },
      { title: "Exporta rellenado", desc: "Descarga el PDF final con todo en su sitio — listo para entregar." },
    ],
  },
  diff: {
    eyebrow: "La diferencia",
    heading: "No es solo otro conversor de PDF.",
    sub: "iLovePDF, Smallpdf y PDFFiller procesan archivos por ti. Grifo convierte el PDF en algo vivo — sin subir nada a ningún sitio.",
    pillars: [
      { title: "Cero subida", desc: "Tu PDF se abre y procesa dentro del propio navegador. Nada viaja, nada queda en logs.", metric: "0 KB enviados" },
      { title: "PDF interactivo de verdad", desc: "Campos, marcas y respuestas forman parte de la página — no un overlay desalineado.", metric: "Capas vectoriales" },
      { title: "Sin registro, sin esperas", desc: "Sueltas el archivo y ya estás editando. Sin cola, sin captcha, sin upsell.", metric: "< 2s para abrir" },
      { title: "Hecho para el profe moderno", desc: "El cuadernillo estático se vuelve actividad rellenable. El alumno responde, exporta y entrega.", metric: "Compatible con cualquier LMS" },
    ],
  },
  compare: {
    eyebrow: "Comparativa honesta",
    heading: "Por qué dejar iLovePDF y PDFFiller.",
    sub: "Las herramientas tradicionales se hicieron para correr en sus servidores. Grifo se hizo para correr en tu ordenador.",
    columns: { grifo: "Grifo", others: "iLovePDF / PDFFiller" },
    rows: [
      { feature: "Subir el archivo a un servidor", grifo: "Nunca", others: "Siempre" },
      { feature: "Funciona offline tras la primera carga", grifo: "Sí", others: "No" },
      { feature: "Crear campos rellenables sobre la página", grifo: "Directo, con snap", others: "Asistente de pago" },
      { feature: "Exportar el PDF rellenado", grifo: "Gratis e ilimitado", others: "Marca de agua o muro de pago" },
      { feature: "Requiere cuenta", grifo: "No", others: "Sí, tarjeta después" },
    ],
  },
  privacy: {
    eyebrow: "Privacidad por defecto",
    heading: "El PDF no sale de tu navegador. Nuestro servidor tampoco lo ve.",
    desc: "Todo el trabajo — lectura, edición, exportación — ocurre localmente. Ideal para contratos, historiales médicos, exámenes y cualquier documento sensible.",
    points: [
      "Renderizado local con WebAssembly",
      "Sin cookies de rastreo de terceros",
      "Cumple con el RGPD por diseño",
      "Código auditable — sin caja negra",
    ],
    cta: "Probar con un PDF ahora",
  },
  finalCta: {
    heading: "Suelta un PDF aquí y nota la diferencia.",
    sub: "En menos de dos segundos verás por qué profes, abogados y RR. HH. se están pasando.",
    primary: "Abrir el editor",
    secondary: "Ver el panel",
  },
  footer: "Hecho en el navegador.",
  dashboard: {
    menu: { overview: "Resumen", classes: "Clases", ranking: "Ranking", skillMap: "Mapa de habilidades", courses: "Cursos", certificates: "Certificados", messages: "Mensajes", settings: "Ajustes" },
    upgrade: { title: "Hazte Premium", desc: "Desbloquea exportaciones ilimitadas y clases colaborativas.", cta: "Mejorar" },
    topbar: { title: "Panel", search: "Buscar PDFs, clases...", notifications: "Notificaciones" },
    continue: { heading: "Sigue estudiando", viewAll: "Ver todos →", pages: "páginas", remaining: "Quedan 2h", cta: "Continuar práctica" },
    recommended: { heading: "Prácticas recomendadas", new: "Nuevo", free: "Gratis" },
    details: { close: "Cerrar detalles" },
    profile: { role: "Estudiante · Preuniversitario", points: "876 puntos", daysRow: "Días seguidos", goals: "Metas del mes", rank: "2º lugar" },
    streak: { heading: "Racha semanal", daysOf: "3 de 7 días", prev: "Semana anterior", next: "Próxima semana", days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] },
    stats: { inProgress: "En curso", finished: "Finalizados", cta: "Soltar un PDF" },
  },
  meta: {
    homeTitle: "Grifo — Cualquier PDF se vuelve práctica que engancha",
    homeDesc: "Suelta tu cuadernillo: crea campos sobre la propia página, responde y exporta el PDF completado — en el navegador, sin registro.",
    homeOgTitle: "Grifo — El editor es la portada",
    homeOgDesc: "Convierte cualquier PDF en práctica interactiva, directamente en el navegador.",
    dashboardTitle: "Panel — Grifo",
    dashboardDesc: "Panel Grifo: retoma tus prácticas en PDF, sigue recomendaciones y consulta tu racha de estudio.",
  },
};

export const DICTIONARIES: Record<Locale, Dict> = { pt, en, es };

export function getDict(locale: Locale): Dict {
  return DICTIONARIES[locale];
}