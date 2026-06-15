// Home Lettuce — Finanzas
// ─────────────────────────────────────────────────────────────────────────────
// Prototipo integrado en AppShell. En el repo TS real, este archivo se
// reparte así:
//   · src/types/finance.ts
//   · src/lib/time.ts                                    (extensión)
//   · src/hooks/useFamilyFinances.ts
//   · src/hooks/usePersonalFinances.ts
//   · src/components/app/finanzas/MetricCard.tsx
//   · src/components/app/finanzas/familia/FamiliaMetrics.tsx
//   · src/components/app/finanzas/familia/PresupuestosView.tsx
//   · src/components/app/finanzas/familia/TarjetasView.tsx
//   · src/components/app/finanzas/familia/MovimientosTable.tsx
//   · src/components/app/finanzas/familia/GastosView.tsx
//   · src/components/app/finanzas/personal/MonthSelector.tsx
//   · src/components/app/finanzas/personal/PrivacyToggle.tsx
//   · src/components/app/finanzas/personal/PersonalView.tsx
//   · src/pages/FinanzasPage.tsx
// ─────────────────────────────────────────────────────────────────────────────


// ─── src/types/finance.ts ───────────────────────────────────────────────────
// type AccountType = 'debit' | 'credit'
// type BankAccount     = { id, bankName, lastFour, type, balance, currency, ownerIds[] }
// type Transaction     = { id, date, description, category, amount, accountId }
// type Budget          = { id, category, limit, spent, currency, month }
// type FixedExpense    = { id, name, amount, averageAmount, dayOfMonth, type, periodicity, nextDue, category }
// type PersonalFinance = { userId, isPrivate, currentBalance, monthlyIncome, monthlyExpenses, transactions }


// ─── src/lib/time.ts (extensión) ────────────────────────────────────────────
// Toda la lógica de fechas y moneda vive aquí — nunca en JSX.
// Helpers locales con prefijo `fin_*` para no chocar con calendar.jsx en el
// preview Babel (en el repo real son módulos separados).

const FIN_MONTH_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const FIN_MONTH_LONG  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                         'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function fin_pad2(n) { return String(n).padStart(2, '0'); }

// Retorna los últimos n meses + el actual como array de "YYYY-MM"
// Ejemplo: getRecentMonths(6) → ["2025-12", "2026-01", ..., "2026-05"]
function getRecentMonths(n) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), 1);
  const out = [];
  for (let i = n; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    out.push(`${d.getFullYear()}-${fin_pad2(d.getMonth() + 1)}`);
  }
  return out;
}

// "2026-05" → "Mayo 2026" (long) | "may" (short)
function formatMonth(yearMonth, format) {
  const [y, m] = yearMonth.split('-').map(Number);
  if (format === 'short') return FIN_MONTH_SHORT[m - 1];
  return `${FIN_MONTH_LONG[m - 1]} ${y}`;
}

// Retorna los próximos n meses contando el actual como primero.
// Ejemplo: getUpcomingMonths(6) → ["2026-06", "2026-07", ..., "2026-11"]
function getUpcomingMonths(n) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), 1);
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setMonth(d.getMonth() + i);
    out.push(`${d.getFullYear()}-${fin_pad2(d.getMonth() + 1)}`);
  }
  return out;
}

function isCurrentMonth(yearMonth) {
  const d = new Date();
  return yearMonth === `${d.getFullYear()}-${fin_pad2(d.getMonth() + 1)}`;
}

// Formato CLP: 1234567 → "$1.234.567"  | -1234 → "-$1.234"
function formatCLP(amount) {
  if (amount == null || isNaN(amount)) return '$0';
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(Math.round(amount));
  const grouped = abs.toLocaleString('es-CL').replace(/,/g, '.');
  return `${sign}$${grouped}`;
}

