// Home Lettuce — Calendario
// ─────────────────────────────────────────────────────────────────────────────
// Prototipo integrado en AppShell. En el repo TS real, este archivo se
// reparte así:
//   · src/types/calendar.ts
//   · src/lib/calendarColors.ts
//   · src/lib/time.ts                                  (extensión)
//   · src/hooks/useCalendars.ts
//   · src/hooks/useCalendarEvents.ts
//   · src/components/app/calendar/WeekHeader.tsx
//   · src/components/app/calendar/HourLabels.tsx
//   · src/components/app/calendar/DayColumn.tsx
//   · src/components/app/calendar/EventBlock.tsx
//   · src/components/app/calendar/EventDetailPopover.tsx
//   · src/components/app/calendar/CreateEventModal.tsx
//   · src/components/app/calendar/CalendarSidebar.tsx
//   · src/pages/CalendarPage.tsx
// Aquí están todos juntos para previsualizarlos en el shell de Babel.
// ─────────────────────────────────────────────────────────────────────────────


// ─── src/types/calendar.ts ──────────────────────────────────────────────────
// type CalendarType = 'personal' | 'shared'
// type Calendar = {
//   id: string
//   name: string
//   type: CalendarType
//   color: string         // id de CALENDAR_COLORS
//   ownerId: string | null
// }
// type CalendarEvent = {
//   id: string
//   calendarId: string
//   title: string
//   date: string          // ISO 'YYYY-MM-DD'
//   startTime: string     // 'HH:mm'
//   endTime: string       // 'HH:mm'
//   color: string         // id de CALENDAR_COLORS (hereda del calendario)
// }


// ─── src/lib/calendarColors.ts ──────────────────────────────────────────────
const CALENDAR_COLORS = [
  { id: 'sage',     label: 'Salvia',      bg: 'bg-green-100',  bgSoft: 'bg-green-100/70',  border: 'border-green-400',  text: 'text-green-800',  dot: 'bg-green-400'  },
  { id: 'lavender', label: 'Lavanda',     bg: 'bg-purple-100', bgSoft: 'bg-purple-100/70', border: 'border-purple-400', text: 'text-purple-800', dot: 'bg-purple-400' },
  { id: 'peach',    label: 'Melocotón',   bg: 'bg-orange-100', bgSoft: 'bg-orange-100/70', border: 'border-orange-400', text: 'text-orange-800', dot: 'bg-orange-400' },
  { id: 'sky',      label: 'Cielo',       bg: 'bg-blue-100',   bgSoft: 'bg-blue-100/70',   border: 'border-blue-400',   text: 'text-blue-800',   dot: 'bg-blue-400'   },
  { id: 'rose',     label: 'Rosa',        bg: 'bg-pink-100',   bgSoft: 'bg-pink-100/70',   border: 'border-pink-400',   text: 'text-pink-800',   dot: 'bg-pink-400'   },
  { id: 'butter',   label: 'Mantequilla', bg: 'bg-yellow-100', bgSoft: 'bg-yellow-100/70', border: 'border-yellow-400', text: 'text-yellow-800', dot: 'bg-yellow-400' },
];
const COLOR_BY_ID = Object.fromEntries(CALENDAR_COLORS.map(c => [c.id, c]));
function getColor(id) { return COLOR_BY_ID[id] || CALENDAR_COLORS[0]; }


// ─── src/lib/time.ts (extensión) ────────────────────────────────────────────
// Toda la lógica de fechas vive aquí — nunca en JSX.

