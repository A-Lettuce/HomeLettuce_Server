// Home Lettuce — Store compartido para tipos de evento personalizados
// ─────────────────────────────────────────────────────────────────────────────
// Hábitos y Evaluaciones se comparten entre el Calendario y sus páginas
// dedicadas, por eso viven en un store ligero (pub/sub) en vez de en el estado
// local de cada página.
// En el repo TS real:
//   · src/store/customEvents.ts        (createStore + useStore)
//   · src/types/habit.ts  · src/types/evaluation.ts
//   · src/lib/habitColors.ts
//   · src/hooks/useHabits.ts · src/hooks/useEvaluations.ts
//   · src/components/app/forms/HabitFields.tsx · EvaluationFields.tsx
// ─────────────────────────────────────────────────────────────────────────────


// ─── date helpers (nombres hl* para no chocar con calendar.jsx) ─────────────
function hlPad2(n) { return n < 10 ? '0' + n : '' + n; }
function hlIso(d)  { return `${d.getFullYear()}-${hlPad2(d.getMonth()+1)}-${hlPad2(d.getDate())}`; }
function hlParse(s){ const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); }
function hlAddDays(d, n) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function hlDow(d)  { return (d.getDay()+6) % 7; }                 // lun=0 … dom=6
function hlWeekStart(d) { const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate()-hlDow(x)); return x; }
function hlToday() { const d = new Date(); d.setHours(0,0,0,0); return d; }

const HL_MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
function hlShortDate(d) { return `${d.getDate()} ${HL_MONTHS[d.getMonth()]}`; }

const WEEKDAYS = [
  { i: 0, short: 'Lun', min: 'L' },
  { i: 1, short: 'Mar', min: 'M' },
  { i: 2, short: 'Mié', min: 'X' },
  { i: 3, short: 'Jue', min: 'J' },
  { i: 4, short: 'Vie', min: 'V' },
  { i: 5, short: 'Sáb', min: 'S' },
  { i: 6, short: 'Dom', min: 'D' },
];

// Opciones de hora (05:00 → 23:00, paso 30 min)
const HL_TIME_OPTS = (() => {
  const out = [];
  for (let h = 5; h <= 23; h++) {
    out.push(`${hlPad2(h)}:00`);
    if (h !== 23) out.push(`${hlPad2(h)}:30`);
  }
  return out;
})();
function hlAddMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number);
  let total = h * 60 + m + mins;
  total = Math.min(total, 23 * 60 + 59);
  return `${hlPad2(Math.floor(total/60))}:${hlPad2(total%60)}`;
}


// ─── src/lib/habitColors.ts — 8 pasteles ────────────────────────────────────
// base  = color pleno (heatmap completado / borde)
// soft  = fondo muy claro (bloque en calendario)
// ink   = texto sobre soft
const HABIT_COLORS = [
  { id: 'sage',     name: 'Salvia',      base: '#34d399', soft: '#d1fae5', ink: '#065f46' },
  { id: 'sky',      name: 'Cielo',       base: '#60a5fa', soft: '#dbeafe', ink: '#1e40af' },
  { id: 'lavender', name: 'Lavanda',     base: '#a78bfa', soft: '#ede9fe', ink: '#5b21b6' },
  { id: 'peach',    name: 'Durazno',     base: '#fb923c', soft: '#ffedd5', ink: '#9a3412' },
  { id: 'rose',     name: 'Rosa',        base: '#f472b6', soft: '#fce7f3', ink: '#9d174d' },
  { id: 'butter',   name: 'Mantequilla', base: '#fbbf24', soft: '#fef3c7', ink: '#92400e' },
  { id: 'mint',     name: 'Menta',       base: '#2dd4bf', soft: '#ccfbf1', ink: '#115e59' },
  { id: 'coral',    name: 'Coral',       base: '#fb7185', soft: '#ffe4e6', ink: '#9f1239' },
];
const HABIT_COLOR_IDS = HABIT_COLORS.map(c => c.id);
function getHabitColor(id) { return HABIT_COLORS.find(c => c.id === id) || HABIT_COLORS[0]; }


// ─── store ligero pub/sub + hook ────────────────────────────────────────────
function hlMakeStore(initial) {
  let state = initial;
  const subs = new Set();
  return {
    get: () => state,
    set: (next) => {
      state = typeof next === 'function' ? next(state) : next;
      subs.forEach(fn => fn(state));
    },
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
  };
}
function useStore(store) {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => store.subscribe(force), [store]);
  return [store.get(), store.set];
}