// "2026-05-21" → "21 may"
function formatDayShort(iso) {
  if (!iso) return '';
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${FIN_MONTH_SHORT[m - 1]}`;
}

// "2026-05-21" → mismo "YYYY-MM"
function monthOf(iso) { return iso.slice(0, 7); }


// ─── src/lib/categoryColors.ts ──────────────────────────────────────────────
// Mapeo de nombre de categoría → id en CALENDAR_COLORS (definido en calendar.jsx).
// Si CALENDAR_COLORS no estuviera disponible (orden de scripts), caemos a una
// tabla local equivalente.
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

const FIN_CATEGORY_TO_COLOR = {
  'Sueldo':        'sage',
  'Freelance':     'sage',
  'Ahorro':        'sage',
  'Comida':        'peach',
  'Restaurantes':  'peach',
  'Mercado':       'peach',
  'Transporte':    'sky',
  'Vivienda':      'lavender',
  'Servicios':     'sky',
  'Ocio':          'rose',
  'Cine':          'rose',
  'Salud':         'butter',
  'Educación':     'lavender',
  'Ropa':          'rose',
  'Mascotas':      'butter',
  'Suscripciones': 'lavender',
  'Otros':         'sky',
};
function categoryColor(name) {
  return finGetColor(FIN_CATEGORY_TO_COLOR[name] || 'sky');
}


// ─── iconos locales para esta vista ─────────────────────────────────────────
const FI = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...props}/>
);
const IconFinWallet = (p) => (
  <FI {...p}>
    <path d="M3.5 8.5h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-13a1 1 0 0 1-1-1V8.5Z"/>
    <path d="M3.5 8.5V7a2 2 0 0 1 2-2h11"/>
    <circle cx="16.5" cy="14.5" r="1.1" fill="currentColor"/>
  </FI>
);
const IconFinIn = (p) => (
  <FI {...p}><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></FI>
);
const IconFinOut = (p) => (
  <FI {...p}><path d="M12 5v14"/><path d="m6 13 6 6 6-6"/></FI>
);
const IconFinBalance = (p) => (
  <FI {...p}>
    <path d="M4 7h16M7 7v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7"/>
    <path d="M10 11h4M10 14.5h4"/>
  </FI>
);
const IconFinClock = (p) => (
  <FI {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></FI>
);
const IconFinSearch = (p) => (
  <FI {...p}><circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/></FI>
);
const IconFinLock = (p) => (
  <FI {...p} width="14" height="14">
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/>
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>
  </FI>
);
const IconFinCard = (p) => (
  <FI {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2.5"/>
    <path d="M3 10h18M7 15h3"/>
  </FI>
);
const IconFinChevron = (p) => (
  <FI {...p} width="15" height="15"><path d="m6 9 6 6 6-6"/></FI>
);
const IconFinStar = (p) => (
  <svg viewBox="0 0 24 24" width="13" height="13" {...p}>
    <path d="M12 2.5l2.7 5.86 6.3.74-4.7 4.32 1.27 6.28L12 16.9l-5.57 2.8 1.27-6.28-4.7-4.32 6.3-.74L12 2.5z"
          fill="currentColor"/>
  </svg>
);


// ─── src/hooks/useFamilyFinances.ts ─────────────────────────────────────────
// TODO: reemplazar por
//   useQuery(['family-finances', month], () =>
//     fetch(`/api/v1/family/finances?month=${month}`).then(r => r.json()))
// y pasar el `month` seleccionado en la UI (no hay selector en Familia aún —
// usar mes actual mientras tanto).

function buildSubfamilyAMock() {
  const now = new Date();
  const ym  = `${now.getFullYear()}-${fin_pad2(now.getMonth() + 1)}`;
  const day = (n) => `${ym}-${fin_pad2(n)}`;

  const accounts = [
    // ── Débito ───────────────────────────────────────────────────────────
    { id: 'acc-deb-mama', bankName: 'Banco Estado', lastFour: '4821', owner: 'Mamá',
      type: 'debit',  principal: true,  balance: 2_345_900, currency: 'CLP', ownerIds: ['mama'] },
    { id: 'acc-deb-hermano', bankName: 'Cuenta Vista', lastFour: '2093', owner: 'Hermano',
      type: 'debit',  balance:   612_300, currency: 'CLP', ownerIds: ['hermano'] },
    { id: 'acc-deb-andreu', bankName: 'Cuenta Vista', lastFour: '5510', owner: 'Andreu',
      type: 'debit',  balance:   438_750, currency: 'CLP', ownerIds: ['andreu'] },
    // ── Crédito ──────────────────────────────────────────────────────────
    { id: 'acc-cred-mama', bankName: 'Crédito', lastFour: '1077', owner: 'Mamá',
      type: 'credit', balance:  -312_450, currency: 'CLP', ownerIds: ['mama'] },
    { id: 'acc-cred-hermano', bankName: 'Crédito', lastFour: '8841', owner: 'Hermano',
      type: 'credit', balance:  -198_900, currency: 'CLP', ownerIds: ['hermano'] },
    { id: 'acc-cred-andreu', bankName: 'Crédito', lastFour: '6204', owner: 'Andreu',
      type: 'credit', balance:  -156_700, currency: 'CLP', ownerIds: ['andreu'] },
  ];

  const budgets = [
    { id: 'b-1', category: 'Mercado',       limit:  400_000, spent: 248_900, currency: 'CLP', month: ym },
    { id: 'b-2', category: 'Restaurantes',  limit:  150_000, spent: 121_300, currency: 'CLP', month: ym },
    { id: 'b-3', category: 'Ocio',          limit:  100_000, spent:  98_500, currency: 'CLP', month: ym },
    { id: 'b-4', category: 'Transporte',    limit:  120_000, spent:  44_200, currency: 'CLP', month: ym },
  ];

  const fixedExpenses = [
    // ── Estables ───────────────────────────────────────────────────────────
    { id: 'f-1',  name: 'Arriendo',          amount: 720_000, averageAmount: null,
      dayOfMonth: 5,  type: 'stable',   periodicity: 'monthly', nextDue: day(5),  category: 'Vivienda' },
    { id: 'f-1b', name: 'Gastos comunes',    amount:  85_000, averageAmount: null,
      dayOfMonth: 5,  type: 'stable',   periodicity: 'monthly', nextDue: day(5),  category: 'Vivienda' },
    { id: 'f-2',  name: 'Internet',          amount:  29_990, averageAmount: null,
      dayOfMonth: 12, type: 'stable',   periodicity: 'monthly', nextDue: day(12), category: 'Servicios' },
    { id: 'f-2b', name: 'Plan celular',      amount:  18_990, averageAmount: null,
      dayOfMonth: 20, type: 'stable',   periodicity: 'monthly', nextDue: day(20), category: 'Servicios' },
    { id: 'f-5',  name: 'Netflix',           amount:   9_990, averageAmount: null,
      dayOfMonth: 14, type: 'stable',   periodicity: 'monthly', nextDue: day(14), category: 'Suscripciones' },
    { id: 'f-5b', name: 'Disney+',           amount:   7_990, averageAmount: null,
      dayOfMonth:  8, type: 'stable',   periodicity: 'monthly', nextDue: day(8),  category: 'Suscripciones' },
    { id: 'f-5c', name: 'Runna',             amount:  14_990, averageAmount: null,
      dayOfMonth: 11, type: 'stable',   periodicity: 'monthly', nextDue: day(11), category: 'Suscripciones' },
    { id: 'f-5d', name: 'Amazon Prime',      amount:   4_990, averageAmount: null,
      dayOfMonth: 21, type: 'stable',   periodicity: 'monthly', nextDue: day(21), category: 'Suscripciones' },
    { id: 'f-5e', name: 'Spotify',           amount:   5_990, averageAmount: null,
      dayOfMonth:  3, type: 'stable',   periodicity: 'monthly', nextDue: day(3),  category: 'Suscripciones' },
    { id: 'f-edu', name: 'Colegio',          amount: 380_000, averageAmount: null,
      dayOfMonth:  2, type: 'stable',   periodicity: 'monthly', nextDue: day(2),  category: 'Educación' },

    // ── Variables ──────────────────────────────────────────────────────────
    { id: 'f-3', name: 'Luz',                amount: null, averageAmount: 38_500,
      currentMonthAmount: 42_180, lastMonthAmount: 37_650,
      dayOfMonth: 18, type: 'variable', periodicity: 'monthly', nextDue: day(18), category: 'Servicios' },
    { id: 'f-4', name: 'Agua',               amount: null, averageAmount: 22_300,
      currentMonthAmount: 21_440, lastMonthAmount: 23_120,
      dayOfMonth: 22, type: 'variable', periodicity: 'monthly', nextDue: day(22), category: 'Servicios' },
    { id: 'f-3b', name: 'Gas',               amount: null, averageAmount: 24_500,
      currentMonthAmount: 26_980, lastMonthAmount: 22_770,
      dayOfMonth: 24, type: 'variable', periodicity: 'monthly', nextDue: day(24), category: 'Servicios' },
    { id: 'f-3c', name: 'Estacionamiento',   amount: null, averageAmount: 45_000,
      currentMonthAmount: 48_500, lastMonthAmount: 43_200,
      dayOfMonth: 28, type: 'variable', periodicity: 'monthly', nextDue: day(28), category: 'Transporte' },

    // ── Recurrentes / Puntuales ───────────────────────────────────────────
    { id: 'f-6', name: 'Seguro auto',        amount: 380_000, averageAmount: null,
      dayOfMonth: 1,  type: 'recurring', periodicity: 'annual',  nextDue: '2026-09-01', category: 'Transporte' },
    { id: 'f-7', name: 'Notebook nueva',     amount: 750_000, averageAmount: null,
      dayOfMonth: null, type: 'one-time', periodicity: null,    nextDue: day(8),  category: 'Otros' },
  ];

  // Cada gasto fijo se carga a una cuenta concreta del hogar. La mayoría salen
  // de la cuenta principal (débito Mamá); algunas suscripciones se cargan a
  // tarjetas de crédito de cada integrante. Permite filtrar el panel por tarjeta.
  const FIXED_ACCOUNT = {
    'f-1':'acc-deb-mama', 'f-1b':'acc-deb-mama', 'f-edu':'acc-deb-mama',
    'f-2':'acc-deb-mama', 'f-2b':'acc-deb-mama',
    'f-5':'acc-cred-mama', 'f-5b':'acc-cred-mama', 'f-5d':'acc-cred-mama',
    'f-5c':'acc-cred-hermano', 'f-5e':'acc-cred-andreu',
    'f-3':'acc-deb-mama', 'f-4':'acc-deb-mama', 'f-3b':'acc-deb-mama', 'f-3c':'acc-deb-andreu',
    'f-6':'acc-deb-mama', 'f-7':'acc-deb-mama',
  };
  fixedExpenses.forEach(f => { f.accountId = FIXED_ACCOUNT[f.id] || 'acc-deb-mama'; });

  const transactions = [
    { id: 't-1',  date: day(2),  description: 'Sueldo Mamá',             category: 'Sueldo',       amount:  1_850_000, accountId: 'acc-deb-mama' },
    { id: 't-1b', date: day(3),  description: 'Sueldo Hermano',          category: 'Sueldo',       amount:    920_000, accountId: 'acc-deb-hermano' },
    { id: 't-2',  date: day(3),  description: 'Mercado Líder',           category: 'Mercado',      amount:    -82_490, accountId: 'acc-deb-mama' },
    { id: 't-3',  date: day(5),  description: 'Arriendo',                category: 'Vivienda',     amount:   -720_000, accountId: 'acc-deb-mama' },
    { id: 't-4',  date: day(6),  description: 'Cena Don Tito',           category: 'Restaurantes', amount:    -34_500, accountId: 'acc-cred-mama' },
    { id: 't-5',  date: day(8),  description: 'Bencina Copec',           category: 'Transporte',   amount:    -28_700, accountId: 'acc-cred-hermano' },
    { id: 't-6',  date: day(10), description: 'Mercado Líder',           category: 'Mercado',      amount:    -64_300, accountId: 'acc-deb-mama' },
    { id: 't-7',  date: day(11), description: 'Cine Hoyts',              category: 'Ocio',         amount:    -19_800, accountId: 'acc-cred-andreu' },
    { id: 't-8',  date: day(12), description: 'Internet Mundo',          category: 'Servicios',    amount:    -29_990, accountId: 'acc-deb-mama' },
    { id: 't-9',  date: day(13), description: 'Café Altura',             category: 'Restaurantes', amount:     -8_900, accountId: 'acc-cred-hermano' },
    { id: 't-10', date: day(14), description: 'Netflix',                 category: 'Suscripciones',amount:     -9_990, accountId: 'acc-cred-mama' },
    { id: 't-11', date: day(15), description: 'Reembolso Sofía',         category: 'Otros',        amount:     45_000, accountId: 'acc-deb-mama' },
    { id: 't-12', date: day(17), description: 'Mercado Jumbo',           category: 'Mercado',      amount:   -102_110, accountId: 'acc-deb-mama' },
    { id: 't-13', date: day(18), description: 'Concierto Caupolicán',    category: 'Ocio',         amount:    -78_700, accountId: 'acc-cred-andreu' },
    { id: 't-14', date: day(19), description: 'Uber',                    category: 'Transporte',   amount:    -15_500, accountId: 'acc-cred-hermano' },
    { id: 't-15', date: day(7),  description: 'Farmacia Cruz Verde',     category: 'Salud',        amount:    -23_400, accountId: 'acc-deb-andreu' },
    { id: 't-16', date: day(9),  description: 'Librería Antártica',      category: 'Educación',    amount:    -18_990, accountId: 'acc-deb-andreu' },
    { id: 't-17', date: day(16), description: 'Spotify',                 category: 'Suscripciones',amount:     -5_990, accountId: 'acc-cred-andreu' },
    { id: 't-18', date: day(20), description: 'Mall Costanera',          category: 'Ropa',         amount:    -56_700, accountId: 'acc-cred-mama' },
  ];

  // ── Cuotas / Compromisos en tarjetas de crédito ──────────────────────────
  // Compras pactadas en cuotas. `paid` = cuotas ya cobradas (en el pasado);
  // las restantes se proyectan mes a mes desde el mes actual hacia adelante.
  const commitments = [
    // Crédito Mamá
    { id: 'cm-1', accountId: 'acc-cred-mama',    description: 'MacBook Air M3',      category: 'Otros',
      totalAmount: 1_199_988, installments: 12, paid: 3, monthlyAmount: 99_999 },
    { id: 'cm-2', accountId: 'acc-cred-mama',    description: 'Refrigerador Samsung', category: 'Otros',
      totalAmount:   539_940, installments:  6, paid: 2, monthlyAmount: 89_990 },
    // Crédito Hermano
    { id: 'ch-1', accountId: 'acc-cred-hermano', description: 'PlayStation 5',        category: 'Ocio',
      totalAmount:   650_000, installments: 10, paid: 3, monthlyAmount: 65_000 },
    { id: 'ch-2', accountId: 'acc-cred-hermano', description: 'Zapatillas Nike Pegasus', category: 'Ropa',
      totalAmount:   119_970, installments:  3, paid: 1, monthlyAmount: 39_990 },
    // Crédito Andreu
    { id: 'ca-1', accountId: 'acc-cred-andreu',  description: 'Curso inglés online',  category: 'Educación',
      totalAmount:   359_940, installments:  6, paid: 1, monthlyAmount: 59_990 },
    { id: 'ca-2', accountId: 'acc-cred-andreu',  description: 'Bicicleta Trek FX',    category: 'Transporte',
      totalAmount:   479_880, installments: 12, paid: 2, monthlyAmount: 39_990 },
  ];

  return { accounts, budgets, fixedExpenses, transactions, commitments };
}

// ─── Capas de visibilidad: sub-familias + compartido ────────────────────────
// Phase 1 (sin auth real): el "usuario activo" se simula con un selector. Hay
// tres capas:
//   · shared → visible para TODOS (planes familiares, suscripciones divididas)
//   · A      → Andreu / Mamá / Hermano   (privado para Papá)
//   · B      → Papá                       (privado para sub-familia A)
// La sub-familia a la que NO perteneces nunca se renderiza ni se enlaza.
// En el repo real esto vendría del token de sesión + RLS por household_id.
const FIN_USER_SUBFAMILY = {
  'u-andreu': 'A', 'u-mama': 'A', 'u-hermano': 'A', 'u-papa': 'B',
};
const FIN_SUBFAMILY_META = {
  A: { id: 'A', label: 'Familia A', memberIds: ['u-andreu', 'u-mama', 'u-hermano'] },
  B: { id: 'B', label: 'Familia B', memberIds: ['u-papa'] },
};
function finSubfamilyOf(userId) { return FIN_USER_SUBFAMILY[userId] || 'A'; }

// ── Sub-familia B (Papá) ──────────────────────────────────────────────────
// Misma forma de datos que A para que TODAS las vistas (tablas, categorías,
// gráficos, tarjetas) funcionen sin cambios. Conjunto pequeño a propósito —
// las vistas sin datos muestran su empty-state habitual.
function buildSubfamilyBMock() {
  const now = new Date();
  const ym  = `${now.getFullYear()}-${fin_pad2(now.getMonth() + 1)}`;
  const day = (n) => `${ym}-${fin_pad2(n)}`;

  const accounts = [
    { id: 'b-deb-papa',  bankName: 'Banco de Chile', lastFour: '7720', owner: 'Papá',
      type: 'debit',  principal: true, balance: 1_980_400, currency: 'CLP', ownerIds: ['papa'] },
    { id: 'b-cred-papa', bankName: 'Crédito',        lastFour: '3391', owner: 'Papá',
      type: 'credit', balance: -184_500, currency: 'CLP', ownerIds: ['papa'] },
  ];

  const budgets = [
    { id: 'bb-1', category: 'Mercado', limit: 220_000, spent: 180_000, currency: 'CLP', month: ym },
  ];

  const fixedExpenses = [
    { id: 'bf-1', name: 'Arriendo',     amount: 350_000, averageAmount: null,
      dayOfMonth: 5, type: 'stable', periodicity: 'monthly', nextDue: day(5), category: 'Vivienda', accountId: 'b-deb-papa' },
    { id: 'bf-2', name: 'Supermercado', amount: 180_000, averageAmount: null,
      dayOfMonth: 1, type: 'stable', periodicity: 'monthly', nextDue: day(1), category: 'Mercado',  accountId: 'b-deb-papa' },
  ];

  const transactions = [
    { id: 'bt-1', date: day(1),  description: 'Sueldo Papá',         category: 'Sueldo',       amount:  2_450_000, accountId: 'b-deb-papa' },
    { id: 'bt-2', date: day(1),  description: 'Supermercado Jumbo',  category: 'Mercado',      amount:   -180_000, accountId: 'b-deb-papa' },
    { id: 'bt-3', date: day(5),  description: 'Arriendo',            category: 'Vivienda',     amount:   -350_000, accountId: 'b-deb-papa' },
    { id: 'bt-4', date: day(9),  description: 'Bencina Copec',       category: 'Transporte',   amount:    -32_400, accountId: 'b-cred-papa' },
    { id: 'bt-5', date: day(13), description: 'Farmacia Salcobrand', category: 'Salud',        amount:    -18_900, accountId: 'b-deb-papa' },
    { id: 'bt-6', date: day(18), description: 'Almuerzo Tarragona',  category: 'Restaurantes', amount:    -27_500, accountId: 'b-cred-papa' },
  ];

  return { accounts, budgets, fixedExpenses, transactions, commitments: [] };
}

// ── Capa compartida (visible para todos) ──────────────────────────────────
function buildSharedFinancesMock() {
  const now = new Date();
  const ym  = `${now.getFullYear()}-${fin_pad2(now.getMonth() + 1)}`;
  const day = (n) => `${ym}-${fin_pad2(n)}`;
  const memberIds = ['u-andreu', 'u-mama', 'u-hermano', 'u-papa'];
  const expenses = [
    { id: 's-1', name: 'Plan celular familia', amount: 29_900, category: 'Servicios',
      dayOfMonth: 20, nextDue: day(20), splitAmong: memberIds },
    { id: 's-2', name: 'Google One',           amount:  4_500, category: 'Suscripciones',
      dayOfMonth:  8, nextDue: day(8),  splitAmong: memberIds },
  ];
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  return { expenses, memberIds, memberCount: memberIds.length, total };
}

// Total mensual de gastos fijos (estables a monto fijo + variables a monto del
// mes en curso). Sirve para el resumen combinado.
function finMonthlyFixedTotal(fixedExpenses) {
  return (fixedExpenses || [])
    .filter(f => f.type === 'stable' || f.type === 'variable')
    .reduce((s, f) => s + (f.type === 'variable'
      ? (f.currentMonthAmount ?? f.averageAmount ?? 0)
      : (f.amount ?? 0)), 0);
}

function useFamilyFinances(subfamilyId) {
  // TODO: useQuery(['family-finances', subfamilyId, month]) con RLS por hogar.
  const data = React.useMemo(
    () => (subfamilyId === 'B' ? buildSubfamilyBMock() : buildSubfamilyAMock()),
    [subfamilyId]
  );
  return { data, isLoading: false, error: null };
}

function useSharedFinances() {
  const data = React.useMemo(() => buildSharedFinancesMock(), []);
  return { data, isLoading: false, error: null };
}


// ─── src/hooks/usePersonalFinances.ts ───────────────────────────────────────
// TODO: useQuery(['personal-finances', month], () =>
//   fetch(`/api/v1/users/me/finances?month=${month}`).then(r => r.json()))

function buildPersonalFinancesMock() {
  // Mock con transacciones distribuidas en los últimos meses para que
  // MonthSelector tenga datos al cambiar de mes.
  const months = getRecentMonths(6);

  const seedByMonth = {
    sueldo:  [ 1_350_000, 1_350_000, 1_400_000, 1_400_000, 1_500_000, 1_500_000, 1_500_000 ],
  };

  const txs = [];
  let txN = 1;
  months.forEach((ym, idx) => {
    const day = (n) => `${ym}-${fin_pad2(n)}`;
    const variants = [
      ['Sueldo Home Lettuce',  'Sueldo',        seedByMonth.sueldo[idx]],
      ['Café Altura',          'Restaurantes', -(6_500 + idx*500)],
      ['Spotify',              'Suscripciones',-5_990],
      ['Almuerzo oficina',     'Restaurantes', -(8_200 + idx*120)],
      ['Bencina',              'Transporte',   -(22_000 + idx*1500)],
      ['Libro Buscalibre',     'Educación',    -(12_900)],
      ['Cumple Andrés (gift)', 'Otros',        -(15_000)],
      ['Gimnasio',             'Salud',        -(24_990)],
      ['Cena de viernes',      'Restaurantes', -(28_400 + idx*1000)],
      ['Mercado para mí',      'Mercado',      -(38_900 + idx*1200)],
    ];
    variants.forEach((v, i) => {
      txs.push({
        id: `pt-${txN++}`,
        date: day(2 + i * 2),
        description: v[0],
        category:    v[1],
        amount:      v[2],
        accountId:   'me-debit',
      });
    });
  });

  // Resumen del mes actual = última posición del seed
  const cur = months[months.length - 1];
  const inMonth = txs.filter(t => monthOf(t.date) === cur);
  const monthlyIncome   = inMonth.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const monthlyExpenses = inMonth.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return {
    userId: 'me',
    isPrivate: true,
    currentBalance: 1_120_400,
    monthlyIncome,
    monthlyExpenses,
    transactions: txs,
  };
}

function usePersonalFinances() {
  const data = React.useMemo(() => buildPersonalFinancesMock(), []);
  return { data, isLoading: false, error: null };
}


// ─── shadcn-like primitives (locales, mimetizan la API real) ────────────────
// En el repo real:
//   import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
//   import { Badge } from '@/components/ui/badge'
//   import { Progress } from '@/components/ui/progress'
//   import { Switch } from '@/components/ui/switch'

const FinTabsCtx = React.createContext({ value: null, onChange: () => {}, look: 'pill' });

// Cuentas del hogar disponibles para resolver accountId → titular/tarjeta en las
// columnas "Tarjeta" de las tablas de gastos. Se provee a nivel de FinanzasPage.
const FinAccountsCtx = React.createContext([]);

function FinTabs({ value, onValueChange, children, className = '' }) {
  // Propagamos por contexto para que wrappers intermedios (divs, secciones)
  // no rompan la comunicación entre TabsList y TabsContent.
  const ctx = React.useMemo(
    () => ({ value, onChange: onValueChange, look: 'pill' }),
    [value, onValueChange]
  );
  return (
    <FinTabsCtx.Provider value={ctx}>
      <div className={className}>{children}</div>
    </FinTabsCtx.Provider>
  );
}
function FinTabsList({ children, look = 'pill', className = '' }) {
  // look="pill"  → píldoras suaves (vista principal Familia/Personal)
  // look="seg"   → segmented underline (vistas internas)
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
                    ${active
                      ? 'text-ink dark:text-night-text font-medium'
                      : 'text-ink-mute dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
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

function FinBadge({ color, children, soft = true }) {
  const c = finGetColor(color || 'sky');
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11.5px]
                      ${c.bg} ${c.text} whitespace-nowrap`}>
      {children}
    </span>
  );
}
function FinStatusBadge({ status }) {
  // "Cerrado" → gris  |  "Abierto" → azul pastel
  const styles = status === 'Cerrado'
    ? 'bg-gray-100 text-gray-500 dark:bg-white/[.06] dark:text-night-softText'
    : 'bg-blue-100 text-blue-500 dark:bg-blue-500/15 dark:text-blue-300';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium ${styles}`}>
      {status}
    </span>
  );
}

function FinProgress({ value, tone = 'auto' }) {
  // value 0..100. tone="auto" deriva color por umbrales.
  const v = Math.max(0, Math.min(100, value));
  const t = tone === 'auto'
    ? (v < 70 ? 'green' : v < 90 ? 'amber' : 'red')
    : tone;
  const bar = ({
    green: 'bg-green-300 dark:bg-green-400/60',
    amber: 'bg-yellow-300 dark:bg-yellow-400/70',
    red:   'bg-red-300   dark:bg-red-400/70',
  })[t];
  return (
    <div className="h-1.5 rounded-full bg-black/[.06] dark:bg-white/[.08] overflow-hidden">
      <div className={`h-full rounded-full ${bar} transition-[width] duration-500`}
           style={{ width: `${v}%` }}/>
    </div>
  );
}

function FinSwitch({ checked, onChange, ariaLabel }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative h-[22px] w-[38px] rounded-full transition-colors
                  ${checked
                    ? 'bg-accent'
                    : 'bg-black/[.12] dark:bg-white/[.18]'}`}>
      <span className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-subtle
                        transition-[left] duration-200
                        ${checked ? 'left-[18px]' : 'left-[2px]'}`}/>
    </button>
  );
}


// ─── src/components/app/finanzas/MetricCard.tsx ─────────────────────────────
// Variante:
//   neutral   — valor en color ink
//   positive  — verde
//   negative  — rojo
//   balanced  — verde si >=0, rojo si <0
//   info      — para "Próximo vencimiento" (valor = texto, no monto)
function MetricCard({ icon, label, value, sublabel, variant = 'neutral', amount, tag }) {
  let valueColor = 'text-ink dark:text-night-text';
  if (variant === 'positive') valueColor = 'text-green-600 dark:text-green-400';
  if (variant === 'negative') valueColor = 'text-red-500  dark:text-red-400';
  if (variant === 'balanced') {
    valueColor = (amount ?? 0) >= 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-500  dark:text-red-400';
  }
  return (
    <div className="snap-start shrink-0 w-[200px] sm:w-auto
                    bg-white dark:bg-night-card rounded-2xl p-4
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle">
      <div className="flex items-center gap-2 text-ink-mute dark:text-night-softText">
        <span className="h-7 w-7 rounded-full bg-paper-soft dark:bg-night-soft
                         flex items-center justify-center shrink-0">
          {icon}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[.06em]">
          {label}
        </span>
      </div>
      <div className={`mt-3 text-[22px] sm:text-[24px] font-medium tabular-nums leading-none
                       truncate ${valueColor}`}>
        {value}
      </div>
      {sublabel && (
        <div className="mt-2 text-[11.5px] text-ink-mute dark:text-night-softText min-w-0">
          {sublabel}
        </div>
      )}
      {tag && (
        <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold
                        uppercase tracking-[.05em] px-1.5 py-0.5 rounded-full
                        bg-accent-tint text-accent">
          {tag}
        </div>
      )}
    </div>
  );
}

function MetricRow({ children }) {
  // Grid en desktop, scroll horizontal en mobile.
  return (
    <div className="-mx-5 sm:mx-0 px-5 sm:px-0
                    flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3
                    overflow-x-auto snap-x sm:overflow-visible
                    no-scrollbar">
      {children}
    </div>
  );
}


// ─── src/components/app/finanzas/familia/AccountSelector.tsx ────────────────
// Fila compacta de pills seleccionables, en dos grupos (Débito · Crédito)
// separados por un divisor vertical. Cada pill muestra solo titular + últimos
// 4 dígitos; el saldo aparece solo en el pill activo (inline) o al pasar el
// cursor (tooltip). Seleccionar un pill NO cambia las métricas — es un acceso
// rápido al detalle de esa tarjeta en la pestaña Tarjetas.
function AccountPill({ account, active, hovered, onSelect, onHover }) {
  const isCredit = account.type === 'credit';
  return (
    <button
      type="button"
      onClick={() => onSelect(account.id)}
      onMouseEnter={() => onHover(account.id)}
      onMouseLeave={() => onHover(h => (h === account.id ? null : h))}
      onFocus={() => onHover(account.id)}
      onBlur={() => onHover(h => (h === account.id ? null : h))}
      aria-pressed={active}
      title={`Ver detalle de ${account.owner} ···· ${account.lastFour}`}
      className={`relative inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full
                  text-[13px] border transition-all duration-200 whitespace-nowrap
                  ${active
                    ? 'border-accent bg-accent-tint text-ink dark:text-night-text ring-1 ring-accent shadow-subtle'
                    : 'border-black/[.07] dark:border-white/[.08] bg-white dark:bg-night-card text-ink-soft dark:text-night-softText hover:border-black/[.16] dark:hover:border-white/[.16] hover:text-ink dark:hover:text-night-text'}`}>
      {account.principal && (
        <span className="text-[hsl(var(--accent-strong))] shrink-0 -ml-0.5"><IconFinStar/></span>
      )}
      <span className="font-medium">{account.owner}</span>
      <span className="tabular-nums text-ink-mute dark:text-night-softText">{account.lastFour}</span>
      {active && (
        <span className="pl-1.5 ml-0.5 border-l border-black/[.1] dark:border-white/[.12]
                         tabular-nums font-medium text-[hsl(var(--accent-strong))]">
          {formatCLP(account.balance)}
        </span>
      )}

      {/* Tooltip de saldo en hover (solo cuando no está activo) */}
      {hovered && !active && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-30
                         px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none
                         bg-ink text-paper dark:bg-night-card dark:text-night-text
                         dark:border dark:border-white/[.08]
                         text-[11.5px] tabular-nums shadow-[0_8px_24px_-8px_rgba(0,0,0,.35)]">
          {formatCLP(account.balance)}
          <span className="opacity-60"> {isCredit ? 'a pagar' : 'saldo'}</span>
        </span>
      )}
    </button>
  );
}

function AccountSelector({ accounts, selectedId, hoveredId, onSelect, onHover }) {
  const debit  = accounts.filter(a => a.type === 'debit');
  const credit = accounts.filter(a => a.type === 'credit');

  const Group = ({ label, items, tone }) => (
    <div className="flex items-center gap-2.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-[.09em]
                       text-ink-mute dark:text-night-softText flex items-center gap-1.5 shrink-0">
        <span className={`h-1.5 w-1.5 rounded-full ${tone}`}/>
        {label}
      </span>
      <div className="flex items-center gap-2">
        {items.map(a => (
          <AccountPill
            key={a.id}
            account={a}
            active={a.id === selectedId}
            hovered={a.id === hoveredId}
            onSelect={onSelect}
            onHover={onHover}/>
        ))}
      </div>
    </div>
  );

  return (
    <div className="-mx-5 sm:mx-0 px-5 sm:px-0 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-4 min-w-max py-1">
        <Group label="Débito"  items={debit}  tone="bg-blue-300 dark:bg-blue-400/70"/>
        <div className="self-stretch w-px bg-black/[.08] dark:bg-white/[.1] my-0.5"/>
        <Group label="Crédito" items={credit} tone="bg-purple-300 dark:bg-purple-400/70"/>
      </div>
    </div>
  );
}


// ─── src/components/app/finanzas/familia/FamiliaMetrics.tsx ─────────────────
// Las 4 métricas SIEMPRE muestran el consolidado del hogar — son independientes
// del pill de cuenta seleccionado. El saldo disponible queda anclado a la cuenta
// débito principal (Banco Estado ···· 4821). Los gastos del mes suman el débito
// ejecutado + el crédito comprometido (compras en tarjetas de crédito que aún no
// se cobran a la débito principal), diferenciados en el subtexto.
function FamiliaMetrics({ principal, transactions, commitments, accounts }) {
  const creditIds = React.useMemo(
    () => new Set(accounts.filter(a => a.type === 'credit').map(a => a.id)),
    [accounts]
  );

  const { income, debitExec, committed, expenses, balance } = React.useMemo(() => {
    let income = 0, debitExec = 0, creditTxn = 0;
    transactions.forEach(t => {
      if (t.amount > 0) { income += t.amount; return; }
      if (creditIds.has(t.accountId)) creditTxn += -t.amount;
      else debitExec += -t.amount;
    });
    // Cuota del mes en curso de cada compra en cuotas aún vigente.
    const commitMonth = (commitments || []).reduce(
      (s, c) => s + ((c.installments - c.paid) > 0 ? c.monthlyAmount : 0), 0
    );
    const committed = creditTxn + commitMonth;
    const expenses  = debitExec + committed;
    return { income, debitExec, committed, expenses, balance: income - expenses };
  }, [transactions, commitments, creditIds]);

  const today = new Date();
  const monthLabel = formatMonth(
    monthOf(transactions[0]?.date || `${today.getFullYear()}-${fin_pad2(today.getMonth()+1)}`),
    'long'
  );

  return (
    <MetricRow>
      <MetricCard
        icon={<IconFinWallet/>}
        label="Saldo disponible"
        value={formatCLP(principal?.balance ?? 0)}
        sublabel={`${principal.bankName} ···· ${principal.lastFour}`}/>
      <MetricCard
        icon={<IconFinIn/>}
        label="Ingresos del mes"
        value={formatCLP(income)}
        sublabel={`${monthLabel} · Todo el hogar`}
        variant="positive"/>
      <MetricCard
        icon={<IconFinOut/>}
        label="Gastos del mes"
        value={formatCLP(expenses)}
        variant="negative"
        sublabel={
          <span className="flex flex-col gap-0.5 leading-tight">
            <span className="tabular-nums">
              {formatCLP(debitExec)}
              <span className="text-ink-mute dark:text-night-softText"> ejecutado</span>
            </span>
            <span className="tabular-nums text-amber-600 dark:text-amber-300">
              {formatCLP(committed)}
              <span className="opacity-70"> comprometido</span>
            </span>
          </span>
        }/>
      <MetricCard
        icon={<IconFinBalance/>}
        label="Balance del mes"
        value={(balance >= 0 ? '+' : '') + formatCLP(balance)}
        sublabel="Ingresos − gastos"
        variant="balanced"
        amount={balance}/>
    </MetricRow>
  );
}


// ─── src/components/app/finanzas/familia/PresupuestosView.tsx ───────────────
function PresupuestosView({ budgets }) {
  if (!budgets.length) return <EmptyHint text="Aún no has creado presupuestos."/>;
  // TODO: botón "+ Nuevo presupuesto" → POST /api/v1/budgets
  return (
    <div className="space-y-3">
      {budgets.map(b => {
        const pct = Math.round((b.spent / b.limit) * 100);
        const c = categoryColor(b.category);
        return (
          <div key={b.id}
               className="bg-white dark:bg-night-card rounded-2xl p-4
                          border border-black/[.04] dark:border-white/[.05] shadow-subtle">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-2.5 w-2.5 rounded-full ${c.dot} shrink-0`}/>
                <span className="text-[14px] font-medium text-ink dark:text-night-text truncate">
                  {b.category}
                </span>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[13.5px] tabular-nums text-ink dark:text-night-text">
                  {formatCLP(b.spent)}<span className="text-ink-mute dark:text-night-softText"> / {formatCLP(b.limit)}</span>
                </div>
                <div className="text-[11px] tabular-nums text-ink-mute dark:text-night-softText">
                  {pct}% usado
                </div>
              </div>
            </div>
            <div className="mt-3">
              <FinProgress value={pct}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ─── src/components/app/finanzas/familia/TarjetasView.tsx ───────────────────