const DAY_SHORT_ES = ['lun','mar','mié','jue','vie','sáb','dom'];
const MONTH_ES     = ['enero','febrero','marzo','abril','mayo','junio',
                      'julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAY_VIEW_START = 7;   // 07:00
const DAY_VIEW_END   = 23;  // 23:00
const DAY_VIEW_MIN   = (DAY_VIEW_END - DAY_VIEW_START) * 60;  // 960 min

function pad2(n) { return n < 10 ? '0' + n : '' + n; }
function isoDate(d) { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function parseISO(s) {
  // 'YYYY-MM-DD' → Date local
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m-1, d);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Lunes de la semana que contiene `date` (lunes=0, domingo=6)
function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  const dow = (d.getDay() + 6) % 7;   // 0..6 con lunes=0
  d.setDate(d.getDate() - dow);
  return d;
}

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

function timeToMinutes(time) {
  const [h,m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(min) {
  const m = ((min % (24*60)) + 24*60) % (24*60);
  return `${pad2(Math.floor(m/60))}:${pad2(m%60)}`;
}

// Posición % dentro de la franja 07:00–23:00 (0%–100%)
function getEventPosition(startTime, endTime) {
  const startM = timeToMinutes(startTime) - DAY_VIEW_START * 60;
  const endM   = timeToMinutes(endTime)   - DAY_VIEW_START * 60;
  const clampedStart = Math.max(0, startM);
  const clampedEnd   = Math.min(DAY_VIEW_MIN, endM);
  const topPercent    = (clampedStart / DAY_VIEW_MIN) * 100;
  const heightPercent = Math.max(0.5, ((clampedEnd - clampedStart) / DAY_VIEW_MIN) * 100);
  return { topPercent, heightPercent };
}

function formatDayHeader(date) {
  return `${DAY_SHORT_ES[(date.getDay()+6) % 7]} ${date.getDate()}`;
}

function isToday(date) {
  const t = new Date();
  return date.getFullYear() === t.getFullYear()
      && date.getMonth()    === t.getMonth()
      && date.getDate()     === t.getDate();
}

// "19–25 mayo 2026"   |  "30 mayo – 5 junio 2026"  |  "28 dic 2026 – 3 ene 2027"
function formatWeekRange(weekStart) {
  const end = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === end.getMonth() && weekStart.getFullYear() === end.getFullYear();
  const sameYear  = weekStart.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${weekStart.getDate()}–${end.getDate()} ${MONTH_ES[end.getMonth()]} ${end.getFullYear()}`;
  }
  if (sameYear) {
    return `${weekStart.getDate()} ${MONTH_ES[weekStart.getMonth()]} – ${end.getDate()} ${MONTH_ES[end.getMonth()]} ${end.getFullYear()}`;
  }
  return `${weekStart.getDate()} ${MONTH_ES[weekStart.getMonth()]} ${weekStart.getFullYear()} – ${end.getDate()} ${MONTH_ES[end.getMonth()]} ${end.getFullYear()}`;
}

// Formato compacto para columna de horas: 7am, 12pm, 11pm
function formatHourCompact(h) {
  if (h === 0)  return '12am';
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

// "10:00 – 11:30"
function formatTimeRange(start, end) { return `${start} – ${end}`; }


// ─── src/hooks/useIsMobile.ts ───────────────────────────────────────────────
// < 768px = móvil (coincide con el breakpoint `md` de Tailwind).
function useIsMobile() {
  const query = '(max-width: 767px)';
  const [mobile, setMobile] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const on = (e) => setMobile(e.matches);
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    setMobile(mq.matches);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on);
    };
  }, []);
  return mobile;
}


// ─── src/hooks/useCalendars.ts ──────────────────────────────────────────────
// TODO: reemplazar por useQuery(['calendars'], () => fetch('/api/v1/calendars'))
//       y separar calendarios por ownerId === currentUser.id en el componente.
const MOCK_CALENDARS = [
  { id: 'cal-personal-1', name: 'Personal',     type: 'personal', color: 'sage',     ownerId: 'me' },
  { id: 'cal-personal-2', name: 'Trabajo',      type: 'personal', color: 'sky',      ownerId: 'me' },
  { id: 'cal-shared-1',   name: 'Familia',      type: 'shared',   color: 'rose',     ownerId: null  },
];

function useCalendars() {
  // Shape compatible con TanStack Query
  const [state] = React.useState({ data: MOCK_CALENDARS, isLoading: false, error: null });
  return state;
}


// ─── src/hooks/useCalendarEvents.ts ─────────────────────────────────────────
// TODO: aceptar params { from, to } y llamar
//   useQuery(['events', from, to], () => fetch(`/api/v1/events?from=${from}&to=${to}`))

function buildMockEvents() {
  // Eventos relativos a "hoy" para que siempre haya algo visible.
  const today    = new Date(); today.setHours(0,0,0,0);
  const weekMon  = getWeekStart(today);
  const nextMon  = addDays(weekMon, 7);
  const at = (base, dayOffset) => isoDate(addDays(base, dayOffset));

  return [
    // Semana actual ───────────────────────────────────────
    { id: 'ev-01', calendarId: 'cal-personal-2', title: 'Stand-up equipo',
      date: at(weekMon, 0), startTime: '09:00', endTime: '09:30', color: 'sky' },
    { id: 'ev-02', calendarId: 'cal-personal-1', title: 'Médico revisión',
      date: at(weekMon, 1), startTime: '10:30', endTime: '12:00', color: 'peach' },
    { id: 'ev-03', calendarId: 'cal-personal-1', title: 'Pilates',
      date: at(weekMon, 1), startTime: '14:00', endTime: '15:00', color: 'sage' },
    { id: 'ev-04', calendarId: 'cal-shared-1',   title: 'Cena con María',
      date: at(weekMon, 2), startTime: '20:00', endTime: '21:30', color: 'rose' },
    { id: 'ev-05', calendarId: 'cal-personal-2', title: 'Reunión proveedores',
      date: at(weekMon, 3), startTime: '11:00', endTime: '12:30', color: 'sky' },
    { id: 'ev-06', calendarId: 'cal-personal-1', title: 'Yoga',
      date: at(weekMon, 4), startTime: '17:00', endTime: '18:00', color: 'sage' },
    { id: 'ev-07', calendarId: 'cal-shared-1',   title: 'Cumple Andrés',
      date: at(weekMon, 4), startTime: '17:30', endTime: '19:30', color: 'rose' },
    { id: 'ev-08', calendarId: 'cal-shared-1',   title: 'Comida familiar',
      date: at(weekMon, 5), startTime: '13:30', endTime: '15:30', color: 'rose' },

    // Semana siguiente ────────────────────────────────────
    { id: 'ev-09', calendarId: 'cal-personal-1', title: 'Mecánico',
      date: at(nextMon, 0), startTime: '08:30', endTime: '09:30', color: 'peach' },
    { id: 'ev-10', calendarId: 'cal-shared-1',   title: 'Película en casa',
      date: at(nextMon, 2), startTime: '21:00', endTime: '22:30', color: 'lavender' },
  ];
}

function useCalendarEvents(weekStart) {
  // TODO: pasar from = isoDate(weekStart), to = isoDate(addDays(weekStart, 6))
  //       al endpoint en el hook real.
  const [state] = React.useState({ data: buildMockEvents(), isLoading: false, error: null });
  // Filtra al rango visible (cliente; en backend será query param)
  const fromISO = isoDate(weekStart);
  const toISO   = isoDate(addDays(weekStart, 6));
  const data = state.data.filter(e => e.date >= fromISO && e.date <= toISO);
  return { ...state, data };
}


// ─── iconos locales para esta vista ─────────────────────────────────────────
const IconChevronLeft = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...p}>
    <path d="m14 6-6 6 6 6"/>
  </svg>
);
const IconChevronRight = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...p}>
    <path d="m10 6 6 6-6 6"/>
  </svg>
);
const IconPlusCal = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...p}>
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconPencil = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...p}>
    <path d="M4 20.5h4l10.5-10.5-4-4L4 16.5v4Z"/>
    <path d="m13 7 4 4"/>
  </svg>
);
const IconTrash = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...p}>
    <path d="M4 7h16M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2"/>
    <path d="M6 7v12.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V7"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>
);
const IconClose = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...p}>
    <path d="m6 6 12 12M18 6 6 18"/>
  </svg>
);
const IconCheckCal = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...p}>
    <path d="m5 12.5 4 4 10-10"/>
  </svg>
);
const IconSidebarToggle = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="3"/>
    <path d="M9.5 4.5v15"/>
  </svg>
);


// ─── src/lib/calendarLayout.ts (helper) ─────────────────────────────────────
// Detecta solapamiento entre eventos de un mismo día y asigna columna paralela.
// Implementación simplificada por grupos conectados.
function layoutDayEvents(events) {
  if (!events.length) return [];
  const sorted = [...events].sort((a, b) =>
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    || timeToMinutes(a.endTime) - timeToMinutes(b.endTime)
  );
  const placed = [];
  for (const ev of sorted) {
    const s = timeToMinutes(ev.startTime);
    const e = timeToMinutes(ev.endTime);
    const overlapping = placed.filter(p =>
      !(timeToMinutes(p.endTime) <= s || timeToMinutes(p.startTime) >= e)
    );
    const usedCols = new Set(overlapping.map(p => p.col));
    let col = 0;
    while (usedCols.has(col)) col++;
    placed.push({ ...ev, col });
  }
  return placed.map(ev => {
    const s = timeToMinutes(ev.startTime);
    const e = timeToMinutes(ev.endTime);
    const overlapping = placed.filter(p =>
      !(timeToMinutes(p.endTime) <= s || timeToMinutes(p.startTime) >= e)
    );
    const cols = Math.max(...overlapping.map(p => p.col + 1));
    return { ...ev, col: ev.col, cols };
  });
}


// ─── src/components/app/calendar/HourLabels.tsx ─────────────────────────────
function HourLabels() {
  const hours = [];
  for (let h = DAY_VIEW_START; h <= DAY_VIEW_END; h++) hours.push(h);
  // 17 etiquetas → 16 franjas. Renderizamos sólo las horas, alineadas al top
  // de su franja (la última al final).
  return (
    <div className="relative w-[44px] sm:w-[52px] shrink-0 select-none">
      {hours.map((h, i) => {
        const isLast = i === hours.length - 1;
        const top = (i / (hours.length - 1)) * 100;
        return (
          <div key={h}
            className="absolute right-2 -translate-y-1/2 text-[10px] sm:text-[11px]
                       text-ink-mute dark:text-night-softText tabular-nums"
            style={{ top: isLast ? 'calc(100% - 1px)' : `${top}%` }}>
            {formatHourCompact(h)}
          </div>
        );
      })}
    </div>
  );
}


// ─── src/components/app/calendar/EventBlock.tsx ─────────────────────────────
function EventBlock({ event, calendar, onClick, onToggleDone, done, col = 0, cols = 1 }) {
  const { topPercent, heightPercent } = getEventPosition(event.startTime, event.endTime);
  const duration = timeToMinutes(event.endTime) - timeToMinutes(event.startTime);
  const isShort = duration < 45;

  const widthPct = 100 / cols;
  const leftPct  = col * widthPct;
  const posStyle = {
    top:    `${topPercent}%`,
    height: `${heightPercent}%`,
    left:   `calc(${leftPct}% + 2px)`,
    width:  `calc(${widthPct}% - 4px)`,
    minHeight: '20px',
  };

  // ── Hábito: fondo muy claro del color, checkbox de completado por día ──
  if (event.kind === 'habit') {
    const c = getHabitColor(event.habitColor);
    return (
      <div
        onClick={(e) => { e.stopPropagation(); onClick(event, e.currentTarget); }}
        className="absolute z-10 rounded-r-lg rounded-l-none px-1.5 py-1 text-left overflow-hidden
                   border-l-[3px] cursor-pointer hover:brightness-[.98] transition"
        style={{ ...posStyle, backgroundColor: c.soft, borderColor: c.base, color: c.ink, opacity: done ? 0.4 : 1 }}>
        <div className="flex items-center gap-1.5 leading-tight">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleDone(event); }}
            aria-label={done ? 'Marcar como pendiente' : 'Marcar como completado'}
            className="shrink-0 h-3.5 w-3.5 rounded-[5px] flex items-center justify-center transition"
            style={done
              ? { backgroundColor: c.base, color: '#fff' }
              : { border: `1.5px solid ${c.base}`, color: c.base }}>
            {done && <HLCheck size={9}/>}
          </button>
          <span className={`text-[11px] sm:text-[12px] font-medium truncate ${done ? 'line-through' : ''}`}>
            {event.title}
          </span>
        </div>
        {!isShort && event.startTime && (
          <div className="text-[10px] opacity-75 leading-tight mt-0.5 tabular-nums truncate pl-[22px]">
            {event.startTime}
          </div>
        )}
      </div>
    );
  }

  // ── Evento estándar (hereda color del calendario) ──
  const c = getColor(event.color);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(event, e.currentTarget); }}
      className={`absolute z-10 ${c.bgSoft} ${c.border} ${c.text}
                  border-l-4 rounded-r-lg rounded-l-none
                  px-2 py-1 text-left overflow-hidden
                  hover:brightness-[.97] active:brightness-95
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
                  transition`}
      style={posStyle}>
      <div className="text-[11px] sm:text-[12px] font-medium leading-tight truncate">
        {event.title}
      </div>
      {!isShort && (
        <div className="text-[10px] opacity-75 leading-tight mt-0.5 tabular-nums truncate">
          {event.startTime}–{event.endTime}
        </div>
      )}
    </button>
  );
}


// ─── src/components/app/calendar/DayColumn.tsx ──────────────────────────────
function DayColumn({ date, events, calendars, isFirst, onEventClick, onSlotClick, onToggleDone, doneMap }) {
  const today = isToday(date);
  // "Ahora" — recalculado al montar; no actualizar en tiempo real (server-home).
  const now = React.useMemo(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }, [isoDate(date)]);
  const nowPct = today
    ? ((now - DAY_VIEW_START * 60) / DAY_VIEW_MIN) * 100
    : null;
  const nowVisible = nowPct != null && nowPct >= 0 && nowPct <= 100;

  const positioned = React.useMemo(() => layoutDayEvents(events), [events]);
  const calById = React.useMemo(
    () => Object.fromEntries(calendars.map(c => [c.id, c])), [calendars]
  );

  const hourRows = (DAY_VIEW_END - DAY_VIEW_START);

  return (
    <div className={`relative flex-1 min-w-0
                     ${isFirst ? '' : 'border-l border-black/[.05] dark:border-white/[.05]'}`}
         onClick={() => onSlotClick(date)}>
      {/* Líneas horarias horizontales — fondo */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: hourRows }, (_, i) => (
          <div key={i}
            className="absolute left-0 right-0 border-t border-black/[.04] dark:border-white/[.045]"
            style={{ top: `${(i / hourRows) * 100}%` }}/>
        ))}
        {/* línea inferior */}
        <div className="absolute left-0 right-0 bottom-0 border-t border-black/[.04] dark:border-white/[.045]"/>
      </div>

      {/* Línea "ahora" */}
      {nowVisible && (
        <div className="absolute left-0 right-0 z-20 pointer-events-none"
             style={{ top: `${nowPct}%` }}>
          <div className="relative h-px bg-red-400/90">
            <div className="absolute -left-[3px] -top-[3px] h-[7px] w-[7px] rounded-full bg-red-500"/>
          </div>
        </div>
      )}

      {/* Eventos */}
      {positioned.map(ev => (
        <EventBlock key={ev.id}
          event={ev}
          calendar={calById[ev.calendarId]}
          col={ev.col} cols={ev.cols}
          onClick={onEventClick}
          onToggleDone={onToggleDone}
          done={ev.kind === 'habit' ? !!(doneMap && doneMap[ev.doneKey]) : false}/>
      ))}
    </div>
  );
}


// ─── src/components/app/calendar/WeekHeader.tsx ─────────────────────────────
function WeekHeader({ weekStart, onPrev, onNext, onToday, onToggleSidebar }) {
  const days = getWeekDays(weekStart);
  return (
    <div className="border-b border-black/[.06] dark:border-white/[.06]">
      {/* Fila de controles */}
      <div className="px-3 sm:px-4 py-3 flex items-center gap-2">
        {/* Toggle sidebar (mobile/tablet) */}
        <button onClick={onToggleSidebar}
          aria-label="Mostrar calendarios"
          className="lg:hidden h-9 w-9 rounded-full flex items-center justify-center
                     text-ink-soft dark:text-night-softText
                     hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
          <IconSidebarToggle/>
        </button>

        <div className="flex items-center gap-1">
          <button onClick={onPrev} aria-label="Semana anterior"
            className="h-9 w-9 rounded-full flex items-center justify-center
                       text-ink-soft dark:text-night-softText
                       hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
            <IconChevronLeft/>
          </button>
          <button onClick={onNext} aria-label="Semana siguiente"
            className="h-9 w-9 rounded-full flex items-center justify-center
                       text-ink-soft dark:text-night-softText
                       hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
            <IconChevronRight/>
          </button>
        </div>

        <div className="flex-1 text-center text-[13px] sm:text-[15px] font-medium
                        tracking-tight text-ink dark:text-night-text">
          {formatWeekRange(weekStart)}
        </div>

        <button onClick={onToday}
          className="text-[12px] sm:text-[13px] px-3 sm:px-3.5 h-8 rounded-full
                     border border-black/[.08] dark:border-white/[.1]
                     text-ink dark:text-night-text
                     hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
          Hoy
        </button>
      </div>

      {/* Fila de días, alineada con el grid del calendario */}
      <div className="flex">
        {/* Hueco que alinea con HourLabels */}
        <div className="w-[44px] sm:w-[52px] shrink-0"/>
        <div className="flex-1 grid grid-cols-7">
          {days.map((d, i) => {
            const today = isToday(d);
            const dow = (d.getDay() + 6) % 7;
            return (
              <div key={i}
                className={`flex flex-col items-center justify-center gap-1 py-2
                            ${i === 0 ? '' : 'border-l border-black/[.05] dark:border-white/[.05]'}`}>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[.08em]
                                text-ink-mute dark:text-night-softText">
                  {DAY_SHORT_ES[dow]}
                </div>
                <div className={`text-[14px] sm:text-[15px] font-medium leading-none
                                  h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center
                                  tabular-nums
                                  ${today
                                    ? 'bg-accent text-[hsl(var(--accent-strong))]'
                                    : 'text-ink dark:text-night-text'}`}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// ─── src/components/app/calendar/AllDayLane.tsx ─────────────────────────────
// Banda superior tipo Google Calendar: ventanas de estudio multi-día (continuas)
// y hábitos "todo el día" (chips de un solo día). Se empaquetan en filas para
// que no se solapen horizontalmente.
function packAllDayRows(items) {
  const sorted = [...items].sort((a, b) =>
    a.startCol - b.startCol || (b.endCol - b.startCol) - (a.endCol - a.startCol));
  const rows = [];
  for (const it of sorted) {
    let placed = false;
    for (const row of rows) {
      if (row.every(r => it.endCol < r.startCol || it.startCol > r.endCol)) {
        row.push(it); placed = true; break;
      }
    }
    if (!placed) rows.push([it]);
  }
  return rows;
}

function AllDayLane({ items, onItemClick, onToggleDone, doneMap }) {
  if (!items.length) return null;
  const rows = packAllDayRows(items);
  const trackPct = (n) => `${(n / 7) * 100}%`;

  return (
    <div className="flex border-b border-black/[.06] dark:border-white/[.06]
                    bg-paper/60 dark:bg-night/40">
      {/* Gutter alineado con HourLabels */}
      <div className="w-[44px] sm:w-[52px] shrink-0 flex items-start justify-end pr-2 pt-2">
        <span className="text-[9px] leading-tight uppercase tracking-[.06em]
                         text-ink-mute dark:text-night-softText text-right">
          Todo<br/>el día
        </span>
      </div>

      {/* Pista de 7 columnas */}
      <div className="flex-1 relative py-1.5 px-px"
           style={{ minHeight: `${rows.length * 26 + 8}px` }}>
        {/* separadores de columna */}
        <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={i === 0 ? '' : 'border-l border-black/[.05] dark:border-white/[.05]'}/>
          ))}
        </div>

        {rows.map((row, ri) => (
          <div key={ri} className="relative" style={{ height: '24px', marginBottom: ri === rows.length - 1 ? 0 : '2px' }}>
            {row.map(it => {
              const left  = trackPct(it.startCol);
              const width = `calc(${trackPct(it.endCol - it.startCol + 1)} - 4px)`;
              // chip de hábito "todo el día"
              const c = getHabitColor(it.habitColor);
              const isDone = !!(doneMap && doneMap[it.doneKey]);
              return (
                <div key={it.key}
                  onClick={(e) => { e.stopPropagation(); onItemClick(it); }}
                  className="absolute top-0 h-full rounded-md px-1.5 flex items-center gap-1.5
                             overflow-hidden cursor-pointer hover:brightness-[.98] transition"
                  style={{ left: `calc(${left} + 2px)`, width, backgroundColor: c.soft, color: c.ink, opacity: isDone ? 0.4 : 1 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleDone(it); }}
                    aria-label={isDone ? 'Marcar como pendiente' : 'Marcar como completado'}
                    className="shrink-0 h-3.5 w-3.5 rounded-[5px] flex items-center justify-center transition"
                    style={isDone ? { backgroundColor: c.base, color: '#fff' } : { border: `1.5px solid ${c.base}`, color: c.base }}>
                    {isDone && <HLCheck size={9}/>}
                  </button>
                  <span className={`text-[11px] font-medium truncate ${isDone ? 'line-through' : ''}`}>{it.title}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── src/components/app/calendar/EventDetailPopover.tsx ─────────────────────
function EventDetailPopover({ anchorRect, gridRect, event, calendar, onClose, onEdit, onDelete }) {
  const ref = React.useRef(null);
  const mobile = useIsMobile();
  const [confirmDel, setConfirmDel] = React.useState(false);
  const [pos, setPos] = React.useState(null);   // { top, left } — null hasta medir

  React.useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Posicionamiento inteligente: medimos el tamaño real del popover y decidimos
  // el lado según en qué mitad del CALENDARIO esté el evento.
  //   · mitad derecha → popover a la IZQUIERDA del evento
  //   · mitad izquierda → popover a la DERECHA
  //   · si el lado preferido no cabe, se usa el opuesto
  //   · clamp final para no salir nunca del viewport
  React.useLayoutEffect(() => {
    if (mobile || !anchorRect || !ref.current) return;
    const M = 8;     // margen mínimo con el borde del viewport
    const gap = 8;   // separación con el bloque de evento
    const W = ref.current.offsetWidth;
    const H = ref.current.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const midX = gridRect ? (gridRect.left + gridRect.right) / 2 : vw / 2;
    const anchorCenter = (anchorRect.left + anchorRect.right) / 2;
    const onRightHalf = anchorCenter >= midX;

    const fitsLeft  = anchorRect.left - gap - W >= M;
    const fitsRight = anchorRect.right + gap + W <= vw - M;

    let left;
    if (onRightHalf) {
      left = fitsLeft ? anchorRect.left - gap - W : anchorRect.right + gap;
    } else {
      left = fitsRight ? anchorRect.right + gap : anchorRect.left - gap - W;
    }
    left = Math.max(M, Math.min(left, vw - M - W));

    // Vertical: alinear con el top del evento y mantener dentro del viewport.
    let top = Math.max(M, Math.min(anchorRect.top, vh - M - H));

    setPos({ top, left });
  }, [anchorRect, gridRect, confirmDel, mobile]);

  if (!event) return null;
  const c = getColor(event.color);

  const body = (
    <React.Fragment>
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${c.dot} shrink-0`}/>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-ink dark:text-night-text leading-tight">
            {event.title}
          </div>
          <div className="text-[12px] text-ink-soft dark:text-night-softText tabular-nums mt-0.5">
            {formatTimeRange(event.startTime, event.endTime)}
          </div>
          <div className="text-[12px] text-ink-mute dark:text-night-softText mt-1.5">
            {calendar?.name || 'Calendario'}
            {calendar?.type === 'shared' && (
              <span className="ml-1.5 text-[10px] uppercase tracking-[.06em] opacity-80">· compartido</span>
            )}
          </div>
          {event.description && (
            <div className="text-[12.5px] text-ink-soft dark:text-night-softText mt-2
                            whitespace-pre-line leading-snug">
              {event.description}
            </div>
          )}
        </div>
        <button onClick={onClose}
                className="text-ink-mute dark:text-night-softText hover:text-ink dark:hover:text-night-text
                           h-7 w-7 rounded-full flex items-center justify-center -mt-1 -mr-1
                           hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
          <IconClose/>
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => onEdit(event)}
                className="flex-1 h-9 rounded-full text-[12.5px] font-medium
                           bg-paper-soft dark:bg-night-soft text-ink dark:text-night-text
                           hover:bg-accent-tint hover:text-accent
                           transition-colors flex items-center justify-center gap-1.5">
          <IconPencil/> Editar
        </button>
        {!confirmDel ? (
          <button onClick={() => setConfirmDel(true)}
                  className="h-9 w-9 rounded-full text-ink-soft dark:text-night-softText
                             hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/15
                             transition-colors flex items-center justify-center">
            <IconTrash/>
          </button>
        ) : (
          <button onClick={() => { onDelete(event.id); onClose(); }}
                  className="h-9 px-3 rounded-full text-[12px] font-medium
                             bg-red-500 text-white hover:bg-red-600 transition-colors
                             flex items-center gap-1.5">
            <IconTrash/> Confirmar
          </button>
        )}
      </div>
      {/* TODO: onDelete → DELETE /api/v1/events/:id (id = event.id) */}
    </React.Fragment>
  );

  // Móvil: tarjeta centrada en pantalla con overlay (no anclada al click).
  if (mobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-5
                      bg-black/30 dark:bg-black/50"
           onClick={onClose}>
        <div ref={ref}
             onClick={(e) => e.stopPropagation()}
             className="w-full max-w-sm rounded-3xl bg-white dark:bg-night-card
                        border border-black/[.06] dark:border-white/[.08]
                        shadow-subtle p-5
                        hl-anim-pop">
          {body}
        </div>
      </div>
    );
  }

  // Desktop: popover anclado al evento (comportamiento original).
  return (
    <div ref={ref}
         className="fixed z-50 rounded-2xl bg-white dark:bg-night-card
                    border border-black/[.06] dark:border-white/[.08]
                    shadow-subtle p-4 w-[280px]"
         style={{
           top:  pos ? pos.top  : -9999,
           left: pos ? pos.left : -9999,
           opacity: pos ? 1 : 0,
           transition: 'opacity .12s ease',
         }}
         onClick={(e) => e.stopPropagation()}>
      {body}
    </div>
  );
}


