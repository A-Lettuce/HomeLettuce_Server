// Home Lettuce — Alimentación · Vista general
// ─────────────────────────────────────────────────────────────────────────────
// En el repo TS real:
//   · src/types/meals.ts                                  (MealEvent, MealType)
//   · src/lib/meal-colors.ts                              (MEAL_TYPES — fijo)
//   · src/hooks/useMealEvents.ts                          (TODO useQuery)
//   · src/components/app/alimentacion/general/
//       PlanificadorCard.tsx           ← calendario semanal genérico
//       WeeklyMealGrid.tsx             ← reusa WeekHeader/HourLabels/EventBlock
//       MealEventBlock.tsx
//       MealEventPopover.tsx
//       MealEventFormDialog.tsx        ← incluye IngredientPicker→RecipePicker
//       MiSemanaCard.tsx               ← overview personal
//       DailySummaryPills.tsx
//       MacroAvgCards.tsx
//       CaloriesBarChart.tsx
//       WeightLogCard.tsx
//   · src/pages/AlimentacionGeneralPage.tsx
// ─────────────────────────────────────────────────────────────────────────────


// ─── src/types/meals.ts ─────────────────────────────────────────────────────
// type MealType   = 'desayuno' | 'almuerzo' | 'cena' | 'snack'
// type Visibility = 'familiar' | 'personal'
// type MealEvent = {
//   id, title, mealType,
//   day: 0..6,                  // L..D (en repo real: date ISO + helper getDay)
//   startTime, endTime,         // 'HH:mm'
//   visibility, assignedTo[], recipes[]
// }


// ─── Constantes ─────────────────────────────────────────────────────────────
const VG_DAYS_FULL  = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const VG_DAYS_SHORT = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const VG_DAYS_LETR  = ['L','M','X','J','V','S','D'];

const VG_DAY_VIEW_START = 7;    // 07:00
const VG_DAY_VIEW_END   = 22;   // 22:00
const VG_DAY_VIEW_MIN   = (VG_DAY_VIEW_END - VG_DAY_VIEW_START) * 60;

// Color por tipo de comida — fijo, no editable. Mapeo a la paleta del
// calendario (calendar.jsx → CALENDAR_COLORS).
const MEAL_TYPES = [
  { id: 'desayuno', label: 'Desayuno', color: 'butter',
    bg: 'bg-yellow-100', bgSoft: 'bg-yellow-100/70', border: 'border-yellow-400', text: 'text-yellow-800', dot: 'bg-yellow-400' },
  { id: 'almuerzo', label: 'Almuerzo', color: 'sage',
    bg: 'bg-green-100',  bgSoft: 'bg-green-100/70',  border: 'border-green-400',  text: 'text-green-800',  dot: 'bg-green-400'  },
  { id: 'cena',     label: 'Cena',     color: 'lavender',
    bg: 'bg-purple-100', bgSoft: 'bg-purple-100/70', border: 'border-purple-400', text: 'text-purple-800', dot: 'bg-purple-400' },
  { id: 'snack',    label: 'Snack',    color: 'peach',
    bg: 'bg-orange-100', bgSoft: 'bg-orange-100/70', border: 'border-orange-400', text: 'text-orange-800', dot: 'bg-orange-400' },
];
const MEAL_BY_ID = Object.fromEntries(MEAL_TYPES.map(m => [m.id, m]));
const VG_getMeal = (id) => MEAL_BY_ID[id] || MEAL_TYPES[0];


// ─── Mocks (usuarios y recetas — en repo: useHouseUsers + useRecipes) ──────
const VG_USERS = [
  { id: 'u-annie',  name: 'Annie',  color: 'peach'  },
  { id: 'u-carlos', name: 'Carlos', color: 'sky'    },
  { id: 'u-sofia',  name: 'Sofía',  color: 'butter' },
];
const VG_USER_BY_ID = Object.fromEntries(VG_USERS.map(u => [u.id, u]));
const VG_CURRENT_USER = VG_USERS[0]; // Annie

// Totals por receta (calculados desde Capa 2 — recetas.jsx). En el repo real
// vendrían del hook useRecipes con el helper rcTotalsFor(items, ingredientById).
const VG_RECIPES = [
  { id: 'r-1', name: 'Pollo con arroz',      totals: { calories: 964, protein: 73, fat: 18, carbs: 120 } },
  { id: 'r-2', name: 'Tortilla de espinaca', totals: { calories: 323, protein: 22, fat: 23, carbs:   6 } },
  { id: 'r-3', name: 'Lentejas guisadas',    totals: { calories: 315, protein: 16, fat: 13, carbs:  36 } },
  { id: 'r-4', name: 'Tostada con palta',    totals: { calories: 280, protein:  8, fat: 15, carbs:  30 } },
  { id: 'r-5', name: 'Yogur con fruta',      totals: { calories: 180, protein:  9, fat:  4, carbs:  26 } },
  { id: 'r-6', name: 'Ensalada césar',       totals: { calories: 420, protein: 18, fat: 28, carbs:  18 } },
];
const VG_RECIPE_BY_ID = Object.fromEntries(VG_RECIPES.map(r => [r.id, r]));


// ─── src/hooks/useMealEvents.ts ────────────────────────────────────────────
function vgBuildDefaultMealEvents() {
  return [
    { id: 'm-1', title: 'Desayuno familia',  mealType: 'desayuno', day: 0,
      startTime: '08:00', endTime: '08:30',
      visibility: 'familiar', assignedTo: [], recipes: ['r-2'] },
    { id: 'm-2', title: 'Almuerzo familia',  mealType: 'almuerzo', day: 0,
      startTime: '13:00', endTime: '13:30',
      visibility: 'familiar', assignedTo: [], recipes: ['r-1'] },
    { id: 'm-3', title: 'Cena Annie',        mealType: 'cena',     day: 0,
      startTime: '20:00', endTime: '20:30',
      visibility: 'personal', assignedTo: ['u-annie'], recipes: ['r-3'] },

    { id: 'm-4', title: 'Desayuno familia',  mealType: 'desayuno', day: 1,
      startTime: '08:00', endTime: '08:30',
      visibility: 'familiar', assignedTo: [], recipes: ['r-4'] },

    { id: 'm-5', title: 'Almuerzo familia',  mealType: 'almuerzo', day: 2,
      startTime: '13:00', endTime: '13:30',
      visibility: 'familiar', assignedTo: [], recipes: ['r-1'] },
    { id: 'm-6', title: 'Snack tarde',       mealType: 'snack',    day: 2,
      startTime: '17:00', endTime: '17:20',
      visibility: 'familiar', assignedTo: [], recipes: ['r-5'] },

    { id: 'm-7', title: 'Almuerzo Annie',    mealType: 'almuerzo', day: 3,
      startTime: '13:00', endTime: '13:30',
      visibility: 'personal', assignedTo: ['u-annie'], recipes: ['r-6'] },

    { id: 'm-8', title: 'Cena familia',      mealType: 'cena',     day: 4,
      startTime: '19:30', endTime: '20:30',
      visibility: 'familiar', assignedTo: [], recipes: ['r-1','r-5'] },
  ];
}