// Detalle de todas las tarjetas del hogar, agrupadas en Débito y Crédito. La
// tarjeta seleccionada desde los pills del selector superior se resalta aquí.
function TarjetasView({ accounts, highlightId }) {
  if (!accounts.length) return <EmptyHint text="No hay cuentas agregadas."/>;
  const debit  = accounts.filter(a => a.type === 'debit');
  const credit = accounts.filter(a => a.type === 'credit');

  const Card = ({ a }) => {
    const isDebit = a.type === 'debit';
    const highlighted = a.id === highlightId;
    return (
      <div className={`bg-white dark:bg-night-card rounded-2xl p-4 shadow-subtle
                       flex items-center gap-4 transition-all duration-200
                       ${highlighted
                         ? 'border border-accent ring-1 ring-accent bg-accent-tint/40'
                         : 'border border-black/[.04] dark:border-white/[.05]'}`}>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0
                         ${isDebit
                           ? 'bg-blue-100 text-blue-500 dark:bg-blue-500/15 dark:text-blue-300'
                           : 'bg-purple-100 text-purple-500 dark:bg-purple-500/15 dark:text-purple-300'}`}>
          <IconFinCard/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-ink dark:text-night-text truncate">
              {a.bankName}
            </span>
            <span className="text-[13px] text-ink-soft dark:text-night-softText">· {a.owner}</span>
            {a.principal && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase
                               tracking-[.05em] px-1.5 py-0.5 rounded-full
                               bg-accent text-[hsl(var(--accent-strong))]">
                <IconFinStar/> Principal
              </span>
            )}
          </div>
          <div className="text-[12px] text-ink-mute dark:text-night-softText tabular-nums mt-0.5">
            ···· {a.lastFour}
            {a.ownerIds && a.ownerIds.length > 1 && <span className="ml-2">· compartida</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-[15px] font-medium tabular-nums
                            ${a.balance >= 0
                              ? 'text-ink dark:text-night-text'
                              : 'text-red-500 dark:text-red-400'}`}>
            {formatCLP(a.balance)}
          </div>
          <div className="text-[11px] text-ink-mute dark:text-night-softText">
            {isDebit ? 'Saldo' : 'Saldo a pagar'}
          </div>
        </div>
      </div>
    );
  };

  const Group = ({ label, items, tone }) => (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 ml-1">
        <span className={`h-1.5 w-1.5 rounded-full ${tone}`}/>
        <span className="text-[11px] font-semibold uppercase tracking-[.08em]
                         text-ink-mute dark:text-night-softText">{label}</span>
      </div>
      {items.map(a => <Card key={a.id} a={a}/>)}
    </div>
  );

  return (
    <div className="space-y-6">
      <Group label="Débito"  items={debit}  tone="bg-blue-300 dark:bg-blue-400/70"/>
      <Group label="Crédito" items={credit} tone="bg-purple-300 dark:bg-purple-400/70"/>
    </div>
  );
}


