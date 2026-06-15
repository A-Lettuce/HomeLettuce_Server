// Home Lettuce — Calendario · vista MÓVIL (< 768px)
// ─────────────────────────────────────────────────────────────────────────────
// En desktop el calendario es una rejilla semanal por horas (calendar.jsx).
// En móvil eso queda ilegible, así que aquí vive una vista MENSUAL compacta:
//   · celdas de día pequeñas con puntos de color (máx. 3)
//   · al tocar un día se abre un bottom sheet con la lista de eventos
// El detalle / edición y la creación los gestiona calendar.jsx (compartidos).
//
// En el repo TS real:
//   · src/components/app/calendar/MonthView.tsx
//   · src/components/app/calendar/MonthCell.tsx
//   · src/components/app/calendar/DayBottomSheet.tsx
//   · src/lib/calendarMonth.ts
// Depende de helpers globales de store.jsx (hl*) e icons.jsx (Icon*).
// ─────────────────────────────────────────────────────────────────────────────


// ─── src/lib/calendarMonth.ts ───────────────────────────────────────────────
const MONTH_FULL_ES = ['enero','febrero','marzo','abril','mayo','junio',
                       'julio','agosto','septiembre','octubre','noviembre','diciembre'];
const WEEKDAY_MIN_ES = ['L','M','X','J','V','S','D'];
const WEEKDAY_FULL_ES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

// Hex equivalente a los colores de calendario (CALENDAR_COLORS usa clases Tailwind).
const CAL_HEX = {
  sage:     '#4ade80',
  lavender: '#c084fc',
  peach:    '#fb923c',
  sky:      '#60a5fa',
  rose:     '#f472b6',
  butter:   '#facc15',
};
function calColorHex(id) { return CAL_HEX[id] || CAL_HEX.sage; }

// Matriz de semanas (lunes→domingo) que cubre el mes que contiene `base`.
function monthMatrix(base) {
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const last  = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  let cur = hlWeekStart(first);
  const weeks = [];
  while (true) {
    const week = [];
    for (let i = 0; i < 7; i++) { week.push(cur); cur = hlAddDays(cur, 1); }
    weeks.push(week);
    if (week[6] >= last) break;
  }
  return weeks;
}

// Lista normalizada de "entradas" de un día (eventos estándar + hábitos).
// time = null → todo el día. Orden: todo-el-día primero, luego por hora.
function buildDayEntries(iso, dow, { events, habits, showHabits, doneMap }) {
  const out = [];
  events.filter(e => e.date === iso).forEach(e => {
    out.push({
      kind: 'standard', title: e.title,
      time: e.startTime, endTime: e.endTime,
      colorHex: calColorHex(e.color), inkHex: calColorHex(e.color),
      event: e,
    });
  });
  if (showHabits) {
    habits.forEach(h => {
      if (!h.days.includes(dow)) return;
      const c = getHabitColor(h.color);
      out.push({
        kind: 'habit', title: h.name,
        time: h.time || null,
        colorHex: c.base, inkHex: c.ink,
        doneKey: habitDoneKey(h.id, iso),
        done: !!(doneMap && doneMap[habitDoneKey(h.id, iso)]),
        habit: h,
      });
    });
  }
  return out.sort((a, b) => {
    if (!a.time && b.time) return -1;
    if (a.time && !b.time) return 1;
    if (!a.time && !b.time) return 0;
    return a.time.localeCompare(b.time);
  });
}


// Resumen de puntos para una celda: eventos estándar primero, luego hábitos,
// deduplicando por color (evita 3 puntos idénticos cuando hay hábitos diarios).
function dotColorsFor(entries) {
  const out = [];
  const seen = new Set();
  const push = (e) => { if (!seen.has(e.colorHex)) { seen.add(e.colorHex); out.push(e.colorHex); } };
  entries.filter(e => e.kind === 'standard').forEach(push);
  entries.filter(e => e.kind !== 'standard').forEach(push);
  return out;
}


// ─── iconos locales ─────────────────────────────────────────────────────────
const MIconChevL = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...p}><path d="m14 6-6 6 6 6"/></svg>
);
const MIconChevR = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...p}><path d="m10 6 6 6-6 6"/></svg>
);
const MIconFilter = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="19" height="19" {...p}>
    <path d="M5 7h14M8 12h8M10.5 17h3"/></svg>
);
const MIconCloseS = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...p}><path d="m6 6 12 12M18 6 6 18"/></svg>
);


