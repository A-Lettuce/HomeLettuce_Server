// Home Lettuce — Tareas
// ─────────────────────────────────────────────────────────────────────────────
// Página con selector de foco (pills): "Tareas" | "Listas".
//   · FOCO Tareas → vista actual (sin cambios).
//   · FOCO Listas → tarjetas de listas con ítems plegables.
// En el repo TS real:
//   · src/pages/TareasPage.tsx
//   · src/components/app/lists/ListCard.tsx · ListFormDialog.tsx
//   · src/store/lists.ts
// Reaprovecha primitivos compartidos (AlTabs, AlDialog, AlPrimary…) de
// alimentacion.jsx, igual que Hábitos reutiliza el patrón de tarjeta.
// ─────────────────────────────────────────────────────────────────────────────

// ─── iconos line locales (24×24, stroke 1.6) ───────────────────────────────
const TI = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...props} />
);

const IconTk_Cart = (p) => (
  <TI {...p}>
    <path d="M3 4h2l1.4 11.2a1.5 1.5 0 0 0 1.5 1.3h8.3a1.5 1.5 0 0 0 1.5-1.2L19 7.5H6.2"/>
    <circle cx="9" cy="20" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="17" cy="20" r="1.3" fill="currentColor" stroke="none"/>
  </TI>
);
const IconTk_Suitcase = (p) => (
  <TI {...p}>
    <rect x="3.5" y="7.5" width="17" height="12.5" rx="2.5"/>
    <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5"/>
    <path d="M3.5 12.5h17"/>
  </TI>
);
const IconTk_Tools = (p) => (
  <TI {...p}>
    <path d="M14.5 6.5a3.5 3.5 0 0 0 4.6 4.6L20 12l-7.5 7.5a2 2 0 0 1-2.8-2.8L17.2 9 18.1 8a3.5 3.5 0 0 0-3.6-1.5Z"/>
    <path d="m6 14-1.6 1.6a2 2 0 0 0 0 2.8 2 2 0 0 0 2.8 0L9 16.8"/>
  </TI>
);
const IconTk_Star = (p) => (
  <TI {...p}>
    <path d="M12 3.6l2.5 5.1 5.6.8-4 4 1 5.6L12 16.5 6.9 19.1l1-5.6-4-4 5.6-.8Z"/>
  </TI>
);
const IconTk_Heart = (p) => (
  <TI {...p}>
    <path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 7.6 4.1 4.1 0 0 1 19 10.6c0 5-7 9.4-7 9.4Z"/>
  </TI>
);
const IconTk_Pin = (p) => (
  <TI {...p}>
    <path d="M12 21s6-5.2 6-10a6 6 0 0 0-12 0c0 4.8 6 10 6 10Z"/>
    <circle cx="12" cy="11" r="2.2"/>
  </TI>
);
const IconTk_Plus = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...p}>
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconTk_Check = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
       strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...p}>
    <path d="m5 12.5 4 4L19 7"/>
  </svg>
);
const IconTk_Chevron = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...p}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const IconTk_List = (p) => (
  <TI {...p}>
    <path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11"/>
    <circle cx="4.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none"/>
    <circle cx="4.5" cy="17.5" r="1" fill="currentColor" stroke="none"/>
  </TI>
);

// Registro de los 6 íconos seleccionables
const LIST_ICONS = [
  { id: 'cart',     name: 'Carrito',      Icon: IconTk_Cart },
  { id: 'suitcase', name: 'Maleta',       Icon: IconTk_Suitcase },
  { id: 'tools',    name: 'Herramientas', Icon: IconTk_Tools },
  { id: 'star',     name: 'Estrella',     Icon: IconTk_Star },
  { id: 'heart',    name: 'Corazón',      Icon: IconTk_Heart },
  { id: 'pin',      name: 'Ubicación',    Icon: IconTk_Pin },
];
function getListIcon(id) {
  const found = LIST_ICONS.find(i => i.id === id);
  return (found || LIST_ICONS[0]).Icon;
}


