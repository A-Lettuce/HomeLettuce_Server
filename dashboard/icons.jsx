// Iconos line de 24×24, stroke 1.6, esquinas redondeadas.
const I = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...props} />
);

const IconHome = (p) => (
  <I {...p}>
    <path d="M3.5 10.5 12 3.5l8.5 7"/>
    <path d="M5 9.5V20a.5.5 0 0 0 .5.5H9.5V14h5v6.5h4a.5.5 0 0 0 .5-.5V9.5"/>
  </I>
);
const IconCalendar = (p) => (
  <I {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3"/>
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3"/>
    <circle cx="8.5" cy="14" r=".8" fill="currentColor"/>
    <circle cx="12" cy="14" r=".8" fill="currentColor"/>
    <circle cx="15.5" cy="14" r=".8" fill="currentColor"/>
  </I>
);
const IconTasks = (p) => (
  <I {...p}>
    <rect x="4" y="4" width="16" height="16" rx="4"/>
    <path d="m8.5 12 2.4 2.4L15.8 9.5"/>
  </I>
);
const IconFood = (p) => (
  // hoja simple de lechuga
  <I {...p}>
    <path d="M4 14c2-6 7-9 16-9-1 9-5 14-12 14a3.5 3.5 0 0 1-3.5-3.5"/>
    <path d="M4.5 19.5C8 16 12 13.5 18 11.5"/>
  </I>
);
const IconFinance = (p) => (
  <I {...p}>
    <path d="M3.5 7.5h14a3 3 0 0 1 3 3v6.5a3 3 0 0 1-3 3h-13a1 1 0 0 1-1-1V7.5Z"/>
    <path d="M3.5 7.5V6.5a2 2 0 0 1 2-2h11"/>
    <circle cx="16.5" cy="14" r="1.2" fill="currentColor"/>
  </I>
);
const IconCinema = (p) => (
  <I {...p}>
    <rect x="3.5" y="6" width="17" height="13" rx="2.5"/>
    <path d="M3.5 9.5h17M7 6V3.5M11 6V3.5M15 6V3.5M19 6V3.5"/>
    <path d="M10.5 12.2v4.6l4-2.3z" fill="currentColor" stroke="none"/>
  </I>
);
const IconMore = (p) => (
  <I {...p}>
    <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>
    <circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none"/>
  </I>
);
const IconSun = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="3.8"/>
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"/>
  </I>
);
const IconMoon = (p) => (
  <I {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>
  </I>
);
const IconUser = (p) => (
  <I {...p}>
    <circle cx="12" cy="8" r="3.5"/>
    <path d="M4.5 20c1.2-3.6 4.2-5.5 7.5-5.5s6.3 1.9 7.5 5.5"/>
  </I>
);
const IconLock = (p) => (
  <I {...p}>
    <rect x="4.5" y="10" width="15" height="10" rx="3"/>
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>
  </I>
);
const IconArrowRight = (p) => (
  <I {...p}>
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </I>
);
const IconEye = (p) => (
  <I {...p}>
    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </I>
);
const IconEyeOff = (p) => (
  <I {...p}>
    <path d="M3 3l18 18"/>
    <path d="M10.6 6.2A10 10 0 0 1 12 6c6 0 9.5 6.5 9.5 6.5a18 18 0 0 1-3.4 4.2"/>
    <path d="M6.5 7.3C3.8 9.2 2.5 12.5 2.5 12.5s3.5 6.5 9.5 6.5a9 9 0 0 0 4.4-1.2"/>
    <path d="M9.5 9.7a3 3 0 0 0 4.2 4.2"/>
  </I>
);

const IconGraduation = (p) => (
  <I {...p}>
    <path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4Z"/>
    <path d="M6.5 10.5V15c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4.5"/>
    <path d="M21.5 8.5v5"/>
  </I>
);
const IconHabit = (p) => (
  // ciclo / recurrencia
  <I {...p}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5"/>
    <path d="M20 4v4.5h-4.5"/>
    <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5"/>
    <path d="M4 20v-4.5h4.5"/>
  </I>
);
const IconNote = (p) => (
  // hoja con lápiz — marca de evaluación
  <I {...p}>
    <path d="M6 3.5h7l5 5V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7.5 3.5"/>
    <path d="M13 3.5V8.5h5"/>
    <path d="M9 12.5h4M9 15.5h6"/>
  </I>
);
const IconHammer = (p) => (
  // martillo — sección Proyectos
  <I {...p}>
    <path d="M12.5 9 4.7 16.8a1.9 1.9 0 0 0 2.7 2.7L15.2 11.7"/>
    <path d="M16 14.5 19.5 11"/>
    <path d="M18.7 11.8 14 7.1a4.4 4.4 0 0 0-3.1-1.3H8.6l.9.8a4.9 4.9 0 0 1 1.6 3.6V11l1.6 1.6h.7a2.6 2.6 0 0 1 1.8.7l1 1"/>
  </I>
);

// ─── Salud ──────────────────────────────────────────────────
const IconHeart = (p) => (
  // corazón con línea de pulso (heart-rate)
  <I {...p}>
    <path d="M12 20C5.5 15.5 3 11.8 3 8.7 3 6.1 5 4.5 7.2 4.5c1.6 0 3 .9 3.8 2.2.8-1.3 2.2-2.2 3.8-2.2C19 4.5 21 6.1 21 8.7c0 3.1-2.5 6.8-9 11.3Z"/>
    <path d="M6.6 10.4h2.1l1-1.8 1.6 3.1 1.1-1.9.7 1.1h2.9"/>
  </I>
);
const IconBarbell = (p) => (
  // pesa / estado físico
  <I {...p}>
    <rect x="2.5" y="9.2" width="2.4" height="5.6" rx="1"/>
    <rect x="4.9" y="7.6" width="2.4" height="8.8" rx="1"/>
    <rect x="16.7" y="7.6" width="2.4" height="8.8" rx="1"/>
    <rect x="19.1" y="9.2" width="2.4" height="5.6" rx="1"/>
    <path d="M7.3 12h9.4"/>
  </I>
);
const IconDroplet = (p) => (
  // gota — consumo
  <I {...p}>
    <path d="M12 3.5c3.6 4.1 6 7.1 6 10.1a6 6 0 0 1-12 0c0-3 2.4-6 6-10.1Z"/>
    <path d="M9 14.5a3 3 0 0 0 2.4 2.9"/>
  </I>
);
const IconMoodHappy = (p) => (
  // cara feliz — emociones
  <I {...p}>
    <circle cx="12" cy="12" r="8.5"/>
    <path d="M8.4 13.8c.8 1.3 2.1 2 3.6 2s2.8-.7 3.6-2"/>
    <circle cx="9" cy="9.8" r=".95" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="9.8" r=".95" fill="currentColor" stroke="none"/>
  </I>
);

// Logo "Home Lettuce" — pequeña lechuga estilizada
const LettuceMark = ({ size = 28, className = "" }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden="true">
    <defs>
      <clipPath id="lct">
        <path d="M16 4c7.4 0 12 4.6 12 12 0 7-5.4 12-12 12S4 23 4 16C4 8.6 8.6 4 16 4Z"/>
      </clipPath>
    </defs>
    {/* hojas exteriores */}
    <g clipPath="url(#lct)">
      <circle cx="10" cy="22" r="9" fill="hsl(var(--accent))" opacity="0.55"/>
      <circle cx="22" cy="22" r="9" fill="hsl(var(--accent))" opacity="0.55"/>
      <circle cx="9"  cy="13" r="8" fill="hsl(var(--accent))" opacity="0.75"/>
      <circle cx="23" cy="13" r="8" fill="hsl(var(--accent))" opacity="0.75"/>
      <circle cx="16" cy="9"  r="8" fill="hsl(var(--accent))"/>
      {/* vena central */}
      <path d="M16 11c0 4 0 9-2 14M16 11c0 4 0 9 2 14"
            stroke="hsl(var(--accent-strong))" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity=".5"/>
    </g>
  </svg>
);

// ─── Tiempo Libre ───────────────────────────────────────────
const IconMusic = (p) => (
  <I {...p}>
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </I>
);

// ─── Trabajo ────────────────────────────────────────────────
const IconChartBar = (p) => (
  // gráfico de barras — panel / dashboard
  <I {...p}>
    <path d="M4 4v16h16"/>
    <rect x="7.5" y="12" width="2.8" height="5" rx="1"/>
    <rect x="12.6" y="8.5" width="2.8" height="8.5" rx="1"/>
    <rect x="17.7" y="5.5" width="2.8" height="11.5" rx="1"/>
  </I>
);

Object.assign(window, {
  IconHome, IconCalendar, IconTasks, IconFood, IconFinance, IconCinema,
  IconMore, IconSun, IconMoon, IconUser, IconLock, IconArrowRight, IconEye, IconEyeOff,
  IconGraduation, IconHabit, IconNote, IconHammer,
  IconHeart, IconBarbell, IconDroplet, IconMoodHappy,
  IconMusic,
  IconChartBar,
  LettuceMark,
});