// ─── datos por defecto ───────────────────────────────────────────────────────
// TODO: reemplazar por GET /api/v1/habits · /api/v1/evaluations
function buildDefaultHabits() {
  return [
    { id: 'h-ejercicio', name: 'Ejercicio',          color: 'sage',     days: [0,2,4],         time: '07:30' },
    { id: 'h-meditar',   name: 'Meditar',            color: 'lavender', days: [0,1,2,3,4,5,6], time: '08:00' },
    { id: 'h-leer',      name: 'Leer 20 min',        color: 'butter',   days: [0,1,2,3,4,5,6], time: '21:30' },
    { id: 'h-agua',      name: 'Beber 2 L de agua',  color: 'sky',      days: [0,1,2,3,4,5,6], time: null    },
  ];
}

// Hash determinista → historial de completados creíble (sin datos aleatorios).
function hlSeed(id, iso) {
  let h = 2166136261;
  const s = id + '|' + iso;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) % 1000 / 1000;
}
function buildDefaultCompletions(habits) {
  const done = {};
  const today = hlToday();
  for (const h of habits) {
    for (let back = 1; back <= 83; back++) {           // back=0 (hoy) lo deja al usuario
      const d = hlAddDays(today, -back);
      if (!h.days.includes(hlDow(d))) continue;
      const recency = 1 - back / 83;                   // racha que mejora con el tiempo
      if (hlSeed(h.id, hlIso(d)) < 0.42 + 0.42 * recency) {
        done[h.id + '|' + hlIso(d)] = true;
      }
    }
  }
  return done;
}

// ─── Responsabilidades del hogar ────────────────────────────────────────────
// Estructuralmente idénticas a un hábito (name, color, days, time) + el campo
// `assignedTo`. Comparten el MISMO mapa de completados (HabitDoneStore): las
// claves son `${id}|${iso}`, así que conviven sin colisión. Sólo la lista de
// ítems vive en un store aparte para no mezclarse con la vista de Hábitos.
// TODO: reemplazar por GET/POST /api/v1/responsibilities
const HL_USERS = [
  { id: 'u-andreu',  name: 'Andreu',  initial: 'A', color: 'sky'    },
  { id: 'u-mama',    name: 'Mamá',    initial: 'M', color: 'rose'   },
  { id: 'u-hermano', name: 'Hermano', initial: 'H', color: 'butter' },
  { id: 'u-papa',    name: 'Papá',    initial: 'P', color: 'sage'   },
];
function getUser(id) { return HL_USERS.find(u => u.id === id) || HL_USERS[0]; }

function buildDefaultResponsibilities() {
  return [
    { id: 'r-loza',   name: 'Lavar loza',     icon: 'plate', color: 'sage',  days: [0,1,2,3,4],     time: null,    assignedTo: 'u-andreu'  },
    { id: 'r-gato',   name: 'Alimentar gato', icon: 'paw',   color: 'peach', days: [0,1,2,3,4,5,6], time: '08:00', assignedTo: 'u-hermano' },
    { id: 'r-cena',   name: 'Cocinar cena',   icon: 'stove', color: 'rose',  days: [0,1,2,3,4,5],   time: '20:00', assignedTo: 'u-mama'    },
    { id: 'r-basura', name: 'Sacar basura',   icon: 'trash', color: 'sky',   days: [2,5],           time: null,    assignedTo: 'u-papa'    },
  ];
}

const HabitsStore           = hlMakeStore(buildDefaultHabits());
const ResponsabilidadesStore = hlMakeStore(buildDefaultResponsibilities());
// Completados compartidos: hábitos + responsabilidades en un único mapa.
const HabitDoneStore = hlMakeStore({
  ...buildDefaultCompletions(HabitsStore.get()),
  ...buildDefaultCompletions(ResponsabilidadesStore.get()),
});

function habitDoneKey(id, iso) { return id + '|' + iso; }
function toggleHabitDone(id, iso) {
  HabitDoneStore.set(prev => {
    const k = habitDoneKey(id, iso);
    const next = { ...prev };
    if (next[k]) delete next[k]; else next[k] = true;
    return next;
  });
}


// ─── primitivas de formulario compartidas (calendario + página Hábitos) ─────
function HLLabel({ children, hint }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5 ml-1">
      <span className="text-[11px] font-medium uppercase tracking-[.08em]
                       text-ink-mute dark:text-night-softText">
        {children}
      </span>
      {hint && (
        <span className="text-[10.5px] normal-case tracking-normal text-ink-mute dark:text-night-softText">
          {hint}
        </span>
      )}
    </div>
  );
}

