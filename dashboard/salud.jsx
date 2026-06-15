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

function SaludMetricChip({ Icon, label, value, sub }) {
  return (
    <div className="flex-1 min-w-[160px] bg-white dark:bg-night-card rounded-[18px]
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle p-4">
      <div className="flex items-center gap-2 text-ink-mute dark:text-night-softText mb-3">
        <span className="h-7 w-7 rounded-full bg-accent-tint text-accent flex items-center justify-center">
          <Icon/>
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[.06em]">{label}</span>
      </div>
      <div className="text-[22px] font-semibold tracking-tight text-ink dark:text-night-text">
        {value}
      </div>
      <div className="text-[11.5px] text-ink-mute dark:text-night-softText mt-0.5">{sub}</div>
    </div>
  );
}

function SaludPage({ onNavigate }) {
  const metrics = [
    { Icon: IconBarbell,   label: 'Actividad',   value: '7.420', sub: 'pasos hoy · meta 8.000' },
    { Icon: IconDroplet,   label: 'Hidratación', value: '1.4 L', sub: 'de 2 L recomendados'   },
    { Icon: IconMoodHappy, label: 'Ánimo',        value: 'Bien',  sub: 'registrado hoy'         },
  ];

  const cards = [
    {
      id: 'salud-fis', name: 'Estado físico', Icon: IconBarbell, badge: 'Próximamente',
      hint: 'Actividad, descanso y energía día a día.',
    },
    {
      id: 'alimentacion', name: 'Alimentación', Icon: IconFood, shortcut: true,
      hint: 'Despensa, recetas y plan de comidas.',
    },
    {
      id: 'salud-con', name: 'Consumo', Icon: IconDroplet, badge: 'Próximamente',
      hint: 'Azúcar · alcohol · cannabis · redes sociales.',
    },
    {
      id: 'salud-emo', name: 'Emociones', Icon: IconMoodHappy, badge: 'Próximamente',
      hint: 'Salud emocional y mental.',
    },
  ];

  return (
    <PageShell title="">
      <header className="mb-6">
        <h1 className="text-[28px] sm:text-[34px] font-medium tracking-tight
                       text-ink dark:text-night-text">
          Salud
        </h1>
        <p className="text-[15px] text-ink-soft dark:text-night-softText mt-2 max-w-xl">
          Bienestar físico, emocional y hábitos de consumo de la casa.
        </p>
      </header>

      {/* Métricas del día */}
      <div className="flex gap-3 flex-wrap mb-6">
        {metrics.map((m, i) => (
          <SaludMetricChip key={i} Icon={m.Icon} label={m.label} value={m.value} sub={m.sub}/>
        ))}
      </div>

      {/* Tarjetas de sección */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl">
        {cards.map(c => (
          <SaludCard key={c.id}
            Icon={c.Icon} name={c.name} hint={c.hint}
            badge={c.badge} shortcut={c.shortcut}
            onClick={c.shortcut ? () => onNavigate(c.id) : undefined}/>
        ))}
      </div>
    </PageShell>
  );
}

Object.assign(window, { SaludPage });