// ─── src/components/app/calendar/CreateEventModal.tsx ───────────────────────

// Tipos de evento. Por ahora solo "Estándar"; el selector está preparado para
// recibir más tipos (cada uno podrá tener su propio formulario).
// TODO: añadir tipos como 'task' | 'reminder' | 'trip' con campos propios.
const EVENT_TYPES = [
  { id: 'standard',   label: 'Estándar' },
  { id: 'habito',     label: 'Hábito' },
];

function CreateEventModal({ open, onClose, onSubmit, onDelete, event, calendars, defaultDate }) {
  const isEdit = !!event;

  // Generar opciones de hora en intervalos de 15min, 07:00 a 22:45
  const TIME_OPTS = React.useMemo(() => {
    const out = [];
    for (let h = DAY_VIEW_START; h <= DAY_VIEW_END - 1; h++) {
      for (let m = 0; m < 60; m += 15) {
        out.push(`${pad2(h)}:${pad2(m)}`);
      }
    }
    // Hora fin puede ser hasta 23:00
    return out;
  }, []);

  const [title, setTitle]     = React.useState('');
  const [type, setType]       = React.useState('standard');
  const [description, setDescription] = React.useState('');
  const [date, setDate]       = React.useState('');
  const [start, setStart]     = React.useState('09:00');
  const [end, setEnd]         = React.useState('10:00');
  const [calId, setCalId]     = React.useState('');
  const [color, setColor]     = React.useState('sage');
  const [colorTouched, setColorTouched] = React.useState(false);
  const [err, setErr]         = React.useState('');

  // Formularios de los tipos personalizados
  const [habitForm, setHabitForm] = React.useState(null);

  React.useEffect(() => {
    if (!open) return;
    const baseDate = defaultDate ? isoDate(defaultDate) : isoDate(new Date());
    // defaults de hábito (también para crear)
    setHabitForm({ name: '', color: 'sage', days: [0,1,2,3,4,5,6], time: null });

    if (event) {
      const ty = event.type || 'standard';
      setType(ty);
      if (ty === 'habito') {
        setHabitForm({
          name: event.name || '', color: event.color || 'sage',
          days: event.days && event.days.length ? event.days : [0,1,2,3,4,5,6],
          time: event.time || null,
        });
      } else {
        setTitle(event.title);
        setDescription(event.description || '');
        setDate(event.date);
        setStart(event.startTime);
        setEnd(event.endTime);
        setCalId(event.calendarId);
        setColor(event.color);
        setColorTouched(true);
      }
    } else {
      setType('standard');
      setTitle('');
      setDescription('');
      setDate(baseDate);
      setStart('09:00');
      setEnd('10:00');
      const first = calendars[0];
      setCalId(first?.id || '');
      setColor(first?.color || 'sage');
      setColorTouched(false);
    }
    setErr('');
  }, [open, event, defaultDate, calendars]);

  // Si cambia el calendario y el color no fue tocado, hereda el del cal.
  const handleCalChange = (id) => {
    setCalId(id);
    if (!colorTouched) {
      const c = calendars.find(c => c.id === id);
      if (c) setColor(c.color);
    }
  };

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();

    if (type === 'habito') {
      const f = habitForm;
      if (!f.name.trim()) { setErr('El nombre del hábito es obligatorio.'); return; }
      if (!f.days.length) { setErr('Elige al menos un día de la semana.'); return; }
      onSubmit({
        id: event?.id, type: 'habito',
        name: f.name.trim(), color: f.color, days: f.days, time: f.time || null,
      });
      return;
    }

    // estándar
    if (!title.trim()) { setErr('El nombre del evento es obligatorio.'); return; }
    if (timeToMinutes(end) <= timeToMinutes(start)) {
      setErr('La hora de fin debe ser posterior a la de inicio.');
      return;
    }
    // TODO: enviar al backend
    //   POST   /api/v1/events           (creación)
    //   PATCH  /api/v1/events/:id       (edición — event.id)
    const payload = {
      id: event?.id,
      title: title.trim(),
      type: 'standard',
      description: description.trim(),
      date, startTime: start, endTime: end,
      calendarId: calId, color,
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center
                    bg-black/30 dark:bg-black/50 sm:px-3 sm:py-4"
         onClick={onClose}>
      <form onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white dark:bg-night-card
                       rounded-t-3xl rounded-b-none sm:rounded-3xl
                       border border-black/[.05] dark:border-white/[.06]
                       shadow-subtle p-5 sm:p-6 space-y-4
                       max-h-[90vh] overflow-y-auto overscroll-contain
                       hl-modal-anim">
        {/* tirador (sólo móvil) */}
        <div className="sm:hidden -mt-1 mb-1 flex justify-center">
          <span className="h-1 w-10 rounded-full bg-black/[.12] dark:bg-white/[.16]"/>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-medium tracking-tight text-ink dark:text-night-text">
            {(() => {
              const noun = type === 'habito' ? 'hábito' : 'evento';
              return isEdit ? `Editar ${noun}` : `Nuevo ${noun}`;
            })()}
          </h2>
          <button type="button" onClick={onClose}
                  className="text-ink-mute dark:text-night-softText hover:text-ink dark:hover:text-night-text
                             h-8 w-8 rounded-full flex items-center justify-center
                             hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
            <IconClose/>
          </button>
        </div>

        {!isEdit && (
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[.08em]
                            text-ink-mute dark:text-night-softText mb-2 ml-1">
              Tipo
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {EVENT_TYPES.map(t => {
                const selected = t.id === type;
                const ic = t.id === 'habito'     ? <IconHabit width="15" height="15"/>
                         : null;
                return (
                  <button key={t.id} type="button"
                    onClick={() => { setType(t.id); setErr(''); }}
                    aria-pressed={selected}
                    className={`h-9 px-4 rounded-full text-[13px] font-medium border transition
                                inline-flex items-center gap-1.5
                                ${selected
                                  ? 'bg-accent-tint text-accent border-accent'
                                  : 'bg-paper-soft dark:bg-night-soft text-ink-soft dark:text-night-softText border-transparent hover:brightness-[.97]'}`}>
                    {ic}{t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {type === 'habito' && habitForm && (
          <HabitFormFields form={habitForm} setForm={setHabitForm} autoFocus={!isEdit}/>
        )}

        {type === 'standard' && (
        <React.Fragment>
        <ModalField label="Nombre">
          <input
            type="text" autoFocus
            value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Cena con María"
            className="w-full bg-transparent outline-none text-[15px]
                       placeholder:text-ink-mute dark:placeholder:text-night-softText"/>
        </ModalField>

        <ModalField label="Fecha">
          <input
            type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent outline-none text-[15px] tabular-nums
                       text-ink dark:text-night-text"/>
        </ModalField>

        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Inicio">
            <select value={start} onChange={(e) => setStart(e.target.value)}
                    className="w-full bg-transparent outline-none text-[15px] tabular-nums
                               text-ink dark:text-night-text">
              {TIME_OPTS.map(t => <option key={t} value={t} className="bg-white dark:bg-night-card">{t}</option>)}
            </select>
          </ModalField>
          <ModalField label="Fin">
            <select value={end} onChange={(e) => setEnd(e.target.value)}
                    className="w-full bg-transparent outline-none text-[15px] tabular-nums
                               text-ink dark:text-night-text">
              {TIME_OPTS.concat(['23:00']).map(t => (
                <option key={t} value={t} className="bg-white dark:bg-night-card">{t}</option>
              ))}
            </select>
          </ModalField>
        </div>

        <ModalField label="Calendario">
          <div className="flex items-center gap-2 w-full">
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${getColor((calendars.find(c=>c.id===calId)||{}).color).dot}`}/>
            <select value={calId} onChange={(e) => handleCalChange(e.target.value)}
                    className="w-full bg-transparent outline-none text-[15px]
                               text-ink dark:text-night-text">
              {calendars.map(c => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-night-card">
                  {c.name} {c.type === 'shared' ? '· compartido' : ''}
                </option>
              ))}
            </select>
          </div>
        </ModalField>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-[.08em]
                          text-ink-mute dark:text-night-softText mb-2 ml-1">
            Color
          </div>
          <div className="flex items-center gap-2.5">
            {CALENDAR_COLORS.map(c => {
              const selected = c.id === color;
              return (
                <button key={c.id} type="button"
                  aria-label={c.label}
                  onClick={() => { setColor(c.id); setColorTouched(true); }}
                  className={`h-8 w-8 rounded-full ${c.dot} flex items-center justify-center
                              ring-2 ring-offset-2 ring-offset-white dark:ring-offset-night-card
                              transition
                              ${selected ? 'ring-ink/40 dark:ring-white/60' : 'ring-transparent'}`}>
                  {selected && <span className="text-white drop-shadow-sm"><IconCheckCal/></span>}
                </button>
              );
            })}
          </div>
        </div>
        </React.Fragment>
        )}

        {type === 'standard' && (
          <label className="block">
            <span className="block text-[11px] font-medium uppercase tracking-[.08em]
                             text-ink-mute dark:text-night-softText mb-1.5 ml-1">
              Descripción <span className="normal-case tracking-normal opacity-70">· opcional</span>
            </span>
            <div className="rounded-2xl px-3.5 py-2.5
                            bg-paper-soft dark:bg-night-soft
                            border border-transparent focus-within:border-accent
                            focus-within:bg-white dark:focus-within:bg-night
                            transition-colors">
              <textarea
                value={description}
                onChange={(e) => {
                  const v = e.target.value;
                  // Máx 3 líneas (2 saltos de línea)
                  if (v.split('\n').length <= 3) setDescription(v);
                }}
                rows={3}
                placeholder="Añade una nota…"
                className="w-full bg-transparent outline-none text-[15px] resize-none leading-snug
                           placeholder:text-ink-mute dark:placeholder:text-night-softText
                           text-ink dark:text-night-text"/>
            </div>
          </label>
        )}

        {err && (
          <div className="text-[12.5px] text-red-600 dark:text-red-400 -mt-1">
            {err}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          {isEdit && type === 'habito' && onDelete && (
            <button type="button"
                    onClick={() => onDelete(event)}
                    className="mr-auto h-10 px-3.5 rounded-full text-[13.5px] font-medium
                               text-red-600 dark:text-red-400
                               hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors
                               inline-flex items-center gap-1.5">
              <IconTrash/> Eliminar
            </button>
          )}
          <button type="button" onClick={onClose}
                  className="h-10 px-4 rounded-full text-[13.5px] font-medium
                             text-ink dark:text-night-text
                             hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
            Cancelar
          </button>
          <button type="submit"
                  className="h-10 px-5 rounded-full text-[13.5px] font-medium
                             bg-accent text-[hsl(var(--accent-strong))]
                             hover:brightness-[.96] active:brightness-[.92] transition">
            {isEdit ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ModalField({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium uppercase tracking-[.08em]
                       text-ink-mute dark:text-night-softText mb-1.5 ml-1">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5
                      bg-paper-soft dark:bg-night-soft
                      border border-transparent focus-within:border-accent
                      focus-within:bg-white dark:focus-within:bg-night
                      transition-colors">
        {children}
      </div>
    </label>
  );
}


// ─── src/components/app/calendar/CalendarSidebar.tsx ────────────────────────
function CalendarSidebar({ calendars, visibleIds, onToggle, custom, onToggleCustom, mobileOpen, onMobileClose }) {
  const personal = calendars.filter(c => c.type === 'personal');
  const shared   = calendars.filter(c => c.type === 'shared');

  const list = (items) => (
    <ul className="space-y-0.5">
      {items.map(c => {
        const checked = visibleIds.has(c.id);
        const color = getColor(c.color);
        return (
          <li key={c.id}>
            <button onClick={() => onToggle(c.id)}
              className="group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl
                         text-left hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
              <span className={`h-4 w-4 rounded-[6px] shrink-0 flex items-center justify-center
                                border ${checked ? `${color.dot} border-transparent` : 'bg-transparent border-black/[.18] dark:border-white/[.18]'}`}>
                {checked && <span className="text-white"><IconCheckCal/></span>}
              </span>
              <span className={`text-[13.5px] truncate
                                ${checked ? 'text-ink dark:text-night-text' : 'text-ink-mute dark:text-night-softText'}`}>
                {c.name}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const body = (
    <div className="space-y-5">
      <div>
        <div className="px-2.5 pb-1.5 text-[10.5px] font-medium uppercase tracking-[.1em]
                        text-ink-mute dark:text-night-softText">
          Mis calendarios
        </div>
        {list(personal)}
      </div>
      <div>
        <div className="px-2.5 pb-1.5 text-[10.5px] font-medium uppercase tracking-[.1em]
                        text-ink-mute dark:text-night-softText">
          Compartidos
        </div>
        {list(shared)}
      </div>

      <div>
        <div className="px-2.5 pb-1.5 text-[10.5px] font-medium uppercase tracking-[.1em]
                        text-ink-mute dark:text-night-softText">
          Eventos personalizados
        </div>
        <ul className="space-y-0.5">
          {custom.map(c => (
            <li key={c.id}>
              <button onClick={() => onToggleCustom(c.id)}
                className="group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl
                           text-left hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
                <span className="h-4 w-4 rounded-[6px] shrink-0 flex items-center justify-center border"
                  style={c.checked
                    ? { backgroundColor: c.color, borderColor: 'transparent' }
                    : { backgroundColor: 'transparent', borderColor: 'rgba(120,120,120,.4)' }}>
                  {c.checked && <span className="text-white"><IconCheckCal/></span>}
                </span>
                <span className={`text-[13.5px] truncate
                                  ${c.checked ? 'text-ink dark:text-night-text' : 'text-ink-mute dark:text-night-softText'}`}>
                  {c.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* TODO: botón "+ Nuevo calendario" → POST /api/v1/calendars */}
      <button
        className="w-full mt-1 flex items-center gap-2 px-2.5 py-2 rounded-xl
                   text-[13px] text-ink-mute dark:text-night-softText
                   hover:bg-paper-soft dark:hover:bg-night-soft hover:text-ink dark:hover:text-night-text
                   transition-colors">
        <span className="h-4 w-4 rounded-full border border-dashed border-black/[.2] dark:border-white/[.25]
                          flex items-center justify-center text-[11px] leading-none">+</span>
        Nuevo calendario
      </button>
    </div>
  );

  return (
    <React.Fragment>
      {/* Desktop */}
      <aside className="hidden lg:block w-[200px] shrink-0 px-3 py-4
                        border-r border-black/[.05] dark:border-white/[.05]">
        {body}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={onMobileClose}>
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[80vw]
                          bg-paper dark:bg-night p-4 overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[13px] font-medium text-ink dark:text-night-text">Calendarios</span>
              <button onClick={onMobileClose}
                      className="h-8 w-8 rounded-full flex items-center justify-center
                                 text-ink-soft dark:text-night-softText
                                 hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
                <IconClose/>
              </button>
            </div>
            {body}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}


// ─── src/pages/CalendarPage.tsx ─────────────────────────────────────────────
function CalendarPage() {
  const mobile = useIsMobile();
  const [weekStart, setWeekStart] = React.useState(() => getWeekStart(new Date()));
  const { data: calendars, isLoading: calLoading, error: calErr } = useCalendars();
  const { data: events, isLoading: evLoading, error: evErr } = useCalendarEvents(weekStart);

  const [visibleIds, setVisibleIds] = React.useState(
    () => new Set(MOCK_CALENDARS.map(c => c.id))
  );
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [modalOpen, setModalOpen]     = React.useState(false);
  const [editEvent, setEditEvent]     = React.useState(null);
  const [defaultDate, setDefaultDate] = React.useState(null);
  const [popover, setPopover]         = React.useState(null);  // { event, anchorRect }
  const [extraEvents, setExtraEvents] = React.useState([]);    // creados en sesión
  const [deletedIds, setDeletedIds]   = React.useState(new Set());
  const [selectedDay, setSelectedDay] = React.useState(null);  // ISO — bottom sheet (móvil)
  const [sheetH, setSheetH]           = React.useState(0);     // alto del bottom sheet (para elevar el FAB)

  // ── Tipos de evento personalizados (store compartido con sus páginas) ──
  const [habits]    = useStore(HabitsStore);
  const [doneMap]   = useStore(HabitDoneStore);
  const [showHabits, setShowHabits] = React.useState(true);

  const gridScrollRef = React.useRef(null);

  // Scroll inicial a las 08:00
  React.useEffect(() => {
    const el = gridScrollRef.current;
    if (!el) return;
    const total = el.scrollHeight;
    // 08:00 está a (1/16) del total visible (16 horas; 08:00 es la segunda hora).
    el.scrollTop = total * (1 / 16);
  }, []);

  const days = getWeekDays(weekStart);
  const iso0 = isoDate(days[0]);
  const iso6 = isoDate(days[6]);
  const visibleEvents = [
    ...events.filter(e => !deletedIds.has(e.id)),
    ...extraEvents.filter(e =>
      e.date >= isoDate(days[0]) && e.date <= isoDate(days[6])
    ),
  ].filter(e => visibleIds.has(e.calendarId));

  // índice de columna (0–6) de una fecha ISO dentro de la semana visible
  const colOf = (iso) => {
    const diff = Math.round((parseISO(iso) - days[0]) / 86400000);
    return Math.max(0, Math.min(6, diff));
  };

  // ── Hábitos con hora → bloque cronometrado por cada día activo de la semana ──
  const habitTimed = [];
  if (showHabits) {
    days.forEach(d => {
      const dow = (d.getDay() + 6) % 7;
      const iso = isoDate(d);
      habits.forEach(h => {
        if (h.time && h.days.includes(dow)) {
          habitTimed.push({
            id: h.id + '-' + iso, kind: 'habit', refId: h.id, habitColor: h.color,
            title: h.name, date: iso,
            startTime: h.time, endTime: hlAddMinutes(h.time, 30),
            doneKey: habitDoneKey(h.id, iso),
          });
        }
      });
    });
  }

  // ── Banda "todo el día": hábitos sin hora ──
  const allDayItems = [];
  if (showHabits) {
    days.forEach((d, idx) => {
      const dow = (d.getDay() + 6) % 7;
      const iso = isoDate(d);
      habits.forEach(h => {
        if (!h.time && h.days.includes(dow)) {
          allDayItems.push({
            key: h.id + '-' + iso, type: 'habit', refId: h.id, habitColor: h.color,
            title: h.name, startCol: idx, endCol: idx,
            doneKey: habitDoneKey(h.id, iso),
          });
        }
      });
    });
  }

  const goPrev  = () => setWeekStart(d => addDays(d, -7));
  const goNext  = () => setWeekStart(d => addDays(d, 7));
  const goToday = () => setWeekStart(getWeekStart(new Date()));

  // ── Vista mensual (móvil) ──────────────────────────────────
  // Mes mostrado = el del centro de la semana visible (robusto en los bordes).
  const monthBase  = addDays(weekStart, 3);
  const monthPrev  = () => setWeekStart(getWeekStart(new Date(monthBase.getFullYear(), monthBase.getMonth() - 1, 1)));
  const monthNext  = () => setWeekStart(getWeekStart(new Date(monthBase.getFullYear(), monthBase.getMonth() + 1, 1)));

  // Conjunto completo de eventos estándar visibles (sin límite de semana),
  // con la misma semántica de borrado/edición que la vista semanal.
  const allMock = React.useMemo(() => buildMockEvents(), []);
  const allVisibleStandard = [
    ...allMock.filter(e => !deletedIds.has(e.id)),
    ...extraEvents,
  ].filter(e => visibleIds.has(e.calendarId));

  // Tocar un evento en móvil: hábito → editar; estándar → popover centrado.
  const handleMobileEventClick = (entry) => {
    setSelectedDay(null);
    if (entry.kind === 'habit') { openEditHabit(entry.habit); return; }
    setPopover({ event: entry.event, anchorRect: null, gridRect: null });
  };

  const toggleCal = (id) => {
    setVisibleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openCreate = (date) => {
    setEditEvent(null);
    setDefaultDate(date || new Date());
    setModalOpen(true);
    setPopover(null);
  };
  const openEdit = (ev) => {
    setEditEvent(ev);
    setDefaultDate(null);
    setModalOpen(true);
    setPopover(null);
  };
  const openEditHabit = (h) => {
    setEditEvent({ ...h, type: 'habito' });
    setDefaultDate(null); setModalOpen(true); setPopover(null);
  };

  const handleSubmit = (payload) => {
    if (payload.type === 'habito') {
      HabitsStore.set(prev => payload.id
        ? prev.map(h => h.id === payload.id ? { ...h, ...payload } : h)
        : [...prev, { ...payload, id: 'hab-' + Date.now() }]);
      setModalOpen(false);
      return;
    }
    // estándar
    if (payload.id) {
      // edición — actualizar en extraEvents si existe, o reemplazar el original
      setExtraEvents(prev => {
        const exists = prev.some(e => e.id === payload.id);
        if (exists) return prev.map(e => e.id === payload.id ? payload : e);
        return [...prev, payload];
      });
      setDeletedIds(prev => new Set(prev).add(payload.id));
    } else {
      const id = `ev-new-${Date.now()}`;
      setExtraEvents(prev => [...prev, { ...payload, id }]);
    }
    setModalOpen(false);
  };
  const handleDelete = (id) => {
    setDeletedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setExtraEvents(prev => prev.filter(e => e.id !== id));
  };
  // Eliminar hábito (desde el modal de edición)
  const handleDeleteCustom = (event) => {
    if (event.type === 'habito') {
      HabitsStore.set(prev => prev.filter(h => h.id !== event.id));
    }
    setModalOpen(false);
  };
  const handleEventClick = (event, target) => {
    if (event.kind === 'habit') {
      const h = habits.find(x => x.id === event.refId);
      if (h) openEditHabit(h);
      return;
    }
    const gridRect = gridScrollRef.current
      ? gridScrollRef.current.getBoundingClientRect()
      : null;
    setPopover({ event, anchorRect: target.getBoundingClientRect(), gridRect });
  };
  // Click en la banda "todo el día"
  const handleAllDayClick = (it) => {
    const h = habits.find(x => x.id === it.refId);
    if (h) openEditHabit(h);
  };
  const handleToggleHabitDone = (it) => {
    // doneKey = "habitId|iso"
    const [id, iso] = it.doneKey.split('|');
    toggleHabitDone(id, iso);
  };

  // Loading / error
  if (calLoading || evLoading) return <CalendarLoading/>;
  if (calErr || evErr)         return <CalendarError/>;

  const popoverCal = popover ? calendars.find(c => c.id === popover.event.calendarId) : null;

  // Overlays compartidos por ambas vistas (popover detalle + modal crear/editar)
  const sharedOverlays = (
    <React.Fragment>
      {popover && (
        <EventDetailPopover
          anchorRect={popover.anchorRect}
          gridRect={popover.gridRect}
          event={popover.event}
          calendar={popoverCal}
          onClose={() => setPopover(null)}
          onEdit={openEdit}
          onDelete={handleDelete}/>
      )}
      <CreateEventModal
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDeleteCustom}
        event={editEvent}
        defaultDate={defaultDate}
        calendars={calendars}/>
    </React.Fragment>
  );

  // ════════════════════════════════════════════════════════════
  // VISTA MÓVIL — calendario mensual + bottom sheet
  // ════════════════════════════════════════════════════════════
  if (mobile) {
    return (
      <div className="route-fade flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Drawer de filtro de calendarios (sólo se ve la parte drawer en móvil) */}
        <CalendarSidebar
          calendars={calendars} visibleIds={visibleIds} onToggle={toggleCal}
          custom={[{ id: 'habits', label: 'Hábitos', checked: showHabits, color: getHabitColor('sage').base }]}
          onToggleCustom={() => setShowHabits(v => !v)}
          mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)}/>

        <MonthView
          monthBase={monthBase}
          onPrevMonth={monthPrev} onNextMonth={monthNext} onToday={goToday}
          onOpenFilter={() => setSidebarOpen(true)}
          events={allVisibleStandard}
          habits={habits} showHabits={showHabits} doneMap={doneMap}
          onSelectDay={setSelectedDay}/>

        {/* FAB "Nuevo evento" — flotante por encima del bottom sheet */}
        <button
          onClick={() => openCreate(selectedDay ? parseISO(selectedDay) : new Date())}
          aria-label="Nuevo evento"
          style={{
            bottom: (selectedDay && sheetH) ? (sheetH + 16) : undefined,
            transition: 'bottom .3s cubic-bezier(.32,.72,0,1)',
          }}
          className="fixed z-[45] right-4 bottom-[86px]
                     h-14 w-14 rounded-full bg-accent text-[hsl(var(--accent-strong))]
                     shadow-subtle border border-black/[.05] dark:border-white/[.08]
                     hover:brightness-[.96] active:brightness-[.92] transition
                     flex items-center justify-center">
          <IconPlusCal/>
        </button>

        {/* Bottom sheet del día */}
        {selectedDay && (
          <DayBottomSheet
            iso={selectedDay}
            events={allVisibleStandard}
            habits={habits} showHabits={showHabits} doneMap={doneMap}
            onClose={() => setSelectedDay(null)}
            onEventClick={handleMobileEventClick}
            onToggleHabitDone={handleToggleHabitDone}
            onCreate={() => openCreate(parseISO(selectedDay))}
            onHeight={setSheetH}/>
        )}

        {sharedOverlays}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // VISTA DESKTOP — rejilla semanal por horas (sin cambios)
  // ════════════════════════════════════════════════════════════
  return (
    <div className="route-fade flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
      <CalendarSidebar
        calendars={calendars} visibleIds={visibleIds} onToggle={toggleCal}
        custom={[
          { id: 'habits', label: 'Hábitos',      checked: showHabits, color: getHabitColor('sage').base },
        ]}
        onToggleCustom={() => setShowHabits(v => !v)}
        mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)}/>

      <div className="flex-1 min-w-0 flex flex-col">
        <WeekHeader
          weekStart={weekStart}
          onPrev={goPrev} onNext={goNext} onToday={goToday}
          onToggleSidebar={() => setSidebarOpen(true)}/>

        <AllDayLane
          items={allDayItems}
          onItemClick={handleAllDayClick}
          onToggleDone={handleToggleHabitDone}
          doneMap={doneMap}/>

        {/* Grid scrollable */}
        <div ref={gridScrollRef}
             className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-4">
          <div className="flex" style={{ height: `${(DAY_VIEW_END - DAY_VIEW_START) * 56}px` }}>
            <HourLabels/>
            <div className="flex-1 grid grid-cols-7 relative">
              {days.map((d, i) => {
                const iso = isoDate(d);
                const dayEvents = [
                  ...visibleEvents.filter(e => e.date === iso),
                  ...habitTimed.filter(e => e.date === iso),
                ];
                return (
                  <DayColumn key={i}
                    date={d}
                    events={dayEvents}
                    calendars={calendars}
                    isFirst={i === 0}
                    onEventClick={handleEventClick}
                    onSlotClick={openCreate}
                    onToggleDone={handleToggleHabitDone}
                    doneMap={doneMap}/>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FAB "Nuevo evento" */}
      <button
        onClick={() => openCreate(new Date())}
        aria-label="Nuevo evento"
        className="fixed z-30 right-4 bottom-[86px] md:bottom-6
                   h-14 w-14 rounded-full bg-accent text-[hsl(var(--accent-strong))]
                   shadow-subtle border border-black/[.05] dark:border-white/[.08]
                   hover:brightness-[.96] active:brightness-[.92] transition
                   flex items-center justify-center">
        <IconPlusCal/>
      </button>

      {/* Popover detalle + Modal crear/editar (compartidos) */}
      {sharedOverlays}
    </div>
  );
}

function CalendarLoading() {
  return (
    <div className="route-fade p-6">
      <div className="h-10 w-64 rounded-full bg-paper-soft dark:bg-night-soft animate-pulse mb-4"/>
      <div className="grid grid-cols-7 gap-2 mb-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-12 rounded-2xl bg-paper-soft dark:bg-night-soft animate-pulse"/>
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 rounded-2xl bg-paper-soft/70 dark:bg-night-soft/70 animate-pulse"/>
        ))}
      </div>
    </div>
  );
}

function CalendarError() {
  return (
    <div className="route-fade p-10 text-center text-ink-soft dark:text-night-softText">
      No se pudieron cargar los eventos. Vuelve a intentarlo en un momento.
    </div>
  );
}


Object.assign(window, { CalendarPage });