// ─── src/components/app/finanzas/familia/MovimientosTable.tsx ───────────────
// TODO: paginación futura con cursor — `?cursor=...` y "Cargar más".
function MovimientosTable({ transactions, maxRows = 30 }) {
  const [q, setQ] = React.useState('');
  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const sorted = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
    const out = needle
      ? sorted.filter(t =>
          t.description.toLowerCase().includes(needle) ||
          t.category.toLowerCase().includes(needle))
      : sorted;
    return out.slice(0, maxRows);
  }, [transactions, q, maxRows]);

  return (
    <div>
      {/* Búsqueda */}
      <div className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5 mb-3
                      bg-paper-soft dark:bg-night-soft
                      border border-transparent focus-within:border-accent
                      focus-within:bg-white dark:focus-within:bg-night
                      transition-colors">
        <span className="text-ink-mute dark:text-night-softText shrink-0"><IconFinSearch/></span>
        <input
          type="text" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por descripción o categoría…"
          className="w-full bg-transparent outline-none text-[14px]
                     placeholder:text-ink-mute dark:placeholder:text-night-softText"/>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-night-card rounded-2xl
                      border border-black/[.04] dark:border-white/[.05] shadow-subtle
                      overflow-hidden">
        {/* Header — visible en sm+ */}
        <div className="hidden sm:grid grid-cols-[80px_1fr_140px_120px] gap-3 px-4 py-2.5
                        text-[11px] uppercase tracking-[.08em]
                        text-ink-mute dark:text-night-softText
                        border-b border-black/[.05] dark:border-white/[.05]">
          <div>Fecha</div>
          <div>Descripción</div>
          <div>Categoría</div>
          <div className="text-right">Monto</div>
        </div>

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px] text-ink-mute dark:text-night-softText">
            Sin movimientos para tu búsqueda.
          </div>
        )}

        <ul>
          {filtered.map((t, i) => (
            <li key={t.id}
                className={`${i === 0 ? '' : 'border-t border-black/[.045] dark:border-white/[.05]'}`}>
              {/* Desktop row */}
              <div className="hidden sm:grid grid-cols-[80px_1fr_140px_120px] gap-3 items-center
                              px-4 py-3">
                <div className="text-[12.5px] tabular-nums text-ink-soft dark:text-night-softText">
                  {formatDayShort(t.date)}
                </div>
                <div className="text-[13.5px] text-ink dark:text-night-text truncate">
                  {t.description}
                </div>
                <div className="min-w-0">
                  <FinBadge color={FIN_CATEGORY_TO_COLOR[t.category]}>
                    {t.category}
                  </FinBadge>
                </div>
                <div className={`text-right text-[14px] font-medium tabular-nums
                                  ${t.amount >= 0
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-500 dark:text-red-400'}`}>
                  {t.amount >= 0 ? '+' : ''}{formatCLP(t.amount)}
                </div>
              </div>

              {/* Mobile row */}
              <div className="sm:hidden px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11.5px] tabular-nums text-ink-mute dark:text-night-softText">
                      {formatDayShort(t.date)}
                    </span>
                    <FinBadge color={FIN_CATEGORY_TO_COLOR[t.category]}>{t.category}</FinBadge>
                  </div>
                  <div className="mt-1 text-[14px] text-ink dark:text-night-text truncate">
                    {t.description}
                  </div>
                </div>
                <div className={`text-right text-[14px] font-medium tabular-nums shrink-0
                                  ${t.amount >= 0
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-500 dark:text-red-400'}`}>
                  {t.amount >= 0 ? '+' : ''}{formatCLP(t.amount)}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {transactions.length > maxRows && (
          <div className="px-4 py-2.5 text-[11.5px] text-center text-ink-mute dark:text-night-softText
                           border-t border-black/[.045] dark:border-white/[.05]">
            Mostrando {maxRows} de {transactions.length} movimientos
          </div>
        )}
      </div>
    </div>
  );
}


// ─── src/components/app/finanzas/familia/CardTag.tsx ────────────────────────
// Identifica a qué titular y tarjeta pertenece un gasto. Punto azul = débito,
// morado = crédito. Las tarjetas de crédito llevan, además, un badge sutil
// "Comprometido" (gasto aún no cobrado a la débito principal — nunca en rojo).
function CommittedBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold
                     uppercase tracking-[.04em] whitespace-nowrap shrink-0
                     bg-amber-100/80 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300/90">
      Comprometido
    </span>
  );
}
function CardTag({ accountId, showCommitted = true }) {
  const accounts = React.useContext(FinAccountsCtx);
  const a = accounts.find(x => x.id === accountId);
  if (!a) return <span className="text-[12.5px] text-ink-mute dark:text-night-softText">—</span>;
  const isCredit = a.type === 'credit';
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={`h-1.5 w-1.5 rounded-full shrink-0
                        ${isCredit ? 'bg-purple-300 dark:bg-purple-400/70' : 'bg-blue-300 dark:bg-blue-400/70'}`}/>
      <span className="text-[12.5px] text-ink-soft dark:text-night-softText truncate">
        {a.owner}
        <span className="text-ink-mute dark:text-night-softText tabular-nums"> ···· {a.lastFour}</span>
      </span>
      {isCredit && showCommitted && <CommittedBadge/>}
    </div>
  );
}

