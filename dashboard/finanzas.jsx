// Home Lettuce — Finanzas (arquitectura Fintoc-ready)
// Datos: window.FAMILIA_A, window.FAMILIA_B, window.GASTOS_COMPARTIDOS
//        definidos en finanzasMock.jsx.
// Para conectar Fintoc real: reemplazar esos arrays por fetch() sin tocar
// ninguno de estos componentes.


// ─── Helpers de fecha y moneda ───────────────────────────────────────────────
const FIN_MONTH_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function fin_pad2(n) { return String(n).padStart(2, '0'); }

// Formato CLP: 1234567 → "$1.234.567"  |  -1234 → "-$1.234"
function formatCLP(amount) {
  if (amount == null || isNaN(amount)) return '$0';
  const sign = amount < 0 ? '-' : '';
  const abs  = Math.abs(Math.round(amount));
  return `${sign}$${abs.toLocaleString('es-CL').replace(/,/g, '.')}`;
}

// "2026-05-21" → "21 may"
function formatDayShort(iso) {
  if (!iso) return '';
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${FIN_MONTH_SHORT[m - 1]}`;
}

// "2026-06-16T10:30:00" → "16 jun · 10:30"
function formatRefreshed(iso) {
  if (!iso) return '';
  const [datePart, timePart] = iso.split('T');
  const [, m, d] = datePart.split('-').map(Number);
  const time = timePart ? timePart.slice(0, 5) : '';
  return `${d} ${FIN_MONTH_SHORT[m - 1]}${time ? ' · ' + time : ''}`;
}

// Retorna "YYYY-MM" del mes actual
function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${fin_pad2(d.getMonth() + 1)}`;
}

// Últimos 4 dígitos de número de cuenta
function lastFour(number) { return (number || '').slice(-4); }