// ─── store de listas (pub/sub, mismo patrón que Hábitos) ────────────────────
// TODO: reemplazar por GET/POST /api/v1/lists
function buildDefaultLists() {
  return [
    {
      id: 'l-super', name: 'Supermercado', icon: 'cart',
      items: [
        { id: 's1', text: 'Tomates cherry',     done: true  },
        { id: 's2', text: 'Pan de masa madre',  done: false },
        { id: 's3', text: 'Leche de avena',     done: false },
        { id: 's4', text: 'Aguacates maduros',  done: true  },
        { id: 's5', text: 'Café en grano',      done: false },
        { id: 's6', text: 'Huevos camperos',    done: false },
      ],
    },
    {
      id: 'l-techo', name: 'Proyecto techo', icon: 'tools',
      items: [
        { id: 't1', text: 'Comprar tornillos largos', done: false },
        { id: 't2', text: 'Lijar las vigas',          done: true  },
        { id: 't3', text: 'Aplicar sellador',         done: false },
        { id: 't4', text: 'Llamar al carpintero',     done: true  },
        { id: 't5', text: 'Pintar el acabado',        done: false },
      ],
    },
  ];
}
const ListsStore = hlMakeStore(buildDefaultLists());


// ─── Checkbox redondeado (estilo IconTasks de la app) ───────────────────────
function ListCheckbox({ done, onToggle, label }) {
  return (
    <button onClick={onToggle} role="checkbox" aria-checked={done} aria-label={label}
      className={`h-[22px] w-[22px] shrink-0 rounded-[8px] flex items-center justify-center
                  border transition-colors
                  ${done
                    ? 'bg-accent border-accent text-[hsl(var(--accent-strong))]'
                    : 'bg-transparent border-black/[.18] dark:border-white/[.22] text-transparent hover:border-accent'}`}>
      <IconTk_Check/>
    </button>
  );
}