// ¿Es un gasto comprometido (cargado a una tarjeta de crédito)?
function finIsCommitted(accounts, accountId) {
  const a = accounts.find(x => x.id === accountId);
  return !!a && a.type === 'credit';
}


// ─── src/components/app/finanzas/familia/GastosView.tsx ─────────────────────
function GastosView({ kind, fixedExpenses, transactions }) {
  if (kind === 'by-category') {
    return <GastosByCategory transactions={transactions}/>;
  }
  if (kind === 'stable') {
    return <GastosStableGrouped rows={fixedExpenses.filter(f => f.type === 'stable')}/>;
  }
  if (kind === 'variable') {
    return <GastosVariable rows={fixedExpenses.filter(f => f.type === 'variable')}/>;
  }
  const rows = fixedExpenses.filter(f => f.type === kind);
  if (rows.length === 0) {
    return <EmptyHint text="No hay gastos de este tipo registrados."/>;
  }

  // Cada cabecera lleva su alineación: la columna Tarjeta va a la izquierda.
  const headers = ({
    recurring:  [['Nombre','l'], ['Tarjeta','l'], ['Monto','r'], ['Periodicidad','r'], ['Próximo cobro','r']],
    'one-time': [['Fecha','l'], ['Descripción','l'], ['Tarjeta','l'], ['Monto','r']],
  })[kind];

  const Amount = ({ f }) => {
    const committed = f.accountId && f.accountId.startsWith('acc-cred');
    return (
      <div className={`text-right text-[13.5px] tabular-nums truncate
                       ${committed
                         ? 'text-ink-soft dark:text-night-softText'
                         : 'text-ink dark:text-night-text font-medium'}`}>
        {formatCLP(f.amount ?? 0)}
      </div>
    );
  };

  const renderRow = (f) => {
    if (kind === 'recurring') return (
      <React.Fragment>
        <Cell strong>{f.name}</Cell>
        <div className="min-w-0"><CardTag accountId={f.accountId}/></div>
        <Amount f={f}/>
        <Cell align="right" mute>{f.periodicity === 'annual' ? 'Anual' : 'Mensual'}</Cell>
        <Cell align="right" mute>{formatDayShort(f.nextDue)}</Cell>
      </React.Fragment>
    );
    // one-time
    return (
      <React.Fragment>
        <Cell mute>{formatDayShort(f.nextDue)}</Cell>
        <Cell strong>{f.name}</Cell>
        <div className="min-w-0"><CardTag accountId={f.accountId}/></div>
        <Amount f={f}/>
      </React.Fragment>
    );
  };

  const cols = ({
    recurring:  'minmax(150px,1fr) 210px 130px 120px 120px',
    'one-time': '100px minmax(150px,1fr) 210px 130px',
  })[kind];
  const minW = kind === 'recurring' ? 'min-w-[720px]' : 'min-w-[640px]';

  return (
    <div className="bg-white dark:bg-night-card rounded-2xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
      <div className={minW}>
      <div className="grid gap-3 px-4 py-2.5 text-[11px] uppercase tracking-[.08em]
                      text-ink-mute dark:text-night-softText
                      border-b border-black/[.05] dark:border-white/[.05]"
           style={{ gridTemplateColumns: cols }}>
        {headers.map(([h, a], i) => (
          <div key={i} className={a === 'r' ? 'text-right' : ''}>{h}</div>
        ))}
      </div>
      <ul>
        {rows.map((f, i) => (
          <li key={f.id}
              className={`${i === 0 ? '' : 'border-t border-black/[.045] dark:border-white/[.05]'}
                          grid gap-3 px-4 py-3 items-center`}
              style={{ gridTemplateColumns: cols }}>
            {renderRow(f)}
          </li>
        ))}
      </ul>
      </div>
      </div>
    </div>
  );
}


// ─── Fijos · Estables — agrupado por categoría con expand/collapse ──────────
// Columnas: [Categoría (toggle + pill)] [Nombres / Nombre] [Monto] [Día del mes]
// El toggle (triángulo ▶/▼) vive fuera del badge pero dentro de la celda; su
// color matchea con el color pastel de la categoría. En estado expandido la
// pill solo se muestra en la primera fila (la de mayor monto); las filas
// secundarias dejan la columna 1 vacía con indent.
const STABLE_COLS = '170px minmax(140px, 1fr) 200px 120px 90px';

// Resumen de tarjeta(s) para una fila colapsada de categoría.
function StableCardSummary({ items }) {
  const ids = [...new Set(items.map(i => i.accountId))];
  if (ids.length === 1) return <CardTag accountId={ids[0]}/>;
  const anyCredit = items.some(i => i.accountId && i.accountId.startsWith('acc-cred'));
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[12.5px] text-ink-mute dark:text-night-softText truncate">Varias tarjetas</span>
      {anyCredit && <CommittedBadge/>}
    </div>
  );
}

