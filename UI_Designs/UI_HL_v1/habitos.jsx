// Home Lettuce — Hábitos
// ─────────────────────────────────────────────────────────────────────────────
// En el repo TS real:
//   · src/components/app/habits/WeekTemplate.tsx
//   · src/components/app/habits/HabitCard.tsx
//   · src/components/app/habits/HabitHeatmap.tsx
//   · src/components/app/habits/HabitFormDialog.tsx
//   · src/pages/HabitosPage.tsx
// El modelo, el store y los campos del formulario viven en store.jsx
// (compartidos con el Calendario).
// ─────────────────────────────────────────────────────────────────────────────

const HEATMAP_WEEKS = 12;

// ─── helpers de estadística ─────────────────────────────────────────────────
function habitStats(habit, doneMap) {
  const today = hlToday();
  // 12 semanas hacia atrás (incluida la actual)
  const thisMon = hlWeekStart(today);
  const start   = hlAddDays(thisMon, -(HEATMAP_WEEKS - 1) * 7);
  let scheduled = 0, completed = 0;
  for (let i = 0; i < HEATMAP_WEEKS * 7; i++) {
    const d = hlAddDays(start, i);
    if (d > today) break;
    if (!habit.days.includes(hlDow(d))) continue;
    scheduled++;
    if (doneMap[habitDoneKey(habit.id, hlIso(d))]) completed++;
  }
  const pct = scheduled ? Math.round((completed / scheduled) * 100) : 0;

  // racha actual: días programados consecutivos hechos, terminando hoy/ayer
  let streak = 0;
  for (let back = 0; back < 400; back++) {
    const d = hlAddDays(today, -back);
    if (!habit.days.includes(hlDow(d))) continue;
    if (doneMap[habitDoneKey(habit.id, hlIso(d))]) streak++;
    else if (back === 0) continue;   // hoy aún pendiente no rompe la racha
    else break;
  }
  return { pct, completed, scheduled, streak };
}


// ─── Chips de días (solo lectura) ───────────────────────────────────────────
function DayBadges({ days }) {
  return (
    <div className="flex items-center gap-1">
      {WEEKDAYS.map(d => {
        const on = days.includes(d.i);
        return (
          <span key={d.i}
            className={`h-5 w-5 rounded-full text-[10px] font-medium flex items-center justify-center
                        ${on
                          ? 'bg-accent text-[hsl(var(--accent-strong))]'
                          : 'bg-paper-soft dark:bg-night-soft text-ink-mute dark:text-night-softText'}`}>
            {d.min}
          </span>
        );
      })}
    </div>
  );
}