// ─── Tarjeta de lista (plegable) ────────────────────────────────────────────
function ListCard({ list, expanded, onToggleExpand, onToggleItem, onAddItem, onEdit, onDelete }) {
  const Icon = getListIcon(list.icon);
  const total = list.items.length;
  const pending = list.items.filter(i => !i.done).length;
  const allDone = total > 0 && pending === 0;
  const [draft, setDraft] = React.useState('');

  const submitItem = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onAddItem(list.id, text);
    setDraft('');
  };

  return (
    <div className="bg-white dark:bg-night-card rounded-3xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle
                    overflow-hidden transition-shadow">
      {/* Cabecera plegable (zona clicable) */}
      <button onClick={() => onToggleExpand(list.id)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3.5 p-4 sm:p-5 text-left
                   hover:bg-paper-soft/50 dark:hover:bg-night-soft/40 transition-colors">
        <span className="h-11 w-11 shrink-0 rounded-2xl bg-accent-tint text-accent
                         flex items-center justify-center">
          <Icon/>
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15.5px] font-medium text-ink dark:text-night-text truncate">
            {list.name}
          </h3>
          <div className="mt-0.5 text-[12.5px] text-ink-soft dark:text-night-softText">
            {total === 0 ? (
              <span className="text-ink-mute dark:text-night-softText">Lista vacía</span>
            ) : allDone ? (
              <span className="inline-flex items-center gap-1 text-accent">
                <IconTk_Check width="12" height="12"/> Completada
              </span>
            ) : (
              <span>
                <span className="font-medium text-ink dark:text-night-text tabular-nums">{pending}</span>
                {' '}pendiente{pending === 1 ? '' : 's'}
                <span className="text-ink-mute dark:text-night-softText"> · de {total}</span>
              </span>
            )}
          </div>
        </div>
        <span className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                          text-ink-mute dark:text-night-softText transition-transform duration-300
                          ${expanded ? 'rotate-180' : ''}`}>
          <IconTk_Chevron/>
        </span>
      </button>

      {/* Cuerpo plegable (grid-rows 0fr→1fr para animar) */}
      <div style={{
              display: 'grid',
              gridTemplateRows: expanded ? '1fr' : '0fr',
              transition: 'grid-template-rows .28s ease',
            }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="px-4 sm:px-5 pb-4 sm:pb-5">
            <div className="h-px bg-black/[.06] dark:bg-white/[.06] mb-2"/>

            <ul className="space-y-0.5">
              {list.items.map(item => (
                <li key={item.id}>
                  <label className="flex items-center gap-3 py-2 px-1.5 rounded-xl cursor-pointer
                                    hover:bg-paper-soft/70 dark:hover:bg-night-soft/50 transition-colors">
                    <ListCheckbox
                      done={item.done}
                      onToggle={() => onToggleItem(list.id, item.id)}
                      label={item.text}/>
                    <span className={`text-[14px] transition-colors
                                      ${item.done
                                        ? 'line-through text-ink-mute dark:text-night-softText opacity-60'
                                        : 'text-ink dark:text-night-text'}`}>
                      {item.text}
                    </span>
                  </label>
                </li>
              ))}
              {list.items.length === 0 && (
                <li className="py-3 text-center text-[13px] text-ink-mute dark:text-night-softText">
                  Añade el primer ítem a esta lista.
                </li>
              )}
            </ul>

            {/* Añadir ítem */}
            <form onSubmit={submitItem} className="mt-2 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5
                              bg-paper-soft dark:bg-night-soft
                              border border-transparent focus-within:border-accent
                              focus-within:bg-white dark:focus-within:bg-night transition-colors">
                <span className="text-ink-mute dark:text-night-softText shrink-0"><IconTk_Plus/></span>
                <input
                  value={draft} onChange={(e) => setDraft(e.target.value)}
                  placeholder="Añadir ítem…"
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

            {/* Acciones de lista */}
            <div className="flex items-center justify-end gap-1 mt-3">
              <button onClick={() => onEdit(list)} aria-label="Editar lista"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12.5px]
                           text-ink-soft dark:text-night-softText
                           hover:bg-paper-soft dark:hover:bg-night-soft
                           hover:text-ink dark:hover:text-night-text transition-colors">
                <IconAlEdit/> Editar
              </button>
              <button onClick={() => onDelete(list)} aria-label="Eliminar lista"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12.5px]
                           text-ink-mute hover:text-red-600 dark:hover:text-red-400
                           hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                <IconAlTrash/> Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Diálogo crear / editar lista ───────────────────────────────────────────
function ListFormDialog({ open, editing, onClose, onSubmit }) {
  const [name, setName] = React.useState('');
  const [icon, setIcon] = React.useState('cart');
  const [err, setErr] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setErr('');
    setName(editing ? editing.name : '');
    setIcon(editing ? editing.icon : 'cart');
  }, [open, editing]);

  const submit = () => {
    if (!name.trim()) { setErr('Ponle un nombre a la lista.'); return; }
    onSubmit({ id: editing?.id, name: name.trim(), icon });
  };

  return (
    <AlDialog
      open={open} onClose={onClose} maxW="sm:max-w-md"
      title={editing ? 'Editar lista' : 'Nueva lista'}
      subtitle="Dale un nombre y elige un ícono para reconocerla de un vistazo."
      footer={
        <React.Fragment>
          <AlGhost onClick={onClose}>Cancelar</AlGhost>
          <AlPrimary onClick={submit}>{editing ? 'Guardar cambios' : 'Crear lista'}</AlPrimary>
        </React.Fragment>
      }>
      <div className="space-y-4">
        <div>
          <AlFormLabel>Nombre</AlFormLabel>
          <AlTextInput
            value={name} onChange={setName} autoFocus
            placeholder="Ej. Supermercado, Viaje a la playa…"/>
        </div>
        <div>
          <AlFormLabel hint="opcional">Ícono</AlFormLabel>
          <div className="grid grid-cols-6 gap-2">
            {LIST_ICONS.map(({ id, name: iname, Icon }) => {
              const active = icon === id;
              return (
                <button key={id} type="button" onClick={() => setIcon(id)}
                  aria-label={iname} aria-pressed={active}
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
      </div>
      {err && <p className="text-[12.5px] text-red-600 dark:text-red-400 mt-3">{err}</p>}
    </AlDialog>
  );
}


// ─── Vista: FOCO Listas ─────────────────────────────────────────────────────
function ListasView() {
  const [lists] = useStore(ListsStore);
  const [expandedId, setExpandedId] = React.useState(() => (buildDefaultLists()[0] || {}).id);
  const [dialog, setDialog] = React.useState({ open: false, editing: null });
  const [confirm, setConfirm] = React.useState(null);

  const toggleExpand = (id) => setExpandedId(cur => (cur === id ? null : id));

  const toggleItem = (listId, itemId) => {
    ListsStore.set(prev => prev.map(l => l.id !== listId ? l : {
      ...l,
      items: l.items.map(it => it.id === itemId ? { ...it, done: !it.done } : it),
    }));
  };
  const addItem = (listId, text) => {
    ListsStore.set(prev => prev.map(l => l.id !== listId ? l : {
      ...l,
      items: [...l.items, { id: 'it-' + Date.now(), text, done: false }],
    }));
  };
  const handleSubmit = (payload) => {
    if (payload.id) {
      ListsStore.set(prev => prev.map(l => l.id === payload.id
        ? { ...l, name: payload.name, icon: payload.icon } : l));
    } else {
      const id = 'l-' + Date.now();
      ListsStore.set(prev => [...prev, { id, name: payload.name, icon: payload.icon, items: [] }]);
      setExpandedId(id);
    }
    setDialog({ open: false, editing: null });
  };
  const handleDelete = (l) => {
    ListsStore.set(prev => prev.filter(x => x.id !== l.id));
    setConfirm(null);
  };

  return (
    <div className="route-fade">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-medium text-ink dark:text-night-text">
          Tus listas
          <span className="ml-2 text-[12px] text-ink-mute dark:text-night-softText tabular-nums">{lists.length}</span>
        </h2>
        <button onClick={() => setDialog({ open: true, editing: null })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full
                     bg-accent text-[hsl(var(--accent-strong))] font-medium text-[13.5px]
                     hover:brightness-[.96] active:brightness-[.92] transition">
          <IconTk_Plus/> Nueva lista
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="bg-white dark:bg-night-card rounded-3xl
                        border border-black/[.04] dark:border-white/[.05] shadow-subtle
                        p-10 sm:p-14 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-3xl bg-accent-tint text-accent flex items-center justify-center mb-4">
            <span style={{ transform: 'scale(1.4)' }}><IconTk_List/></span>
          </div>
          <h3 className="text-[15px] font-medium text-ink dark:text-night-text">Aún no hay listas</h3>
          <p className="mt-1.5 text-[13px] text-ink-soft dark:text-night-softText max-w-xs">
            Crea tu primera lista — la compra, un proyecto, lo que sea — y añade sus ítems.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
          {lists.map(l => (
            <ListCard key={l.id} list={l}
              expanded={expandedId === l.id}
              onToggleExpand={toggleExpand}
              onToggleItem={toggleItem}
              onAddItem={addItem}
              onEdit={(li) => setDialog({ open: true, editing: li })}
              onDelete={(li) => setConfirm(li)}/>
          ))}
        </div>
      )}

      <ListFormDialog
        open={dialog.open} editing={dialog.editing}
        onClose={() => setDialog({ open: false, editing: null })}
        onSubmit={handleSubmit}/>

      <AlDialog
        open={!!confirm} onClose={() => setConfirm(null)} maxW="sm:max-w-sm"
        title="Eliminar lista"
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
            Se borrarán también sus ítems.
          </p>
        )}
      </AlDialog>
    </div>
  );
}


// ─── Vista: FOCO Tareas (estado actual, sin cambios) ────────────────────────
function TareasFocusView() {
  return (
    <div className="route-fade mt-6 sm:mt-10 flex flex-col items-center text-center max-w-md mx-auto">
      <div className="h-20 w-20 rounded-3xl bg-accent-tint flex items-center justify-center mb-5">
        <span className="text-accent" style={{ transform: 'scale(1.6)' }}><IconTasks/></span>
      </div>
      <h2 className="text-lg font-medium text-ink dark:text-night-text">
        Aún no hay nada por aquí
      </h2>
      <p className="text-[14px] text-ink-soft dark:text-night-softText mt-2 leading-relaxed">
        Una lista limpia para lo que tienes que hacer hoy y esta semana.
      </p>
    </div>
  );
}


// ─── Página ─────────────────────────────────────────────────────────────────
function TareasPage() {
  const [focus, setFocus] = React.useState(() => {
    try { return localStorage.getItem('hl.tareas.focus') || 'tareas'; } catch (_) { return 'tareas'; }
  });
  const changeFocus = (v) => {
    setFocus(v);
    try { localStorage.setItem('hl.tareas.focus', v); } catch (_) {}
  };

  return (
    <PageShell title="Tareas">
      <div className="-mt-2 mb-7">
        <AlTabs value={focus} onChange={changeFocus}>
          <AlTabsList>
            <AlTabsTrigger value="tareas" icon={<IconTasks width="17" height="17"/>}>Tareas</AlTabsTrigger>
            <AlTabsTrigger value="listas" icon={<IconTk_List width="17" height="17"/>}>Listas</AlTabsTrigger>
          </AlTabsList>
        </AlTabs>
      </div>

      {focus === 'listas' ? <ListasView/> : <TareasFocusView/>}
    </PageShell>
  );
}

Object.assign(window, { TareasPage });