// ─── Helpers ────────────────────────────────────────────────────────────────
function vgPad2(n) { return n < 10 ? '0' + n : '' + n; }
function vgTimeToMin(t) { const [h,m] = t.split(':').map(Number); return h*60 + m; }
function vgMinToTime(m) {
  const x = ((m % (24*60)) + 24*60) % (24*60);
  return `${vgPad2(Math.floor(x/60))}:${vgPad2(x%60)}`;
}
function vgFormatHourCompact(h) {
  if (h === 0) return '12am';
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h-12}pm`;
}
function vgEventPosition(startTime, endTime) {
  const startM = vgTimeToMin(startTime) - VG_DAY_VIEW_START * 60;
  const endM   = vgTimeToMin(endTime)   - VG_DAY_VIEW_START * 60;
  const s = Math.max(0, startM);
  const e = Math.min(VG_DAY_VIEW_MIN, endM);
  return {
    topPct:  (s / VG_DAY_VIEW_MIN) * 100,
    heightPct: Math.max(0.6, ((e - s) / VG_DAY_VIEW_MIN) * 100),
  };
}
// Macros totales sumando sus recetas
function vgTotalsForEvent(ev) {
  return (ev.recipes || []).reduce((acc, rid) => {
    const r = VG_RECIPE_BY_ID[rid];
    if (!r) return acc;
    acc.calories += r.totals.calories;
    acc.protein  += r.totals.protein;
    acc.fat      += r.totals.fat;
    acc.carbs    += r.totals.carbs;
    return acc;
  }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
}
// ¿Annie está incluida en este evento?
function vgEventIncludesUser(ev, userId) {
  if (ev.visibility === 'familiar') return true;
  if (ev.assignedTo && ev.assignedTo.length === 0) return true;
  return (ev.assignedTo || []).includes(userId);
}
function vgRound(n, d = 1) { const k = Math.pow(10,d); return Math.round(n*k)/k; }


// ─── Iconos por tipo de comida ─────────────────────────────────────────────
const VGI = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}/>
);
const IconMealDesayuno = (p) => <VGI {...p}><path d="M5 11h14l-1.5 7a2 2 0 0 1-2 1.5h-7a2 2 0 0 1-2-1.5Z"/><path d="M9 11c0-2.5 0-5 3-5s3 2.5 3 5"/><path d="M7.5 4.5c0 1-.8 1.2-.8 2.2"/></VGI>;
const IconMealAlmuerzo = (p) => <VGI {...p}><path d="M12 4v8"/><path d="M9 4v4a3 3 0 0 0 6 0V4"/><path d="M18 4v6a3 3 0 0 1-2 2.8V20"/></VGI>;
const IconMealCena     = (p) => <VGI {...p}><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3.5"/></VGI>;
const IconMealSnack    = (p) => <VGI {...p}><path d="M5 9h14l-1 11.5a1.5 1.5 0 0 1-1.5 1.4h-9A1.5 1.5 0 0 1 6 20.5Z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/></VGI>;
const VG_MEAL_ICONS = {
  desayuno: IconMealDesayuno,
  almuerzo: IconMealAlmuerzo,
  cena:     IconMealCena,
  snack:    IconMealSnack,
};

const IconVgPlus = (p) => <VGI {...p}><path d="M12 5v14M5 12h14"/></VGI>;
const IconVgEdit = (p) => <VGI {...p}><path d="M14.5 5.5 18.5 9.5 8 20H4v-4Z"/><path d="m13 7 4 4"/></VGI>;
const IconVgTrash= (p) => <VGI {...p}><path d="M4.5 7h15"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"/><path d="M6.5 7l1 12.5a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-12.5"/></VGI>;
const IconVgClose= (p) => <VGI {...p}><path d="m6 6 12 12M18 6 6 18"/></VGI>;
const IconVgClock= (p) => <VGI {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></VGI>;
const IconVgEye  = (p) => <VGI {...p}><path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/></VGI>;
const IconVgScale= (p) => <VGI {...p}><path d="M4 7h16l-1 13a1.5 1.5 0 0 1-1.5 1.4h-11A1.5 1.5 0 0 1 5 20Z"/><path d="M8.5 7a3.5 3.5 0 0 1 7 0"/><path d="M9 14h6"/></VGI>;
const IconVgChartBar = (p) => <VGI {...p}><path d="M4 19h16"/><path d="M7 16v-4M11 16v-7M15 16v-2M19 16v-9"/></VGI>;


// ─── Hour labels (reusa diseño de calendar.jsx) ────────────────────────────
function VgHourLabels() {
  const hours = [];
  for (let h = VG_DAY_VIEW_START; h <= VG_DAY_VIEW_END; h++) hours.push(h);
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
            {vgFormatHourCompact(h)}
          </div>
        );
      })}
    </div>
  );
}


// ─── MealEventBlock ────────────────────────────────────────────────────────
function VgMealEventBlock({ event, onClick, col = 0, cols = 1 }) {
  const m = VG_getMeal(event.mealType);
  const Icon = VG_MEAL_ICONS[event.mealType];
  const { topPct, heightPct } = vgEventPosition(event.startTime, event.endTime);
  const duration = vgTimeToMin(event.endTime) - vgTimeToMin(event.startTime);
  const isShort = duration < 35;

  const widthPct = 100 / cols;
  const leftPct  = col * widthPct;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(event, e.currentTarget); }}
      className={`absolute z-10 ${m.bgSoft} ${m.border} ${m.text}
                  border-l-4 rounded-r-lg rounded-l-none
                  px-2 py-1 text-left overflow-hidden
                  hover:brightness-[.97] active:brightness-95
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
                  transition`}
      style={{
        top: `${topPct}%`, height: `${heightPct}%`,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
        minHeight: '20px',
      }}>
      <div className="flex items-center gap-1 leading-tight">
        <Icon width="11" height="11"/>
        <span className="text-[11px] sm:text-[12px] font-medium truncate">
          {event.title}
        </span>
      </div>
      {!isShort && (
        <div className="text-[10px] opacity-75 leading-tight mt-0.5 tabular-nums truncate">
          {event.startTime}–{event.endTime}
        </div>
      )}
    </button>
  );
}


// ─── DayColumn ─────────────────────────────────────────────────────────────
function VgDayColumn({ events, onEventClick, onSlotClick, isFirst, isToday }) {
  const positioned = React.useMemo(() => vgLayoutDayEvents(events), [events]);
  const hourRows = (VG_DAY_VIEW_END - VG_DAY_VIEW_START);
  return (
    <div className={`relative flex-1 min-w-0
                     ${isFirst ? '' : 'border-l border-black/[.05] dark:border-white/[.05]'}`}
         style={isToday ? { backgroundColor: 'hsl(var(--accent-tint) / 0.5)' } : undefined}
         onClick={onSlotClick}>
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: hourRows }, (_, i) => (
          <div key={i}
            className="absolute left-0 right-0 border-t border-black/[.04] dark:border-white/[.045]"
            style={{ top: `${(i / hourRows) * 100}%` }}/>
        ))}
        <div className="absolute left-0 right-0 bottom-0 border-t border-black/[.04] dark:border-white/[.045]"/>
      </div>
      {positioned.map(ev => (
        <VgMealEventBlock key={ev.id}
          event={ev} col={ev.col} cols={ev.cols}
          onClick={onEventClick}/>
      ))}
    </div>
  );
}

// Layout — copia simplificada de calendarLayout
function vgLayoutDayEvents(events) {
  if (!events.length) return [];
  const sorted = [...events].sort((a,b) =>
    vgTimeToMin(a.startTime) - vgTimeToMin(b.startTime)
    || vgTimeToMin(a.endTime) - vgTimeToMin(b.endTime));
  const placed = [];
  for (const ev of sorted) {
    const s = vgTimeToMin(ev.startTime);
    const e = vgTimeToMin(ev.endTime);
    const overlap = placed.filter(p =>
      !(vgTimeToMin(p.endTime) <= s || vgTimeToMin(p.startTime) >= e));
    const used = new Set(overlap.map(p => p.col));
    let col = 0; while (used.has(col)) col++;
    placed.push({ ...ev, col });
  }
  return placed.map(ev => {
    const s = vgTimeToMin(ev.startTime);
    const e = vgTimeToMin(ev.endTime);
    const overlap = placed.filter(p =>
      !(vgTimeToMin(p.endTime) <= s || vgTimeToMin(p.startTime) >= e));
    const cols = Math.max(...overlap.map(p => p.col + 1));
    return { ...ev, cols };
  });
}


// ─── WeekHeader genérico (Lun..Dom, sin fechas) ────────────────────────────
function VgWeekDaysHeader({ highlightDay, onPickDay }) {
  return (
    <div className="flex">
      <div className="w-[44px] sm:w-[52px] shrink-0"/>
      <div className="flex-1 grid grid-cols-7">
        {VG_DAYS_SHORT.map((d, i) => {
          const today = i === highlightDay;
          return (
            <button key={i} onClick={() => onPickDay?.(i)} type="button"
              className={`flex flex-col items-center justify-center gap-1 py-2
                          ${i === 0 ? '' : 'border-l border-black/[.05] dark:border-white/[.05]'}
                          hover:bg-paper-soft/60 dark:hover:bg-night-soft/30 transition-colors`}>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[.08em]
                              text-ink-mute dark:text-night-softText">
                {d}
              </div>
              <div className={`text-[12px] sm:text-[13px] font-medium leading-none
                                h-6 px-2 rounded-full flex items-center justify-center
                                ${today
                                  ? 'bg-accent text-[hsl(var(--accent-strong))]'
                                  : 'text-ink-soft dark:text-night-softText'}`}>
                {VG_DAYS_FULL[i]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


// ─── Planificador (calendario semanal genérico) ────────────────────────────
function VgPlanificadorCard({
  events, filter, onFilterChange, onCreate,
  onEventClick, highlightDay, onPickDay,
}) {
  const visible = React.useMemo(() => {
    if (filter === 'all') return events;
    return events.filter(e => e.visibility === filter);
  }, [events, filter]);

  return (
    <section className="bg-white dark:bg-night-card rounded-3xl
                        border border-black/[.045] dark:border-white/[.05]
                        shadow-subtle overflow-hidden">

      {/* Controles */}
      <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 flex-wrap
                      border-b border-black/[.04] dark:border-white/[.05]">
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-2xl bg-accent-tint text-accent
                           flex items-center justify-center">
            <window.IconAlMealCal/>
          </span>
          <div>
            <h2 className="text-[15.5px] font-medium tracking-tight
                           text-ink dark:text-night-text leading-tight">
              Planificador
            </h2>
            <p className="text-[11.5px] text-ink-mute dark:text-night-softText leading-tight mt-0.5">
              Semana base · sin fechas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <VgVisibilityToggle value={filter} onChange={onFilterChange} events={events}/>
          <window.AlPrimary icon={<IconVgPlus/>} onClick={() => onCreate(null)}>
            Nuevo evento
          </window.AlPrimary>
        </div>
      </div>

      {/* Header de días */}
      <VgWeekDaysHeader highlightDay={highlightDay} onPickDay={onPickDay}/>

      {/* Grilla horaria */}
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="flex"
               style={{ height: `${(VG_DAY_VIEW_END - VG_DAY_VIEW_START) * 44}px` }}>
            <VgHourLabels/>
            <div className="flex-1 grid grid-cols-7 relative">
              {Array.from({ length: 7 }, (_, i) => {
                const dayEvents = visible.filter(e => e.day === i);
                return (
                  <VgDayColumn key={i}
                    events={dayEvents}
                    isFirst={i === 0}
                    isToday={i === highlightDay}
                    onEventClick={onEventClick}
                    onSlotClick={() => onCreate({ day: i })}/>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VgVisibilityToggle({ value, onChange, events }) {
  const counts = React.useMemo(() => ({
    all:      events.length,
    familiar: events.filter(e => e.visibility === 'familiar').length,
    personal: events.filter(e => e.visibility === 'personal').length,
  }), [events]);
  const opts = [
    { id: 'all',      label: 'Todos' },
    { id: 'familiar', label: 'Familiar' },
    { id: 'personal', label: 'Personal' },
  ];
  return (
    <div className="inline-flex items-center gap-0.5 p-1 rounded-full
                    bg-paper-soft dark:bg-night-soft">
      {opts.map(o => {
        const sel = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)}
            className={`px-3.5 py-1.5 rounded-full text-[12.5px] transition-colors
                        inline-flex items-center gap-1.5
                        ${sel
                          ? 'bg-white dark:bg-night-card text-ink dark:text-night-text font-medium shadow-subtle'
                          : 'text-ink-soft dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
            {o.label}
            <span className={`text-[11px] tabular-nums
                              ${sel ? 'text-ink-mute dark:text-night-softText' : 'opacity-60'}`}>
              {counts[o.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}


// ─── MealEvent popover ─────────────────────────────────────────────────────
function VgEventPopover({ anchorRect, event, onClose, onEdit, onDelete }) {
  const ref = React.useRef(null);
  const [confirmDel, setConfirmDel] = React.useState(false);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  if (!anchorRect || !event) return null;

  const m = VG_getMeal(event.mealType);
  const Icon = VG_MEAL_ICONS[event.mealType];
  const totals = vgTotalsForEvent(event);

  const W = 320;
  const gap = 8;
  let left = anchorRect.right + gap;
  if (left + W > window.innerWidth - 8) left = Math.max(8, anchorRect.left - W - gap);
  let top = anchorRect.top;
  if (top + 280 > window.innerHeight - 8) top = Math.max(8, window.innerHeight - 8 - 280);

  return (
    <div ref={ref}
         className="fixed z-50 rounded-2xl bg-white dark:bg-night-card
                    border border-black/[.06] dark:border-white/[.08]
                    shadow-subtle p-4 w-[320px]"
         style={{ top, left }}
         onClick={(e) => e.stopPropagation()}>

      <div className="flex items-start gap-2.5">
        <span className={`h-8 w-8 rounded-2xl ${m.bgSoft} ${m.text}
                          flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon/>
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium text-ink dark:text-night-text leading-tight">
            {event.title}
          </div>
          <div className="text-[11.5px] text-ink-soft dark:text-night-softText mt-0.5
                          flex items-center gap-1.5">
            <span>{m.label}</span>
            <span className="opacity-30">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <IconVgClock width="11" height="11"/>
              {event.startTime}–{event.endTime}
            </span>
          </div>
        </div>
        <button onClick={onClose}
          className="text-ink-mute dark:text-night-softText hover:text-ink dark:hover:text-night-text
                     h-7 w-7 rounded-full flex items-center justify-center -mt-1 -mr-1
                     hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
          <IconVgClose/>
        </button>
      </div>

      {/* Visibility + assignment */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <window.AlBadge type={event.visibility === 'personal'
          ? { name: 'Personal',  color: 'lavender' }
          : { name: 'Familiar', color: 'sage' }}>
          <IconVgEye width="11" height="11"/>
          <span>{event.visibility === 'personal' ? 'Personal' : 'Familiar'}</span>
        </window.AlBadge>
        {event.visibility === 'personal' && event.assignedTo?.length > 0 && (
          <div className="flex items-center gap-1.5">
            {event.assignedTo.map(uid => (
              <VgUserAvatar key={uid} user={VG_USER_BY_ID[uid]}/>
            ))}
          </div>
        )}
      </div>

      {/* Recetas */}
      <div className="mt-3">
        <div className="text-[10.5px] font-medium uppercase tracking-[.08em]
                        text-ink-mute dark:text-night-softText mb-1.5">
          Recetas
        </div>
        {event.recipes?.length ? (
          <ul className="space-y-1">
            {event.recipes.map(rid => {
              const r = VG_RECIPE_BY_ID[rid];
              if (!r) return null;
              return (
                <li key={rid}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg
                             bg-paper-soft dark:bg-night-soft text-[12.5px]">
                  <span className="text-ink dark:text-night-text truncate">{r.name}</span>
                  <span className="text-ink-mute dark:text-night-softText tabular-nums shrink-0">
                    {window.alFormatKcal(r.totals.calories)} kcal
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[12px] text-ink-mute dark:text-night-softText italic">
            Sin recetas asociadas
          </p>
        )}
      </div>

      {/* Macros */}
      <div className="mt-3 grid grid-cols-4 rounded-xl overflow-hidden
                      bg-paper-soft dark:bg-night-soft">
        <VgMiniStat big value={window.alFormatKcal(totals.calories)} label="kcal"/>
        <VgMiniStat value={window.alFormatG(totals.protein)} label="P · g" sep/>
        <VgMiniStat value={window.alFormatG(totals.fat)}     label="G · g" sep/>
        <VgMiniStat value={window.alFormatG(totals.carbs)}   label="C · g" sep/>
      </div>

      {/* Actions */}
      <div className="mt-3.5 flex items-center gap-2">
        <button onClick={() => onEdit(event)}
          className="flex-1 h-9 rounded-full text-[12.5px] font-medium
                     bg-paper-soft dark:bg-night-soft text-ink dark:text-night-text
                     hover:bg-accent-tint hover:text-accent
                     transition-colors flex items-center justify-center gap-1.5">
          <IconVgEdit/> Editar
        </button>
        {!confirmDel ? (
          <button onClick={() => setConfirmDel(true)}
            className="h-9 w-9 rounded-full text-ink-soft dark:text-night-softText
                       hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/15
                       transition-colors flex items-center justify-center">
            <IconVgTrash/>
          </button>
        ) : (
          <button onClick={() => { onDelete(event.id); onClose(); }}
            className="h-9 px-3 rounded-full text-[12px] font-medium
                       bg-red-500 text-white hover:bg-red-600 transition-colors
                       flex items-center gap-1.5">
            <IconVgTrash/> Confirmar
          </button>
        )}
      </div>
    </div>
  );
}

function VgMiniStat({ value, label, big, sep }) {
  return (
    <div className={`text-center py-2 ${sep ? 'border-l border-black/[.05] dark:border-white/[.05]' : ''}`}>
      <div className={`tabular-nums leading-tight
                       ${big ? 'text-[15px] font-medium text-accent' : 'text-[13px] text-ink dark:text-night-text font-medium'}`}>
        {value}
      </div>
      <div className="text-[9.5px] uppercase tracking-[.06em]
                      text-ink-mute dark:text-night-softText leading-tight mt-0.5">
        {label}
      </div>
    </div>
  );
}

function VgUserAvatar({ user, size = 'sm' }) {
  if (!user) return null;
  const c = window.alGetPalette(user.color);
  const d = size === 'lg' ? 'h-7 w-7 text-[12px]' : 'h-5 w-5 text-[10px]';
  return (
    <span className={`${d} rounded-full ${c.swatch}
                      inline-flex items-center justify-center
                      text-[hsl(var(--accent-strong))] font-medium
                      ring-1 ring-black/[.04] dark:ring-white/[.06]`}
          title={user.name}>
      {user.name.charAt(0).toUpperCase()}
    </span>
  );
}


// ─── MealEvent form ────────────────────────────────────────────────────────
function VgMealEventForm({ open, editing, defaults, onClose, onSubmit }) {
  const TIME_OPTS = React.useMemo(() => {
    const out = [];
    for (let h = VG_DAY_VIEW_START; h <= VG_DAY_VIEW_END; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === VG_DAY_VIEW_END && m > 0) break;
        out.push(`${vgPad2(h)}:${vgPad2(m)}`);
      }
    }
    return out;
  }, []);

  const empty = {
    title: '',
    mealType: 'almuerzo',
    day: 0,
    startTime: '13:00',
    endTime: '13:30',
    visibility: 'familiar',
    assignedTo: [],
    recipes: [],
  };
  const [form, setForm] = React.useState(empty);
  const [err, setErr] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title: editing.title,
        mealType: editing.mealType,
        day: editing.day,
        startTime: editing.startTime,
        endTime: editing.endTime,
        visibility: editing.visibility,
        assignedTo: editing.assignedTo || [],
        recipes: editing.recipes || [],
      });
    } else {
      setForm({ ...empty, ...(defaults || {}) });
    }
    setErr('');
  }, [open, editing, defaults]);

  const totals = React.useMemo(
    () => vgTotalsForEvent({ recipes: form.recipes }),
    [form.recipes]
  );

  if (!open) return null;

  const canSubmit = form.title.trim().length > 0;

  const submit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit) { setErr('El título es obligatorio.'); return; }
    if (vgTimeToMin(form.endTime) <= vgTimeToMin(form.startTime)) {
      setErr('La hora de fin debe ser posterior al inicio.'); return;
    }
    onSubmit({
      id: editing?.id,
      title: form.title.trim(),
      mealType: form.mealType,
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      visibility: form.visibility,
      assignedTo: form.visibility === 'personal' ? form.assignedTo : [],
      recipes: form.recipes,
    });
  };

  return (
    <window.AlDialog
      open={open}
      onClose={onClose}
      title={editing ? 'Editar evento' : 'Nuevo evento'}
      subtitle="Planifica una comida en la semana base."
      footer={
        <React.Fragment>
          <window.AlGhost onClick={onClose}>Cancelar</window.AlGhost>
          <window.AlPrimary onClick={submit} disabled={!canSubmit}>
            {editing ? 'Guardar cambios' : 'Guardar'}
          </window.AlPrimary>
        </React.Fragment>
      }>

      <form onSubmit={submit} className="space-y-5">
        {/* Título */}
        <div>
          <window.AlFormLabel>Título</window.AlFormLabel>
          <window.AlTextInput autoFocus
            value={form.title}
            onChange={(v) => setForm(f => ({ ...f, title: v }))}
            placeholder="Ej. Cena en familia"/>
        </div>

        {/* Tipo */}
        <div>
          <window.AlFormLabel>Tipo</window.AlFormLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {MEAL_TYPES.map(m => {
              const Icon = VG_MEAL_ICONS[m.id];
              const sel = form.mealType === m.id;
              return (
                <button key={m.id} type="button"
                  onClick={() => setForm(f => ({ ...f, mealType: m.id }))}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl
                              border text-[12.5px] font-medium transition-colors
                              ${sel
                                ? `${m.bgSoft} ${m.border} ${m.text}`
                                : 'border-black/[.08] dark:border-white/[.1] text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
                  <Icon width="14" height="14"/>
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Día */}
        <div>
          <window.AlFormLabel>Día de la semana</window.AlFormLabel>
          <div className="grid grid-cols-7 gap-1.5">
            {VG_DAYS_SHORT.map((d, i) => {
              const sel = form.day === i;
              return (
                <button key={i} type="button"
                  onClick={() => setForm(f => ({ ...f, day: i }))}
                  className={`px-2 py-2 rounded-xl text-[12.5px] font-medium transition-colors
                              ${sel
                                ? 'bg-accent text-[hsl(var(--accent-strong))]'
                                : 'bg-paper-soft dark:bg-night-soft text-ink-soft dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hora */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <window.AlFormLabel>Inicio</window.AlFormLabel>
            <VgSelectInput value={form.startTime}
              onChange={(v) => setForm(f => ({ ...f, startTime: v }))}
              options={TIME_OPTS}/>
          </div>
          <div>
            <window.AlFormLabel>Fin</window.AlFormLabel>
            <VgSelectInput value={form.endTime}
              onChange={(v) => setForm(f => ({ ...f, endTime: v }))}
              options={TIME_OPTS}/>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <window.AlFormLabel>Visibilidad</window.AlFormLabel>
          <div className="inline-flex p-1 rounded-2xl bg-paper-soft dark:bg-night-soft">
            {[
              { id: 'familiar', label: 'Familiar' },
              { id: 'personal', label: 'Personal' },
            ].map(opt => {
              const sel = form.visibility === opt.id;
              return (
                <button key={opt.id} type="button"
                  onClick={() => setForm(f => ({ ...f, visibility: opt.id }))}
                  className={`px-4 py-2 rounded-xl text-[12.5px] transition-colors
                              ${sel
                                ? 'bg-white dark:bg-night-card text-ink dark:text-night-text font-medium shadow-subtle'
                                : 'text-ink-soft dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
                  {opt.label}
                </button>
              );
            })}
          </div>

          {form.visibility === 'personal' && (
            <div className="mt-3">
              <div className="text-[11px] text-ink-mute dark:text-night-softText mb-1.5 ml-1">
                Asignado a
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VG_USERS.map(u => {
                  const sel = form.assignedTo.includes(u.id);
                  const c = window.alGetPalette(u.color);
                  return (
                    <button key={u.id} type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        assignedTo: sel
                          ? f.assignedTo.filter(x => x !== u.id)
                          : [...f.assignedTo, u.id],
                      }))}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
                                  text-[12px] font-medium border transition-colors
                                  ${sel
                                    ? 'bg-accent-tint border-transparent text-accent'
                                    : 'border-black/[.08] dark:border-white/[.1] text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
                      <span className={`h-4 w-4 rounded-full ${c.swatch}
                                        flex items-center justify-center text-[9px]
                                        text-[hsl(var(--accent-strong))]`}>
                        {u.name.charAt(0)}
                      </span>
                      {u.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recetas */}
        <div>
          <window.AlFormLabel hint={form.recipes.length > 0
            ? `${window.alFormatKcal(totals.calories)} kcal · P ${window.alFormatG(totals.protein)} · G ${window.alFormatG(totals.fat)} · C ${window.alFormatG(totals.carbs)}`
            : 'Selecciona una o más'}>
            Recetas asociadas
          </window.AlFormLabel>
          <VgRecipePicker
            value={form.recipes}
            onChange={(rs) => setForm(f => ({ ...f, recipes: rs }))}/>
        </div>

        {err && <div className="text-[12.5px] text-red-600 dark:text-red-400">{err}</div>}
      </form>
    </window.AlDialog>
  );
}

function VgSelectInput({ value, onChange, options }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl px-4 py-3
                    bg-paper-soft dark:bg-night-soft
                    border border-transparent focus-within:border-accent
                    focus-within:bg-white dark:focus-within:bg-night
                    transition-colors">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none text-[14.5px] tabular-nums
                   text-ink dark:text-night-text appearance-none cursor-pointer">
        {options.map(o => (
          <option key={o} value={o} className="bg-white dark:bg-night-card">{o}</option>
        ))}
      </select>
    </div>
  );
}

function VgRecipePicker({ value, onChange }) {
  const [q, setQ] = React.useState('');
  const filtered = React.useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return VG_RECIPES;
    return VG_RECIPES.filter(r => r.name.toLowerCase().includes(n));
  }, [q]);

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id]);
  };

  return (
    <div className="rounded-2xl border border-black/[.06] dark:border-white/[.08]
                    overflow-hidden bg-white dark:bg-night-card">
      {/* search */}
      <div className="px-3 py-2.5 border-b border-black/[.04] dark:border-white/[.05]">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2
                        bg-paper-soft dark:bg-night-soft">
          <span className="text-ink-mute dark:text-night-softText shrink-0">
            <window.IconAlSearch/>
          </span>
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar receta…"
            className="w-full bg-transparent outline-none text-[13px]
                       placeholder:text-ink-mute dark:placeholder:text-night-softText"/>
        </div>
      </div>

      <ul className="max-h-44 overflow-y-auto">
        {filtered.length === 0 && (
          <li className="px-4 py-6 text-center text-[12.5px] text-ink-mute dark:text-night-softText">
            Sin resultados.
          </li>
        )}
        {filtered.map(r => {
          const sel = value.includes(r.id);
          return (
            <li key={r.id}>
              <button type="button" onClick={() => toggle(r.id)}
                style={sel ? { backgroundColor: 'hsl(var(--accent-tint) / 0.7)' } : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left
                            transition-colors
                            ${sel ? '' : 'hover:bg-paper-soft/70 dark:hover:bg-night-soft/40'}`}>
                <span className={`h-4 w-4 rounded-[5px] shrink-0 flex items-center justify-center
                                  border ${sel
                                    ? 'bg-accent border-transparent'
                                    : 'border-black/[.18] dark:border-white/[.18]'}`}>
                  {sel && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                         className="text-[hsl(var(--accent-strong))]">
                      <path d="m6 12 4 4 8-8"/>
                    </svg>
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-ink dark:text-night-text truncate">{r.name}</div>
                  <div className="text-[10.5px] text-ink-mute dark:text-night-softText tabular-nums">
                    {window.alFormatKcal(r.totals.calories)} kcal ·
                    P {window.alFormatG(r.totals.protein)} ·
                    G {window.alFormatG(r.totals.fat)} ·
                    C {window.alFormatG(r.totals.carbs)}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


// ─── Mi semana · Overview personal ─────────────────────────────────────────
function VgMiSemana({ events, currentUser, highlightDay, onPickDay }) {
  // 1. Filtrar eventos del usuario actual
  const userEvents = React.useMemo(
    () => events.filter(e => vgEventIncludesUser(e, currentUser.id)),
    [events, currentUser]
  );

  // 2. Calorías por día
  const dailyKcal = React.useMemo(() => {
    const arr = Array.from({ length: 7 }, () => 0);
    userEvents.forEach(ev => {
      arr[ev.day] += vgTotalsForEvent(ev).calories;
    });
    return arr;
  }, [userEvents]);

  // 3. Macros promedio/día
  const macros = React.useMemo(() => {
    const sum = userEvents.reduce((acc, ev) => {
      const t = vgTotalsForEvent(ev);
      acc.calories += t.calories;
      acc.protein  += t.protein;
      acc.fat      += t.fat;
      acc.carbs    += t.carbs;
      return acc;
    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
    const daysWithMeals = Math.max(1, dailyKcal.filter(k => k > 0).length);
    return {
      calories: sum.calories,
      proteinAvg: sum.protein / daysWithMeals,
      fatAvg:     sum.fat     / daysWithMeals,
      carbsAvg:   sum.carbs   / daysWithMeals,
      daysWithMeals,
    };
  }, [userEvents, dailyKcal]);

  return (
    <section className="space-y-5">
      {/* Header de sección */}
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[.1em]
                          text-ink-mute dark:text-night-softText">
            Resumen personal
          </div>
          <h2 className="text-[20px] sm:text-[22px] font-medium tracking-tight
                         text-ink dark:text-night-text mt-1">
            Mi semana
            <span className="ml-2 inline-flex items-center gap-1.5 text-[14px] font-normal
                             text-ink-soft dark:text-night-softText">
              <VgUserAvatar user={currentUser} size="lg"/>
              {currentUser.name}
            </span>
          </h2>
        </div>
        <div className="text-[11.5px] text-ink-mute dark:text-night-softText">
          {macros.daysWithMeals} {macros.daysWithMeals === 1 ? 'día con comidas' : 'días con comidas'}
        </div>
      </header>

      {/* Pills diarias */}
      <VgDailyPills dailyKcal={dailyKcal} highlightDay={highlightDay} onPickDay={onPickDay}/>

      {/* Macros + chart en grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <VgMacroCards macros={macros}/>
          <VgCaloriesBarChart dailyKcal={dailyKcal} highlightDay={highlightDay} onPickDay={onPickDay}/>
        </div>
        <div className="lg:col-span-2">
          <VgWeightLogCard currentUser={currentUser}/>
        </div>
      </div>
    </section>
  );
}

function VgDailyPills({ dailyKcal, highlightDay, onPickDay }) {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {VG_DAYS_SHORT.map((d, i) => {
        const isToday = i === highlightDay;
        const k = Math.round(dailyKcal[i]);
        return (
          <button key={i} onClick={() => onPickDay(i)}
            className={`group rounded-2xl px-2 py-3 text-center transition-colors
                        border
                        ${isToday
                          ? 'bg-accent border-transparent text-[hsl(var(--accent-strong))]'
                          : 'bg-white dark:bg-night-card border-black/[.045] dark:border-white/[.05] hover:border-accent'}`}>
            <div className={`text-[10px] uppercase tracking-[.08em] font-medium
                             ${isToday
                                ? 'text-[hsl(var(--accent-strong))]/80'
                                : 'text-ink-mute dark:text-night-softText'}`}>
              {d}
            </div>
            <div className={`text-[15px] sm:text-[17px] font-medium tabular-nums leading-tight mt-1
                             ${isToday
                               ? 'text-[hsl(var(--accent-strong))]'
                               : k > 0 ? 'text-ink dark:text-night-text' : 'text-ink-mute dark:text-night-softText/70'}`}>
              {k > 0 ? k.toLocaleString('es-CL') : '—'}
            </div>
            <div className={`text-[10px] tabular-nums
                             ${isToday
                               ? 'text-[hsl(var(--accent-strong))]/70'
                               : 'text-ink-mute dark:text-night-softText'}`}>
              kcal
            </div>
          </button>
        );
      })}
    </div>
  );
}

function VgMacroCards({ macros }) {
  const items = [
    { label: 'Calorías semana', value: Math.round(macros.calories).toLocaleString('es-CL'), sub: 'kcal totales',  color: 'sage'    },
    { label: 'Proteínas',       value: vgRound(macros.proteinAvg),                          sub: 'g · promedio/día', color: 'rose'    },
    { label: 'Grasas',          value: vgRound(macros.fatAvg),                              sub: 'g · promedio/día', color: 'butter'  },
    { label: 'Carbohidratos',   value: vgRound(macros.carbsAvg),                            sub: 'g · promedio/día', color: 'sky'     },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map(it => {
        const c = window.alGetPalette(it.color);
        return (
          <div key={it.label}
            className="bg-white dark:bg-night-card rounded-2xl p-3.5
                       border border-black/[.045] dark:border-white/[.05] shadow-subtle">
            <div className={`h-7 w-7 rounded-xl ${c.swatch} mb-2`}/>
            <div className="text-[18px] sm:text-[20px] font-medium tracking-tight
                            tabular-nums text-ink dark:text-night-text leading-none">
              {it.value}
            </div>
            <div className="text-[10.5px] uppercase tracking-[.06em]
                            text-ink-mute dark:text-night-softText mt-1.5">
              {it.label}
            </div>
            <div className="text-[11px] text-ink-soft dark:text-night-softText mt-0.5">
              {it.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VgCaloriesBarChart({ dailyKcal, highlightDay, onPickDay }) {
  const max = Math.max(1, ...dailyKcal);
  // Eje Y "agradable": redondear al múltiplo de 250 más cercano por encima.
  const ceil = Math.ceil(max / 250) * 250;

  return (
    <div className="bg-white dark:bg-night-card rounded-2xl p-4 sm:p-5
                    border border-black/[.045] dark:border-white/[.05] shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-xl bg-accent-tint text-accent
                           flex items-center justify-center">
            <IconVgChartBar/>
          </span>
          <div>
            <div className="text-[13.5px] font-medium text-ink dark:text-night-text leading-tight">
              Calorías por día
            </div>
            <div className="text-[11px] text-ink-mute dark:text-night-softText mt-0.5">
              kcal totales de tus comidas asignadas
            </div>
          </div>
        </div>
        <div className="text-[11px] text-ink-mute dark:text-night-softText tabular-nums">
          máx · {ceil.toLocaleString('es-CL')}
        </div>
      </div>

      {/* Bars */}
      <div className="grid grid-cols-7 gap-2 h-44 sm:h-52 items-end">
        {dailyKcal.map((v, i) => {
          const pct = ceil > 0 ? (v / ceil) * 100 : 0;
          const isToday = i === highlightDay;
          return (
            <button key={i} onClick={() => onPickDay(i)}
              className="group flex flex-col items-center gap-2 h-full justify-end">
              <div className={`text-[10.5px] tabular-nums font-medium
                               ${v > 0
                                 ? (isToday ? 'text-accent' : 'text-ink-soft dark:text-night-softText')
                                 : 'text-ink-mute/60 dark:text-night-softText/40'}`}>
                {v > 0 ? Math.round(v).toLocaleString('es-CL') : ''}
              </div>
              <div className="w-full flex-1 flex items-end">
                <div className="w-full rounded-t-lg transition-all"
                     style={{
                       height: `${Math.max(2, pct)}%`,
                       backgroundColor: isToday
                         ? 'hsl(var(--accent))'
                         : 'hsl(var(--accent) / 0.45)',
                     }}/>
              </div>
              <div className={`text-[10.5px] uppercase tracking-[.08em]
                               ${isToday
                                 ? 'text-accent font-medium'
                                 : 'text-ink-mute dark:text-night-softText'}`}>
                {VG_DAYS_LETR[i]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


// ─── Weight log ────────────────────────────────────────────────────────────
const VG_HEIGHT_CM = 165;
const VG_INIT_WEIGHTS = [
  { day: 'L', kg: 62.4 },
  { day: 'M', kg: 62.2 },
  { day: 'X', kg: 62.0 },
  { day: 'J', kg: 62.3 },
  { day: 'V', kg: 61.9 },
  { day: 'S', kg: 61.7 },
  { day: 'D', kg: 61.8 },
];

function VgWeightLogCard({ currentUser }) {
  const [log, setLog]     = React.useState(VG_INIT_WEIGHTS);
  const [input, setInput] = React.useState('');

  const current = log[log.length - 1]?.kg;
  const bmi     = current ? current / Math.pow(VG_HEIGHT_CM / 100, 2) : 0;

  const register = () => {
    const n = Number(input);
    if (!n || n < 30 || n > 250) return;
    const todayLetter = VG_DAYS_LETR[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    setLog(l => [...l.slice(-6), { day: todayLetter, kg: vgRound(n, 1) }]);
    setInput('');
  };

  // chart geometry
  const W = 280, H = 90, PAD_X = 8, PAD_Y = 10;
  const min = Math.min(...log.map(l => l.kg)) - 0.3;
  const max = Math.max(...log.map(l => l.kg)) + 0.3;
  const span = Math.max(0.6, max - min);
  const points = log.map((l, i) => {
    const x = PAD_X + (i / (log.length - 1)) * (W - PAD_X * 2);
    const y = PAD_Y + (1 - (l.kg - min) / span) * (H - PAD_Y * 2);
    return { x, y, ...l };
  });
  const path = points.map((p,i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y).join(' ');
  const area = path + ` L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

  const bmiLabel =
    bmi < 18.5 ? 'Bajo'   :
    bmi < 25   ? 'Normal' :
    bmi < 30   ? 'Sobrepeso' : 'Obesidad';

  return (
    <div className="bg-white dark:bg-night-card rounded-2xl p-4 sm:p-5
                    border border-black/[.045] dark:border-white/[.05] shadow-subtle
                    flex flex-col gap-4 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-xl bg-accent-tint text-accent
                           flex items-center justify-center">
            <IconVgScale/>
          </span>
          <div>
            <div className="text-[13.5px] font-medium text-ink dark:text-night-text leading-tight">
              Registro de peso
            </div>
            <div className="text-[11px] text-ink-mute dark:text-night-softText mt-0.5">
              {VG_HEIGHT_CM} cm · {currentUser.name}
            </div>
          </div>
        </div>
      </div>

      {/* Peso actual + IMC */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-paper-soft dark:bg-night-soft px-3.5 py-2.5">
          <div className="text-[10px] uppercase tracking-[.08em]
                          text-ink-mute dark:text-night-softText">
            Peso actual
          </div>
          <div className="text-[20px] font-medium tracking-tight tabular-nums
                          text-ink dark:text-night-text leading-tight mt-0.5">
            {vgRound(current, 1)}
            <span className="text-[12px] text-ink-mute dark:text-night-softText ml-1">kg</span>
          </div>
        </div>
        <div className="rounded-2xl bg-paper-soft dark:bg-night-soft px-3.5 py-2.5">
          <div className="text-[10px] uppercase tracking-[.08em]
                          text-ink-mute dark:text-night-softText">
            IMC
          </div>
          <div className="text-[20px] font-medium tracking-tight tabular-nums
                          text-ink dark:text-night-text leading-tight mt-0.5
                          flex items-baseline gap-1.5">
            {vgRound(bmi, 1)}
            <span className="text-[10px] uppercase tracking-[.06em]
                             text-ink-soft dark:text-night-softText">{bmiLabel}</span>
          </div>
        </div>
      </div>

      {/* Mini line chart */}
      <div className="rounded-2xl bg-paper-soft/60 dark:bg-night-soft/60 p-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[.08em]
                        text-ink-mute dark:text-night-softText mb-1.5">
          <span>Últimos 7 registros</span>
          <span className="tabular-nums normal-case tracking-normal">
            {vgRound(min + 0.3, 1)}–{vgRound(max - 0.3, 1)} kg
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[90px]">
          <defs>
            <linearGradient id="vg-weight-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"  stopColor="hsl(var(--accent-strong))" stopOpacity=".18"/>
              <stop offset="100%" stopColor="hsl(var(--accent-strong))" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={area} fill="url(#vg-weight-area)"/>
          <path d={path} fill="none" stroke="hsl(var(--accent-strong))"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="2.6" fill="white"
                      stroke="hsl(var(--accent-strong))" strokeWidth="1.6"/>
            </g>
          ))}
        </svg>
        <div className="grid grid-cols-7 mt-1 text-[10px] tabular-nums
                        text-ink-mute dark:text-night-softText text-center">
          {log.map((l,i) => <span key={i}>{l.day}</span>)}
        </div>
      </div>

      {/* Form */}
      <div className="flex items-stretch gap-2 mt-auto">
        <div className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-2.5
                        bg-paper-soft dark:bg-night-soft
                        border border-transparent focus-within:border-accent
                        focus-within:bg-white dark:focus-within:bg-night
                        transition-colors">
          <input type="number" inputMode="decimal" step="0.1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); register(); } }}
            placeholder="Peso de hoy"
            className="w-full bg-transparent outline-none text-[14.5px] tabular-nums
                       placeholder:text-ink-mute dark:placeholder:text-night-softText"/>
          <span className="text-[11.5px] text-ink-mute dark:text-night-softText shrink-0">kg</span>
        </div>
        <button onClick={register}
          disabled={!input || Number(input) < 30 || Number(input) > 250}
          className="px-4 rounded-2xl bg-accent text-[hsl(var(--accent-strong))]
                     font-medium text-[13px] hover:brightness-[.96] active:brightness-[.92]
                     disabled:opacity-50 disabled:cursor-not-allowed transition">
          Registrar
        </button>
      </div>
    </div>
  );
}


// ─── VistaGeneralViewImpl (export) ─────────────────────────────────────────
function VistaGeneralViewImpl() {
  const [mealEvents, setMealEvents] = React.useState(vgBuildDefaultMealEvents);
  const [filter, setFilter]         = React.useState('all');
  const [popover, setPopover]       = React.useState(null);   // { event, anchorRect }
  const [formDialog, setFormDialog] = React.useState({ open: false, editing: null, defaults: null });
  // Día "actual" — sin lógica de date-fns; se selecciona manualmente.
  // (En el repo real: derivar de new Date() vía date-fns getDay y mapear a 0..6.)
  const [highlightDay, setHighlightDay] = React.useState(2); // Miércoles por defecto

  // CRUD
  const upsertEvent = (data) => {
    setMealEvents(list => {
      if (data.id) return list.map(e => e.id === data.id ? { ...e, ...data } : e);
      return [...list, { ...data, id: 'm-' + Date.now().toString(36) }];
    });
    setFormDialog({ open: false, editing: null, defaults: null });
  };
  const deleteEvent = (id) => {
    setMealEvents(list => list.filter(e => e.id !== id));
  };

  const handleEventClick = (event, target) => {
    setPopover({ event, anchorRect: target.getBoundingClientRect() });
  };
  const openCreate = (defaults) => {
    setFormDialog({ open: true, editing: null, defaults: defaults || null });
    setPopover(null);
  };
  const openEdit = (ev) => {
    setFormDialog({ open: true, editing: ev, defaults: null });
    setPopover(null);
  };

  return (
    <div className="route-fade space-y-8">

      {/* SECCIÓN 1 — Planificador */}
      <VgPlanificadorCard
        events={mealEvents}
        filter={filter}
        onFilterChange={setFilter}
        onCreate={openCreate}
        onEventClick={handleEventClick}
        highlightDay={highlightDay}
        onPickDay={setHighlightDay}/>

      {/* Divisor */}
      <div className="h-px bg-black/[.06] dark:bg-white/[.06]"/>

      {/* SECCIÓN 2 — Mi semana */}
      <VgMiSemana
        events={mealEvents}
        currentUser={VG_CURRENT_USER}
        highlightDay={highlightDay}
        onPickDay={setHighlightDay}/>

      {/* Popover */}
      {popover && (
        <VgEventPopover
          anchorRect={popover.anchorRect}
          event={popover.event}
          onClose={() => setPopover(null)}
          onEdit={openEdit}
          onDelete={deleteEvent}/>
      )}

      {/* Form */}
      <VgMealEventForm
        open={formDialog.open}
        editing={formDialog.editing}
        defaults={formDialog.defaults}
        onClose={() => setFormDialog({ open: false, editing: null, defaults: null })}
        onSubmit={upsertEvent}/>
    </div>
  );
}

Object.assign(window, { VistaGeneralViewImpl });