function GastosStableGrouped({ rows }) {
  if (rows.length === 0) {
    return <EmptyHint text="No hay gastos fijos estables registrados."/>;
  }

  // Agrupar por categoría, ordenar entradas desc por monto.
  const groups = React.useMemo(() => {
    const map = new Map();
    rows.forEach(r => {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category).push(r);
    });
    const out = [];
    map.forEach((items, category) => {
      items.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
      const total = items.reduce((s, x) => s + (x.amount ?? 0), 0);
      out.push({ category, items, total });
    });
    out.sort((a, b) => b.total - a.total);
    return out;
  }, [rows]);

  // Estado expandido por categoría (default: todas colapsadas).
  const [expanded, setExpanded] = React.useState({});
  const toggle = (cat) =>
    setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div className="bg-white dark:bg-night-card rounded-2xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
      <div className="min-w-[760px]">
      <div className="grid gap-3 px-4 py-2.5 text-[11px] uppercase tracking-[.08em]
                      text-ink-mute dark:text-night-softText
                      border-b border-black/[.05] dark:border-white/[.05]"
           style={{ gridTemplateColumns: STABLE_COLS }}>
        <div>Categoría</div>
        <div>Nombre</div>
        <div>Tarjeta</div>
        <div className="text-right">Monto</div>
        <div className="text-right">Día del mes</div>
      </div>

      <ul>
        {groups.map((g, gi) => {
          const isOpen = !!expanded[g.category];
          const colorId = FIN_CATEGORY_TO_COLOR[g.category] || 'sky';
          const c = finGetColor(colorId);
          return (
            <React.Fragment key={g.category}>
              {/* Fila principal: en colapsado muestra resumen; en expandido
                  muestra la primera entrada (la de mayor monto). */}
              <li
                className={`${gi === 0 ? '' : 'border-t border-black/[.045] dark:border-white/[.05]'}
                            grid gap-3 px-4 py-3 items-center`}
                style={{ gridTemplateColumns: STABLE_COLS }}>
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggle(g.category)}
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? 'Colapsar' : 'Expandir'} ${g.category}`}
                    className="shrink-0 h-6 w-6 -ml-1 rounded-md
                               flex items-center justify-center
                               hover:bg-paper-soft dark:hover:bg-night-soft
                               transition-colors">
                    <span
                      className={`block w-2 h-2.5 ${c.dot} transition-transform duration-200`}
                      style={{
                        clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}/>
                  </button>
                  <FinBadge color={colorId}>{g.category}</FinBadge>
                </div>

                {isOpen ? (
                  // Primera entrada (mayor monto) en la fila principal.
                  <React.Fragment>
                    <Cell strong>{g.items[0].name}</Cell>
                    <div className="min-w-0"><CardTag accountId={g.items[0].accountId}/></div>
                    <Cell tabular align="right">{formatCLP(g.items[0].amount ?? 0)}</Cell>
                    <Cell align="right" mute>{g.items[0].dayOfMonth ?? '—'}</Cell>
                  </React.Fragment>
                ) : (
                  // Resumen colapsado: nombres truncados, tarjeta(s), total, dash.
                  <React.Fragment>
                    <div className="text-[13.5px] text-ink-soft dark:text-night-softText
                                    overflow-hidden whitespace-nowrap text-ellipsis"
                         title={g.items.map(x => x.name).join(', ')}>
                      {g.items.map(x => x.name).join(', ')}
                    </div>
                    <div className="min-w-0"><StableCardSummary items={g.items}/></div>
                    <Cell tabular align="right" strong>{formatCLP(g.total)}</Cell>
                    <Cell align="right" mute>—</Cell>
                  </React.Fragment>
                )}
              </li>

              {/* Filas secundarias (sólo en expandido): col 1 vacía con indent. */}
              {isOpen && g.items.slice(1).map((it) => (
                <li
                  key={it.id}
                  className="border-t border-black/[.03] dark:border-white/[.04]
                             grid gap-3 px-4 py-2.5 items-center"
                  style={{ gridTemplateColumns: STABLE_COLS }}>
                  <div aria-hidden="true"/>
                  <Cell strong>{it.name}</Cell>
                  <div className="min-w-0"><CardTag accountId={it.accountId}/></div>
                  <Cell tabular align="right">{formatCLP(it.amount ?? 0)}</Cell>
                  <Cell align="right" mute>{it.dayOfMonth ?? '—'}</Cell>
                </li>
              ))}
            </React.Fragment>
          );
        })}
      </ul>
      </div>
      </div>
    </div>
  );
}


// ─── Fijos · Variables ──────────────────────────────────────────────────────
// Columnas: Nombre | Categoría | Mes Actual | Mes Pasado | Promedio 3 Meses
// Sólo Nombre va a la izquierda; el resto (incluida la pill de categoría) va
// alineado a la derecha para que los montos formen una columna numérica
// continua y legible.
const VARIABLE_COLS = 'minmax(130px, 1fr) 130px 200px 105px 105px 115px';

function GastosVariable({ rows }) {
  if (rows.length === 0) {
    return <EmptyHint text="No hay gastos fijos variables registrados."/>;
  }
  return (
    <div className="bg-white dark:bg-night-card rounded-2xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
      <div className="min-w-[840px]">
      <div className="grid gap-3 px-4 py-2.5 text-[11px] uppercase tracking-[.08em]
                      text-ink-mute dark:text-night-softText
                      border-b border-black/[.05] dark:border-white/[.05]"
           style={{ gridTemplateColumns: VARIABLE_COLS }}>
        <div>Nombre</div>
        <div className="text-right">Categoría</div>
        <div>Tarjeta</div>
        <div className="text-right">Mes Actual</div>
        <div className="text-right">Mes Pasado</div>
        <div className="text-right">Promedio 3 meses</div>
      </div>
      <ul>
        {rows.map((f, i) => {
          const colorId = FIN_CATEGORY_TO_COLOR[f.category] || 'sky';
          return (
            <li
              key={f.id}
              className={`${i === 0 ? '' : 'border-t border-black/[.045] dark:border-white/[.05]'}
                          grid gap-3 px-4 py-3 items-center`}
              style={{ gridTemplateColumns: VARIABLE_COLS }}>
              <Cell strong>{f.name}</Cell>
              <div className="flex justify-end min-w-0">
                <FinBadge color={colorId}>{f.category}</FinBadge>
              </div>
              <div className="min-w-0"><CardTag accountId={f.accountId}/></div>
              <Cell tabular align="right">
                {formatCLP(f.currentMonthAmount ?? f.averageAmount ?? 0)}
              </Cell>
              <Cell tabular align="right" mute>
                {formatCLP(f.lastMonthAmount ?? f.averageAmount ?? 0)}
              </Cell>
              <Cell tabular align="right" mute>
                {formatCLP(f.averageAmount ?? 0)}
              </Cell>
            </li>
          );
        })}
      </ul>
      </div>
      </div>
    </div>
  );
}

function Cell({ children, align = 'left', strong, mute, tabular }) {
  const classes = [
    align === 'right' ? 'text-right' : 'text-left',
    'truncate',
    tabular ? 'tabular-nums' : '',
    'text-[13.5px]',
    strong
      ? 'text-ink dark:text-night-text font-medium'
      : (mute ? 'text-ink-soft dark:text-night-softText' : 'text-ink dark:text-night-text'),
  ].join(' ');
  return <div className={classes}>{children}</div>;
}

function GastosByCategory({ transactions }) {
  const accounts = React.useContext(FinAccountsCtx);
  const creditIds = React.useMemo(
    () => new Set(accounts.filter(a => a.type === 'credit').map(a => a.id)),
    [accounts]
  );

  // Suma de gastos por categoría (negativos), separando lo ejecutado en débito
  // de lo comprometido en crédito. Ordenado descendente por total.
  const totals = React.useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (t.amount >= 0) return;
      const v = Math.abs(t.amount);
      const e = map[t.category] || (map[t.category] = { total: 0, committed: 0 });
      e.total += v;
      if (creditIds.has(t.accountId)) e.committed += v;
    });
    const list = Object.entries(map).map(([category, v]) => ({ category, ...v }));
    list.sort((a, b) => b.total - a.total);
    const grand = list.reduce((s, x) => s + x.total, 0);
    return list.map(x => ({ ...x, pct: grand > 0 ? Math.round((x.total / grand) * 100) : 0 }));
  }, [transactions, creditIds]);

  if (totals.length === 0) return <EmptyHint text="No hay gastos para clasificar."/>;
  const max = totals[0].total;

  return (
    <div className="bg-white dark:bg-night-card rounded-2xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle p-4">
      <ul className="space-y-3.5">
        {totals.map(row => {
          const c = categoryColor(row.category);
          const widthPct = Math.max(4, Math.round((row.total / max) * 100));
          const commPct = row.total > 0 ? (row.committed / row.total) * 100 : 0;
          return (
            <li key={row.category} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FinBadge color={FIN_CATEGORY_TO_COLOR[row.category]}>{row.category}</FinBadge>
                  {row.committed > 0 && (
                    <span className="text-[11px] tabular-nums text-amber-600 dark:text-amber-300/90 whitespace-nowrap">
                      {formatCLP(row.committed)} comprometido
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[13.5px] tabular-nums text-ink dark:text-night-text font-medium">
                    {formatCLP(row.total)}
                  </span>
                  <span className="text-[11px] tabular-nums text-ink-mute dark:text-night-softText ml-2">
                    {row.pct}%
                  </span>
                </div>
              </div>
              {/* Barra: tramo sólido = ejecutado en débito · tramo rayado = comprometido */}
              <div className="h-2 rounded-full bg-paper-soft dark:bg-night-soft overflow-hidden flex"
                   style={{ width: `${widthPct}%` }}>
                <div className={`h-full ${c.dot}`} style={{ width: `${100 - commPct}%`, opacity: .75 }}/>
                <div className="h-full"
                     style={{
                       width: `${commPct}%`,
                       backgroundImage: 'repeating-linear-gradient(45deg, hsl(38 92% 60% / .55) 0 4px, transparent 4px 8px)',
                       backgroundColor: 'hsl(38 92% 60% / .18)',
                     }}/>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


// ─── Gastos · Cuotas / Comprometido ─────────────────────────────────────────
// Cobros futuros ya pactados en tarjetas de crédito. Se agrupan por tarjeta y,
// dentro de cada tarjeta, se desglosan mes a mes (proyección a 6 meses). Cada
// fila: descripción de la compra original · monto por cuota · cuota X/N ·
// cuotas restantes. La tarjeta y el mes de cobro vienen dados por la agrupación.
const COMMIT_HORIZON = 6;
const COMMIT_COLS = 'minmax(160px, 1fr) 130px 130px';

function GastosCommitments({ commitments, accounts }) {
  const upcoming = React.useMemo(() => getUpcomingMonths(COMMIT_HORIZON), []);

  const cards = React.useMemo(() => {
    const byCard = new Map();
    commitments.forEach(c => {
      if (!byCard.has(c.accountId)) byCard.set(c.accountId, []);
      byCard.get(c.accountId).push(c);
    });
    const out = [];
    byCard.forEach((items, accountId) => {
      const account = accounts.find(a => a.id === accountId);
      if (!account) return;
      const rows = [];
      items.forEach(c => {
        const remaining = c.installments - c.paid;
        for (let i = 0; i < remaining && i < COMMIT_HORIZON; i++) {
          const cuotaNum = c.paid + 1 + i;
          rows.push({
            id: `${c.id}-${cuotaNum}`,
            month: upcoming[i],
            description: c.description,
            category: c.category,
            amount: c.monthlyAmount,
            cuotaNum,
            total: c.installments,
            remainingAfter: c.installments - cuotaNum,
          });
        }
      });
      const pendingTotal   = items.reduce((s, c) => s + c.monthlyAmount * (c.installments - c.paid), 0);
      const thisMonthTotal = items.reduce((s, c) => s + ((c.installments - c.paid) > 0 ? c.monthlyAmount : 0), 0);
      out.push({ account, items, rows, pendingTotal, thisMonthTotal });
    });
    out.sort((a, b) => b.pendingTotal - a.pendingTotal);
    return out;
  }, [commitments, accounts, upcoming]);

  if (cards.length === 0) {
    return <EmptyHint text="No hay cuotas comprometidas para esta selección."/>;
  }

  return (
    <div className="space-y-4">
      {cards.map(card => <CommitmentCard key={card.account.id} {...card}/>)}
    </div>
  );
}

function CommitmentCard({ account, items, rows, pendingTotal, thisMonthTotal }) {
  const months = React.useMemo(() => {
    const map = new Map();
    rows.forEach(r => {
      if (!map.has(r.month)) map.set(r.month, []);
      map.get(r.month).push(r);
    });
    return [...map.entries()].map(([month, list]) => ({
      month, items: list, subtotal: list.reduce((s, x) => s + x.amount, 0),
    }));
  }, [rows]);

  return (
    <div className="bg-white dark:bg-night-card rounded-2xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle overflow-hidden">
      {/* Encabezado de tarjeta */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5
                      border-b border-black/[.05] dark:border-white/[.05]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-500/15
                           text-purple-500 dark:text-purple-300
                           flex items-center justify-center shrink-0">
            <IconFinCard/>
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-ink dark:text-night-text truncate">
                Crédito {account.owner}
              </span>
              <span className="text-[11px] text-ink-mute dark:text-night-softText tabular-nums">
                ···· {account.lastFour}
              </span>
            </div>
            <div className="text-[11.5px] text-ink-mute dark:text-night-softText">
              {items.length} {items.length === 1 ? 'compra' : 'compras'} en cuotas
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[14.5px] font-medium tabular-nums text-ink dark:text-night-text">
            {formatCLP(thisMonthTotal)}
            <span className="text-[11px] text-ink-mute dark:text-night-softText font-normal"> / mes</span>
          </div>
          <div className="text-[11px] text-ink-mute dark:text-night-softText tabular-nums">
            Pendiente {formatCLP(pendingTotal)}
          </div>
        </div>
      </div>

      {/* Desglose mes a mes */}
      <div>
        {months.map((m, mi) => (
          <div key={m.month} className={mi === 0 ? '' : 'border-t border-black/[.045] dark:border-white/[.05]'}>
            <div className="flex items-center justify-between gap-3 px-4 py-2
                            bg-paper-soft/60 dark:bg-night-soft/50">
              <span className="text-[11px] font-medium uppercase tracking-[.07em]
                               text-ink-mute dark:text-night-softText capitalize">
                {formatMonth(m.month, 'long')}
              </span>
              <span className="text-[11.5px] tabular-nums text-ink-soft dark:text-night-softText">
                {formatCLP(m.subtotal)}
              </span>
            </div>
            <ul>
              {m.items.map((r, i) => (
                <li key={r.id}
                    className={`${i === 0 ? '' : 'border-t border-black/[.03] dark:border-white/[.04]'}
                                grid gap-3 px-4 py-2.5 items-center`}
                    style={{ gridTemplateColumns: COMMIT_COLS }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[13.5px] text-ink dark:text-night-text font-medium truncate">
                      {r.description}
                    </span>
                    <FinBadge color={FIN_CATEGORY_TO_COLOR[r.category]}>{r.category}</FinBadge>
                  </div>
                  <Cell tabular align="right">{formatCLP(r.amount)}</Cell>
                  <div className="text-right">
                    <div className="text-[12.5px] tabular-nums text-ink dark:text-night-text">
                      Cuota {r.cuotaNum}/{r.total}
                    </div>
                    <div className="text-[10.5px] tabular-nums text-ink-mute dark:text-night-softText">
                      {r.remainingAfter === 0 ? 'última cuota' : `${r.remainingAfter} restantes`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 text-[11px] text-ink-mute dark:text-night-softText
                      border-t border-black/[.045] dark:border-white/[.05]">
        Proyección a {COMMIT_HORIZON} meses
      </div>
    </div>
  );
}


// ─── src/components/app/finanzas/personal/MonthSelector.tsx ─────────────────
function MonthSelector({ months, value, onChange }) {
  return (
    <div className="-mx-5 sm:mx-0 px-5 sm:px-0 overflow-x-auto no-scrollbar">
      <ul className="flex items-center gap-2 min-w-max">
        {months.map(ym => {
          const selected = ym === value;
          const current  = isCurrentMonth(ym);
          return (
            <li key={ym}>
              <button onClick={() => onChange(ym)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px]
                            border transition-colors
                            ${selected
                              ? 'bg-accent border-transparent text-[hsl(var(--accent-strong))] font-medium'
                              : 'border-black/[.08] dark:border-white/[.1] text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
                <span className="capitalize">{formatMonth(ym, 'short')}</span>
                <FinStatusBadge status={current ? 'Abierto' : 'Cerrado'}/>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


// ─── src/components/app/finanzas/personal/PrivacyToggle.tsx ─────────────────
// TODO: conectar a PATCH /api/v1/users/me/finances/privacy { isPrivate: boolean }
function PrivacyToggle({ isPrivate, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      {isPrivate && (
        <span className="text-ink-mute dark:text-night-softText"><IconFinLock/></span>
      )}
      <span className="text-[12.5px] text-ink-soft dark:text-night-softText">
        {isPrivate ? 'Solo yo' : 'Visible para todos'}
      </span>
      <FinSwitch checked={isPrivate} onChange={onChange}
                 ariaLabel="Privacidad de finanzas personales"/>
    </div>
  );
}


// ─── src/components/app/finanzas/personal/MonthDropdown.tsx ─────────────────
// Selector de mes compacto. El botón muestra el mes activo con su etiqueta
// larga + estado (ej. "Junio 2026 · Abierto"). Al abrir, lista los meses
// (más reciente arriba) con su estado Cerrado/Abierto.
function MonthDropdown({ months, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const ordered = React.useMemo(() => [...months].reverse(), [months]); // más reciente primero
  const activeStatus = isCurrentMonth(value) ? 'Abierto' : 'Cerrado';

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full
                   border border-black/[.08] dark:border-white/[.1]
                   bg-white dark:bg-night-card
                   hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
        <span className="capitalize text-[13px] font-medium text-ink dark:text-night-text">
          {formatMonth(value, 'long')}
        </span>
        <span className="text-ink-mute dark:text-night-softText text-[12px]">·</span>
        <FinStatusBadge status={activeStatus}/>
        <span className={`text-ink-mute dark:text-night-softText transition-transform duration-200
                          ${open ? 'rotate-180' : ''}`}>
          <IconFinChevron/>
        </span>
      </button>

      {open && (
        <div role="listbox"
             className="absolute z-30 mt-2 left-0 min-w-[230px]
                        bg-white dark:bg-night-card rounded-2xl
                        border border-black/[.06] dark:border-white/[.08]
                        shadow-[0_12px_32px_-12px_rgba(0,0,0,.18)] p-1.5
                        origin-top-left route-fade">
          <ul className="max-h-[280px] overflow-y-auto no-scrollbar">
            {ordered.map(ym => {
              const selected = ym === value;
              const status = isCurrentMonth(ym) ? 'Abierto' : 'Cerrado';
              return (
                <li key={ym}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => { onChange(ym); setOpen(false); }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl
                                transition-colors
                                ${selected
                                  ? 'bg-paper-soft dark:bg-night-soft'
                                  : 'hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
                    <span className={`capitalize text-[13px]
                                      ${selected
                                        ? 'font-medium text-ink dark:text-night-text'
                                        : 'text-ink-soft dark:text-night-softText'}`}>
                      {formatMonth(ym, 'long')}
                    </span>
                    <FinStatusBadge status={status}/>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}


// ─── src/components/app/finanzas/personal/PersonalView.tsx ──────────────────
function PersonalView({ data, activeUser }) {
  const me = activeUser ? getUser(activeUser) : null;
  const months = React.useMemo(() => getRecentMonths(6), []);
  const [month, setMonth] = React.useState(months[months.length - 1]);
  // Estado optimista: cambia al instante. TODO: sincronizar con backend.
  const [isPrivate, setIsPrivate] = React.useState(data.isPrivate);

  const monthTxs = React.useMemo(
    () => data.transactions.filter(t => monthOf(t.date) === month),
    [data.transactions, month]
  );

  const income   = monthTxs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  // Vista individual: el saldo disponible es el de la cuenta del usuario (no
  // hay snapshot histórico por mes), y nunca mostramos "Balance del mes".
  const accountsLabel = data.accountsLabel || 'Cuenta vista + Tarjeta crédito Santander';

  return (
    <section className="bg-white dark:bg-night-card rounded-3xl
                        border border-black/[.04] dark:border-white/[.05] shadow-subtle
                        p-5 sm:p-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {me && <FinUserAvatar user={me} size={36}/>}
          <div className="min-w-0">
            <h2 className="text-[17px] font-medium tracking-tight text-ink dark:text-night-text">
              {me ? `Finanzas personales de ${me.name}` : 'Mis finanzas personales'}
            </h2>
            <p className="text-[12.5px] text-ink-soft dark:text-night-softText mt-0.5">
              Estos datos solo los ves tú mientras la privacidad esté activa.
            </p>
          </div>
        </div>
        <PrivacyToggle isPrivate={isPrivate} onChange={setIsPrivate}/>
      </header>

      {/* Selector de mes (compacto) + contexto de tarjetas incluidas */}
      <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
        <MonthDropdown months={months} value={month} onChange={setMonth}/>
        <div className="flex items-center gap-1.5 text-[12px] text-ink-mute dark:text-night-softText">
          <span className="shrink-0"><IconFinCard width="15" height="15"/></span>
          <span className="truncate">Incluye <span className="text-ink-soft dark:text-night-text">{accountsLabel}</span></span>
        </div>
      </div>

      <div className="mt-5">
        <MetricRow>
          <MetricCard
            icon={<IconFinWallet/>}
            label="Saldo disponible"
            value={formatCLP(data.currentBalance)}
            sublabel={formatMonth(month, 'long')}/>
          <MetricCard
            icon={<IconFinIn/>}
            label="Ingresos del mes"
            value={formatCLP(income)}
            sublabel={formatMonth(month, 'long')}
            variant="positive"/>
          <MetricCard
            icon={<IconFinOut/>}
            label="Gastos del mes"
            value={formatCLP(expenses)}
            sublabel={formatMonth(month, 'long')}
            variant="negative"/>
        </MetricRow>
      </div>

      <div className="mt-6">
        <SectionLabel>Movimientos</SectionLabel>
        <MovimientosTable transactions={monthTxs}/>
      </div>
    </section>
  );
}


// ─── helpers de página ──────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-[.08em]
                    text-ink-mute dark:text-night-softText mb-3 ml-1">
      {children}
    </div>
  );
}
function SectionTitle({ children }) {
  return (
    <h2 className="text-[18px] sm:text-[20px] font-medium tracking-tight
                   text-ink dark:text-night-text mb-3">
      {children}
    </h2>
  );
}
function EmptyHint({ text }) {
  return (
    <div className="rounded-2xl bg-paper-soft/60 dark:bg-night-soft/60
                    border border-dashed border-black/[.08] dark:border-white/[.08]
                    py-10 text-center text-[13px] text-ink-mute dark:text-night-softText">
      {text}
    </div>
  );
}


// ─── capas de visibilidad: UI ───────────────────────────────────────────────
const IconFinUsers = (p) => (
  <FI {...p}>
    <circle cx="9" cy="8.5" r="3.1"/>
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0"/>
    <path d="M16 5.6a3 3 0 0 1 0 5.8"/>
    <path d="M17.6 19a5.3 5.3 0 0 0-2.2-4.3"/>
  </FI>
);

// Avatar circular con la inicial y el color del integrante (de HABIT_COLORS).
function FinUserAvatar({ user, size = 26 }) {
  const c = getHabitColor(user.color);
  return (
    <span className="rounded-full flex items-center justify-center font-semibold shrink-0 select-none"
          style={{ width: size, height: size, backgroundColor: c.soft, color: c.ink,
                   fontSize: Math.round(size * 0.42) }}>
      {user.initial}
    </span>
  );
}

// Badge "Todos" — distinto de las pills de categoría: tono azul + icono grupo.
function SharedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium
                     bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300 whitespace-nowrap">
      <IconFinUsers width="13" height="13"/> Todos
    </span>
  );
}

// ─── Selector de usuario activo (simulado · Phase 1) ────────────────────────
// Cambia la sub-familia visible. NO es auth real — solo decide qué capa privada
// se muestra. La otra sub-familia jamás aparece.
function ActiveUserSelector({ userId, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const user = getUser(userId);
  const sf = FIN_SUBFAMILY_META[finSubfamilyOf(userId)];

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-full
                   border border-black/[.08] dark:border-white/[.1]
                   bg-white dark:bg-night-card
                   hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
        <FinUserAvatar user={user}/>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[13.5px] font-medium text-ink dark:text-night-text">{user.name}</span>
          <span className="text-[10.5px] text-ink-mute dark:text-night-softText">{sf.label}</span>
        </span>
        <span className={`text-ink-mute dark:text-night-softText transition-transform duration-200
                          ${open ? 'rotate-180' : ''}`}>
          <IconFinChevron/>
        </span>
      </button>

      {open && (
        <div role="listbox"
             className="absolute z-40 mt-2 right-0 min-w-[252px]
                        bg-white dark:bg-night-card rounded-2xl
                        border border-black/[.06] dark:border-white/[.08]
                        shadow-[0_12px_32px_-12px_rgba(0,0,0,.2)] p-1.5
                        origin-top-right route-fade">
          <div className="flex items-center gap-1.5 px-3 pt-1.5 pb-2 text-[10.5px] font-medium
                          uppercase tracking-[.08em] text-ink-mute dark:text-night-softText">
            <IconFinUsers width="13" height="13"/> Usuario activo
          </div>
          <ul>
            {HL_USERS.map(u => {
              const selected = u.id === userId;
              const usf = FIN_SUBFAMILY_META[finSubfamilyOf(u.id)];
              return (
                <li key={u.id}>
                  <button
                    type="button" role="option" aria-selected={selected}
                    onClick={() => { onChange(u.id); setOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors
                                ${selected
                                  ? 'bg-paper-soft dark:bg-night-soft'
                                  : 'hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
                    <FinUserAvatar user={u} size={28}/>
                    <span className="flex flex-col items-start leading-tight min-w-0">
                      <span className={`text-[13.5px] ${selected
                        ? 'font-medium text-ink dark:text-night-text'
                        : 'text-ink-soft dark:text-night-softText'}`}>{u.name}</span>
                      <span className="text-[11px] text-ink-mute dark:text-night-softText">{usf.label}</span>
                    </span>
                    {selected && (
                      <span className="ml-auto text-[hsl(var(--accent-strong))]"><HLCheck size={14}/></span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-1 px-3 py-2 text-[10.5px] leading-snug text-ink-mute dark:text-night-softText
                          border-t border-black/[.05] dark:border-white/[.06]">
            Sesión simulada (Phase 1). Cada usuario solo ve lo compartido y su propia familia.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Resumen combinado (arriba) ─────────────────────────────────────────────
// Compartido prorrateado + gastos fijos de mi familia + total mensual.
function CombinedSummaryCard({ icon, label, value, sublabel, badge, accent }) {
  return (
    <div className={`rounded-2xl p-4 border shadow-subtle
                     ${accent
                       ? 'bg-accent-tint/60 border-accent/30 dark:bg-accent-tint/40'
                       : 'bg-white dark:bg-night-card border-black/[.04] dark:border-white/[.05]'}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-ink-mute dark:text-night-softText min-w-0">
          <span className="h-7 w-7 rounded-full bg-paper-soft dark:bg-night-soft
                           flex items-center justify-center shrink-0">{icon}</span>
          <span className="text-[11px] font-medium uppercase tracking-[.06em] truncate">{label}</span>
        </div>
        {badge}
      </div>
      <div className="mt-3 text-[24px] sm:text-[26px] font-medium tabular-nums leading-none
                      text-ink dark:text-night-text truncate">{value}</div>
      {sublabel && (
        <div className="mt-2 text-[11.5px] text-ink-mute dark:text-night-softText leading-snug">{sublabel}</div>
      )}
    </div>
  );
}