function HLBox({ children }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5
                    bg-paper-soft dark:bg-night-soft
                    border border-transparent focus-within:border-accent
                    focus-within:bg-white dark:focus-within:bg-night
                    transition-colors">
      {children}
    </div>
  );
}

const HLInputCls = `w-full bg-transparent outline-none text-[15px]
                    text-ink dark:text-night-text
                    placeholder:text-ink-mute dark:placeholder:text-night-softText`;

function HLCheck({ size = 12 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
         strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d="m5 12.5 4 4 10-10"/>
    </svg>
  );
}

function HabitColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {HABIT_COLORS.map(c => {
        const sel = c.id === value;
        return (
          <button key={c.id} type="button"
            aria-label={c.name} title={c.name}
            onClick={() => onChange(c.id)}
            style={{ backgroundColor: c.base }}
            className={`h-8 w-8 rounded-full flex items-center justify-center transition
                        ring-2 ring-offset-2 ring-offset-white dark:ring-offset-night-card
                        ${sel ? 'ring-ink/40 dark:ring-white/60 scale-105' : 'ring-transparent hover:scale-105'}`}>
            {sel && <span className="text-white drop-shadow-sm"><HLCheck/></span>}
          </button>
        );
      })}
    </div>
  );
}

function WeekdayChips({ value, onChange }) {
  const toggle = (i) => {
    const has = value.includes(i);
    const next = has ? value.filter(x => x !== i) : [...value, i].sort((a, b) => a - b);
    onChange(next);
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {WEEKDAYS.map(d => {
        const sel = value.includes(d.i);
        return (
          <button key={d.i} type="button"
            aria-pressed={sel}
            onClick={() => toggle(d.i)}
            className={`h-9 min-w-[44px] px-2 rounded-full text-[12.5px] font-medium border transition
                        ${sel
                          ? 'bg-accent border-transparent text-[hsl(var(--accent-strong))]'
                          : 'border-black/[.08] dark:border-white/[.1] text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
            {d.short}
          </button>
        );
      })}
    </div>
  );
}

// Campos del formulario "Hábito" (compartidos por el modal del calendario y el
// diálogo de la página Hábitos).
function HabitFormFields({ form, setForm, autoFocus }) {
  const set = (patch) => setForm(f => ({ ...f, ...patch }));
  return (
    <div className="space-y-4">
      <div>
        <HLLabel>Nombre del hábito</HLLabel>
        <HLBox>
          <input type="text" autoFocus={autoFocus} className={HLInputCls}
            value={form.name} onChange={(e) => set({ name: e.target.value })}
            placeholder="Ej. Salir a correr"/>
        </HLBox>
      </div>
      <div>
        <HLLabel>Color</HLLabel>
        <HabitColorPicker value={form.color} onChange={(c) => set({ color: c })}/>
      </div>
      <div>
        <HLLabel hint="multiselección · todos por defecto">Días de la semana</HLLabel>
        <WeekdayChips value={form.days} onChange={(days) => set({ days })}/>
      </div>
      <div>
        <HLLabel hint="opcional">Hora</HLLabel>
        <HLBox>
          <select value={form.time || ''} onChange={(e) => set({ time: e.target.value || null })}
            className={`${HLInputCls} tabular-nums`}>
            <option value="" className="bg-white dark:bg-night-card">Sin hora · todo el día</option>
            {HL_TIME_OPTS.map(t => (
              <option key={t} value={t} className="bg-white dark:bg-night-card">{t}</option>
            ))}
          </select>
        </HLBox>
      </div>
    </div>
  );
}

Object.assign(window, {
  // date helpers
  hlIso, hlParse, hlAddDays, hlDow, hlWeekStart, hlToday, hlShortDate, hlAddMinutes,
  WEEKDAYS, HL_TIME_OPTS,
  // colors
  HABIT_COLORS, HABIT_COLOR_IDS, getHabitColor,
  // store
  useStore, HabitsStore, HabitDoneStore,
  ResponsabilidadesStore, buildDefaultResponsibilities,
  HL_USERS, getUser,
  habitDoneKey, toggleHabitDone, buildDefaultHabits,
  // form primitives
  HLLabel, HLBox, HLInputCls, HLCheck, HabitColorPicker, WeekdayChips,
  HabitFormFields,
});
