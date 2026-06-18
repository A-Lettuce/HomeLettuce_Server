// Home Lettuce — App shell + router

// ── nav plano (para BottomNav y fallback) ──────────────────
const NAV = [
  { id: 'inicio',     label: 'Inicio',       Icon: IconHome,    section: 'main' },
  { id: 'calendario', label: 'Calendario',   Icon: IconCalendar, section: 'main' },
  { id: 'tareas',     label: 'Tareas',       Icon: IconTasks,   section: 'main' },
  { id: 'habitos',    label: 'Hábitos',      Icon: IconHabit,   section: 'main' },
  { id: 'proyectos',  label: 'Proyectos',    Icon: IconHammer,  section: 'main' },
  { id: 'cine',        label: 'Cine',         Icon: IconCinema,  section: 'leisure' },
  { id: 'musica',     label: 'Música',       Icon: IconMusic,   section: 'leisure' },
  { id: 'salud',      label: 'Salud',        Icon: IconHeart,   section: 'health' },
  { id: 'finanzas',   label: 'Finanzas',     Icon: IconFinance, section: 'life' },
  { id: 'vantop',     label: 'Vantop Panel', Icon: IconChartBar, section: 'work',
    href: 'https://home-lettuce.com/vantop-dashboard', external: true },
];

// ── sub-navs de acordeón ────────────────────────────────────
const SALUD_SUBNAV = [
  { id: 'salud',        label: 'Resumen' },
  { id: 'salud-fis',    label: 'Estado físico', badge: 'Pronto' },
  { id: 'alimentacion', label: 'Alimentación' },
  { id: 'salud-con',    label: 'Consumo',       badge: 'Pronto' },
  { id: 'salud-emo',    label: 'Emociones',     badge: 'Pronto' },
];

const FIN_SUBNAV = [
  { id: 'finanzas', label: 'Resumen' },
  { id: 'fin-tar',  label: 'Tarjetas' },
  { id: 'fin-pre',  label: 'Presupuestos' },
  { id: 'fin-mov',  label: 'Movimientos' },
  { id: 'fin-gas',  label: 'Gastos fijos' },
  { id: 'fin-per',  label: 'Personal',    badge: 'Privado' },
];

const TL_SUBNAV = [
  { id: 'cine',   label: 'Cine' },
  { id: 'musica', label: 'Música', badge: 'Próximamente' },
];

const SALUD_IDS = new Set(SALUD_SUBNAV.map(i => i.id));
const FIN_IDS   = new Set(FIN_SUBNAV.map(i => i.id));
const TL_IDS    = new Set(TL_SUBNAV.map(i => i.id));

const PAGE_META = {
  inicio:       { title: 'Inicio',        subtitle: 'Tu panel de bienvenida.' },
  calendario:   { title: 'Calendario',    subtitle: 'Aquí verás tus próximos eventos y podrás organizar tu agenda.' },
  tareas:       { title: 'Tareas',        subtitle: 'Una lista limpia para lo que tienes que hacer hoy y esta semana.' },
  habitos:      { title: 'Hábitos',       subtitle: 'Define tus rutinas y haz seguimiento día a día.' },
  proyectos:    { title: 'Proyectos',     subtitle: 'Iniciativas del hogar con tareas, presupuesto y avance.' },
  alimentacion: { title: 'Alimentación',  subtitle: 'Despensa, recetas y planificación de comidas para la casa.' },
  finanzas:     { title: 'Finanzas',      subtitle: 'Gastos, ingresos y suscripciones — todo en un solo sitio.' },
  cine:         { title: 'Cine',          subtitle: 'Tu lista de películas y series para ver con calma.' },
  musica:       { title: 'Música',        subtitle: 'Tus playlists y colección musical.' },
  salud:        { title: 'Salud',         subtitle: 'Seguimiento de bienestar físico, emocional y hábitos de consumo.' },
  'salud-fis':  { title: 'Estado físico', subtitle: 'Actividad, descanso y energía día a día.' },
  'salud-con':  { title: 'Consumo',       subtitle: 'Seguimiento de consumo de azúcar, alcohol, pantallas y más.' },
  'salud-emo':  { title: 'Emociones',     subtitle: 'Registro de ánimo y salud mental.' },
  'fin-tar':    { title: 'Tarjetas',      subtitle: 'Resumen de tus tarjetas y cuentas.' },
  'fin-pre':    { title: 'Presupuestos',  subtitle: 'Gestión de presupuestos por categoría.' },
  'fin-mov':    { title: 'Movimientos',   subtitle: 'Historial de transacciones del hogar.' },
  'fin-gas':    { title: 'Gastos fijos',  subtitle: 'Gastos recurrentes y suscripciones.' },
  'fin-per':    { title: 'Personal',      subtitle: 'Tus finanzas personales (privado).' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "sage",
  "density": "regular"
}/*EDITMODE-END*/;

const PALETTES = [
  { value: 'sage',     label: 'Sage',     color: 'hsl(150,38%,76%)' },
  { value: 'mint',     label: 'Mint',     color: 'hsl(172,48%,78%)' },
  { value: 'sky',      label: 'Sky',      color: 'hsl(212,62%,83%)' },
  { value: 'lavender', label: 'Lavender', color: 'hsl(265,45%,82%)' },
  { value: 'rose',     label: 'Rose',     color: 'hsl(342,65%,84%)' },
  { value: 'coral',    label: 'Coral',    color: 'hsl(8,75%,82%)'   },
  { value: 'peach',    label: 'Peach',    color: 'hsl(22,78%,84%)'  },
  { value: 'sand',     label: 'Sand',     color: 'hsl(42,72%,82%)'  },
];

function useDarkMode() {
  const read = () => {
    try {
      const v = localStorage.getItem('hl.dark');
      if (v === '1') return true;
      if (v === '0') return false;
    } catch (_) {}
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  };
  const [dark, setDark] = React.useState(read);
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('hl.dark', dark ? '1' : '0'); } catch (_) {}
  }, [dark]);
  return [dark, setDark];
}