function CombinedSummary({ shared, subfamilyId, famData }) {
  const sf = FIN_SUBFAMILY_META[subfamilyId];
  const perPerson = shared.memberCount > 0 ? shared.total / shared.memberCount : 0;
  const myShared  = perPerson * sf.memberIds.length;
  const famFixed  = finMonthlyFixedTotal(famData.fixedExpenses);
  const combined  = myShared + famFixed;
  const fixedCount = (famData.fixedExpenses || []).filter(f => f.type === 'stable' || f.type === 'variable').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <CombinedSummaryCard
        icon={<IconFinUsers/>}
        label="Compartido · mi parte"
        value={formatCLP(myShared)}
        badge={<SharedBadge/>}
        sublabel={
          <span>
            {sf.memberIds.length} de {shared.memberCount} personas · de {formatCLP(shared.total)}/mes
          </span>
        }/>
      <CombinedSummaryCard
        icon={<IconFinWallet/>}
        label="Mi familia · gastos fijos"
        value={formatCLP(famFixed)}
        sublabel={`${fixedCount} ${fixedCount === 1 ? 'gasto fijo' : 'gastos fijos'} mensuales`}/>
      <CombinedSummaryCard
        icon={<IconFinBalance/>}
        label="Total mensual estimado"
        value={formatCLP(combined)}
        accent
        sublabel="Mi parte compartida + mi familia"/>
    </div>
  );
}

