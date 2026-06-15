// Home Lettuce — Proyectos
// ─────────────────────────────────────────────────────────────────────────────
// Un proyecto del hogar = iniciativa con varias tareas, presupuesto opcional y
// estado de avance. Dos vistas:
//   · Grid de tarjetas (una por proyecto).
//   · Detalle (tareas internas estilo Listas + presupuesto colapsable).
// En el repo TS real:
//   · src/pages/ProyectosPage.tsx
//   · src/components/app/proyectos/ProjectCard.tsx · ProjectDetail.tsx
//   · src/components/app/proyectos/ProjectFormDialog.tsx · BudgetSection.tsx
//   · src/store/projects.ts
// Reaprovecha primitivos compartidos (AlDialog, AlPrimary, AlGhost, AlFormLabel,
// AlTextInput…) de alimentacion.jsx y la moneda formatCLP() de finanzas.jsx.
// ─────────────────────────────────────────────────────────────────────────────

// ─── iconos line locales (24×24, stroke 1.6) ───────────────────────────────
const PI = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...props} />
);

const IconPr_House = (p) => (
  <PI {...p}>
    <path d="M3.5 10.5 12 3.5l8.5 7"/>
    <path d="M5 9.5V20a.5.5 0 0 0 .5.5H9.5V14h5v6.5h4a.5.5 0 0 0 .5-.5V9.5"/>
  </PI>
);
const IconPr_Hammer = (p) => (
  <PI {...p}>
    <path d="M12.5 9 4.7 16.8a1.9 1.9 0 0 0 2.7 2.7L15.2 11.7"/>
    <path d="M16 14.5 19.5 11"/>
    <path d="M18.7 11.8 14 7.1a4.4 4.4 0 0 0-3.1-1.3H8.6l.9.8a4.9 4.9 0 0 1 1.6 3.6V11l1.6 1.6h.7a2.6 2.6 0 0 1 1.8.7l1 1"/>
  </PI>
);
const IconPr_Sofa = (p) => (
  <PI {...p}>
    <path d="M4.5 11V8.5A2.5 2.5 0 0 1 7 6h10a2.5 2.5 0 0 1 2.5 2.5V11"/>
    <path d="M4.5 11a2 2 0 0 0-2 2v3.5h19V13a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1.5H6.5V13a2 2 0 0 0-2-2Z"/>
    <path d="M5.5 16.5V19M18.5 16.5V19"/>
  </PI>
);
const IconPr_Tree = (p) => (
  <PI {...p}>
    <path d="M12 3 6.5 11h3l-3 4.5h11L14.5 11h3L12 3Z"/>
    <path d="M12 15.5V21"/>
  </PI>
);
const IconPr_Key = (p) => (
  <PI {...p}>
    <circle cx="8" cy="8" r="4"/>
    <path d="M10.9 10.9 20 20"/>
    <path d="m16.5 16.5 2-2M13.5 13.5l2-2"/>
  </PI>
);
const IconPr_Brush = (p) => (
  <PI {...p}>
    <path d="M20 4 9.5 14.5"/>
    <path d="m13 7.5 3.5 3.5"/>
    <path d="M9.5 14.5c-1.6-.5-3.2.6-3.7 2.2C5.4 18 4.4 19.5 3 20c1.6 1 4.2.6 5.8-1 1.1-1.1 1.3-2.7.5-3.8"/>
  </PI>
);
const IconPr_Box = (p) => (
  <PI {...p}>
    <path d="M3.5 7.5 12 4l8.5 3.5L12 11 3.5 7.5Z"/>
    <path d="M3.5 7.5v9L12 20l8.5-3.5v-9"/>
    <path d="M12 11v9"/>
  </PI>
);
const IconPr_Star = (p) => (
  <PI {...p}>
    <path d="M12 3.6l2.5 5.1 5.6.8-4 4 1 5.6L12 16.5 6.9 19.1l1-5.6-4-4 5.6-.8Z"/>
  </PI>
);