// ─── Colores de categoría ────────────────────────────────────────────────────
const FIN_COLORS_FALLBACK = [
  { id: 'sage',     bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-400'  },
  { id: 'lavender', bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-400' },
  { id: 'peach',    bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-400' },
  { id: 'sky',      bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-400'   },
  { id: 'rose',     bg: 'bg-pink-100',   text: 'text-pink-800',   dot: 'bg-pink-400'   },
  { id: 'butter',   bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
];
const FIN_COLOR_BY_ID = Object.fromEntries(FIN_COLORS_FALLBACK.map(c => [c.id, c]));
function finGetColor(id) {
  return (typeof COLOR_BY_ID !== 'undefined' && COLOR_BY_ID[id])
    || FIN_COLOR_BY_ID[id] || FIN_COLOR_BY_ID.sky;
}
const FIN_CAT_COLOR = {
  'Sueldo': 'sage', 'Freelance': 'sage', 'Ahorro': 'sage',
  'Comida': 'peach', 'Restaurantes': 'peach', 'Mercado': 'peach',
  'Transporte': 'sky', 'Vivienda': 'lavender', 'Servicios': 'sky',
  'Ocio': 'rose', 'Cine': 'rose', 'Salud': 'butter', 'Educación': 'lavender',
  'Ropa': 'rose', 'Mascotas': 'butter', 'Suscripciones': 'lavender', 'Otros': 'sky',
};


// ─── Iconos locales ──────────────────────────────────────────────────────────
const FI = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...p}/>
);
const IconFinWallet   = (p) => <FI {...p}><path d="M3.5 8.5h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-13a1 1 0 0 1-1-1V8.5Z"/><path d="M3.5 8.5V7a2 2 0 0 1 2-2h11"/><circle cx="16.5" cy="14.5" r="1.1" fill="currentColor"/></FI>;
const IconFinIn       = (p) => <FI {...p}><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></FI>;
const IconFinOut      = (p) => <FI {...p}><path d="M12 5v14"/><path d="m6 13 6 6 6-6"/></FI>;
const IconFinBalance  = (p) => <FI {...p}><path d="M4 7h16M7 7v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7"/><path d="M10 11h4M10 14.5h4"/></FI>;
const IconFinSearch   = (p) => <FI {...p}><circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/></FI>;
const IconFinLock     = (p) => <FI {...p} width="14" height="14"><rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></FI>;
const IconFinCard     = (p) => <FI {...p}><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/></FI>;
const IconFinChevron  = (p) => <FI {...p} width="15" height="15"><path d="m6 9 6 6 6-6"/></FI>;
const IconFinUsers    = (p) => <FI {...p}><circle cx="9" cy="8.5" r="3.1"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.6a3 3 0 0 1 0 5.8"/><path d="M17.6 19a5.3 5.3 0 0 0-2.2-4.3"/></FI>;


// ─── Tabs (pill y seg) ───────────────────────────────────────────────────────
const FinTabsCtx = React.createContext({ value: null, onChange: () => {}, look: 'pill' });

function FinTabs({ value, onValueChange, children, className = '' }) {
  const ctx = React.useMemo(
    () => ({ value, onChange: onValueChange, look: 'pill' }),
    [value, onValueChange]
  );
  return <FinTabsCtx.Provider value={ctx}><div className={className}>{children}</div></FinTabsCtx.Provider>;
}
function FinTabsList({ children, look = 'pill', className = '' }) {
  const parent = React.useContext(FinTabsCtx);
  const ctx = React.useMemo(() => ({ ...parent, look }), [parent, look]);
  const isSeg = look === 'seg';
  return (
    <FinTabsCtx.Provider value={ctx}>
      <div className={[
        'inline-flex items-center gap-1',
        isSeg
          ? 'border-b border-black/[.06] dark:border-white/[.08] gap-0 w-full overflow-x-auto no-scrollbar'
          : 'p-1 rounded-full bg-paper-soft dark:bg-night-soft',
        className,
      ].join(' ')}>
        {children}
      </div>
    </FinTabsCtx.Provider>
  );
}
function FinTabsTrigger({ value, children }) {
  const { value: cur, onChange, look } = React.useContext(FinTabsCtx);
  const active = cur === value;
  if (look === 'seg') {
    return (
      <button onClick={() => onChange(value)}
        className={`relative px-3.5 sm:px-4 py-2.5 text-[13px] whitespace-nowrap transition-colors
                    ${active ? 'text-ink dark:text-night-text font-medium' : 'text-ink-mute dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
        {children}
        {active && <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full bg-accent"/>}
      </button>
    );
  }
  return (
    <button onClick={() => onChange(value)}
      className={`px-4 sm:px-5 py-1.5 rounded-full text-[13.5px] transition-colors
                  ${active
                    ? 'bg-white dark:bg-night-card text-ink dark:text-night-text font-medium shadow-subtle'
                    : 'text-ink-soft dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
      {children}
    </button>
  );
}
function FinTabsContent({ value, children }) {
  const { value: cur } = React.useContext(FinTabsCtx);
  if (cur !== value) return null;
  return <div className="route-fade">{children}</div>;
}


// ─── Primitivos UI ───────────────────────────────────────────────────────────
function FinBadge({ color, children }) {
  const c = finGetColor(color || 'sky');
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11.5px] whitespace-nowrap ${c.bg} ${c.text}`}>
      {children}
    </span>
  );
}

function FinSwitch({ checked, onChange, ariaLabel }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative h-[22px] w-[38px] rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-black/[.12] dark:bg-white/[.18]'}`}>
      <span className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-subtle transition-[left] duration-200 ${checked ? 'left-[18px]' : 'left-[2px]'}`}/>
    </button>
  );
}

function MetricCard({ icon, label, value, sublabel, variant = 'neutral', amount }) {
  let valueColor = 'text-ink dark:text-night-text';
  if (variant === 'positive') valueColor = 'text-green-600 dark:text-green-400';
  if (variant === 'negative') valueColor = 'text-red-500  dark:text-red-400';
  if (variant === 'balanced') {
    valueColor = (amount ?? 0) >= 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-500  dark:text-red-400';
  }
  return (
    <div className="snap-start shrink-0 w-[200px] sm:w-auto bg-white dark:bg-night-card rounded-2xl p-4 border border-black/[.04] dark:border-white/[.05] shadow-subtle">
      <div className="flex items-center gap-2 text-ink-mute dark:text-night-softText">
        <span className="h-7 w-7 rounded-full bg-paper-soft dark:bg-night-soft flex items-center justify-center shrink-0">
          {icon}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[.06em]">{label}</span>
      </div>
      <div className={`mt-3 text-[22px] sm:text-[24px] font-medium tabular-nums leading-none truncate ${valueColor}`}>
        {value}
      </div>
      {sublabel && (
        <div className="mt-2 text-[11.5px] text-ink-mute dark:text-night-softText min-w-0">{sublabel}</div>
      )}
    </div>
  );
}


// ─── Utilidades de sección ───────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-[.08em] text-ink-mute dark:text-night-softText mb-3 ml-1">
      {children}
    </div>
  );
}
function SectionDivider() {
  return <div className="border-t border-black/[.08] dark:border-white/[.08] my-7" aria-hidden="true"/>;
}
function EmptyHint({ text }) {
  return (
    <div className="rounded-2xl bg-paper-soft/60 dark:bg-night-soft/60 border border-dashed border-black/[.08] dark:border-white/[.08] py-10 text-center text-[13px] text-ink-mute dark:text-night-softText">
      {text}
    </div>
  );
}

// Avatar circular con colores inline (hex directo de FamilyMember)
function MemberAvatar({ member, size = 24 }) {
  return (
    <span className="rounded-full inline-flex items-center justify-center font-semibold shrink-0 select-none"
          style={{ width: size, height: size, backgroundColor: member.color, color: member.textColor, fontSize: Math.round(size * 0.42) }}>
      {member.initial}
    </span>
  );
}

// Input de búsqueda reutilizable
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5 mb-3
                    bg-paper-soft dark:bg-night-soft
                    border border-transparent focus-within:border-accent
                    focus-within:bg-white dark:focus-within:bg-night transition-colors">
      <span className="text-ink-mute dark:text-night-softText shrink-0"><IconFinSearch/></span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-[14px] placeholder:text-ink-mute dark:placeholder:text-night-softText"/>
    </div>
  );
}


// ─── Tabla de movimientos reutilizable ───────────────────────────────────────
// rows: array de movimientos enriquecidos con .member y .account (opcionales)
// showWho: muestra columna avatar del miembro
// showAccount: muestra últimos 4 dígitos de la cuenta
// privacyOn: false → reemplaza montos con ••••••
function MovTable({ rows, showWho = false, showAccount = false, privacyOn = true }) {
  if (!rows || rows.length === 0) return <EmptyHint text="Sin movimientos para mostrar."/>;

  const colParts = ['72px', '1fr'];
  const headers  = ['Fecha', 'Descripción'];
  if (showWho)     { colParts.push('40px');  headers.push(''); }
  if (showAccount) { colParts.push('60px');  headers.push('Cuenta'); }
  colParts.push('120px'); headers.push('Monto');
  const cols = colParts.join(' ');

  return (
    <div className="bg-white dark:bg-night-card rounded-2xl border border-black/[.04] dark:border-white/[.05] shadow-subtle overflow-hidden">
      <div className="hidden sm:grid gap-3 px-4 py-2.5 text-[11px] uppercase tracking-[.08em] text-ink-mute dark:text-night-softText border-b border-black/[.05] dark:border-white/[.05]"
           style={{ gridTemplateColumns: cols }}>
        {headers.map((h, i) => (
          <div key={i} className={i === headers.length - 1 ? 'text-right' : ''}>{h}</div>
        ))}
      </div>
      <ul>
        {rows.map((mov, i) => {
          const amtStr   = privacyOn ? ((mov.amount >= 0 ? '+' : '') + formatCLP(mov.amount)) : '••••••';
          const amtColor = !privacyOn
            ? 'text-ink-soft dark:text-night-softText'
            : mov.amount >= 0
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-500 dark:text-red-400';

          return (
            <li key={mov.id || i} className={i > 0 ? 'border-t border-black/[.045] dark:border-white/[.05]' : ''}>
              {/* Desktop */}
              <div className="hidden sm:grid gap-3 items-center px-4 py-3" style={{ gridTemplateColumns: cols }}>
                <div className="text-[12.5px] tabular-nums text-ink-soft dark:text-night-softText">
                  {formatDayShort(mov.post_date)}
                </div>
                <div className="text-[13.5px] text-ink dark:text-night-text truncate">{mov.description}</div>
                {showWho && (
                  <div>{mov.member && <MemberAvatar member={mov.member} size={20}/>}</div>
                )}
                {showAccount && (
                  <div className="text-[12.5px] tabular-nums text-ink-mute dark:text-night-softText">
                    {mov.account ? lastFour(mov.account.number) : '—'}
                  </div>
                )}
                <div className={`text-right text-[14px] font-medium tabular-nums ${amtColor}`}>{amtStr}</div>
              </div>
              {/* Mobile */}
              <div className="sm:hidden px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11.5px] tabular-nums text-ink-mute dark:text-night-softText">
                      {formatDayShort(mov.post_date)}
                    </span>
                    {showWho && mov.member && <MemberAvatar member={mov.member} size={16}/>}
                  </div>
                  <div className="mt-1 text-[14px] text-ink dark:text-night-text truncate">{mov.description}</div>
                </div>
                <div className={`text-right text-[14px] font-medium tabular-nums shrink-0 ${amtColor}`}>{amtStr}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


// ─── BLOQUE 1 — Compartido ───────────────────────────────────────────────────
function CompartidoBloque() {
  const { totalMes, miParte, fraccion } = React.useMemo(() => {
    const totalMes = GASTOS_COMPARTIDOS.reduce((s, e) => s + e.totalAmount, 0);
    const miParte  = Math.round(GASTOS_COMPARTIDOS.reduce((s, e) => s + e.totalAmount * e.myPortionCount / e.splitCount, 0));
    const first    = GASTOS_COMPARTIDOS[0];
    const fraccion = first ? `${first.myPortionCount}/${first.splitCount} partes` : '';
    return { totalMes, miParte, fraccion };
  }, []);

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <SectionLabel>Compartido · entre familias</SectionLabel>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <MetricCard
          icon={<IconFinUsers/>}
          label="Total gastos compartidos"
          value={`${formatCLP(totalMes)}/mes`}/>
        <MetricCard
          icon={<IconFinWallet/>}
          label="Tu parte"
          value={formatCLP(miParte)}
          sublabel={fraccion}/>
      </div>

      <div className="bg-white dark:bg-night-card rounded-2xl border border-black/[.04] dark:border-white/[.05] shadow-subtle overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_110px_110px_130px] gap-3 px-4 py-2.5 text-[11px] uppercase tracking-[.08em] text-ink-mute dark:text-night-softText border-b border-black/[.05] dark:border-white/[.05]">
          <div>Gasto</div>
          <div>División</div>
          <div className="text-right">Próx. cobro</div>
          <div className="text-right">Monto/mes</div>
        </div>
        <ul>
          {GASTOS_COMPARTIDOS.map((e, i) => {
            const colorId = FIN_CAT_COLOR[e.category] || 'sky';
            return (
              <li key={e.id} className={i > 0 ? 'border-t border-black/[.045] dark:border-white/[.05]' : ''}>
                {/* Desktop */}
                <div className="hidden sm:grid grid-cols-[1fr_110px_110px_130px] gap-3 items-center px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[13.5px] font-medium text-ink dark:text-night-text truncate">{e.name}</span>
                    <FinBadge color={colorId}>{e.category}</FinBadge>
                  </div>
                  <div className="text-[12.5px] text-ink-soft dark:text-night-softText">
                    ÷ {e.splitCount} personas
                  </div>
                  <div className="text-right text-[12.5px] tabular-nums text-ink-mute dark:text-night-softText">
                    {e.nextBillingDate}
                  </div>
                  <div className="text-right text-[14px] font-medium tabular-nums text-ink dark:text-night-text">
                    {formatCLP(e.totalAmount)}
                    <span className="text-[11px] text-ink-mute dark:text-night-softText font-normal">/mes</span>
                  </div>
                </div>
                {/* Mobile */}
                <div className="sm:hidden px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-ink dark:text-night-text truncate">{e.name}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <FinBadge color={colorId}>{e.category}</FinBadge>
                      <span className="text-[11.5px] text-ink-mute dark:text-night-softText">÷ {e.splitCount}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[14px] font-medium tabular-nums text-ink dark:text-night-text">
                      {formatCLP(e.totalAmount)}
                      <span className="text-[10.5px] text-ink-mute dark:text-night-softText font-normal">/mes</span>
                    </div>
                    <div className="text-[11px] text-ink-mute dark:text-night-softText">{e.nextBillingDate}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}


// ─── BLOQUE 2 — Mi Familia ───────────────────────────────────────────────────
function AccountChip({ account, member, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(account.id)}
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-[13px] border transition-all duration-200 whitespace-nowrap
                  ${selected
                    ? 'border-accent bg-accent-tint text-ink dark:text-night-text ring-1 ring-accent shadow-subtle'
                    : 'border-black/[.07] dark:border-white/[.08] bg-white dark:bg-night-card text-ink-soft dark:text-night-softText hover:border-black/[.16] dark:hover:border-white/[.16] hover:text-ink dark:hover:text-night-text'}`}>
      <span style={{ backgroundColor: member.color }} className="h-2 w-2 rounded-full shrink-0"/>
      <span className="font-medium">{member.name}</span>
      <span className="tabular-nums text-ink-mute dark:text-night-softText">{lastFour(account.number)}</span>
    </button>
  );
}

function FamiliaBloque({ members }) {
  const [selectedAccount, setSelectedAccount] = React.useState(null);
  const [showAll, setShowAll]               = React.useState(false);

  // Aplanar cuentas y movimientos con referencia al miembro
  const allAccounts = React.useMemo(() =>
    members.flatMap(m => m.accounts.map(a => ({ ...a, member: m }))),
    [members]
  );
  const allMovements = React.useMemo(() => {
    const movs = members.flatMap(m =>
      m.movements.map(mov => ({
        ...mov,
        member: m,
        account: m.accounts.find(a => a.id === mov.account_id),
      }))
    );
    return movs.sort((a, b) => b.post_date.localeCompare(a.post_date));
  }, [members]);

  // Métricas calculadas en runtime desde los arrays
  const curMonth = React.useMemo(getCurrentMonth, []);
  const { saldo, ingresos, gastos, balance } = React.useMemo(() => {
    const saldo    = allAccounts
      .filter(a => a.type !== 'credit_card')
      .reduce((s, a) => s + a.balance.available, 0);
    const inMonth  = allMovements.filter(m => m.post_date.startsWith(curMonth));
    const ingresos = inMonth.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0);
    const gastos   = inMonth.filter(m => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0);
    return { saldo, ingresos, gastos, balance: ingresos - gastos };
  }, [allAccounts, allMovements, curMonth]);

  // Movimientos filtrados por cuenta seleccionada
  const baseMovs = React.useMemo(() =>
    selectedAccount
      ? allMovements.filter(m => m.account_id === selectedAccount)
      : allMovements,
    [allMovements, selectedAccount]
  );
  const visibleMovs = showAll ? baseMovs : baseMovs.slice(0, 10);
  const hasMore     = baseMovs.length > 10 && !showAll;

  const debitAccounts  = allAccounts.filter(a => a.type !== 'credit_card');
  const creditAccounts = allAccounts.filter(a => a.type === 'credit_card');

  const handleChipToggle = (id) => {
    setSelectedAccount(prev => prev === id ? null : id);
    setShowAll(false);
  };

  const GroupLabel = ({ children }) => (
    <span className="text-[10.5px] font-semibold uppercase tracking-[.09em] text-ink-mute dark:text-night-softText shrink-0">
      {children}
    </span>
  );

  return (
    <section className="space-y-5">
      <SectionLabel>Mi Familia</SectionLabel>

      {/* 4 metric cards */}
      <div className="-mx-5 sm:mx-0 px-5 sm:px-0 flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto snap-x sm:overflow-visible no-scrollbar">
        <MetricCard icon={<IconFinWallet/>}  label="Saldo total"     value={formatCLP(saldo)}/>
        <MetricCard icon={<IconFinIn/>}      label="Ingresos del mes" value={formatCLP(ingresos)}  variant="positive"/>
        <MetricCard icon={<IconFinOut/>}     label="Gastos del mes"   value={formatCLP(gastos)}    variant="negative"/>
        <MetricCard icon={<IconFinBalance/>} label="Balance"
          value={(balance >= 0 ? '+' : '') + formatCLP(balance)}
          variant="balanced" amount={balance}/>
      </div>

      {/* Chips de tarjetas */}
      <div className="-mx-5 sm:mx-0 px-5 sm:px-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 min-w-max py-1">
          <GroupLabel>Débito</GroupLabel>
          {debitAccounts.map(a => (
            <AccountChip key={a.id} account={a} member={a.member}
              selected={selectedAccount === a.id} onToggle={handleChipToggle}/>
          ))}
          <div className="self-stretch w-px bg-black/[.08] dark:bg-white/[.1] my-0.5"/>
          <GroupLabel>Crédito</GroupLabel>
          {creditAccounts.map(a => (
            <AccountChip key={a.id} account={a} member={a.member}
              selected={selectedAccount === a.id} onToggle={handleChipToggle}/>
          ))}
        </div>
      </div>

      {/* Tabla últimos movimientos */}
      <div>
        <SectionLabel>Últimos movimientos</SectionLabel>
        <MovTable rows={visibleMovs} showWho showAccount/>
        {hasMore && (
          <button onClick={() => setShowAll(true)}
            className="mt-2.5 w-full py-2.5 text-center text-[13px] text-ink-mute dark:text-night-softText hover:text-ink dark:hover:text-night-text transition-colors">
            Ver todos ({baseMovs.length}) →
          </button>
        )}
      </div>
    </section>
  );
}


// ─── BLOQUE 3 — Análisis ─────────────────────────────────────────────────────
function AccountCard({ account }) {
  const isCredit = account.type === 'credit_card';
  return (
    <div className="bg-white dark:bg-night-card rounded-2xl p-4 border border-black/[.04] dark:border-white/[.05] shadow-subtle flex items-center gap-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0
                       ${isCredit
                         ? 'bg-purple-100 text-purple-500 dark:bg-purple-500/15 dark:text-purple-300'
                         : 'bg-blue-100 text-blue-500 dark:bg-blue-500/15 dark:text-blue-300'}`}>
        <IconFinCard/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-ink dark:text-night-text truncate">{account.name}</div>
        <div className="text-[12px] text-ink-mute dark:text-night-softText tabular-nums mt-0.5">
          ···· {lastFour(account.number)}
          <span className="ml-2 not-tabular">
            {isCredit ? 'Crédito' : account.type === 'savings_account' ? 'Ahorro' : 'Corriente/Vista'}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[15px] font-medium tabular-nums text-ink dark:text-night-text">
          {formatCLP(account.balance.available)}
        </div>
        <div className="text-[11px] text-ink-mute dark:text-night-softText">
          {isCredit ? 'Disponible' : 'Saldo'} · {formatRefreshed(account.refreshed_at)}
        </div>
        {isCredit && account.balance.limit && (
          <div className="text-[10.5px] tabular-nums text-ink-mute dark:text-night-softText mt-0.5">
            Deuda {formatCLP(Math.abs(account.balance.current))} / {formatCLP(account.balance.limit)}
          </div>
        )}
      </div>
    </div>
  );
}

function CuentasTab({ members }) {
  if (!members || members.length === 0) return <EmptyHint text="Sin cuentas."/>;
  return (
    <div className="space-y-8">
      {members.map(m => (
        <div key={m.id}>
          <div className="flex items-center gap-2.5 mb-3">
            <MemberAvatar member={m} size={28}/>
            <span className="text-[15px] font-medium text-ink dark:text-night-text">{m.name}</span>
          </div>
          <div className="space-y-2.5">
            {m.accounts.map(a => <AccountCard key={a.id} account={a}/>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalisisBloque({ members }) {
  const [tab, setTab]   = React.useState('movimientos');
  const [query, setQuery] = React.useState('');

  const allMovements = React.useMemo(() => {
    const movs = members.flatMap(m =>
      m.movements.map(mov => ({
        ...mov,
        member: m,
        account: m.accounts.find(a => a.id === mov.account_id),
      }))
    );
    return movs.sort((a, b) => b.post_date.localeCompare(a.post_date));
  }, [members]);

  const filteredMovs = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return allMovements;
    return allMovements.filter(m => m.description.toLowerCase().includes(needle));
  }, [allMovements, query]);

  return (
    <section>
      <SectionLabel>Análisis</SectionLabel>

      <FinTabs value={tab} onValueChange={(v) => { setTab(v); setQuery(''); }}>
        <div className="-mx-5 sm:mx-0 px-5 sm:px-0 overflow-x-auto no-scrollbar">
          <FinTabsList look="seg">
            <FinTabsTrigger value="movimientos">Movimientos</FinTabsTrigger>
            <FinTabsTrigger value="cuentas">Cuentas</FinTabsTrigger>
          </FinTabsList>
        </div>

        <div className="mt-5">
          <FinTabsContent value="movimientos">
            <SearchInput value={query} onChange={setQuery} placeholder="Buscar en movimientos..."/>
            <MovTable rows={filteredMovs} showWho showAccount/>
          </FinTabsContent>
          <FinTabsContent value="cuentas">
            <CuentasTab members={members}/>
          </FinTabsContent>
        </div>
      </FinTabs>
    </section>
  );
}


// ─── BLOQUE 4 — Personal ─────────────────────────────────────────────────────
function PersonalBloque({ member }) {
  const [privacyOn, setPrivacyOn] = React.useState(true);
  const [query, setQuery]         = React.useState('');

  // Métricas personales calculadas desde movimientos del mes actual
  const curMonth = React.useMemo(getCurrentMonth, []);
  const { saldo, ingresos, gastos, monthMovs } = React.useMemo(() => {
    const debitAccs = member.accounts.filter(a => a.type !== 'credit_card');
    const saldo     = debitAccs.reduce((s, a) => s + a.balance.available, 0);
    const inMonth   = member.movements.filter(m => m.post_date.startsWith(curMonth));
    const ingresos  = inMonth.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0);
    const gastos    = inMonth.filter(m => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0);
    const sorted    = [...inMonth].sort((a, b) => b.post_date.localeCompare(a.post_date));
    return { saldo, ingresos, gastos, monthMovs: sorted };
  }, [member, curMonth]);

  const filteredMovs = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return monthMovs;
    return monthMovs.filter(m => m.description.toLowerCase().includes(needle));
  }, [monthMovs, query]);

  // Enriquecer movimientos con account para mostrar últimos 4 dígitos
  const enrichedMovs = React.useMemo(() =>
    filteredMovs.map(m => ({
      ...m,
      account: member.accounts.find(a => a.id === m.account_id),
    })),
    [filteredMovs, member]
  );

  const cuentasLabel = member.accounts.map(a => `${a.name} ···· ${lastFour(a.number)}`).join(' + ');

  const fmt = (n) => privacyOn ? formatCLP(n) : '••••••';

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <SectionLabel>Personal · Solo yo</SectionLabel>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-600 dark:bg-purple-400/15 dark:text-purple-300 -mt-3">
            <IconFinLock/> Privado
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {!privacyOn && <span className="text-ink-mute dark:text-night-softText"><IconFinLock/></span>}
          <span className="text-[12.5px] text-ink-soft dark:text-night-softText">
            {privacyOn ? 'Montos visibles' : 'Montos ocultos'}
          </span>
          <FinSwitch checked={privacyOn} onChange={setPrivacyOn} ariaLabel="Mostrar/ocultar montos personales"/>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <MemberAvatar member={member} size={36}/>
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-ink dark:text-night-text">
            Finanzas de {member.name}
          </p>
          <p className="text-[12px] text-ink-soft dark:text-night-softText truncate">{cuentasLabel}</p>
        </div>
      </div>

      <div className="-mx-5 sm:mx-0 px-5 sm:px-0 flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto snap-x sm:overflow-visible no-scrollbar mb-5">
        <MetricCard icon={<IconFinWallet/>} label="Saldo disponible" value={fmt(saldo)}/>
        <MetricCard icon={<IconFinIn/>}     label="Ingresos del mes" value={fmt(ingresos)} variant={privacyOn ? 'positive' : 'neutral'}/>
        <MetricCard icon={<IconFinOut/>}    label="Gastos del mes"   value={fmt(gastos)}   variant={privacyOn ? 'negative' : 'neutral'}/>
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder="Buscar en mis movimientos..."/>
      <MovTable rows={enrichedMovs} showAccount privacyOn={privacyOn}/>
    </section>
  );
}


// ─── FinanzasPage ────────────────────────────────────────────────────────────
function FinanzasPage() {
  const [activeFamily, setActiveFamily] = React.useState('A');

  const familyData = activeFamily === 'A' ? FAMILIA_A : FAMILIA_B;
  // Andreu es siempre el usuario personal (está en Familia A)
  const andreuMember = React.useMemo(
    () => FAMILIA_A.find(m => m.id === 'andreu') || FAMILIA_A[0],
    []
  );

  return (
    <div className="route-fade max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-10 pb-28 md:pb-14">

      {/* HEADER */}
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-[28px] sm:text-[34px] font-medium tracking-tight text-ink dark:text-night-text">
            Finanzas
          </h1>
          <p className="text-[14px] text-ink-soft dark:text-night-softText mt-1">
            Lo compartido y lo de tu familia, en un solo lugar.
          </p>
        </div>
        {/* Segmented toggle Familia A / B */}
        <div className="inline-flex p-1 rounded-full bg-paper-soft dark:bg-night-soft">
          {['A', 'B'].map(f => (
            <button key={f} onClick={() => setActiveFamily(f)}
              className={`px-4 py-1.5 rounded-full text-[13.5px] transition-colors
                          ${activeFamily === f
                            ? 'bg-white dark:bg-night-card text-ink dark:text-night-text font-medium shadow-subtle border border-black/[.05] dark:border-white/[.06]'
                            : 'text-ink-soft dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
              Familia {f}
            </button>
          ))}
        </div>
      </header>

      {/* BLOQUE 1 — Compartido (fijo, no cambia con toggle) */}
      <CompartidoBloque/>

      <SectionDivider/>

      {/* BLOQUE 2 — Mi Familia (key resetea selectedAccount al cambiar familia) */}
      <FamiliaBloque key={activeFamily} members={familyData}/>

      <SectionDivider/>

      {/* BLOQUE 3 — Análisis */}
      <AnalisisBloque members={familyData}/>

      <SectionDivider/>

      {/* BLOQUE 4 — Personal (siempre Andreu) */}
      <PersonalBloque member={andreuMember}/>

    </div>
  );
}


// ─── Loading / Error ─────────────────────────────────────────────────────────
function FinanzasLoading() {
  const Box = ({ className }) => (
    <div className={`rounded-2xl bg-paper-soft dark:bg-night-soft animate-pulse ${className}`}/>
  );
  return (
    <div className="route-fade max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-10 pb-28 md:pb-14 space-y-6">
      <Box className="h-9 w-48"/>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Box key={i} className="h-24"/>)}
      </div>
      <Box className="h-10 w-72"/>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => <Box key={i} className="h-14"/>)}
      </div>
    </div>
  );
}


// ─── Ocultar scrollbar en chips / tabs móvil ─────────────────────────────────
const __finStyle = document.createElement('style');
__finStyle.textContent = `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none;-ms-overflow-style:none}`;
document.head.appendChild(__finStyle);


Object.assign(window, { FinanzasPage });