// ─── Sección "Compartido" (badge Todos) ─────────────────────────────────────
function SharedSection({ shared, subfamilyId }) {
  const sf = FIN_SUBFAMILY_META[subfamilyId];
  const perPerson = shared.memberCount > 0 ? shared.total / shared.memberCount : 0;
  const myShare   = perPerson * sf.memberIds.length;

  return (
    <section>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-2.5">
          <SectionTitle>Compartido</SectionTitle>
          <SharedBadge/>
        </div>
        <span className="text-[12px] text-ink-mute dark:text-night-softText">
          Visible para toda la casa · se divide entre {shared.memberCount}
        </span>
      </div>

      <div className="bg-white dark:bg-night-card rounded-2xl overflow-hidden
                      border border-black/[.04] dark:border-white/[.05] shadow-subtle">
        {/* Cabecera */}
        <div className="hidden sm:grid grid-cols-[1fr_120px_104px_120px] gap-3 px-4 py-2.5
                        text-[11px] uppercase tracking-[.08em]
                        text-ink-mute dark:text-night-softText
                        border-b border-black/[.05] dark:border-white/[.05]">
          <div>Gasto</div>
          <div>División</div>
          <div className="text-right">Próximo cobro</div>
          <div className="text-right">Monto</div>
        </div>

        <ul>
          {shared.expenses.map((e, i) => {
            const colorId = FIN_CATEGORY_TO_COLOR[e.category] || 'sky';
            const c = finGetColor(colorId);
            return (
              <li key={e.id}
                  className={`${i === 0 ? '' : 'border-t border-black/[.045] dark:border-white/[.05]'}`}>
                {/* Desktop */}
                <div className="hidden sm:grid grid-cols-[1fr_120px_104px_120px] gap-3 items-center px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-2.5 w-2.5 rounded-full ${c.dot} shrink-0`}/>
                    <span className="text-[14px] font-medium text-ink dark:text-night-text truncate">{e.name}</span>
                    <FinBadge color={colorId}>{e.category}</FinBadge>
                  </div>
                  <div className="text-[12.5px] text-ink-soft dark:text-night-softText tabular-nums">
                    ÷ {e.splitAmong.length} personas
                  </div>
                  <div className="text-right text-[12.5px] tabular-nums text-ink-mute dark:text-night-softText">
                    {formatDayShort(e.nextDue)}
                  </div>
                  <div className="text-right text-[14px] font-medium tabular-nums text-ink dark:text-night-text">
                    {formatCLP(e.amount)}<span className="text-[11px] text-ink-mute dark:text-night-softText font-normal">/mes</span>
                  </div>
                </div>
                {/* Mobile */}
                <div className="sm:hidden px-4 py-3 flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${c.dot} shrink-0`}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-ink dark:text-night-text truncate">{e.name}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <FinBadge color={colorId}>{e.category}</FinBadge>
                      <span className="text-[11.5px] text-ink-mute dark:text-night-softText tabular-nums">÷ {e.splitAmong.length}</span>
                    </div>
                  </div>
                  <div className="text-right text-[14px] font-medium tabular-nums text-ink dark:text-night-text shrink-0">
                    {formatCLP(e.amount)}<span className="text-[10.5px] text-ink-mute dark:text-night-softText font-normal">/mes</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Footer: total + tu parte prorrateada */}
        <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-3
                        bg-paper-soft/60 dark:bg-night-soft/50
                        border-t border-black/[.05] dark:border-white/[.05]">
          <div className="text-[12.5px] text-ink-soft dark:text-night-softText">
            Total compartido
            <span className="ml-2 text-[14px] font-medium tabular-nums text-ink dark:text-night-text">
              {formatCLP(shared.total)}<span className="text-[11px] text-ink-mute dark:text-night-softText font-normal">/mes</span>
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-accent-tint text-ink dark:text-night-text">
            <span className="text-[11.5px] text-ink-soft dark:text-night-softText">Tu parte prorrateada</span>
            <span className="text-[14px] font-medium tabular-nums text-[hsl(var(--accent-strong))]">{formatCLP(myShare)}</span>
            <span className="text-[10.5px] text-ink-mute dark:text-night-softText">· {sf.memberIds.length}/{shared.memberCount}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Sección "Mi familia" (sub-familia del usuario activo, privada) ─────────
// Conserva intacta toda la estructura de Familia: selector de cuentas, métricas
// y las pestañas Gastos/Presupuestos/Categorías/Tarjetas/Movimientos. El estado
// interno se reinicia al cambiar de sub-familia (montada con key={subfamilyId}).
function MiFamiliaSection({ subfamilyId, data }) {
  const { accounts, budgets, fixedExpenses, transactions, commitments } = data;
  const [famTab, setFamTab] = React.useState('gastos');
  const [gastosTab, setGastosTab] = React.useState('stable');

  const principal = React.useMemo(
    () => accounts.find(a => a.principal) || accounts.find(a => a.type === 'debit') || accounts[0],
    [accounts]
  );
  const [selectedId, setSelectedId] = React.useState(null);
  const [hoveredId, setHoveredId]   = React.useState(null);
  React.useEffect(() => {
    if (!selectedId && principal) setSelectedId(principal.id);
  }, [principal, selectedId]);
  const activeId = selectedId || (principal && principal.id);

  const sf = FIN_SUBFAMILY_META[subfamilyId];
  const members = sf.memberIds.map(getUser);

  const handlePillSelect = (id) => { setSelectedId(id); setFamTab('tarjetas'); };

  return (
    <FinAccountsCtx.Provider value={accounts}>
      <section className="space-y-6">

        {/* Encabezado privado de la sub-familia */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap">
            <SectionTitle>Mi familia</SectionTitle>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px]
                             bg-paper-soft dark:bg-night-soft text-ink-soft dark:text-night-softText">
              <IconFinLock/> Privado
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {members.map(u => (
              <span key={u.id}
                    className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full
                               bg-white dark:bg-night-card border border-black/[.06] dark:border-white/[.06]">
                <FinUserAvatar user={u} size={20}/>
                <span className="text-[12px] text-ink-soft dark:text-night-text">{u.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Selector de cuentas del hogar */}
        <div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <SectionLabel>Cuentas de mi familia</SectionLabel>
            <span className="mb-3 text-[12px] text-ink-mute dark:text-night-softText">
              Toca una tarjeta para ver su detalle
            </span>
          </div>
          <AccountSelector
            accounts={accounts}
            selectedId={activeId}
            hoveredId={hoveredId}
            onSelect={handlePillSelect}
            onHover={setHoveredId}/>
        </div>

        <FamiliaMetrics
          principal={principal}
          transactions={transactions}
          commitments={commitments}
          accounts={accounts}/>

        <div className="h-px bg-black/[.06] dark:bg-white/[.06]"/>

        {/* Navegación de primer nivel */}
        <FinTabs value={famTab} onValueChange={setFamTab}>
          <div className="-mx-5 sm:mx-0 px-5 sm:px-0 overflow-x-auto no-scrollbar">
            <FinTabsList>
              <FinTabsTrigger value="gastos">Gastos</FinTabsTrigger>
              <FinTabsTrigger value="presupuestos">Presupuestos</FinTabsTrigger>
              <FinTabsTrigger value="categorias">Categorías</FinTabsTrigger>
              <FinTabsTrigger value="tarjetas">Tarjetas</FinTabsTrigger>
              <FinTabsTrigger value="movimientos">Movimientos</FinTabsTrigger>
            </FinTabsList>
          </div>

          <div className="mt-6">
            <FinTabsContent value="gastos">
              <FinTabs value={gastosTab} onValueChange={setGastosTab}>
                <FinTabsList look="seg">
                  <FinTabsTrigger value="stable">Fijos · Estables</FinTabsTrigger>
                  <FinTabsTrigger value="variable">Fijos · Variables</FinTabsTrigger>
                  <FinTabsTrigger value="recurring">Recurrentes</FinTabsTrigger>
                  <FinTabsTrigger value="one-time">Puntuales</FinTabsTrigger>
                  <FinTabsTrigger value="commitments">Cuotas / Comprometido</FinTabsTrigger>
                </FinTabsList>
                <div className="mt-5">
                  <FinTabsContent value="stable">
                    <GastosView kind="stable" fixedExpenses={fixedExpenses}/>
                  </FinTabsContent>
                  <FinTabsContent value="variable">
                    <GastosView kind="variable" fixedExpenses={fixedExpenses}/>
                  </FinTabsContent>
                  <FinTabsContent value="recurring">
                    <GastosView kind="recurring" fixedExpenses={fixedExpenses}/>
                  </FinTabsContent>
                  <FinTabsContent value="one-time">
                    <GastosView kind="one-time" fixedExpenses={fixedExpenses}/>
                  </FinTabsContent>
                  <FinTabsContent value="commitments">
                    <GastosCommitments commitments={commitments} accounts={accounts}/>
                  </FinTabsContent>
                </div>
              </FinTabs>
            </FinTabsContent>

            <FinTabsContent value="presupuestos">
              <PresupuestosView budgets={budgets}/>
            </FinTabsContent>

            <FinTabsContent value="categorias">
              <GastosByCategory transactions={transactions}/>
            </FinTabsContent>

            <FinTabsContent value="tarjetas">
              <TarjetasView accounts={accounts} highlightId={activeId}/>
            </FinTabsContent>

            <FinTabsContent value="movimientos">
              <MovimientosTable transactions={transactions}/>
            </FinTabsContent>
          </div>
        </FinTabs>
      </section>
    </FinAccountsCtx.Provider>
  );
}


// ─── persistencia del usuario activo (Phase 1) ──────────────────────────────
const FIN_ACTIVE_USER_KEY = 'hl.fin.activeUser';
function finReadActiveUser() {
  try {
    const v = localStorage.getItem(FIN_ACTIVE_USER_KEY);
    if (v && FIN_USER_SUBFAMILY[v]) return v;
  } catch (_) {}
  return 'u-andreu';
}


// ─── src/pages/FinanzasPage.tsx ─────────────────────────────────────────────
function FinanzasPage() {
  // Usuario activo simulado (Phase 1). Determina qué sub-familia se ve.
  const [activeUser, setActiveUser] = React.useState(finReadActiveUser);
  React.useEffect(() => {
    try { localStorage.setItem(FIN_ACTIVE_USER_KEY, activeUser); } catch (_) {}
  }, [activeUser]);
  const subfamilyId = finSubfamilyOf(activeUser);

  const fam    = useFamilyFinances(subfamilyId);
  const shared = useSharedFinances();
  const per    = usePersonalFinances();

  const [tab, setTab] = React.useState('familia'); // familia | personal

  if (fam.isLoading || per.isLoading) return <FinanzasLoading/>;
  if (fam.error    || per.error)      return <FinanzasError/>;

  return (
    <div className="route-fade max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-10 pb-28 md:pb-14">

      {/* Encabezado de página */}
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-[28px] sm:text-[34px] font-medium tracking-tight
                         text-ink dark:text-night-text">
            Finanzas
          </h1>
          <p className="text-[14px] text-ink-soft dark:text-night-softText mt-1">
            Lo compartido por toda la casa y lo de tu familia, en un solo lugar.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <ActiveUserSelector userId={activeUser} onChange={setActiveUser}/>
          <FinTabs value={tab} onValueChange={setTab}>
            <FinTabsList>
              <FinTabsTrigger value="familia">Familia</FinTabsTrigger>
              <FinTabsTrigger value="personal">Personal</FinTabsTrigger>
            </FinTabsList>
          </FinTabs>
        </div>
      </header>

      <FinTabs value={tab} onValueChange={setTab}>

        {/* ───────────── FAMILIA ───────────── */}
        <FinTabsContent value="familia">
          <div className="space-y-8">
            {/* Resumen combinado: mi parte compartida + mi familia */}
            <CombinedSummary
              shared={shared.data}
              subfamilyId={subfamilyId}
              famData={fam.data}/>

            {/* Capa 1 · Compartido (visible para todos) */}
            <SharedSection shared={shared.data} subfamilyId={subfamilyId}/>

            {/* Capa 2 · Mi familia (privada · cambia con el usuario activo) */}
            <MiFamiliaSection key={subfamilyId} subfamilyId={subfamilyId} data={fam.data}/>
          </div>
        </FinTabsContent>

        {/* ───────────── PERSONAL ───────────── */}
        <FinTabsContent value="personal">
          <PersonalView data={per.data} activeUser={activeUser}/>
        </FinTabsContent>
      </FinTabs>
    </div>
  );
}


// ─── estados loading/error ──────────────────────────────────────────────────
function FinanzasLoading() {
  const Box = ({ className }) => (
    <div className={`rounded-2xl bg-paper-soft dark:bg-night-soft animate-pulse ${className}`}/>
  );
  return (
    <div className="route-fade max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-10 pb-28 md:pb-14 space-y-6">
      <Box className="h-9 w-48"/>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => <Box key={i} className="h-24"/>)}
      </div>
      <Box className="h-10 w-72"/>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => <Box key={i} className="h-14"/>)}
      </div>
    </div>
  );
}
function FinanzasError() {
  return (
    <div className="route-fade py-20 text-center text-ink-soft dark:text-night-softText">
      No pudimos cargar las finanzas. Vuelve a intentarlo en un momento.
    </div>
  );
}


// Util CSS para ocultar scrollbar en tabs móviles
const __finStyle = document.createElement('style');
__finStyle.textContent = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
`;
document.head.appendChild(__finStyle);


Object.assign(window, { FinanzasPage });