// Registro de los 8 íconos seleccionables
const PROJECT_ICONS = [
  { id: 'house',  name: 'Casa',      Icon: IconPr_House  },
  { id: 'hammer', name: 'Martillo',  Icon: IconPr_Hammer },
  { id: 'sofa',   name: 'Sofá',      Icon: IconPr_Sofa   },
  { id: 'tree',   name: 'Árbol',     Icon: IconPr_Tree   },
  { id: 'key',    name: 'Llave',     Icon: IconPr_Key    },
  { id: 'brush',  name: 'Pincel',    Icon: IconPr_Brush  },
  { id: 'box',    name: 'Caja',      Icon: IconPr_Box    },
  { id: 'star',   name: 'Estrella',  Icon: IconPr_Star   },
];
function getProjectIcon(id) {
  const found = PROJECT_ICONS.find(i => i.id === id);
  return (found || PROJECT_ICONS[0]).Icon;
}


// ─── estados ────────────────────────────────────────────────────────────────
const PROJECT_STATUS = [
  { id: 'pending', label: 'Pendiente',
    badge: 'bg-gray-100 text-gray-500 dark:bg-white/[.06] dark:text-night-softText',
    dot: 'bg-gray-300 dark:bg-white/30' },
  { id: 'active',  label: 'En curso',
    badge: 'bg-blue-100 text-blue-500 dark:bg-blue-500/15 dark:text-blue-300',
    dot: 'bg-blue-300 dark:bg-blue-400/70' },
  { id: 'done',    label: 'Completado',
    badge: 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-300',
    dot: 'bg-green-300 dark:bg-green-400/70' },
];
function getStatus(id) { return PROJECT_STATUS.find(s => s.id === id) || PROJECT_STATUS[0]; }


// ─── store de proyectos (pub/sub, mismo patrón que Listas/Hábitos) ──────────
// TODO: reemplazar por GET/POST /api/v1/projects
function buildDefaultProjects() {
  return [
    {
      id: 'p-gato', name: 'Casa del gato', icon: 'house', status: 'active',
      description: 'Construir una casita acogedora para Michi en el rincón del patio.',
      dueDate: null,
      budget: null,                 // sin presupuesto
      expenses: [],
      tasks: [
        { id: 'pg1', text: 'Medir el rincón del patio',   done: true  },
        { id: 'pg2', text: 'Comprar tablas de pino',       done: true  },
        { id: 'pg3', text: 'Cortar y lijar las piezas',    done: true  },
        { id: 'pg4', text: 'Armar la estructura',          done: false },
        { id: 'pg5', text: 'Poner cojín y mantita',        done: false },
      ],
    },
    {
      id: 'p-techo', name: 'Techo del patio', icon: 'hammer', status: 'pending',
      description: 'Instalar un techo retráctil para dar sombra en verano.',
      dueDate: '2026-09-15',
      budget: 280000,               // presupuesto estimado, sin gastos aún
      expenses: [],
      tasks: [
        { id: 'pt1', text: 'Pedir cotización de materiales', done: false },
        { id: 'pt2', text: 'Comprar perfiles y lona',        done: false },
        { id: 'pt3', text: 'Anclar la estructura al muro',   done: false },
        { id: 'pt4', text: 'Montar el sistema retráctil',    done: false },
      ],
    },
    {
      id: 'p-sillon', name: 'Sillón nuevo', icon: 'sofa', status: 'done',
      description: 'Renovar el sillón del living por uno más cómodo.',
      dueDate: '2026-04-20',
      budget: 150000,
      expenses: [
        { id: 'ps-e1', desc: 'Sillón 3 cuerpos (oferta)', amount: 129990, date: '2026-04-12' },
        { id: 'ps-e2', desc: 'Despacho a domicilio',       amount: 12000,  date: '2026-04-12' },
        { id: 'ps-e3', desc: 'Funda protectora',           amount: 8010,   date: '2026-04-18' },
      ],
      tasks: [
        { id: 'pl1', text: 'Medir el espacio del living',  done: true },
        { id: 'pl2', text: 'Comparar precios en tiendas',  done: true },
        { id: 'pl3', text: 'Comprar el sillón',            done: true },
        { id: 'pl4', text: 'Coordinar la entrega',         done: true },
      ],
    },
  ];
}
const ProjectsStore = hlMakeStore(buildDefaultProjects());