// ─── Semana tipo (plantilla no navegable) ───────────────────────────────────
function WeekTemplate({ habits }) {
  return (
    <div className="bg-white dark:bg-night-card rounded-3xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle
                    p-4 sm:p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[15px] font-medium text-ink dark:text-night-text">Semana tipo</h2>
        <span className="text-[11.5px] text-ink-mute dark:text-night-softText">Plantilla · no navegable</span>
      </div>
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="grid grid-cols-7 gap-2 min-w-[620px]">
          {WEEKDAYS.map(d => {
            const dayHabits = habits
              .filter(h => h.days.includes(d.i))
              .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
            const today = hlDow(hlToday()) === d.i;
            return (
              <div key={d.i}
                className={`rounded-2xl p-2 min-h-[112px]
                            ${today ? 'bg-accent-tint' : 'bg-paper-soft/70 dark:bg-night-soft/60'}`}>
                <div className={`text-[11px] font-medium uppercase tracking-[.06em] mb-2 text-center
                                 ${today ? 'text-accent' : 'text-ink-mute dark:text-night-softText'}`}>
                  {d.short}
                </div>
                <div className="space-y-1">
                  {dayHabits.map(h => {
                    const c = getHabitColor(h.color);
                    return (
                      <div key={h.id}
                        className="rounded-lg px-1.5 py-1 flex items-center gap-1 overflow-hidden"
                        style={{ backgroundColor: c.soft, color: c.ink, borderLeft: `3px solid ${c.base}` }}>
                        <span className="text-[10.5px] font-medium truncate leading-tight">{h.name}</span>
                      </div>
                    );
                  })}
                  {dayHabits.length === 0 && (
                    <div className="text-[10.5px] text-ink-mute dark:text-night-softText text-center pt-3 opacity-70">
                      —
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// ─── Heatmap 12 semanas × 7 días ────────────────────────────────────────────
function HabitHeatmap({ habit, doneMap }) {
  const c = getHabitColor(habit.color);
  const today = hlToday();
  const todayIso = hlIso(today);
  const thisMon = hlWeekStart(today);
  const startMon = hlAddDays(thisMon, -(HEATMAP_WEEKS - 1) * 7);

  const cellStyle = (d) => {
    const iso = hlIso(d);
    const scheduled = habit.days.includes(hlDow(d));
    const future = d > today;
    const done = !!doneMap[habitDoneKey(habit.id, iso)];
    let bg, border;
    if (!scheduled) {
      bg = 'rgba(127,127,127,.06)';
    } else if (done) {
      bg = c.base;
    } else if (future) {
      bg = c.soft;
    } else {
      bg = 'rgba(127,127,127,.16)';        // programado, no hecho (gris claro)
    }
    if (iso === todayIso) border = '2px solid hsl(var(--accent-strong))';
    return { backgroundColor: bg, boxShadow: border ? `inset 0 0 0 2px hsl(var(--accent-strong))` : 'none' };
  };

  return (
    <div className="w-full">
      {/* cabecera de días */}
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-12 shrink-0"/>
        <div className="flex-1 grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map(d => (
            <div key={d.i} className="text-[10px] text-ink-mute dark:text-night-softText text-center">
              {d.min}
            </div>
          ))}
        </div>
      </div>
      {/* 12 filas semanales */}
      <div className="space-y-1.5">
        {Array.from({ length: HEATMAP_WEEKS }, (_, r) => {
          const weekMon = hlAddDays(startMon, r * 7);
          return (
            <div key={r} className="flex items-center gap-1.5">
              <div className="w-12 shrink-0 text-[10px] tabular-nums text-ink-mute dark:text-night-softText text-right pr-0.5">
                {hlShortDate(weekMon)}
              </div>
              <div className="flex-1 grid grid-cols-7 gap-1.5">
                {WEEKDAYS.map((_, cIdx) => {
                  const d = hlAddDays(weekMon, cIdx);
                  return (
                    <div key={cIdx}
                      title={hlIso(d)}
                      className="h-6 rounded-[5px]"
                      style={cellStyle(d)}/>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* leyenda */}
      <div className="flex items-center justify-end gap-1.5 mt-2 text-[10.5px] text-ink-mute dark:text-night-softText">
        <span>Menos</span>
        <span className="h-3 w-3 rounded-[4px]" style={{ backgroundColor: 'rgba(127,127,127,.16)' }}/>
        <span className="h-3 w-3 rounded-[4px]" style={{ backgroundColor: c.soft }}/>
        <span className="h-3 w-3 rounded-[4px]" style={{ backgroundColor: c.base, opacity: .6 }}/>
        <span className="h-3 w-3 rounded-[4px]" style={{ backgroundColor: c.base }}/>
        <span>Más</span>
      </div>
    </div>
  );
}


// ─── Tarjeta de hábito ──────────────────────────────────────────────────────
function HabitCard({ habit, doneMap, onEdit, onDelete }) {
  const c = getHabitColor(habit.color);
  const stats = habitStats(habit, doneMap);
  return (
    <div className="bg-white dark:bg-night-card rounded-3xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle
                    p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="h-9 w-9 rounded-2xl shrink-0 mt-0.5" style={{ backgroundColor: c.base }}/>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-medium text-ink dark:text-night-text truncate">{habit.name}</h3>
            {habit.time
              ? <span className="text-[11px] tabular-nums px-2 py-0.5 rounded-full bg-paper-soft dark:bg-night-soft text-ink-soft dark:text-night-softText">{habit.time}</span>
              : <span className="text-[11px] px-2 py-0.5 rounded-full bg-paper-soft dark:bg-night-soft text-ink-mute dark:text-night-softText">Todo el día</span>}
          </div>
          <div className="mt-2"><DayBadges days={habit.days}/></div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(habit)} aria-label="Editar"
            className="h-8 w-8 rounded-full inline-flex items-center justify-center
                       text-ink-mute hover:text-ink dark:text-night-softText dark:hover:text-night-text
                       hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
            <IconHabitEdit/>
          </button>
          <button onClick={() => onDelete(habit)} aria-label="Eliminar"
            className="h-8 w-8 rounded-full inline-flex items-center justify-center
                       text-ink-mute hover:text-red-600 dark:hover:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <IconHabitTrash/>
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="flex items-center gap-5 mt-4 mb-3">
        <div>
          <div className="text-[20px] font-medium tabular-nums leading-none" style={{ color: c.base }}>
            {stats.streak}
          </div>
          <div className="text-[10.5px] uppercase tracking-[.06em] text-ink-mute dark:text-night-softText mt-1">
            racha · días
          </div>
        </div>
        <div className="h-8 w-px bg-black/[.06] dark:bg-white/[.08]"/>
        <div>
          <div className="text-[20px] font-medium tabular-nums leading-none text-ink dark:text-night-text">
            {stats.pct}<span className="text-[13px] text-ink-mute dark:text-night-softText">%</span>
          </div>
          <div className="text-[10.5px] uppercase tracking-[.06em] text-ink-mute dark:text-night-softText mt-1">
            12 sem · {stats.completed}/{stats.scheduled}
          </div>
        </div>
      </div>

      <HabitHeatmap habit={habit} doneMap={doneMap}/>
    </div>
  );
}


// ─── Diálogo crear / editar ─────────────────────────────────────────────────
function HabitFormDialog({ open, editing, onClose, onSubmit }) {
  const [form, setForm] = React.useState({ name: '', color: 'sage', days: [0,1,2,3,4,5,6], time: null });
  const [err, setErr] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setErr('');
    if (editing) {
      setForm({
        name: editing.name, color: editing.color,
        days: editing.days && editing.days.length ? editing.days : [0,1,2,3,4,5,6],
        time: editing.time || null,
      });
    } else {
      setForm({ name: '', color: 'sage', days: [0,1,2,3,4,5,6], time: null });
    }
  }, [open, editing]);

  const submit = () => {
    if (!form.name.trim()) { setErr('El nombre del hábito es obligatorio.'); return; }
    if (!form.days.length) { setErr('Elige al menos un día de la semana.'); return; }
    onSubmit({
      id: editing?.id,
      name: form.name.trim(), color: form.color, days: form.days, time: form.time || null,
    });
  };

  return (
    <AlDialog
      open={open} onClose={onClose} maxW="sm:max-w-md"
      title={editing ? 'Editar hábito' : 'Nuevo hábito'}
      subtitle="Aparecerá en tu calendario los días elegidos."
      footer={
        <React.Fragment>
          <AlGhost onClick={onClose}>Cancelar</AlGhost>
          <AlPrimary onClick={submit}>{editing ? 'Guardar cambios' : 'Crear hábito'}</AlPrimary>
        </React.Fragment>
      }>
      <HabitFormFields form={form} setForm={setForm} autoFocus/>
      {err && <p className="text-[12.5px] text-red-600 dark:text-red-400 mt-3">{err}</p>}
    </AlDialog>
  );
}


// ─── iconos locales ─────────────────────────────────────────────────────────
const IconHabitEdit = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...p}>
    <path d="M14.5 5.5 18.5 9.5 8 20H4v-4Z"/><path d="m13 7 4 4"/>
  </svg>
);
const IconHabitTrash = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...p}>
    <path d="M4.5 7h15"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"/>
    <path d="M6.5 7l1 12.5a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-12.5"/><path d="M10 11v6M14 11v6"/>
  </svg>
);
const IconHabitPlus = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...p}>
    <path d="M12 5v14M5 12h14"/>
  </svg>
);


// ═════════════════════════════════════════════════════════════════════════════
// RESPONSABILIDADES — hábitos recurrentes del hogar asignados a personas.
// Reaprovecha habitStats / HabitHeatmap / getHabitColor (mismo scope) y el
// mapa de completados compartido (HabitDoneStore + toggleHabitDone).
// En el repo TS real:
//   · src/components/app/responsibilities/ResponsibilityCard.tsx
//   · src/components/app/responsibilities/PersonGroup.tsx
//   · src/components/app/responsibilities/ResponsibilityFormDialog.tsx
//   · src/lib/householdIcons.ts
// ═════════════════════════════════════════════════════════════════════════════

// ─── 8 íconos del hogar (24×24, stroke 1.6, estilo de la app) ───────────────
const HI = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...props} />
);
const IconHm_Broom = (p) => (
  <HI {...p}>
    <path d="M16.5 4.5 10.5 10.5"/>
    <path d="M6.5 14.5 9.5 11.5 13.5 15.5 10.5 18.5Z"/>
    <path d="M7.6 16.4 6 20M9.4 17.4 8.4 20.6M11.4 17.8 11.4 21"/>
  </HI>
);
const IconHm_Plate = (p) => (
  <HI {...p}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.8"/></HI>
);
const IconHm_Paw = (p) => (
  <HI {...p}>
    <ellipse cx="12" cy="15.5" rx="3.4" ry="2.7"/>
    <circle cx="7.6" cy="11.4" r="1.5"/><circle cx="10.6" cy="8.6" r="1.5"/>
    <circle cx="13.4" cy="8.6" r="1.5"/><circle cx="16.4" cy="11.4" r="1.5"/>
  </HI>
);
const IconHm_Trash = (p) => (
  <HI {...p}>
    <path d="M6.5 9h11l-1 9.6a2 2 0 0 1-2 1.8h-5a2 2 0 0 1-2-1.8Z"/>
    <path d="M8 9c0-2 1.8-3.6 4-3.6S16 7 16 9"/>
    <path d="M10.5 12.5v5M13.5 12.5v5"/>
  </HI>
);
const IconHm_Watering = (p) => (
  <HI {...p}>
    <path d="M6 11h7.5v7a1.5 1.5 0 0 1-1.5 1.5H7.5A1.5 1.5 0 0 1 6 18Z"/>
    <path d="M13.5 12.5 18 9l1.5 1"/>
    <path d="M7.2 11V9.3a2.2 2.2 0 0 1 4.3 0V11"/>
  </HI>
);
const IconHm_Wrench = (p) => (
  <HI {...p}>
    <path d="M15 6.4a3.6 3.6 0 0 0-4.7 4.7l-5.2 5.2a2 2 0 0 0 2.8 2.8l5.2-5.2A3.6 3.6 0 0 0 18 9.5l-2.2 2.2-2-2L15 6.4Z"/>
  </HI>
);
const IconHm_Washer = (p) => (
  <HI {...p}>
    <rect x="5" y="3.5" width="14" height="17" rx="2.5"/>
    <circle cx="12" cy="13" r="4.3"/><circle cx="12" cy="13" r="1.4"/>
    <circle cx="8" cy="6.6" r=".5" fill="currentColor"/><circle cx="10.4" cy="6.6" r=".5" fill="currentColor"/>
  </HI>
);
const IconHm_Stove = (p) => (
  <HI {...p}>
    <rect x="4.5" y="6" width="15" height="13" rx="2"/>
    <circle cx="9" cy="11" r="1.9"/><circle cx="15" cy="11" r="1.9"/>
    <path d="M7 15.5h10"/>
  </HI>
);

const HOUSEHOLD_ICONS = [
  { id: 'broom',    name: 'Escoba',        Icon: IconHm_Broom    },
  { id: 'plate',    name: 'Plato',         Icon: IconHm_Plate    },
  { id: 'paw',      name: 'Mascota',       Icon: IconHm_Paw      },
  { id: 'trash',    name: 'Basura',        Icon: IconHm_Trash    },
  { id: 'watering', name: 'Regadera',      Icon: IconHm_Watering },
  { id: 'wrench',   name: 'Llave inglesa', Icon: IconHm_Wrench   },
  { id: 'washer',   name: 'Lavadora',      Icon: IconHm_Washer   },
  { id: 'stove',    name: 'Cocina',        Icon: IconHm_Stove    },
];
function getHouseholdIcon(id) {
  const f = HOUSEHOLD_ICONS.find(i => i.id === id);
  return (f || HOUSEHOLD_ICONS[0]).Icon;
}

// ─── Avatar de persona (círculo con inicial, teñido) ────────────────────────
function PersonAvatar({ user, size = 40 }) {
  const c = getHabitColor(user.color);
  return (
    <span className="shrink-0 rounded-full flex items-center justify-center font-medium"
      style={{ height: size, width: size, backgroundColor: c.soft, color: c.ink,
               fontSize: size * 0.42 }}>
      {user.initial}
    </span>
  );
}

// ─── Checkbox de completado del día (teñido con el color de la resp.) ───────
function RespDayCheck({ done, scheduled, color, onToggle }) {
  const c = getHabitColor(color);
  if (!scheduled) {
    return (
      <span className="h-[26px] px-2.5 rounded-full inline-flex items-center text-[11px]
                       bg-paper-soft dark:bg-night-soft text-ink-mute dark:text-night-softText shrink-0">
        Hoy no
      </span>
    );
  }
  return (
    <button onClick={onToggle} role="checkbox" aria-checked={done}
      aria-label={done ? 'Marcar como pendiente hoy' : 'Marcar como hecho hoy'}
      className="h-[26px] w-[26px] shrink-0 rounded-[9px] flex items-center justify-center
                 border transition-colors"
      style={done
        ? { backgroundColor: c.base, borderColor: c.base, color: '#fff' }
        : { borderColor: 'rgba(127,127,127,.34)', color: 'transparent' }}>
      <HLCheck size={14}/>
    </button>
  );
}

// ─── Tarjeta de responsabilidad (icono + nombre + check del día + heatmap) ──
function ResponsibilityCard({ resp, doneMap, onEdit, onDelete }) {
  const c = getHabitColor(resp.color);
  const Icon = getHouseholdIcon(resp.icon);
  const stats = habitStats(resp, doneMap);
  const todayIso = hlIso(hlToday());
  const scheduledToday = resp.days.includes(hlDow(hlToday()));
  const doneToday = !!doneMap[habitDoneKey(resp.id, todayIso)];

  return (
    <div className="bg-white dark:bg-night-card rounded-3xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle
                    p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="h-10 w-10 rounded-2xl shrink-0 flex items-center justify-center"
          style={{ backgroundColor: c.soft, color: c.ink }}>
          <Icon/>
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-medium text-ink dark:text-night-text truncate">{resp.name}</h3>
            {resp.time
              ? <span className="text-[11px] tabular-nums px-2 py-0.5 rounded-full bg-paper-soft dark:bg-night-soft text-ink-soft dark:text-night-softText">{resp.time}</span>
              : <span className="text-[11px] px-2 py-0.5 rounded-full bg-paper-soft dark:bg-night-soft text-ink-mute dark:text-night-softText">Todo el día</span>}
          </div>
          <div className="mt-2"><DayBadges days={resp.days}/></div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(resp)} aria-label="Editar"
            className="h-8 w-8 rounded-full inline-flex items-center justify-center
                       text-ink-mute hover:text-ink dark:text-night-softText dark:hover:text-night-text
                       hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
            <IconHabitEdit/>
          </button>
          <button onClick={() => onDelete(resp)} aria-label="Eliminar"
            className="h-8 w-8 rounded-full inline-flex items-center justify-center
                       text-ink-mute hover:text-red-600 dark:hover:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <IconHabitTrash/>
          </button>
        </div>
      </div>

      {/* Completado de HOY */}
      <label className="flex items-center gap-3 mt-3.5 px-3 py-2.5 rounded-2xl cursor-pointer
                        bg-paper-soft/70 dark:bg-night-soft/60
                        hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
        <RespDayCheck done={doneToday} scheduled={scheduledToday} color={resp.color}
          onToggle={() => toggleHabitDone(resp.id, todayIso)}/>
        <span className={`text-[13.5px] ${scheduledToday
          ? (doneToday ? 'text-ink-mute dark:text-night-softText line-through' : 'text-ink dark:text-night-text')
          : 'text-ink-mute dark:text-night-softText'}`}>
          {!scheduledToday ? 'No toca hoy' : doneToday ? 'Hecho hoy' : 'Pendiente hoy'}
        </span>
        <span className="ml-auto text-[11px] tabular-nums text-ink-mute dark:text-night-softText">
          racha {stats.streak} · {stats.pct}%
        </span>
      </label>

      <div className="mt-4">
        <HabitHeatmap habit={resp} doneMap={doneMap}/>
      </div>
    </div>
  );
}

