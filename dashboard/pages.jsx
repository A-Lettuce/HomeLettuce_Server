// Pages para Home Lettuce

// ─── LoginPage ──────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const ACCOUNTS = {
    'fragonzeb@gmail.com':     { name: 'Francisca Gonzalez', hlUserId: 'u-mama'    },
    'mateolechuga5@gmail.com': { name: 'Mateo Lechuga',       hlUserId: 'u-hermano' },
    '2001.lechuga@gmail.com':  { name: 'Andreu Lechuga',      hlUserId: 'u-andreu'  },
    'chlechuga@gmail.com':     { name: 'Christian Lechuga',   hlUserId: 'u-papa'    },
  };

  const [identity, setIdentity] = React.useState(null);
  const [entering, setEntering] = React.useState(false);

  React.useEffect(() => {
    fetch('/cdn-cgi/access/get-identity')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        const acct = ACCOUNTS[data.email];
        setIdentity(acct ? { name: acct.name, email: data.email, hlUserId: acct.hlUserId } : false);
      })
      .catch(() => setIdentity(false));
  }, []);

  const handleAcceder = () => {
    setEntering(true);
    setTimeout(() => onLogin(identity), 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10
                    bg-accent-tint dark:bg-night transition-colors">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="h-16 w-16 rounded-3xl bg-white dark:bg-night-card
                          flex items-center justify-center shadow-subtle
                          border border-black/[.04] dark:border-white/[.05]">
            <LettuceMark size={36}/>
          </div>
          <h1 className="text-[22px] font-medium tracking-tight text-ink dark:text-night-text">
            Home Lettuce
          </h1>
          <p className="text-sm text-ink-soft dark:text-night-softText -mt-1">
            Bienvenido de nuevo a casa
          </p>
        </div>

        <div className="bg-white dark:bg-night-card rounded-3xl p-6 sm:p-7
                        border border-black/[.04] dark:border-white/[.05]
                        shadow-subtle">

          {identity === null && (
            <div className="flex justify-center py-8">
              <span className="h-5 w-5 rounded-full border-2 border-accent border-t-transparent animate-spin"/>
            </div>
          )}

          {identity === false && (
            <div className="text-center py-6 space-y-2">
              <p className="text-[15px] font-medium text-ink dark:text-night-text">No autorizado</p>
              <p className="text-sm text-ink-mute dark:text-night-softText">
                Tu cuenta no tiene acceso a Home Lettuce.
              </p>
            </div>
          )}

          {identity && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-1.5 py-2 text-center">
                <span className="h-14 w-14 rounded-full bg-accent flex items-center justify-center
                                 text-[22px] font-medium text-[hsl(var(--accent-strong))]">
                  {identity.name.slice(0, 1)}
                </span>
                <p className="mt-2 text-[13px] text-ink-mute dark:text-night-softText">
                  Accediste como
                </p>
                <p className="text-[20px] font-medium tracking-tight text-ink dark:text-night-text">
                  {identity.name}
                </p>
                <p className="text-[12px] text-ink-mute dark:text-night-softText">
                  {identity.email}
                </p>
              </div>
              <button onClick={handleAcceder} disabled={entering}
                className="w-full rounded-full bg-accent text-[hsl(var(--accent-strong))]
                           py-3 px-4 font-medium text-[15px]
                           hover:brightness-[.96] active:brightness-[.92]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition flex items-center justify-center gap-2">
                {entering
                  ? <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
                  : <React.Fragment><span>Acceder</span><IconArrowRight width="18" height="18"/></React.Fragment>}
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-xs text-ink-mute dark:text-night-softText">
          Servidor casero · privado · v0.1
        </p>
      </div>
    </div>
  );
}

function Field({ icon, label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium uppercase tracking-[.08em]
                       text-ink-mute dark:text-night-softText mb-1.5 ml-1">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3
                      bg-paper-soft dark:bg-night-soft
                      border border-transparent focus-within:border-accent
                      focus-within:bg-white dark:focus-within:bg-night
                      transition-colors">
        <span className="text-ink-mute dark:text-night-softText shrink-0">{icon}</span>
        {children}
      </div>
    </label>
  );
}

// ─── Widgets del dashboard de inicio ────────────────────────

function WidgetCard({ children, className, accent }) {
  return (
    <div className={`rounded-[22px] border shadow-subtle p-5
                     ${accent
                       ? 'bg-accent-tint border-black/[.04] dark:border-white/[.04]'
                       : 'bg-white dark:bg-night-card border-black/[.04] dark:border-white/[.05]'}
                     ${className || ''}`}>
      {children}
    </div>
  );
}

function WidgetHeader({ title, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[13.5px] font-semibold text-ink dark:text-night-text">{title}</span>
      {right && <span className="text-ink-mute dark:text-night-softText text-[12px]">{right}</span>}
    </div>
  );
}

function WidgetEventos({ onNavigate }) {
  const events = [
    { dot: '#86c79a', title: 'Dentista — Mateo', when: 'Hoy · 17:30' },
    { dot: '#cf9ad9', title: 'Pago arriendo', when: 'Mañana' },
    { dot: '#f0a868', title: 'Cumpleaños abuela', when: 'Sáb · todo el día' },
  ];
  return (
    <WidgetCard>
      <WidgetHeader
        title="Próximos eventos"
        right={
          <button onClick={() => onNavigate('calendario')}
            className="hover:text-accent transition-colors">
            <IconArrowRight width="15" height="15"/>
          </button>
        }
      />
      <div className="space-y-0.5">
        {events.map((e, i) => (
          <div key={i} className="flex gap-3 items-start py-2 border-t border-black/[.045] dark:border-white/[.05]">
            <span style={{ background: e.dot }}
              className="mt-[5px] h-2 w-2 rounded-full flex-shrink-0"/>
            <div className="min-w-0">
              <div className="text-[13.5px] text-ink dark:text-night-text truncate">{e.title}</div>
              <div className="text-[11.5px] text-ink-mute dark:text-night-softText">{e.when}</div>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function WidgetTareas({ onNavigate }) {
  const tasks = [
    { name: 'Sacar la basura',   done: true  },
    { name: 'Comprar pan',       done: true  },
    { name: 'Llamar al gasfíter',done: true  },
    { name: 'Regar las plantas', done: false },
  ];
  const done = tasks.filter(t => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);

  return (
    <WidgetCard>
      <WidgetHeader
        title="Tareas de hoy"
        right={
          <button onClick={() => onNavigate('tareas')}
            className="text-ink-mute dark:text-night-softText hover:text-accent transition-colors font-variant-numeric tabular-nums">
            {done}/{tasks.length}
          </button>
        }
      />
      <div className="h-1.5 rounded-full bg-black/[.06] dark:bg-white/[.06] overflow-hidden mb-3">
        <div style={{ width: `${pct}%` }}
          className="h-full rounded-full bg-accent transition-all"/>
      </div>
      <div className="space-y-0.5">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-2.5 py-1.5">
            <span className={`h-5 w-5 rounded-[7px] flex-shrink-0 flex items-center justify-center
                              ${t.done
                                ? 'bg-accent'
                                : 'border-[1.5px] border-black/20 dark:border-white/20'}`}>
              {t.done && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                     strokeLinecap="round" strokeLinejoin="round" width="12" height="12"
                     className="text-[hsl(var(--accent-strong))]">
                  <path d="m5 12 4.5 4.5L19 7"/>
                </svg>
              )}
            </span>
            <span className={`text-[13.5px] ${t.done ? 'line-through text-ink-mute dark:text-night-softText' : 'text-ink dark:text-night-text'}`}>
              {t.name}
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function WidgetDespensa({ onNavigate }) {
  const items = [
    { name: 'Leche',  level: 'Quedan 1',  color: '#d2553f' },
    { name: 'Huevos', level: 'Pocos',     color: '#e0863f' },
    { name: 'Café',   level: 'Por acabar',color: '#e0863f' },
    { name: 'Arroz',  level: 'Suficiente',color: '#8b9089' },
  ];
  const bajo = items.filter(i => i.color !== '#8b9089').length;
  return (
    <WidgetCard>
      <WidgetHeader
        title="Despensa"
        right={
          <button onClick={() => onNavigate('alimentacion')}
            className="text-[10.5px] font-semibold uppercase tracking-[.05em] px-2.5 py-1 rounded-full
                       bg-accent-tint text-accent hover:brightness-95 transition-colors">
            {bajo} por reponer
          </button>
        }
      />
      <div className="space-y-0.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-t border-black/[.045] dark:border-white/[.05]">
            <span className="text-[13.5px] text-ink dark:text-night-text">{it.name}</span>
            <span style={{ color: it.color }} className="text-[12px] font-medium">{it.level}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function WidgetFinanzas({ onNavigate }) {
  return (
    <WidgetCard>
      <WidgetHeader
        title="Finanzas del mes"
        right={
          <button onClick={() => onNavigate('finanzas')}
            className="hover:text-accent transition-colors text-ink-mute dark:text-night-softText">
            <IconArrowRight width="15" height="15"/>
          </button>
        }
      />
      <div className="text-[11px] text-ink-mute dark:text-night-softText uppercase tracking-[.05em] mb-0.5">
        Saldo disponible
      </div>
      <div className="text-[26px] font-semibold tracking-tight text-ink dark:text-night-text mb-3 tabular-nums">
        $2.345.900
      </div>
      <div className="flex gap-2.5">
        <div className="flex-1 bg-paper-soft dark:bg-night-soft rounded-[14px] px-3 py-2.5">
          <div className="text-[11px] text-ink-mute dark:text-night-softText mb-0.5">Ingresos</div>
          <div className="text-[14px] font-semibold tabular-nums" style={{ color: '#16895a' }}>$2.77M</div>
        </div>
        <div className="flex-1 bg-paper-soft dark:bg-night-soft rounded-[14px] px-3 py-2.5">
          <div className="text-[11px] text-ink-mute dark:text-night-softText mb-0.5">Gastos</div>
          <div className="text-[14px] font-semibold tabular-nums" style={{ color: '#d2553f' }}>$1.98M</div>
        </div>
      </div>
    </WidgetCard>
  );
}

function WidgetHabitos({ onNavigate }) {
  const habits = [
    { name: 'Ejercicio', days: [1,1,0,1,1,1,0] },
    { name: 'Leer',      days: [1,1,1,1,0,1,1] },
    { name: 'Meditar',   days: [0,1,1,1,1,0,0] },
  ];
  return (
    <WidgetCard>
      <WidgetHeader
        title="Hábitos"
        right={
          <button onClick={() => onNavigate('habitos')}
            className="text-[12px] text-ink-mute dark:text-night-softText hover:text-accent transition-colors">
            racha 5 días
          </button>
        }
      />
      <div className="space-y-3">
        {habits.map((h, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-[13px] text-ink dark:text-night-text flex-1 truncate">{h.name}</span>
            <div className="flex gap-1">
              {h.days.map((v, j) => (
                <span key={j} style={{
                  width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                  background: v ? 'hsl(var(--accent))' : 'rgba(0,0,0,.07)',
                  display: 'inline-block',
                }}/>
              ))}
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function WidgetCena({ onNavigate }) {
  return (
    <WidgetCard accent className="flex flex-col">
      <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-accent mb-2">
        Cena de hoy
      </div>
      <div className="text-[19px] font-semibold tracking-tight text-ink dark:text-night-text mb-1">
        Pasta al pesto
      </div>
      <div className="text-[12.5px] text-ink-soft dark:text-night-softText leading-snug flex-1">
        25 min · tienes todos los ingredientes en la despensa.
      </div>
      <button onClick={() => onNavigate('alimentacion')}
        className="mt-4 self-start flex items-center gap-2 px-4 py-2.5 rounded-full
                   bg-accent text-[hsl(var(--accent-strong))] text-[13px] font-medium
                   hover:brightness-[.96] active:brightness-[.92] transition">
        Ver receta
        <IconArrowRight width="15" height="15"/>
      </button>
    </WidgetCard>
  );
}

// ─── Inicio Dashboard ───────────────────────────────────────
function InicioDashboard({ username, onNavigate }) {
  const hour = new Date().getHours();
  const greet = hour < 6 ? 'Buenas noches' : hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  return (
    <PageShell title="">
      <div className="space-y-1">
        <p className="text-sm text-ink-soft dark:text-night-softText">{greet},</p>
        <h1 className="text-[40px] sm:text-[52px] leading-[1.05] font-medium tracking-tight
                       text-ink dark:text-night-text">
          Bienvenido,<br/>
          <span className="text-accent">{username}</span>.
        </h1>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <WidgetEventos onNavigate={onNavigate}/>
        <WidgetTareas  onNavigate={onNavigate}/>
        <WidgetDespensa onNavigate={onNavigate}/>
        <WidgetFinanzas onNavigate={onNavigate}/>
        <WidgetHabitos  onNavigate={onNavigate}/>
        <WidgetCena     onNavigate={onNavigate}/>
      </div>
    </PageShell>
  );
}

// ─── Página genérica vacía ──────────────────────────────────
function EmptyPage({ title, subtitle, icon }) {
  return (
    <PageShell title={title}>
      <div className="mt-10 sm:mt-16 flex flex-col items-center text-center max-w-md mx-auto">
        <div className="h-20 w-20 rounded-3xl bg-accent-tint flex items-center justify-center mb-5">
          <span className="text-accent" style={{transform:'scale(1.6)'}}>{icon}</span>
        </div>
        <h2 className="text-lg font-medium text-ink dark:text-night-text">
          Aún no hay nada por aquí
        </h2>
        <p className="text-[14px] text-ink-soft dark:text-night-softText mt-2 leading-relaxed">
          {subtitle}
        </p>
      </div>
    </PageShell>
  );
}

// ─── Encabezado común de página ─────────────────────────────
function PageShell({ title, children }) {
  return (
    <div className="route-fade max-w-5xl mx-auto px-5 sm:px-8 pt-6 sm:pt-10 pb-28 md:pb-10">
      {title && (
        <header className="mb-8">
          <h1 className="text-[28px] sm:text-[34px] font-medium tracking-tight
                         text-ink dark:text-night-text">
            {title}
          </h1>
        </header>
      )}
      {children}
    </div>
  );
}

Object.assign(window, { LoginPage, InicioDashboard, EmptyPage, PageShell });