function projectSpent(p) {
  return (p.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
}


// ─── Checkbox redondeado (estilo Listas) ────────────────────────────────────
function PrCheck({ size = 14 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d="m5 12.5 4 4L19 7"/>
    </svg>
  );
}
function PrCheckbox({ done, onToggle, label }) {
  return (
    <button onClick={onToggle} role="checkbox" aria-checked={done} aria-label={label}
      className={`h-[22px] w-[22px] shrink-0 rounded-[8px] flex items-center justify-center
                  border transition-colors
                  ${done
                    ? 'bg-accent border-accent text-[hsl(var(--accent-strong))]'
                    : 'bg-transparent border-black/[.18] dark:border-white/[.22] text-transparent hover:border-accent'}`}>
      <PrCheck/>
    </button>
  );
}

// Barra de progreso de tareas (acento)
function TaskProgress({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="h-1.5 rounded-full bg-black/[.06] dark:bg-white/[.08] overflow-hidden">
      <div className="h-full rounded-full bg-accent transition-[width] duration-500"
           style={{ width: `${pct}%` }}/>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = getStatus(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      text-[11.5px] font-medium whitespace-nowrap ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`}/>
      {s.label}
    </span>
  );
}


// ─── Tarjeta de proyecto ─────────────────────────────────────────────────────
function ProjectCard({ project, onOpen }) {
  const Icon = getProjectIcon(project.icon);
  const total = project.tasks.length;
  const done = project.tasks.filter(t => t.done).length;
  const spent = projectSpent(project);
  const hasBudget = project.budget != null || spent > 0;

  return (
    <button onClick={() => onOpen(project.id)}
      className="text-left bg-white dark:bg-night-card rounded-3xl
                 border border-black/[.04] dark:border-white/[.05] shadow-subtle
                 p-5 flex flex-col gap-4 transition-all duration-200
                 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-12px_rgba(20,28,24,.18)]
                 hover:border-black/[.08] dark:hover:border-white/[.1]">
      {/* Cabecera: ícono + nombre + estado */}
      <div className="flex items-start gap-3.5">
        <span className="h-11 w-11 shrink-0 rounded-2xl bg-accent-tint text-accent
                         flex items-center justify-center">
          <Icon/>
        </span>
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="text-[15.5px] font-medium text-ink dark:text-night-text leading-snug truncate">
            {project.name}
          </h3>
          <div className="mt-1.5">
            <StatusBadge status={project.status}/>
          </div>
        </div>
      </div>

      {/* Progreso de tareas */}
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[12px] text-ink-soft dark:text-night-softText">Tareas</span>
          <span className="text-[12px] tabular-nums text-ink dark:text-night-text font-medium">
            {done}<span className="text-ink-mute dark:text-night-softText font-normal"> de {total}</span>
          </span>
        </div>
        <TaskProgress done={done} total={total}/>
      </div>

      {/* Presupuesto + fecha */}
      {(hasBudget || project.dueDate) && (
        <div className="space-y-1.5 pt-0.5">
          {hasBudget && (
            <div className="text-[12.5px] text-ink-soft dark:text-night-softText tabular-nums">
              {project.budget != null && (
                <span>Presupuesto: <span className="text-ink dark:text-night-text font-medium">{formatCLP(project.budget)}</span></span>
              )}
              {project.budget != null && <span className="text-ink-mute dark:text-night-softText"> · </span>}
              <span>Gastado: <span className="text-ink dark:text-night-text font-medium">{formatCLP(spent)}</span></span>
            </div>
          )}
          {project.dueDate && (
            <div className="text-[12px] text-ink-mute dark:text-night-softText">
              Fecha estimada: {hlShortDate(hlParse(project.dueDate))}
            </div>
          )}
        </div>
      )}
    </button>
  );
}


// ─── Diálogo crear / editar proyecto ────────────────────────────────────────
function ProjectFormDialog({ open, editing, onClose, onSubmit }) {
  const [name, setName] = React.useState('');
  const [icon, setIcon] = React.useState('house');
  const [status, setStatus] = React.useState('pending');
  const [description, setDescription] = React.useState('');
  const [budget, setBudget] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [err, setErr] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setErr('');
    setName(editing ? editing.name : '');
    setIcon(editing ? editing.icon : 'house');
    setStatus(editing ? editing.status : 'pending');
    setDescription(editing ? (editing.description || '') : '');
    setBudget(editing && editing.budget != null ? String(editing.budget) : '');
    setDueDate(editing ? (editing.dueDate || '') : '');
  }, [open, editing]);

  const submit = () => {
    if (!name.trim()) { setErr('Ponle un nombre al proyecto.'); return; }
    const cleanBudget = budget.replace(/\D/g, '');
    onSubmit({
      id: editing?.id,
      name: name.trim(),
      icon, status,
      description: description.trim(),
      budget: cleanBudget ? Number(cleanBudget) : null,
      dueDate: dueDate || null,
    });
  };

  return (
    <AlDialog
      open={open} onClose={onClose} maxW="sm:max-w-lg"
      title={editing ? 'Editar proyecto' : 'Nuevo proyecto'}
      subtitle="Dale un nombre, elige un ícono y, si quieres, un presupuesto estimado."
      footer={
        <React.Fragment>
          <AlGhost onClick={onClose}>Cancelar</AlGhost>
          <AlPrimary onClick={submit}>{editing ? 'Guardar cambios' : 'Crear proyecto'}</AlPrimary>
        </React.Fragment>
      }>
      <div className="space-y-4">
        <div>
          <AlFormLabel>Nombre</AlFormLabel>
          <AlTextInput
            value={name} onChange={setName} autoFocus
            placeholder="Ej. Techo del patio, Casa del gato…"/>
        </div>

        <div>
          <AlFormLabel hint="elige uno">Ícono</AlFormLabel>
          <div className="grid grid-cols-8 gap-2">
            {PROJECT_ICONS.map(({ id, name: iname, Icon }) => {
              const active = icon === id;
              return (
                <button key={id} type="button" onClick={() => setIcon(id)}
                  aria-label={iname} aria-pressed={active} title={iname}
                  className={`aspect-square rounded-2xl flex items-center justify-center
                              border transition-colors
                              ${active
                                ? 'bg-accent-tint border-accent text-accent'
                                : 'bg-paper-soft dark:bg-night-soft border-transparent text-ink-soft dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
                  <Icon/>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <AlFormLabel>Estado</AlFormLabel>
          <div className="flex flex-wrap gap-2">
            {PROJECT_STATUS.map(s => {
              const active = status === s.id;
              return (
                <button key={s.id} type="button" onClick={() => setStatus(s.id)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] border transition-colors
                              ${active
                                ? 'bg-accent-tint border-accent text-ink dark:text-night-text font-medium'
                                : 'border-black/[.08] dark:border-white/[.1] text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`}/>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <AlFormLabel hint="opcional">Descripción</AlFormLabel>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)}
            rows={2} placeholder="¿De qué trata este proyecto?"
            className="w-full rounded-2xl px-4 py-3 resize-none
                       bg-paper-soft dark:bg-night-soft
                       border border-transparent focus:border-accent
                       focus:bg-white dark:focus:bg-night outline-none
                       text-[14.5px] text-ink dark:text-night-text
                       placeholder:text-ink-mute dark:placeholder:text-night-softText transition-colors"/>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <AlFormLabel hint="opcional · CLP">Presupuesto</AlFormLabel>
            <AlTextInput
              value={budget ? formatCLP(Number(budget.replace(/\D/g, '') || 0)) : ''}
              onChange={(v) => setBudget(v.replace(/\D/g, ''))}
              placeholder="$0"/>
          </div>
          <div>
            <AlFormLabel hint="opcional">Fecha estimada</AlFormLabel>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-2xl px-4 py-3
                         bg-paper-soft dark:bg-night-soft
                         border border-transparent focus:border-accent
                         focus:bg-white dark:focus:bg-night outline-none
                         text-[14.5px] tabular-nums text-ink dark:text-night-text
                         [color-scheme:light] dark:[color-scheme:dark] transition-colors"/>
          </div>
        </div>
      </div>
      {err && <p className="text-[12.5px] text-red-600 dark:text-red-400 mt-3">{err}</p>}
    </AlDialog>
  );
}


// ─── Sección presupuesto (colapsable) ───────────────────────────────────────
function BudgetSection({ project, onAddExpense, onDeleteExpense }) {
  const [open, setOpen] = React.useState(true);
  const [adding, setAdding] = React.useState(false);
  const [desc, setDesc] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [date, setDate] = React.useState(hlIso(hlToday()));

  const spent = projectSpent(project);
  const total = project.budget;
  const pct = total ? Math.min(100, Math.round((spent / total) * 100)) : null;
  const remaining = total != null ? total - spent : null;

  const submit = (e) => {
    e.preventDefault();
    const cleanAmount = amount.replace(/\D/g, '');
    if (!desc.trim() || !cleanAmount) return;
    onAddExpense(project.id, { desc: desc.trim(), amount: Number(cleanAmount), date });
    setDesc(''); setAmount(''); setDate(hlIso(hlToday())); setAdding(false);
  };

  return (
    <div className="bg-white dark:bg-night-card rounded-3xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle overflow-hidden">
      {/* cabecera colapsable */}
      <button onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="w-full flex items-center gap-3 px-5 py-4 text-left
                   hover:bg-paper-soft/50 dark:hover:bg-night-soft/40 transition-colors">
        <span className="h-9 w-9 shrink-0 rounded-xl bg-accent-tint text-accent flex items-center justify-center">
          <IconPr_Box width="18" height="18"/>
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14.5px] font-medium text-ink dark:text-night-text">Presupuesto</h3>
          <div className="text-[12.5px] text-ink-soft dark:text-night-softText tabular-nums mt-0.5">
            {total != null
              ? <span>Gastado <span className="text-ink dark:text-night-text font-medium">{formatCLP(spent)}</span> de {formatCLP(total)}</span>
              : <span>Gastado <span className="text-ink dark:text-night-text font-medium">{formatCLP(spent)}</span> · sin tope definido</span>}
          </div>
        </div>
        <span className={`shrink-0 text-ink-mute dark:text-night-softText transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <IconAlChevDown width="18" height="18"/>
        </span>
      </button>

      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .28s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="px-5 pb-5">
            <div className="h-px bg-black/[.06] dark:bg-white/[.06] mb-4"/>

            {/* barra presupuesto vs gastado */}
            {total != null && (
              <div className="mb-4">
                <div className="h-2 rounded-full bg-black/[.06] dark:bg-white/[.08] overflow-hidden">
                  <div className={`h-full rounded-full transition-[width] duration-500
                                   ${pct >= 100 ? 'bg-red-300 dark:bg-red-400/70'
                                     : pct >= 85 ? 'bg-yellow-300 dark:bg-yellow-400/70'
                                     : 'bg-accent'}`}
                       style={{ width: `${pct}%` }}/>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[11.5px] tabular-nums
                                text-ink-mute dark:text-night-softText">
                  <span>{pct}% usado</span>
                  <span>{remaining >= 0 ? 'Disponible ' : 'Excedido '}{formatCLP(Math.abs(remaining))}</span>
                </div>
              </div>
            )}

            {/* lista de gastos */}
            <div className="text-[11px] font-medium uppercase tracking-[.08em]
                            text-ink-mute dark:text-night-softText mb-2 ml-0.5">
              Gastos del proyecto
            </div>
            <ul className="space-y-0.5">
              {project.expenses.map(e => (
                <li key={e.id}
                  className="group flex items-center gap-3 py-2 px-1.5 rounded-xl
                             hover:bg-paper-soft/70 dark:hover:bg-night-soft/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] text-ink dark:text-night-text truncate">{e.desc}</div>
                    <div className="text-[11.5px] text-ink-mute dark:text-night-softText">
                      {hlShortDate(hlParse(e.date))}
                    </div>
                  </div>
                  <div className="text-[14px] tabular-nums font-medium text-ink dark:text-night-text shrink-0">
                    {formatCLP(e.amount)}
                  </div>
                  <button onClick={() => onDeleteExpense(project.id, e.id)} aria-label="Eliminar gasto"
                    className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                               text-ink-mute opacity-0 group-hover:opacity-100 focus:opacity-100
                               hover:text-red-600 dark:hover:text-red-400
                               hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                    <IconAlTrash/>
                  </button>
                </li>
              ))}
              {project.expenses.length === 0 && (
                <li className="py-3 text-center text-[13px] text-ink-mute dark:text-night-softText">
                  Aún no hay gastos registrados.
                </li>
              )}
            </ul>

            {/* añadir gasto */}
            {adding ? (
              <form onSubmit={submit} className="mt-3 space-y-2 rounded-2xl p-3
                                                 bg-paper-soft/60 dark:bg-night-soft/50
                                                 border border-black/[.05] dark:border-white/[.06]">
                <input
                  value={desc} onChange={(e) => setDesc(e.target.value)} autoFocus
                  placeholder="Descripción del gasto"
                  className="w-full bg-white dark:bg-night rounded-xl px-3.5 py-2.5 outline-none
                             text-[14px] text-ink dark:text-night-text
                             border border-transparent focus:border-accent
                             placeholder:text-ink-mute dark:placeholder:text-night-softText transition-colors"/>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={amount ? formatCLP(Number(amount.replace(/\D/g, '') || 0)) : ''}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                    placeholder="$0" inputMode="numeric"
                    className="flex-1 bg-white dark:bg-night rounded-xl px-3.5 py-2.5 outline-none
                               text-[14px] tabular-nums text-ink dark:text-night-text
                               border border-transparent focus:border-accent
                               placeholder:text-ink-mute dark:placeholder:text-night-softText transition-colors"/>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="flex-1 bg-white dark:bg-night rounded-xl px-3.5 py-2.5 outline-none
                               text-[14px] tabular-nums text-ink dark:text-night-text
                               border border-transparent focus:border-accent
                               [color-scheme:light] dark:[color-scheme:dark] transition-colors"/>
                </div>
                <div className="flex items-center justify-end gap-2 pt-0.5">
                  <button type="button" onClick={() => { setAdding(false); setDesc(''); setAmount(''); }}
                    className="h-9 px-4 rounded-full text-[13px] font-medium text-ink dark:text-night-text
                               hover:bg-black/[.04] dark:hover:bg-white/[.06] transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={!desc.trim() || !amount.replace(/\D/g, '')}
                    className="h-9 px-4 rounded-full bg-accent text-[hsl(var(--accent-strong))]
                               font-medium text-[13px] hover:brightness-[.96] active:brightness-[.92]
                               disabled:opacity-40 disabled:cursor-not-allowed transition">
                    Guardar gasto
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={() => setAdding(true)}
                className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-full
                           border border-dashed border-black/[.14] dark:border-white/[.16]
                           text-[13.5px] font-medium text-ink-soft dark:text-night-softText
                           hover:border-accent hover:text-accent transition-colors">
                <IconAlPlus/> Añadir gasto
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Vista detalle ───────────────────────────────────────────────────────────
function ProjectDetail({ project, onBack, onEdit }) {
  const Icon = getProjectIcon(project.icon);
  const total = project.tasks.length;
  const done = project.tasks.filter(t => t.done).length;
  const [draft, setDraft] = React.useState('');

  const toggleTask = (taskId) => {
    ProjectsStore.set(prev => prev.map(p => p.id !== project.id ? p : {
      ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t),
    }));
  };
  const addTask = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    ProjectsStore.set(prev => prev.map(p => p.id !== project.id ? p : {
      ...p, tasks: [...p.tasks, { id: 'tk-' + Date.now(), text, done: false }],
    }));
    setDraft('');
  };
  const deleteTask = (taskId) => {
    ProjectsStore.set(prev => prev.map(p => p.id !== project.id ? p : {
      ...p, tasks: p.tasks.filter(t => t.id !== taskId),
    }));
  };
  const setStatus = (status) => {
    ProjectsStore.set(prev => prev.map(p => p.id !== project.id ? p : { ...p, status }));
  };
  const addExpense = (pid, exp) => {
    ProjectsStore.set(prev => prev.map(p => p.id !== pid ? p : {
      ...p, expenses: [...p.expenses, { id: 'ex-' + Date.now(), ...exp }],
    }));
  };
  const deleteExpense = (pid, exId) => {
    ProjectsStore.set(prev => prev.map(p => p.id !== pid ? p : {
      ...p, expenses: p.expenses.filter(e => e.id !== exId),
    }));
  };

  return (
    <div className="route-fade space-y-5">
      {/* volver + editar */}
      <div className="flex items-center justify-between">
        <button onClick={onBack}
          className="inline-flex items-center gap-2 h-9 pl-2 pr-3.5 rounded-full text-[13.5px]
                     text-ink-soft dark:text-night-softText
                     hover:bg-paper-soft dark:hover:bg-night-soft hover:text-ink dark:hover:text-night-text transition-colors">
          <IconAlBack/> Proyectos
        </button>
        <AlGhost icon={<IconAlEdit/>} onClick={() => onEdit(project)}>Editar</AlGhost>
      </div>

      {/* header */}
      <div className="bg-white dark:bg-night-card rounded-3xl
                      border border-black/[.04] dark:border-white/[.05] shadow-subtle p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="h-14 w-14 shrink-0 rounded-2xl bg-accent-tint text-accent
                           flex items-center justify-center">
            <span style={{ transform: 'scale(1.15)' }}><Icon/></span>
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] sm:text-[26px] font-medium tracking-tight text-ink dark:text-night-text leading-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-1.5 text-[14px] text-ink-soft dark:text-night-softText leading-relaxed max-w-2xl">
                {project.description}
              </p>
            )}
            {project.dueDate && (
              <p className="mt-2 text-[12.5px] text-ink-mute dark:text-night-softText">
                Fecha estimada: {hlShortDate(hlParse(project.dueDate))}
              </p>
            )}
          </div>
        </div>

        {/* estado editable */}
        <div className="mt-5">
          <div className="text-[11px] font-medium uppercase tracking-[.08em]
                          text-ink-mute dark:text-night-softText mb-2 ml-0.5">
            Estado
          </div>
          <div className="flex flex-wrap gap-2">
            {PROJECT_STATUS.map(s => {
              const active = project.status === s.id;
              return (
                <button key={s.id} onClick={() => setStatus(s.id)} aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] border transition-colors
                              ${active
                                ? 'bg-accent-tint border-accent text-ink dark:text-night-text font-medium'
                                : 'border-black/[.08] dark:border-white/[.1] text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`}/>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* tareas */}
      <div className="bg-white dark:bg-night-card rounded-3xl
                      border border-black/[.04] dark:border-white/[.05] shadow-subtle p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14.5px] font-medium text-ink dark:text-night-text">Tareas</h3>
          <span className="text-[12.5px] tabular-nums text-ink-soft dark:text-night-softText">
            <span className="text-ink dark:text-night-text font-medium">{done}</span> de {total} completadas
          </span>
        </div>
        <TaskProgress done={done} total={total}/>

        <ul className="mt-4 space-y-0.5">
          {project.tasks.map(t => (
            <li key={t.id}
              className="group flex items-center gap-3 py-2 px-1.5 rounded-xl
                         hover:bg-paper-soft/70 dark:hover:bg-night-soft/50 transition-colors">
              <PrCheckbox done={t.done} onToggle={() => toggleTask(t.id)} label={t.text}/>
              <span className={`flex-1 text-[14px] transition-colors
                                ${t.done
                                  ? 'line-through text-ink-mute dark:text-night-softText opacity-60'
                                  : 'text-ink dark:text-night-text'}`}>
                {t.text}
              </span>
              <button onClick={() => deleteTask(t.id)} aria-label="Eliminar tarea"
                className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                           text-ink-mute opacity-0 group-hover:opacity-100 focus:opacity-100
                           hover:text-red-600 dark:hover:text-red-400
                           hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                <IconAlTrash/>
              </button>
            </li>
          ))}
          {project.tasks.length === 0 && (
            <li className="py-3 text-center text-[13px] text-ink-mute dark:text-night-softText">
              Añade la primera tarea a este proyecto.
            </li>
          )}
        </ul>

        {/* añadir tarea inline */}
        <form onSubmit={addTask} className="mt-3 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5
                          bg-paper-soft dark:bg-night-soft
                          border border-transparent focus-within:border-accent
                          focus-within:bg-white dark:focus-within:bg-night transition-colors">
            <span className="text-ink-mute dark:text-night-softText shrink-0"><IconAlPlus/></span>
            <input
              value={draft} onChange={(e) => setDraft(e.target.value)}
              placeholder="Añadir tarea…"
              className="w-full bg-transparent outline-none text-[14px]
                         placeholder:text-ink-mute dark:placeholder:text-night-softText
                         text-ink dark:text-night-text"/>
          </div>
          <button type="submit" disabled={!draft.trim()}
            className="shrink-0 h-10 px-4 rounded-2xl bg-accent text-[hsl(var(--accent-strong))]
                       font-medium text-[13.5px] hover:brightness-[.96] active:brightness-[.92]
                       disabled:opacity-40 disabled:cursor-not-allowed transition">
            Añadir
          </button>
        </form>
      </div>

      {/* presupuesto */}
      <BudgetSection project={project} onAddExpense={addExpense} onDeleteExpense={deleteExpense}/>
    </div>
  );
}


// ─── Página ─────────────────────────────────────────────────────────────────
function ProyectosPage() {
  const [projects] = useStore(ProjectsStore);
  const [selectedId, setSelectedId] = React.useState(null);
  const [dialog, setDialog] = React.useState({ open: false, editing: null });
  const [confirm, setConfirm] = React.useState(null);

  const selected = projects.find(p => p.id === selectedId) || null;

  const handleSubmit = (payload) => {
    if (payload.id) {
      ProjectsStore.set(prev => prev.map(p => p.id === payload.id ? {
        ...p,
        name: payload.name, icon: payload.icon, status: payload.status,
        description: payload.description, budget: payload.budget, dueDate: payload.dueDate,
      } : p));
    } else {
      const id = 'p-' + Date.now();
      ProjectsStore.set(prev => [...prev, {
        id, name: payload.name, icon: payload.icon, status: payload.status,
        description: payload.description, budget: payload.budget, dueDate: payload.dueDate,
        expenses: [], tasks: [],
      }]);
    }
    setDialog({ open: false, editing: null });
  };
  const handleDelete = (p) => {
    ProjectsStore.set(prev => prev.filter(x => x.id !== p.id));
    setConfirm(null);
    setSelectedId(null);
  };

  return (
    <PageShell title="Proyectos">
      {selected ? (
        <ProjectDetail
          project={selected}
          onBack={() => setSelectedId(null)}
          onEdit={(p) => setDialog({ open: true, editing: p })}/>
      ) : (
        <div className="route-fade">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[14px] text-ink-soft dark:text-night-softText max-w-md">
              Iniciativas del hogar con sus tareas, presupuesto y avance.
            </p>
            <button onClick={() => setDialog({ open: true, editing: null })}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full
                         bg-accent text-[hsl(var(--accent-strong))] font-medium text-[13.5px]
                         hover:brightness-[.96] active:brightness-[.92] transition">
              <IconAlPlus/> Nuevo proyecto
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white dark:bg-night-card rounded-3xl
                            border border-black/[.04] dark:border-white/[.05] shadow-subtle
                            p-10 sm:p-14 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-3xl bg-accent-tint text-accent flex items-center justify-center mb-4">
                <span style={{ transform: 'scale(1.4)' }}><IconPr_Hammer/></span>
              </div>
              <h3 className="text-[15px] font-medium text-ink dark:text-night-text">Aún no hay proyectos</h3>
              <p className="mt-1.5 text-[13px] text-ink-soft dark:text-night-softText max-w-xs">
                Crea tu primer proyecto del hogar — un arreglo, una mejora, lo que tengas en mente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
              {projects.map(p => (
                <ProjectCard key={p.id} project={p} onOpen={setSelectedId}/>
              ))}
            </div>
          )}
        </div>
      )}

      <ProjectFormDialog
        open={dialog.open} editing={dialog.editing}
        onClose={() => setDialog({ open: false, editing: null })}
        onSubmit={handleSubmit}/>

      {/* Confirmar borrado (accesible desde el diálogo de edición) */}
      <AlDialog
        open={!!confirm} onClose={() => setConfirm(null)} maxW="sm:max-w-sm"
        title="Eliminar proyecto"
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
            Se borrarán sus tareas y gastos.
          </p>
        )}
      </AlDialog>
    </PageShell>
  );
}

Object.assign(window, { ProyectosPage });