// ─── Selector de persona asignada ──────────────────────────────────────────
function AssigneePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {HL_USERS.map(u => {
        const sel = u.id === value;
        return (
          <button key={u.id} type="button" onClick={() => onChange(u.id)}
            aria-pressed={sel}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border text-left transition-colors
                        ${sel
                          ? 'bg-accent-tint border-accent'
                          : 'bg-paper-soft dark:bg-night-soft border-transparent hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
            <PersonAvatar user={u} size={30}/>
            <span className={`text-[13.5px] font-medium truncate
                              ${sel ? 'text-accent' : 'text-ink dark:text-night-text'}`}>
              {u.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Selector de ícono del hogar ────────────────────────────────────────────
function HouseholdIconPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {HOUSEHOLD_ICONS.map(({ id, name, Icon }) => {
        const sel = value === id;
        return (
          <button key={id} type="button" onClick={() => onChange(id)}
            aria-label={name} title={name} aria-pressed={sel}
            className={`aspect-square rounded-2xl flex items-center justify-center border transition-colors
                        ${sel
                          ? 'bg-accent-tint border-accent text-accent'
                          : 'bg-paper-soft dark:bg-night-soft border-transparent text-ink-soft dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
            <Icon/>
          </button>
        );
      })}
    </div>
  );
}

// ─── Diálogo crear / editar responsabilidad ─────────────────────────────────
function RespFormDialog({ open, editing, onClose, onSubmit }) {
  const [form, setForm] = React.useState({
    name: '', icon: 'broom', color: 'sage', days: [0,1,2,3,4,5,6], time: null, assignedTo: 'u-andreu',
  });
  const [err, setErr] = React.useState('');
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  React.useEffect(() => {
    if (!open) return;
    setErr('');
    if (editing) {
      setForm({
        name: editing.name, icon: editing.icon || 'broom', color: editing.color,
        days: editing.days && editing.days.length ? editing.days : [0,1,2,3,4,5,6],
        time: editing.time || null, assignedTo: editing.assignedTo || 'u-andreu',
      });
    } else {
      setForm({ name: '', icon: 'broom', color: 'sage', days: [0,1,2,3,4,5,6], time: null, assignedTo: 'u-andreu' });
    }
  }, [open, editing]);

  const submit = () => {
    if (!form.name.trim()) { setErr('El nombre de la responsabilidad es obligatorio.'); return; }
    if (!form.days.length) { setErr('Elige al menos un día de la semana.'); return; }
    onSubmit({ id: editing?.id, ...form, name: form.name.trim(), time: form.time || null });
  };

  return (
    <AlDialog
      open={open} onClose={onClose} maxW="sm:max-w-md"
      title={editing ? 'Editar responsabilidad' : 'Nueva responsabilidad'}
      subtitle="Una tarea recurrente del hogar asignada a alguien de la casa."
      footer={
        <React.Fragment>
          <AlGhost onClick={onClose}>Cancelar</AlGhost>
          <AlPrimary onClick={submit}>{editing ? 'Guardar cambios' : 'Crear responsabilidad'}</AlPrimary>
        </React.Fragment>
      }>
      <div className="space-y-4">
        <div>
          <HLLabel>Nombre</HLLabel>
          <HLBox>
            <input type="text" autoFocus className={HLInputCls}
              value={form.name} onChange={(e) => set({ name: e.target.value })}
              placeholder="Ej. Lavar loza, Sacar basura…"/>
          </HLBox>
        </div>
        <div>
          <HLLabel>Ícono</HLLabel>
          <HouseholdIconPicker value={form.icon} onChange={(icon) => set({ icon })}/>
        </div>
        <div>
          <HLLabel>Asignado a</HLLabel>
          <AssigneePicker value={form.assignedTo} onChange={(assignedTo) => set({ assignedTo })}/>
        </div>
        <div>
          <HLLabel>Color</HLLabel>
          <HabitColorPicker value={form.color} onChange={(color) => set({ color })}/>
        </div>
        <div>
          <HLLabel hint="multiselección">Días de la semana</HLLabel>
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
      {err && <p className="text-[12.5px] text-red-600 dark:text-red-400 mt-3">{err}</p>}
    </AlDialog>
  );
}

// ─── Vista: FOCO Responsabilidades ──────────────────────────────────────────
function ResponsabilidadesView() {
  const [resps] = useStore(ResponsabilidadesStore);
  const [doneMap] = useStore(HabitDoneStore);
  const [dialog, setDialog] = React.useState({ open: false, editing: null });
  const [confirm, setConfirm] = React.useState(null);

  const handleSubmit = (payload) => {
    ResponsabilidadesStore.set(prev => payload.id
      ? prev.map(r => r.id === payload.id ? { ...r, ...payload } : r)
      : [...prev, { ...payload, id: 'r-' + Date.now() }]);
    setDialog({ open: false, editing: null });
  };
  const handleDelete = (r) => {
    ResponsabilidadesStore.set(prev => prev.filter(x => x.id !== r.id));
    setConfirm(null);
  };

  // Agrupar por persona, respetando el orden de HL_USERS.
  const groups = HL_USERS
    .map(u => ({ user: u, items: resps.filter(r => r.assignedTo === u.id)
      .sort((a, b) => (a.time || '99').localeCompare(b.time || '99')) }))
    .filter(g => g.items.length > 0);

  return (
    <div className="route-fade">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[14px] text-ink-soft dark:text-night-softText max-w-xl">
          Tareas recurrentes del hogar, repartidas entre la familia. Marca cada día lo que ya está hecho.
        </p>
        <button onClick={() => setDialog({ open: true, editing: null })}
          className="shrink-0 ml-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-full
                     bg-accent text-[hsl(var(--accent-strong))] font-medium text-[13.5px]
                     hover:brightness-[.96] active:brightness-[.92] transition">
          <IconHabitPlus/> Nueva responsabilidad
        </button>
      </div>

      {resps.length === 0 ? (
        <div className="bg-white dark:bg-night-card rounded-3xl
                        border border-black/[.04] dark:border-white/[.05] shadow-subtle
                        p-10 sm:p-14 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-3xl bg-accent-tint text-accent flex items-center justify-center mb-4">
            <span style={{ transform: 'scale(1.4)' }}><IconHm_Broom/></span>
          </div>
          <h3 className="text-[15px] font-medium text-ink dark:text-night-text">Aún no hay responsabilidades</h3>
          <p className="mt-1.5 text-[13px] text-ink-soft dark:text-night-softText max-w-xs">
            Crea la primera y asígnala a alguien de la casa para empezar a repartir las tareas.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ user, items }) => (
            <section key={user.id}>
              <div className="flex items-center gap-3 mb-3">
                <PersonAvatar user={user} size={40}/>
                <div>
                  <h2 className="text-[16px] font-medium text-ink dark:text-night-text leading-none">{user.name}</h2>
                  <span className="text-[12px] text-ink-mute dark:text-night-softText tabular-nums">
                    {items.length} responsabilidad{items.length === 1 ? '' : 'es'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {items.map(r => (
                  <ResponsibilityCard key={r.id} resp={r} doneMap={doneMap}
                    onEdit={(rr) => setDialog({ open: true, editing: rr })}
                    onDelete={(rr) => setConfirm(rr)}/>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <RespFormDialog
        open={dialog.open} editing={dialog.editing}
        onClose={() => setDialog({ open: false, editing: null })}
        onSubmit={handleSubmit}/>

      <AlDialog
        open={!!confirm} onClose={() => setConfirm(null)} maxW="sm:max-w-sm"
        title="Eliminar responsabilidad"
        footer={
          <React.Fragment>
            <AlGhost onClick={() => setConfirm(null)}>Cancelar</AlGhost>
            <button onClick={() => handleDelete(confirm)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full
                         bg-red-500 text-white font-medium text-[13.5px]
                         hover:bg-red-600 active:bg-red-700 transition-colors">
              Eliminar
            </button>
          </React.Fragment>
        }>
        {confirm && (
          <p className="text-[14px] text-ink-soft dark:text-night-softText leading-relaxed">
            ¿Seguro que quieres eliminar <span className="font-medium text-ink dark:text-night-text">{confirm.name}</span>?
            Se borrará también su historial de seguimiento.
          </p>
        )}
      </AlDialog>
    </div>
  );
}


// ─── Vista: FOCO Hábitos (vista actual, sin cambios) ────────────────────────
function HabitosFocusView() {
  const [habits] = useStore(HabitsStore);
  const [doneMap] = useStore(HabitDoneStore);
  const [dialog, setDialog] = React.useState({ open: false, editing: null });
  const [confirm, setConfirm] = React.useState(null);  // habit a borrar

  const openCreate = () => setDialog({ open: true, editing: null });
  const openEdit = (h) => setDialog({ open: true, editing: h });

  const handleSubmit = (payload) => {
    HabitsStore.set(prev => payload.id
      ? prev.map(h => h.id === payload.id ? { ...h, ...payload } : h)
      : [...prev, { ...payload, id: 'hab-' + Date.now() }]);
    setDialog({ open: false, editing: null });
  };
  const handleDelete = (h) => {
    HabitsStore.set(prev => prev.filter(x => x.id !== h.id));
    setConfirm(null);
  };

  return (
    <div className="route-fade">
      <p className="-mt-2 mb-6 text-[14px] text-ink-soft dark:text-night-softText max-w-xl">
        Define tus rutinas y haz seguimiento día a día. Cada hábito aparece en el calendario
        y guarda su propio historial.
      </p>

      <WeekTemplate habits={habits}/>

      <div className="flex items-center justify-between mt-8 mb-3">
        <h2 className="text-[15px] font-medium text-ink dark:text-night-text">
          Tus hábitos
          <span className="ml-2 text-[12px] text-ink-mute dark:text-night-softText tabular-nums">{habits.length}</span>
        </h2>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full
                     bg-accent text-[hsl(var(--accent-strong))] font-medium text-[13.5px]
                     hover:brightness-[.96] active:brightness-[.92] transition">
          <IconHabitPlus/> Nuevo hábito
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="bg-white dark:bg-night-card rounded-3xl
                        border border-black/[.04] dark:border-white/[.05] shadow-subtle
                        p-10 sm:p-14 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-3xl bg-accent-tint text-accent flex items-center justify-center mb-4">
            <span style={{ transform: 'scale(1.5)' }}><IconHabit/></span>
          </div>
          <h3 className="text-[15px] font-medium text-ink dark:text-night-text">Aún no hay hábitos</h3>
          <p className="mt-1.5 text-[13px] text-ink-soft dark:text-night-softText max-w-xs">
            Crea tu primer hábito para empezar a construir rutinas y ver tu progreso.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {habits.map(h => (
            <HabitCard key={h.id} habit={h} doneMap={doneMap}
              onEdit={openEdit} onDelete={(hb) => setConfirm(hb)}/>
          ))}
        </div>
      )}

      <HabitFormDialog
        open={dialog.open} editing={dialog.editing}
        onClose={() => setDialog({ open: false, editing: null })}
        onSubmit={handleSubmit}/>

      <AlDialog
        open={!!confirm} onClose={() => setConfirm(null)} maxW="sm:max-w-sm"
        title="Eliminar hábito"
        footer={
          <React.Fragment>
            <AlGhost onClick={() => setConfirm(null)}>Cancelar</AlGhost>
            <button onClick={() => handleDelete(confirm)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full
                         bg-red-500 text-white font-medium text-[13.5px]
                         hover:bg-red-600 active:bg-red-700 transition-colors">
              Eliminar
            </button>
          </React.Fragment>
        }>
        {confirm && (
          <p className="text-[14px] text-ink-soft dark:text-night-softText leading-relaxed">
            ¿Seguro que quieres eliminar <span className="font-medium text-ink dark:text-night-text">{confirm.name}</span>?
            Se borrará también su historial de seguimiento.
          </p>
        )}
      </AlDialog>
    </div>
  );
}

// ─── Página: selector de foco Hábitos | Responsabilidades ───────────────────
function HabitosPage() {
  const [focus, setFocus] = React.useState(() => {
    try { return localStorage.getItem('hl.habitos.focus') || 'habitos'; } catch (_) { return 'habitos'; }
  });
  const changeFocus = (v) => {
    setFocus(v);
    try { localStorage.setItem('hl.habitos.focus', v); } catch (_) {}
  };

  return (
    <PageShell title="Hábitos">
      <div className="-mt-2 mb-7">
        <AlTabs value={focus} onChange={changeFocus}>
          <AlTabsList>
            <AlTabsTrigger value="habitos" icon={<IconHabit width="17" height="17"/>}>Hábitos</AlTabsTrigger>
            <AlTabsTrigger value="responsabilidades" icon={<IconHm_Broom width="17" height="17"/>}>Responsabilidades</AlTabsTrigger>
          </AlTabsList>
        </AlTabs>
      </div>

      {focus === 'responsabilidades' ? <ResponsabilidadesView/> : <HabitosFocusView/>}
    </PageShell>
  );
}

Object.assign(window, { HabitosPage });