// ─── MonthCell ──────────────────────────────────────────────────────────────
function MonthCell({ date, inMonth, today, dots, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 pt-1.5 pb-1 min-h-0
                  border-t border-l border-black/[.05] dark:border-white/[.06]
                  transition-colors
                  ${inMonth ? 'hover:bg-paper-soft dark:hover:bg-night-soft' : ''}`}>
      <span className={`h-6 w-6 flex items-center justify-center rounded-full
                        text-[12.5px] tabular-nums leading-none
                        ${today
                          ? 'bg-accent text-[hsl(var(--accent-strong))] font-semibold'
                          : inMonth
                            ? 'text-ink dark:text-night-text'
                            : 'text-ink-mute/55 dark:text-night-softText/45'}`}>
        {date.getDate()}
      </span>
      <span className="flex items-center justify-center gap-[3px] h-2">
        {dots.slice(0, 3).map((hex, i) => (
          <span key={i} className="h-[5px] w-[5px] rounded-full"
                style={{ backgroundColor: hex, opacity: inMonth ? 1 : 0.4 }}/>
        ))}
      </span>
    </button>
  );
}


// ─── MonthView ──────────────────────────────────────────────────────────────
function MonthView({
  monthBase, onPrevMonth, onNextMonth, onToday, onOpenFilter,
  events, habits, showHabits, doneMap, onSelectDay,
}) {
  const weeks = React.useMemo(() => monthMatrix(monthBase), [monthBase]);
  const todayIso = hlIso(hlToday());
  const month = monthBase.getMonth();

  return (
    <div className="flex flex-col flex-1 min-h-0 pb-[80px]">
      {/* Controles */}
      <div className="px-3 py-3 flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-0.5">
          <button onClick={onPrevMonth} aria-label="Mes anterior"
            className="h-9 w-9 rounded-full flex items-center justify-center
                       text-ink-soft dark:text-night-softText
                       hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
            <MIconChevL/>
          </button>
          <button onClick={onNextMonth} aria-label="Mes siguiente"
            className="h-9 w-9 rounded-full flex items-center justify-center
                       text-ink-soft dark:text-night-softText
                       hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
            <MIconChevR/>
          </button>
        </div>
        <div className="flex-1 text-[16px] font-medium tracking-tight text-ink dark:text-night-text">
          <span className="capitalize">{MONTH_FULL_ES[month]}</span>{' '}
          <span className="text-ink-mute dark:text-night-softText tabular-nums">{monthBase.getFullYear()}</span>
        </div>
        <button onClick={onToday}
          className="text-[12.5px] px-3 h-8 rounded-full
                     border border-black/[.08] dark:border-white/[.1]
                     text-ink dark:text-night-text
                     hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
          Hoy
        </button>
        <button onClick={onOpenFilter} aria-label="Filtrar calendarios"
          className="h-9 w-9 rounded-full flex items-center justify-center
                     text-ink-soft dark:text-night-softText
                     hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
          <MIconFilter/>
        </button>
      </div>

      {/* Cabecera de días */}
      <div className="grid grid-cols-7 px-px shrink-0">
        {WEEKDAY_MIN_ES.map((d, i) => (
          <div key={i} className="py-1.5 text-center text-[11px] font-medium
                                  text-ink-mute dark:text-night-softText">
            {d}
          </div>
        ))}
      </div>

      {/* Rejilla del mes */}
      <div className="flex-1 min-h-0 grid grid-cols-7 auto-rows-fr px-px
                      border-b border-r border-black/[.05] dark:border-white/[.06]">
        {weeks.flat().map((date, i) => {
          const iso = hlIso(date);
          const dow = hlDow(date);
          const entries = buildDayEntries(iso, dow, { events, habits, showHabits, doneMap });
          return (
            <MonthCell key={i}
              date={date}
              inMonth={date.getMonth() === month}
              today={iso === todayIso}
              dots={dotColorsFor(entries)}
              onClick={() => onSelectDay(iso)}/>
          );
        })}
      </div>
    </div>
  );
}


// ─── DayBottomSheet ─────────────────────────────────────────────────────────
function DayBottomSheet({
  iso, events, habits, showHabits, doneMap,
  onClose, onEventClick, onToggleHabitDone, onCreate, onHeight,
}) {
  const date = hlParse(iso);
  const dow = hlDow(date);
  const entries = buildDayEntries(iso, dow, { events, habits, showHabits, doneMap });
  const panelRef = React.useRef(null);

  // Reporta la altura para que el FAB se eleve por encima del sheet.
  React.useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el || !onHeight) return;
    const report = () => onHeight(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => { ro.disconnect(); onHeight(0); };
  }, [iso, entries.length, onHeight]);

  // Escape cierra
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fmtTime = (e) => {
    if (e.kind === 'habit') return e.time ? e.time : 'Todo el día';
    return `${e.time}–${e.endTime}`;
  };

  return (
    <React.Fragment>
      {/* overlay */}
      <div className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50
                      hl-anim-fade" onClick={onClose}/>
      {/* panel */}
      <div ref={panelRef}
        role="dialog" aria-modal="true"
        className="fixed bottom-0 left-0 right-0 z-40
                   bg-paper dark:bg-night rounded-t-3xl
                   border-t border-black/[.06] dark:border-white/[.08]
                   shadow-[0_-8px_30px_rgba(20,28,24,.12)]
                   max-h-[70vh] flex flex-col
                   hl-anim-sheet">
        {/* tirador */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <span className="h-1 w-10 rounded-full bg-black/[.12] dark:bg-white/[.16]"/>
        </div>
        {/* cabecera */}
        <div className="px-5 pt-1 pb-3 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-ink dark:text-night-text leading-tight">
              {WEEKDAY_FULL_ES[dow]} {date.getDate()}
            </div>
            <div className="text-[12.5px] text-ink-mute dark:text-night-softText capitalize">
              {MONTH_FULL_ES[date.getMonth()]} {date.getFullYear()}
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar"
            className="h-8 w-8 rounded-full flex items-center justify-center
                       text-ink-soft dark:text-night-softText
                       hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
            <MIconCloseS/>
          </button>
        </div>

        {/* lista */}
        <div className="px-3 pb-5 overflow-y-auto overscroll-contain"
             style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
          {entries.length === 0 ? (
            <div className="px-2 py-10 text-center">
              <div className="text-[13.5px] text-ink-mute dark:text-night-softText">
                No hay eventos este día.
              </div>
              <button onClick={onCreate}
                className="mt-3 h-9 px-4 rounded-full text-[13px] font-medium
                           bg-accent text-[hsl(var(--accent-strong))]
                           hover:brightness-[.96] transition">
                + Añadir evento
              </button>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {entries.map((e, i) => {
                const Icon = e.kind === 'habit' ? IconHabit : IconCalendar;
                return (
                  <li key={i}>
                    <div className="w-full flex items-center gap-3 px-2 py-2 rounded-2xl
                                    hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
                      <button
                        onClick={() => onEventClick(e)}
                        className="flex-1 min-w-0 flex items-center gap-3 text-left">
                        <span className="h-9 w-9 rounded-xl shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: e.colorHex + '24', color: e.inkHex }}>
                          <Icon width="17" height="17"/>
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-[14px] font-medium truncate
                                            text-ink dark:text-night-text
                                            ${e.done ? 'line-through opacity-50' : ''}`}>
                            {e.title}
                          </span>
                          <span className="block text-[12px] tabular-nums text-ink-mute dark:text-night-softText">
                            {fmtTime(e)}
                          </span>
                        </span>
                      </button>
                      {e.kind === 'habit' && (
                        <button
                          onClick={() => onToggleHabitDone(e)}
                          aria-label={e.done ? 'Marcar pendiente' : 'Marcar completado'}
                          className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center transition"
                          style={e.done
                            ? { backgroundColor: e.colorHex, color: '#fff' }
                            : { border: `1.5px solid ${e.colorHex}`, color: e.colorHex }}>
                          {e.done && <HLCheck size={13}/>}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}


Object.assign(window, { MonthView, DayBottomSheet, buildDayEntries, calColorHex });