// ─── iconos locales ────────────────────────────────────────
const IconMenu = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20" {...p}>
    <path d="M4 7h16M4 12h16M4 17h16"/>
  </svg>
);

const IconChevronDown = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...p}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

// ─── Header ────────────────────────────────────────────────
function Header({ dark, onToggleDark, onLogout, username, email, onOpenNav, palette, onPalette }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md
                       bg-paper/80 dark:bg-night/80
                       border-b border-black/[.05] dark:border-white/[.05]">
      <div className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button onClick={onOpenNav}
            aria-label="Abrir menú"
            className="md:hidden h-9 w-9 -ml-0.5 rounded-full flex items-center justify-center
                       text-ink-soft dark:text-night-softText
                       hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
            <IconMenu/>
          </button>
          <LettuceMark size={26}/>
          <span className="text-[15px] sm:text-base font-medium tracking-tight
                           text-ink dark:text-night-text">
            Home Lettuce
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onToggleDark}
            aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="h-9 w-9 rounded-full flex items-center justify-center
                       text-ink-soft dark:text-night-softText
                       hover:bg-paper-soft dark:hover:bg-night-soft
                       transition-colors">
            {dark ? <IconSun/> : <IconMoon/>}
          </button>
          <UserMenu username={username} email={email} onLogout={onLogout}
                    palette={palette} onPalette={onPalette}/>
        </div>
      </div>
    </header>
  );
}

function UserMenu({ username, email, onLogout, palette, onPalette }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const initial = (username || '?').slice(0, 1).toUpperCase();
  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(o=>!o)}
        className="h-9 px-1.5 sm:px-2 rounded-full flex items-center gap-2
                   hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
        <span className="h-7 w-7 rounded-full bg-accent flex items-center justify-center
                         text-[12px] font-medium text-[hsl(var(--accent-strong))]">
          {initial}
        </span>
        <span className="hidden sm:inline text-[13px] text-ink dark:text-night-text pr-1">
          {username}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl
                        bg-white dark:bg-night-card
                        border border-black/[.05] dark:border-white/[.05]
                        shadow-subtle p-1.5 z-40">
          <div className="px-3 py-2 text-[11px] uppercase tracking-[.08em] text-ink-mute dark:text-night-softText">
            Sesión
          </div>
          <div className="px-3 pb-2 text-[13px] text-ink dark:text-night-text truncate">
            {email || username}
          </div>
          <div className="h-px bg-black/[.06] dark:bg-white/[.06] my-1"/>
          <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-[.08em] text-ink-mute dark:text-night-softText">
            Paleta
          </div>
          <div className="px-3 pb-2.5 grid grid-cols-4 gap-2.5">
            {PALETTES.map(({ value, label, color }) => (
              <button key={value} title={label}
                onClick={() => { onPalette(value); }}
                style={{ background: color }}
                className={`h-6 w-6 rounded-full transition-all
                            ${palette === value
                              ? 'ring-2 ring-offset-2 ring-black/25 dark:ring-white/35 scale-110'
                              : 'hover:scale-110 ring-1 ring-black/10'}`}
              />
            ))}
          </div>
          <div className="h-px bg-black/[.06] dark:bg-white/[.06] my-1"/>
          <button onClick={onLogout}
            className="w-full text-left px-3 py-2 rounded-xl text-[13px]
                       hover:bg-paper-soft dark:hover:bg-night-soft
                       text-ink dark:text-night-text transition-colors">
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

