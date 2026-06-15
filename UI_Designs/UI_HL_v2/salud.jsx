// Home Lettuce — Salud (mapa futuro, sin funcionalidad real)

function SaludCard({ Icon, name, hint, badge, shortcut, onClick }) {
  const base = `group relative rounded-3xl p-5 sm:p-6 flex flex-col gap-4 min-h-[156px]
                bg-white dark:bg-night-card text-left
                border border-black/[.04] dark:border-white/[.05] shadow-subtle
                transition-colors`;

  const inner = (
    <React.Fragment>
      <div className="flex items-start justify-between">
        <span className="h-11 w-11 rounded-2xl bg-accent-tint flex items-center justify-center text-accent">
          <Icon/>
        </span>
        {shortcut ? (
          <span className="h-8 w-8 rounded-full flex items-center justify-center
                           text-ink-mute dark:text-night-softText
                           group-hover:text-accent group-hover:bg-accent-tint transition-colors">
            <IconArrowRight width="18" height="18"/>
          </span>
        ) : (
          <span className="text-[10.5px] font-medium uppercase tracking-[.07em]
                           px-2.5 py-1 rounded-full
                           bg-paper-soft dark:bg-night-soft
                           text-ink-mute dark:text-night-softText">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-auto">
        <div className="text-[15px] font-medium text-ink dark:text-night-text">
          {name}
        </div>
        {hint && (
          <div className="text-[12.5px] text-ink-soft dark:text-night-softText mt-1 leading-snug">
            {hint}
          </div>
        )}
      </div>
    </React.Fragment>
  );

  if (shortcut) {
    return (
      <button onClick={onClick}
        className={`${base} hover:border-accent hover:bg-accent-tint/40 dark:hover:bg-night-soft`}>
        {inner}
      </button>
    );
  }
  return <div className={base}>{inner}</div>;
}

function SaludPage({ onNavigate }) {
  const cards = [
    {
      id: 'fisico', name: 'Estado físico', Icon: IconBarbell, badge: 'Próximamente',
      hint: 'Actividad, descanso y energía día a día.',
    },
    {
      id: 'alimentacion', name: 'Alimentación', Icon: IconFood, shortcut: true,
      hint: 'Acceso directo a tu sección de Alimentación.',
    },
    {
      id: 'consumo', name: 'Consumo', Icon: IconDroplet, badge: 'Próximamente',
      hint: 'Azúcar · alcohol · cannabis · redes sociales.',
    },
    {
      id: 'emociones', name: 'Emociones', Icon: IconMoodHappy, badge: 'Próximamente',
      hint: 'Salud emocional y mental.',
    },
  ];

  return (
    <PageShell title="">
      <header className="mb-8">
        <h1 className="text-[28px] sm:text-[34px] font-medium tracking-tight
                       text-ink dark:text-night-text">
          Salud
        </h1>
        <p className="text-[15px] text-ink-soft dark:text-night-softText mt-2 max-w-xl">
          Seguimiento de bienestar físico, emocional y hábitos de consumo.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl">
        {cards.map(c => (
          <SaludCard key={c.id}
            Icon={c.Icon} name={c.name} hint={c.hint}
            badge={c.badge} shortcut={c.shortcut}
            onClick={c.shortcut ? () => onNavigate('alimentacion') : undefined}/>
        ))}
      </div>
    </PageShell>
  );
}

Object.assign(window, { SaludPage });
