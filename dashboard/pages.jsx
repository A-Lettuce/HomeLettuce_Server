// Pages para Home Lettuce

// ─── LoginPage ──────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const ACCOUNTS = {
    'fragonzeb@gmail.com':     { name: 'Francisca Gonzalez', hlUserId: 'u-mama'    },
    'mateolechuga5@gmail.com': { name: 'Mateo Lechuga',       hlUserId: 'u-hermano' },
    '2001.lechuga@gmail.com':  { name: 'Andreu Lechuga',      hlUserId: 'u-andreu'  },
    'chlechuga@gmail.com':     { name: 'Christian Lechuga',   hlUserId: 'u-papa'    },
  };

  // null = cargando, false = no autorizado, { name, email, hlUserId } = identificado
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
        {/* Logo */}
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

        {/* Card */}
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

// ─── Inicio Dashboard ───────────────────────────────────────
function InicioDashboard({ username }) {
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
        <p className="text-[15px] text-ink-soft dark:text-night-softText pt-2 max-w-md">
          Aquí podrás añadir widgets para tu día — calendario, tareas pendientes,
          recordatorios de alimentación o lo que necesites.
        </p>
      </div>

      <div className="mt-10">
        <div className="text-[11px] font-medium uppercase tracking-[.08em]
                        text-ink-mute dark:text-night-softText mb-3 ml-1">
          Tus widgets
        </div>
        <WidgetPlaceholderGrid/>
      </div>
    </PageShell>
  );
}

function WidgetPlaceholderGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { h: 'h-44', label: 'Próximos eventos' },
        { h: 'h-44', label: 'Tareas de hoy' },
        { h: 'h-44', label: 'Despensa' },
      ].map((w, i) => (
        <button key={i}
          className="group relative rounded-3xl h-44
                     bg-paper-soft/60 dark:bg-night-soft/60
                     border border-dashed border-black/[.08] dark:border-white/[.08]
                     hover:border-accent hover:bg-accent-tint dark:hover:bg-night-card
                     transition-colors flex flex-col items-center justify-center gap-2
                     text-ink-mute dark:text-night-softText hover:text-accent">
          <span className="h-9 w-9 rounded-full bg-white dark:bg-night-card border border-black/[.05] dark:border-white/[.05]
                            flex items-center justify-center text-[18px] font-light leading-none">+</span>
          <span className="text-[13px]">Añadir widget</span>
          <span className="text-[11px] opacity-70">{w.label}</span>
        </button>
      ))}
    </div>
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