// ─── NavGroup (sección plana) ──────────────────────────────
function NavGroup({ label, items, current, onNavigate }) {
  return (
    <div>
      <div className="px-3 pb-1.5 text-[10.5px] font-medium uppercase tracking-[.1em]
                      text-ink-mute dark:text-night-softText">
        {label}
      </div>
      <ul className="space-y-0.5">
        {items.map(({ id, label, Icon, href, external }) => {
          const active = current === id;
          if (href) {
            return (
              <li key={id}>
                <a href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="group w-full flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-2xl
                             text-[14px] transition-colors relative
                             text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft hover:text-ink dark:hover:text-night-text">
                  <Icon/>
                  <span>{label}</span>
                </a>
              </li>
            );
          }
          return (
            <li key={id}>
              <button onClick={()=>onNavigate(id)}
                className={`group w-full flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-2xl
                            text-[14px] transition-colors relative
                            ${active
                              ? 'bg-accent-tint text-accent font-medium'
                              : 'text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft hover:text-ink dark:hover:text-night-text'}`}>
                {active && (
                  <span aria-hidden="true"
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-accent"/>
                )}
                <Icon/>
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── NavAccordion (categoría con hijos) ───────────────────
function NavAccordion({ label, Icon, items, current, onNavigate }) {
  const isChildActive = items.some(i => i.id === current);
  const [open, setOpen] = React.useState(isChildActive);

  React.useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 pl-3 pr-2 py-2.5 rounded-2xl
                    text-[14px] transition-colors
                    ${isChildActive
                      ? 'text-ink dark:text-night-text font-medium'
                      : 'text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft hover:text-ink dark:hover:text-night-text'}`}>
        <Icon/>
        <span className="flex-1 text-left">{label}</span>
        <span style={{ display:'flex', transition:'transform .2s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <IconChevronDown/>
        </span>
      </button>

      {open && (
        <div className="ml-[22px] pl-3 border-l border-black/[.07] dark:border-white/[.07] space-y-0.5 pb-0.5">
          {items.map(({ id, label, badge }) => {
            const active = current === id;
            return (
              <button key={id} onClick={() => onNavigate(id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl
                            text-[13.5px] transition-colors
                            ${active
                              ? 'bg-accent-tint text-accent font-medium'
                              : 'text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft hover:text-ink dark:hover:text-night-text'}`}>
                <span>{label}</span>
                {badge && (
                  <span className="text-[9.5px] font-semibold uppercase tracking-[.04em]
                                   px-2 py-0.5 rounded-full
                                   bg-paper-soft dark:bg-night-soft
                                   text-ink-mute dark:text-night-softText">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Side menu (desktop + drawer móvil) ───────────────────
function SideMenu({ current, onNavigate, open, onClose }) {
  const main = NAV.filter(n => n.section === 'main');
  const work = NAV.filter(n => n.section === 'work');

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const navAnd = (id) => { onNavigate(id); onClose && onClose(); };

  const groups = (handler) => (
    <React.Fragment>
      <NavGroup label="General" items={main} current={current} onNavigate={handler}/>
      <div className="my-3 mx-3 h-px bg-black/[.06] dark:bg-white/[.06]"/>
      <NavAccordion label="Salud"        Icon={IconHeart}   items={SALUD_SUBNAV} current={current} onNavigate={handler}/>
      <NavAccordion label="Finanzas"     Icon={IconFinance} items={FIN_SUBNAV}   current={current} onNavigate={handler}/>
      <NavAccordion label="Tiempo Libre" Icon={IconCinema}  items={TL_SUBNAV}    current={current} onNavigate={handler}/>
      <div className="my-3 mx-3 h-px bg-black/[.06] dark:bg-white/[.06]"/>
      <NavGroup label="Trabajo" items={work} current={current} onNavigate={handler}/>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      {/* Desktop — estático */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 px-3 py-6 gap-1">
        {groups(onNavigate)}
      </aside>

      {/* Móvil — drawer lateral */}
      <div className={`md:hidden fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
           aria-hidden={!open}>
        <div onClick={onClose}
             className={`absolute inset-0 bg-black/40 transition-opacity duration-300
                         ${open ? 'opacity-100' : 'opacity-0'}`}/>
        <aside
          role="dialog" aria-modal="true" aria-label="Menú de navegación"
          className={`absolute left-0 top-0 bottom-0 w-72 max-w-[82vw]
                      bg-paper dark:bg-night shadow-xl
                      border-r border-black/[.06] dark:border-white/[.06]
                      flex flex-col transition-transform duration-300 ease-out
                      ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-14 px-4 flex items-center justify-between shrink-0
                          border-b border-black/[.05] dark:border-white/[.05]">
            <div className="flex items-center gap-2.5">
              <LettuceMark size={24}/>
              <span className="text-[15px] font-medium tracking-tight text-ink dark:text-night-text">
                Home Lettuce
              </span>
            </div>
            <button onClick={onClose} aria-label="Cerrar menú"
              className="h-9 w-9 rounded-full flex items-center justify-center
                         text-ink-soft dark:text-night-softText
                         hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                   strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="m6 6 12 12M18 6 6 18"/>
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {groups(navAnd)}
          </div>
        </aside>
      </div>
    </React.Fragment>
  );
}

// ─── Bottom nav (mobile) ───────────────────────────────────
function BottomNav({ current, onNavigate }) {
  const visible = NAV.slice(0, 4);
  const overflow = NAV.slice(4);
  const [moreOpen, setMoreOpen] = React.useState(false);

  const isOverflowActive = (id) => {
    if (id === current) return true;
    if (id === 'salud' && SALUD_IDS.has(current)) return true;
    if (id === 'finanzas' && FIN_IDS.has(current)) return true;
    return false;
  };
  const inOverflowActive = overflow.some(o => isOverflowActive(o.id));

  return (
    <React.Fragment>
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/30"
             onClick={()=>setMoreOpen(false)}>
          <div className="absolute bottom-[72px] left-3 right-3 rounded-3xl
                          bg-white dark:bg-night-card
                          border border-black/[.05] dark:border-white/[.05]
                          shadow-subtle p-2"
               onClick={(e)=>e.stopPropagation()}>
            <div className="px-3 py-2 text-[11px] uppercase tracking-[.08em]
                            text-ink-mute dark:text-night-softText">
              Más
            </div>
            {overflow.map(({ id, label, Icon, href, external }) => {
              const active = isOverflowActive(id);
              if (href) {
                return (
                  <a key={id} href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    onClick={()=>setMoreOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-[14px] text-ink dark:text-night-text">
                    <Icon/><span>{label}</span>
                  </a>
                );
              }
              return (
                <button key={id}
                  onClick={()=>{ onNavigate(id); setMoreOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-[14px]
                              ${active ? 'bg-accent-tint text-accent font-medium' : 'text-ink dark:text-night-text'}`}>
                  <Icon/><span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30
                      bg-paper/90 dark:bg-night/90 backdrop-blur-md
                      border-t border-black/[.06] dark:border-white/[.06]
                      pb-[env(safe-area-inset-bottom)]">
        <ul className="grid grid-cols-5 px-1.5 pt-1.5 pb-2">
          {visible.map(({ id, label, Icon }) => {
            const active = current === id;
            return (
              <li key={id}>
                <button onClick={()=>onNavigate(id)}
                  className={`w-full h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5
                              transition-colors
                              ${active ? 'bg-accent-tint text-accent' : 'text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
                  <Icon/>
                  <span className={`text-[10.5px] ${active ? 'font-medium' : ''}`}>{label}</span>
                </button>
              </li>
            );
          })}
          <li>
            <button onClick={()=>setMoreOpen(o=>!o)}
              className={`w-full h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5
                          transition-colors
                          ${inOverflowActive ? 'bg-accent-tint text-accent' : 'text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
              <IconMore/>
              <span className={`text-[10.5px] ${inOverflowActive ? 'font-medium' : ''}`}>Más</span>
            </button>
          </li>
        </ul>
      </nav>
    </React.Fragment>
  );
}

// ─── AppShell ──────────────────────────────────────────────
function AppShell({ username, email, hlUserId, onLogout, palette, onPalette }) {
  const [route, setRoute] = React.useState('inicio');
  const [dark, setDark] = useDarkMode();
  const [navOpen, setNavOpen] = React.useState(false);

  const renderRoute = () => {
    if (route === 'inicio')       return <InicioDashboard username={username} onNavigate={setRoute}/>;
    if (route === 'calendario')   return <CalendarPage/>;
    if (route === 'tareas')       return <TareasPage/>;
    if (route === 'habitos')      return <HabitosPage/>;
    if (route === 'proyectos')    return <ProyectosPage/>;
    if (route === 'cine')         return <CinePage/>;
    if (route === 'musica')       return <EmptyPage title="Música" subtitle="Tus playlists y colección musical · próximamente." icon={<IconMusic/>}/>;
    if (route === 'salud')        return <SaludPage onNavigate={setRoute}/>;
    if (route === 'alimentacion') return <AlimentacionPage currentUserId={hlUserId}/>;
    if (route === 'salud-fis')    return <EmptyPage title="Estado físico" subtitle="Actividad, descanso y energía día a día." icon={<IconBarbell/>}/>;
    if (route === 'salud-con')    return <EmptyPage title="Consumo" subtitle="Seguimiento de consumo de azúcar, alcohol, pantallas y más." icon={<IconDroplet/>}/>;
    if (route === 'salud-emo')    return <EmptyPage title="Emociones" subtitle="Registro de ánimo y salud mental." icon={<IconMoodHappy/>}/>;
    if (FIN_IDS.has(route))       return <FinanzasPage/>;
    const meta = PAGE_META[route];
    if (!meta) return <EmptyPage title={route} subtitle="" icon={<IconHome/>}/>;
    const navItem = NAV.find(n => n.id === route);
    const Icon = navItem ? navItem.Icon : IconHome;
    return <EmptyPage title={meta.title} subtitle={meta.subtitle} icon={<Icon/>}/>;
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-night transition-colors">
      <Header dark={dark} onToggleDark={()=>setDark(d=>!d)}
              onLogout={onLogout} username={username} email={email}
              onOpenNav={()=>setNavOpen(true)}
              palette={palette} onPalette={onPalette}/>
      <div className="flex">
        <SideMenu current={route} onNavigate={setRoute}
                  open={navOpen} onClose={()=>setNavOpen(false)}/>
        <main className="flex-1 min-w-0">
          {renderRoute()}
        </main>
      </div>
      <BottomNav current={route} onNavigate={setRoute}/>
    </div>
  );
}

// ─── Tweaks (paleta + densidad) ────────────────────────────
function TweaksOverlay({ t, setTweak }) {
  return (
    <div data-tweaks-host>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Paleta de acento"/>
        <TweakRadio
          label="Color"
          value={t.palette}
          options={[
            { value: 'sage',     label: 'Sage' },
            { value: 'mint',     label: 'Mint' },
            { value: 'sky',      label: 'Sky' },
            { value: 'lavender', label: 'Lavender' },
            { value: 'rose',     label: 'Rose' },
            { value: 'coral',    label: 'Coral' },
            { value: 'peach',    label: 'Peach' },
            { value: 'sand',     label: 'Sand' },
          ]}
          onChange={(v)=>setTweak('palette', v)}/>
        <TweakSection label="Densidad"/>
        <TweakRadio
          label="Spacing"
          value={t.density}
          options={['compact', 'regular', 'comfy']}
          onChange={(v)=>setTweak('density', v)}/>
      </TweaksPanel>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────
function App() {
  const [user, setUser] = React.useState(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('palette-sage','palette-lavender','palette-peach','palette-sky','palette-rose','palette-sand','palette-mint','palette-coral');
    root.classList.add('palette-' + (t.palette || 'sage'));
  }, [t.palette]);

  React.useEffect(() => {
    const map = { compact: '.92', regular: '1', comfy: '1.1' };
    document.documentElement.style.setProperty('--hl-density', map[t.density] || '1');
  }, [t.density]);

  return (
    <React.Fragment>
      {user
        ? <AppShell username={user.name} email={user.email} hlUserId={user.hlUserId} onLogout={()=>setUser(null)}
                    palette={t.palette} onPalette={(v)=>setTweak('palette', v)}/>
        : <LoginPage onLogin={(u)=>setUser(u)}/>}
      <TweaksOverlay t={t} setTweak={setTweak}/>
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
