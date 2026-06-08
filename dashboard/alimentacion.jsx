// Home Lettuce — Alimentación · Ingredientes
// ─────────────────────────────────────────────────────────────────────────────
// En el repo TS real:
//   · src/types/food.ts
//   · src/lib/macros.ts                        (kcal = 4P + 4C + 9F)
//   · src/hooks/useIngredients.ts              (TODO useQuery)
//   · src/hooks/useIngredientTypes.ts
//   · src/components/app/alimentacion/IngredientesTable.tsx
//   · src/components/app/alimentacion/IngredienteFormDialog.tsx
//   · src/components/app/alimentacion/TiposPanel.tsx
//   · src/components/app/alimentacion/TipoFormDialog.tsx
//   · src/components/app/alimentacion/ConfirmDialog.tsx
//   · src/pages/AlimentacionPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

// ─── src/types/food.ts ──────────────────────────────────────────────────────
// type PriceUnit  = 'kg' | 'l'
// type IngredientType = { id, name, color }       // color = clave de TYPE_PALETTES
// type Ingredient = {
//   id, name, typeId,
//   protein, fat, carbs,          // g por 100g/ml
//   calories, caloriesAuto,       // kcal por 100g/ml, flag de auto-calc
//   price, priceUnit,
// }

// ─── src/lib/macros.ts ──────────────────────────────────────────────────────
function calcCalories(p, c, f) {
  const v = (Number(p) || 0) * 4 + (Number(c) || 0) * 4 + (Number(f) || 0) * 9;
  return Math.round(v * 10) / 10; // 1 decimal
}

// ─── Paleta de tipos (8 pasteles consistentes con el resto de la app) ──────
// Cada palette define classes Tailwind para badge (bg+text), swatch (bg sólido
// pastel) y dot. Mantener los keys aquí abajo sincronizados con TYPE_PALETTE_IDS.
const TYPE_PALETTES = {
  sage:     { label: 'Salvia',   badge: 'bg-green-100  text-green-700  dark:bg-green-400/15  dark:text-green-300',  swatch: 'bg-green-300  dark:bg-green-400/60'  },
  peach:    { label: 'Durazno',  badge: 'bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300', swatch: 'bg-orange-300 dark:bg-orange-400/60' },
  rose:     { label: 'Rosa',     badge: 'bg-pink-100   text-pink-700   dark:bg-pink-400/15   dark:text-pink-300',   swatch: 'bg-pink-300   dark:bg-pink-400/60'   },
  sky:      { label: 'Cielo',    badge: 'bg-sky-100    text-sky-700    dark:bg-sky-400/15    dark:text-sky-300',    swatch: 'bg-sky-300    dark:bg-sky-400/60'    },
  butter:   { label: 'Mantequilla', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-300', swatch: 'bg-yellow-300 dark:bg-yellow-400/60' },
  lavender: { label: 'Lavanda',  badge: 'bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300', swatch: 'bg-purple-300 dark:bg-purple-400/60' },
  mint:     { label: 'Menta',    badge: 'bg-teal-100   text-teal-700   dark:bg-teal-400/15   dark:text-teal-300',   swatch: 'bg-teal-300   dark:bg-teal-400/60'   },
  stone:    { label: 'Piedra',   badge: 'bg-stone-200  text-stone-700  dark:bg-white/[.08]   dark:text-night-softText', swatch: 'bg-stone-300 dark:bg-white/30' },
};
const TYPE_PALETTE_IDS = ['sage','peach','rose','sky','butter','lavender','mint','stone'];

function getPalette(colorId) { return TYPE_PALETTES[colorId] || TYPE_PALETTES.stone; }


// ─── Iconos locales (line, 18×18 a tono con FI de finanzas) ────────────────
const AI = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...props}/>
);
const IconAlSearch  = (p) => <AI {...p}><circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/></AI>;
const IconAlPlus    = (p) => <AI {...p}><path d="M12 5v14M5 12h14"/></AI>;
const IconAlEdit    = (p) => <AI {...p}><path d="M14.5 5.5 18.5 9.5 8 20H4v-4Z"/><path d="m13 7 4 4"/></AI>;
const IconAlTrash   = (p) => <AI {...p}><path d="M4.5 7h15"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"/><path d="M6.5 7l1 12.5a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-12.5"/><path d="M10 11v6M14 11v6"/></AI>;
const IconAlClose   = (p) => <AI {...p}><path d="m6 6 12 12M18 6 6 18"/></AI>;
const IconAlChevDown= (p) => <AI {...p} width="12" height="12"><path d="m6 9 6 6 6-6"/></AI>;
const IconAlChevUp  = (p) => <AI {...p} width="12" height="12"><path d="m6 15 6-6 6 6"/></AI>;
const IconAlChevs   = (p) => <AI {...p} width="12" height="12" strokeWidth="1.8"><path d="m8 10 4-4 4 4M8 14l4 4 4-4"/></AI>;
const IconAlSort    = ({ dir }) => dir === 'asc' ? <IconAlChevUp/> : dir === 'desc' ? <IconAlChevDown/> : <IconAlChevs/>;
const IconAlFilter  = (p) => <AI {...p}><path d="M4 5h16l-6 8v6l-4-2v-4Z"/></AI>;
const IconAlBack    = (p) => <AI {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></AI>;
const IconAlWarn    = (p) => <AI {...p}><path d="M12 4 2.5 20h19Z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.5" r=".9" fill="currentColor" stroke="none"/></AI>;
const IconAlCalc    = (p) => <AI {...p}><rect x="6" y="3.5" width="12" height="17" rx="2.5"/><path d="M9 7h6"/><circle cx="9.5" cy="12" r=".8" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="12" r=".8" fill="currentColor" stroke="none"/><circle cx="9.5" cy="15" r=".8" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="15" r=".8" fill="currentColor" stroke="none"/></AI>;
const IconAlIngrd   = (p) => <AI {...p}><path d="M5 13c1.5-5 5.5-7 14-7-1 8-4.5 12-10.5 12A3.5 3.5 0 0 1 5 14.5"/><path d="M6 18C9 14.5 13 12.5 17 11"/></AI>;
const IconAlTag     = (p) => <AI {...p}><path d="M12.5 3.5h7v7L11 19.5a2 2 0 0 1-2.8 0L4.5 15.8a2 2 0 0 1 0-2.8z"/><circle cx="16" cy="7" r="1.2" fill="currentColor" stroke="none"/></AI>;
const IconAlGrid    = (p) => <AI {...p}><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></AI>;
const IconAlBook    = (p) => <AI {...p}><path d="M5 5a2 2 0 0 1 2-2h11v15H7a2 2 0 0 0-2 2Z"/><path d="M5 18a2 2 0 0 0 2 2h11"/><path d="M9 7.5h6M9 11h5"/></AI>;
const IconAlMealCal = (p) => <AI {...p}><rect x="3.5" y="5.5" width="17" height="14.5" rx="2.5"/><path d="M3.5 10h17M8 3.5v3M16 3.5v3"/><path d="M8 14h2.5M8 17h4"/><circle cx="15.5" cy="15.5" r="2.2"/></AI>;
const IconAlChartUp = (p) => <AI {...p}><path d="M4 19h16"/><path d="M6 16v-3M10 16V9M14 16v-5M18 16V6"/></AI>;


// ─── src/hooks/useIngredientTypes.ts ───────────────────────────────────────
// TODO: useQuery(['ingredient-types'], ...). Por ahora: estado local + mock.
function buildDefaultTypes() {
  return [
    { id: 't-fruta',      name: 'Fruta',      color: 'peach'    },
    { id: 't-verdura',    name: 'Verdura',    color: 'sage'     },
    { id: 't-carne',      name: 'Carne',      color: 'rose'     },
    { id: 't-lacteo',     name: 'Lácteo',     color: 'sky'      },
    { id: 't-cereal',     name: 'Cereal',     color: 'butter'   },
    { id: 't-legumbre',   name: 'Legumbre',   color: 'lavender' },
    { id: 't-condimento', name: 'Condimento', color: 'mint'     },
    { id: 't-otro',       name: 'Otro',       color: 'stone'    },
  ];
}

// ─── src/hooks/useIngredients.ts ───────────────────────────────────────────
// TODO: GET /api/v1/ingredients
function buildDefaultIngredients() {
  return [
    { id: 'i-1', name: 'Pechuga de pollo', typeId: 't-carne',
      protein: 31, fat: 3.6, carbs: 0,
      calories: 165, caloriesAuto: true, price: 8500, priceUnit: 'kg' },
    { id: 'i-2', name: 'Arroz blanco', typeId: 't-cereal',
      protein: 7, fat: 0.5, carbs: 80,
      calories: 364, caloriesAuto: true, price: 1200, priceUnit: 'kg' },
    { id: 'i-3', name: 'Espinaca', typeId: 't-verdura',
      protein: 2.9, fat: 0.4, carbs: 3.6,
      calories: 23, caloriesAuto: true, price: 2500, priceUnit: 'kg' },
    { id: 'i-4', name: 'Leche entera', typeId: 't-lacteo',
      protein: 3.3, fat: 3.2, carbs: 4.8,
      calories: 61, caloriesAuto: true, price: 1100, priceUnit: 'l' },
    { id: 'i-5', name: 'Huevo', typeId: 't-otro',
      protein: 13, fat: 11, carbs: 1.1,
      calories: 155, caloriesAuto: true, price: 4500, priceUnit: 'kg' },
    { id: 'i-6', name: 'Manzana roja', typeId: 't-fruta',
      protein: 0.3, fat: 0.2, carbs: 14,
      calories: 52, caloriesAuto: true, price: 1900, priceUnit: 'kg' },
    { id: 'i-7', name: 'Lentejas', typeId: 't-legumbre',
      protein: 9, fat: 0.4, carbs: 20,
      calories: 116, caloriesAuto: true, price: 2300, priceUnit: 'kg' },
    { id: 'i-8', name: 'Aceite de oliva', typeId: 't-condimento',
      protein: 0, fat: 100, carbs: 0,
      calories: 884, caloriesAuto: true, price: 9800, priceUnit: 'l' },
  ];
}


// ─── Formatters ────────────────────────────────────────────────────────────
function formatCLPInt(n) {
  if (n == null || isNaN(n)) return '—';
  return '$' + Math.round(n).toLocaleString('es-CL').replace(/,/g, '.');
}
function formatG(n) {
  if (n == null || isNaN(n)) return '—';
  return String(Math.round(n * 10) / 10);
}
function formatKcal(n) {
  if (n == null || isNaN(n)) return '—';
  return String(Math.round(n * 10) / 10);
}


// ─── shadcn-like primitives (locales, mimetizan la API real) ───────────────
function AlBadge({ type, children }) {
  const c = getPalette(type?.color);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                      text-[11.5px] font-medium whitespace-nowrap ${c.badge}`}>
      {children ?? type?.name}
    </span>
  );
}

// Tabs (pill) ─ reaprovecha el patrón de Finanzas pero independiente del scope
const AlTabsCtx = React.createContext({ value: null, onChange: () => {} });
function AlTabs({ value, onChange, children, className = '' }) {
  const ctx = React.useMemo(() => ({ value, onChange }), [value, onChange]);
  return (
    <AlTabsCtx.Provider value={ctx}>
      <div className={className}>{children}</div>
    </AlTabsCtx.Provider>
  );
}
function AlTabsList({ children }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full
                    bg-paper-soft dark:bg-night-soft">
      {children}
    </div>
  );
}
function AlTabsTrigger({ value, icon, children }) {
  const { value: cur, onChange } = React.useContext(AlTabsCtx);
  const active = cur === value;
  return (
    <button onClick={() => onChange(value)}
      className={`flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full
                  text-[13.5px] transition-colors
                  ${active
                    ? 'bg-white dark:bg-night-card text-ink dark:text-night-text font-medium shadow-subtle'
                    : 'text-ink-soft dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

// Botón primario (pill) — la app usa el patrón "bg-accent + texto del accent fuerte".
function AlPrimary({ icon, children, onClick, type = 'button', disabled }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full
                 bg-accent text-[hsl(var(--accent-strong))] font-medium text-[13.5px]
                 hover:brightness-[.96] active:brightness-[.92]
                 disabled:opacity-50 disabled:cursor-not-allowed transition">
      {icon}<span>{children}</span>
    </button>
  );
}
function AlGhost({ icon, children, onClick, type = 'button', tone = 'neutral' }) {
  const toneCls = tone === 'danger'
    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
    : 'text-ink dark:text-night-text hover:bg-paper-soft dark:hover:bg-night-soft';
  return (
    <button type={type} onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full
                  text-[13.5px] font-medium transition-colors ${toneCls}`}>
      {icon}{children && <span>{children}</span>}
    </button>
  );
}


// ─── IngredientesTable ─────────────────────────────────────────────────────
// Columnas: Nombre | Tipo | P | G | C | kcal | Precio | Acciones
// Ordenable por cualquier cabecera. Acciones aparecen al hover (md+) y
// siempre en mobile (donde no hay hover fiable).
const COLS = [
  { id: 'name',     label: 'Nombre',          align: 'left',  width: 'minmax(180px, 1.4fr)', numeric: false },
  { id: 'type',     label: 'Tipo',            align: 'left',  width: '130px',                numeric: false },
  { id: 'protein',  label: 'Proteínas (g)',   align: 'right', width: '110px',                numeric: true  },
  { id: 'fat',      label: 'Grasas (g)',      align: 'right', width: '100px',                numeric: true  },
  { id: 'carbs',    label: 'Carbohidratos',   label2: '(g)',  align: 'right', width: '120px',numeric: true  },
  { id: 'calories', label: 'Calorías',        label2: '(kcal)', align: 'right', width: '110px', numeric: true},
  { id: 'price',    label: 'Precio',          align: 'right', width: '140px',                numeric: true  },
  { id: 'actions',  label: '',                align: 'right', width: '88px',                 numeric: false },
];
const COLS_GRID = COLS.map(c => c.width).join(' ');

function IngredientesTable({
  ingredients, types, search, typeFilter, sort, onSort, onEdit, onDelete,
}) {
  const byId = React.useMemo(
    () => Object.fromEntries(types.map(t => [t.id, t])),
    [types]
  );

  const rows = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    let r = ingredients;
    if (needle) {
      r = r.filter(i => {
        const t = byId[i.typeId];
        return i.name.toLowerCase().includes(needle)
            || (t && t.name.toLowerCase().includes(needle));
      });
    }
    if (typeFilter) r = r.filter(i => i.typeId === typeFilter);

    const k = sort.key; const dir = sort.dir === 'asc' ? 1 : -1;
    r = [...r].sort((a, b) => {
      let va, vb;
      if (k === 'name')       { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
      else if (k === 'type')  { va = (byId[a.typeId]?.name || '').toLowerCase(); vb = (byId[b.typeId]?.name || '').toLowerCase(); }
      else if (k === 'price') { va = a.price; vb = b.price; }
      else                    { va = a[k]; vb = b[k]; }
      if (va == null) va = -Infinity;
      if (vb == null) vb = -Infinity;
      if (va < vb) return -1 * dir;
      if (va > vb) return  1 * dir;
      return 0;
    });
    return r;
  }, [ingredients, byId, search, typeFilter, sort]);

  if (rows.length === 0) {
    return <IngredientesEmpty hasFilter={!!(search || typeFilter)}/>;
  }

  return (
    <div className="bg-white dark:bg-night-card rounded-2xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle
                    overflow-hidden">
      {/* Header desktop */}
      <div className="hidden md:block overflow-x-auto no-scrollbar">
        <div className="min-w-[920px]">
          <div className="grid gap-3 px-4 py-3
                          text-[11px] font-medium uppercase tracking-[.08em]
                          text-ink-mute dark:text-night-softText
                          border-b border-black/[.05] dark:border-white/[.05]"
               style={{ gridTemplateColumns: COLS_GRID }}>
            {COLS.map((c) => {
              const sortable = c.id !== 'actions';
              const active = sort.key === c.id;
              const dir = active ? sort.dir : null;
              return (
                <button key={c.id}
                  type={sortable ? 'button' : undefined}
                  disabled={!sortable}
                  onClick={sortable ? () => onSort(c.id) : undefined}
                  className={`inline-flex items-center gap-1.5 select-none
                              ${c.align === 'right' ? 'justify-end' : 'justify-start'}
                              ${sortable
                                ? 'hover:text-ink dark:hover:text-night-text transition-colors cursor-pointer'
                                : 'cursor-default'}
                              ${active ? 'text-ink dark:text-night-text' : ''}`}>
                  <span>
                    {c.label}{c.label2 && <span className="hidden lg:inline"> {c.label2}</span>}
                  </span>
                  {sortable && (
                    <span className={active ? 'text-accent' : 'opacity-50'}>
                      <IconAlSort dir={dir}/>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filas desktop */}
          <ul>
            {rows.map((i, idx) => {
              const t = byId[i.typeId];
              return (
                <li key={i.id}
                    className={`group grid gap-3 px-4 py-3 items-center
                                ${idx === 0 ? '' : 'border-t border-black/[.045] dark:border-white/[.05]'}
                                hover:bg-paper-soft/60 dark:hover:bg-night-soft/40
                                transition-colors`}
                    style={{ gridTemplateColumns: COLS_GRID }}>
                  <div className="text-[14px] text-ink dark:text-night-text font-medium truncate">
                    {i.name}
                  </div>
                  <div className="min-w-0">
                    {t
                      ? <AlBadge type={t}/>
                      : <span className="text-[12px] text-ink-mute dark:text-night-softText">—</span>}
                  </div>
                  <NumCell value={formatG(i.protein)}/>
                  <NumCell value={formatG(i.fat)}/>
                  <NumCell value={formatG(i.carbs)}/>
                  <NumCell value={formatKcal(i.calories)} strong/>
                  <div className="text-right">
                    <div className="text-[13.5px] tabular-nums text-ink dark:text-night-text">
                      {formatCLPInt(i.price)}
                    </div>
                    <div className="text-[10.5px] uppercase tracking-[.06em] text-ink-mute dark:text-night-softText">
                      por {i.priceUnit === 'l' ? 'litro' : 'kg'}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1
                                  opacity-0 group-hover:opacity-100
                                  focus-within:opacity-100 transition-opacity">
                    <RowIcon label="Editar" onClick={() => onEdit(i)}><IconAlEdit/></RowIcon>
                    <RowIcon label="Borrar" tone="danger" onClick={() => onDelete(i)}><IconAlTrash/></RowIcon>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Card layout mobile */}
      <ul className="md:hidden divide-y divide-black/[.045] dark:divide-white/[.05]">
        {rows.map((i) => {
          const t = byId[i.typeId];
          return (
            <li key={i.id} className="px-4 py-3.5">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-medium text-ink dark:text-night-text">
                      {i.name}
                    </span>
                    {t && <AlBadge type={t}/>}
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-[12px] tabular-nums">
                    <Stat label="P" value={formatG(i.protein) + 'g'}/>
                    <Stat label="G" value={formatG(i.fat) + 'g'}/>
                    <Stat label="C" value={formatG(i.carbs) + 'g'}/>
                    <Stat label="kcal" value={formatKcal(i.calories)} strong/>
                  </div>
                  <div className="mt-2 text-[12px] text-ink-soft dark:text-night-softText">
                    {formatCLPInt(i.price)}
                    <span className="text-ink-mute dark:text-night-softText"> /{i.priceUnit === 'l' ? 'litro' : 'kg'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 -mt-1">
                  <RowIcon label="Editar" onClick={() => onEdit(i)}><IconAlEdit/></RowIcon>
                  <RowIcon label="Borrar" tone="danger" onClick={() => onDelete(i)}><IconAlTrash/></RowIcon>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer count */}
      <div className="px-4 py-2.5 border-t border-black/[.045] dark:border-white/[.05]
                      text-[11.5px] text-ink-mute dark:text-night-softText
                      flex items-center justify-between">
        <span>
          {rows.length} {rows.length === 1 ? 'ingrediente' : 'ingredientes'}
          {(search || typeFilter) && rows.length !== ingredients.length && (
            <span> · de {ingredients.length} totales</span>
          )}
        </span>
        <span className="hidden sm:inline">Valores por 100 g / 100 ml</span>
      </div>
    </div>
  );
}

function NumCell({ value, strong }) {
  return (
    <div className={`text-right tabular-nums text-[13.5px]
                     ${strong ? 'text-ink dark:text-night-text font-medium'
                              : 'text-ink-soft dark:text-night-softText'}`}>
      {value}
    </div>
  );
}
function Stat({ label, value, strong }) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-[.06em] text-ink-mute dark:text-night-softText">
        {label}
      </div>
      <div className={`mt-0.5 ${strong ? 'text-ink dark:text-night-text font-medium' : 'text-ink-soft dark:text-night-softText'}`}>
        {value}
      </div>
    </div>
  );
}
function RowIcon({ label, tone = 'neutral', onClick, children }) {
  const toneCls = tone === 'danger'
    ? 'text-ink-mute hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
    : 'text-ink-mute hover:text-ink dark:text-night-softText dark:hover:text-night-text hover:bg-paper-soft dark:hover:bg-night-soft';
  return (
    <button onClick={onClick} aria-label={label} title={label}
      className={`h-8 w-8 rounded-full inline-flex items-center justify-center
                  transition-colors ${toneCls}`}>
      {children}
    </button>
  );
}

function IngredientesEmpty({ hasFilter }) {
  return (
    <div className="bg-white dark:bg-night-card rounded-2xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle
                    p-10 sm:p-14 flex flex-col items-center text-center">
      <div className="h-16 w-16 rounded-3xl bg-accent-tint flex items-center justify-center
                      text-accent mb-4">
        <span style={{transform:'scale(1.6)'}}><IconAlIngrd/></span>
      </div>
      <h3 className="text-[15px] font-medium text-ink dark:text-night-text">
        {hasFilter ? 'Sin resultados' : 'Aún no hay ingredientes'}
      </h3>
      <p className="mt-1.5 text-[13px] text-ink-soft dark:text-night-softText max-w-xs">
        {hasFilter
          ? 'Prueba con otro nombre o limpia el filtro de tipo.'
          : 'Agrega tu primer ingrediente para empezar a planificar recetas y compras.'}
      </p>
    </div>
  );
}


// ─── Filter chips (tipo) ───────────────────────────────────────────────────
function TypeFilterChips({ types, value, onChange, ingredients }) {
  const countBy = React.useMemo(() => {
    const m = {};
    ingredients.forEach(i => { m[i.typeId] = (m[i.typeId] || 0) + 1; });
    return m;
  }, [ingredients]);

  return (
    <div className="-mx-5 sm:mx-0 px-5 sm:px-0 overflow-x-auto no-scrollbar">
      <ul className="flex items-center gap-2 min-w-max">
        <li>
          <FilterChip selected={!value} onClick={() => onChange(null)}>
            <IconAlFilter/> Todos
            <span className="opacity-60 tabular-nums">{ingredients.length}</span>
          </FilterChip>
        </li>
        {types.map(t => {
          const count = countBy[t.id] || 0;
          if (count === 0) return null;
          const selected = value === t.id;
          const c = getPalette(t.color);
          return (
            <li key={t.id}>
              <FilterChip selected={selected} onClick={() => onChange(selected ? null : t.id)}>
                <span className={`h-2.5 w-2.5 rounded-full ${c.swatch}`}/>
                {t.name}
                <span className="opacity-60 tabular-nums">{count}</span>
              </FilterChip>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
function FilterChip({ selected, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px]
                  border transition-colors whitespace-nowrap
                  ${selected
                    ? 'bg-accent border-transparent text-[hsl(var(--accent-strong))] font-medium'
                    : 'border-black/[.08] dark:border-white/[.1] text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
      {children}
    </button>
  );
}


// ─── Search input ──────────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5
                    bg-paper-soft dark:bg-night-soft
                    border border-transparent focus-within:border-accent
                    focus-within:bg-white dark:focus-within:bg-night
                    transition-colors w-full sm:max-w-md">
      <span className="text-ink-mute dark:text-night-softText shrink-0"><IconAlSearch/></span>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-[14px]
                   placeholder:text-ink-mute dark:placeholder:text-night-softText"/>
      {value && (
        <button onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="text-ink-mute dark:text-night-softText hover:text-ink dark:hover:text-night-text shrink-0">
          <IconAlClose/>
        </button>
      )}
    </div>
  );
}


// ─── Dialog shell ──────────────────────────────────────────────────────────
function Dialog({ open, onClose, title, subtitle, children, footer, maxW = 'sm:max-w-lg' }) {
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                    bg-black/40 backdrop-blur-[2px] animate-[alfadein_.18s_ease]"
         onClick={onClose} role="dialog" aria-modal="true">
      <style>{`
        @keyframes alfadein { from { opacity:0 } to { opacity:1 } }
        @keyframes alriseup { from { opacity:0; transform: translateY(16px) } to { opacity:1; transform:none } }
      `}</style>
      <div onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxW}
                    max-h-[92vh] sm:max-h-[88vh]
                    bg-white dark:bg-night-card
                    rounded-t-3xl sm:rounded-3xl
                    border border-black/[.06] dark:border-white/[.06]
                    shadow-subtle overflow-hidden flex flex-col
                    animate-[alriseup_.22s_ease]`}>

        {/* mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-black/10 dark:bg-white/15"/>
        </div>

        {/* header */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-4 sm:pt-5 pb-3
                        border-b border-black/[.04] dark:border-white/[.05]">
          <div className="min-w-0">
            <h2 className="text-[17px] font-medium tracking-tight text-ink dark:text-night-text">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12.5px] text-ink-soft dark:text-night-softText mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Cerrar"
            className="h-9 w-9 -mr-1 rounded-full flex items-center justify-center
                       text-ink-soft dark:text-night-softText
                       hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
            <IconAlClose/>
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5">
          {children}
        </div>

        {/* footer */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5
                          border-t border-black/[.04] dark:border-white/[.05]
                          flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Inputs reutilizables ──────────────────────────────────────────────────
function FormLabel({ children, htmlFor, hint }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5 ml-1">
      <label htmlFor={htmlFor}
        className="text-[11px] font-medium uppercase tracking-[.08em]
                   text-ink-mute dark:text-night-softText">
        {children}
      </label>
      {hint && (
        <span className="text-[10.5px] text-ink-mute dark:text-night-softText">{hint}</span>
      )}
    </div>
  );
}
function TextInput({ id, value, onChange, placeholder, autoFocus, type = 'text', suffix }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl px-4 py-3
                    bg-paper-soft dark:bg-night-soft
                    border border-transparent focus-within:border-accent
                    focus-within:bg-white dark:focus-within:bg-night
                    transition-colors">
      <input id={id} type={type} value={value ?? ''} autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-[14.5px] tabular-nums
                   placeholder:text-ink-mute dark:placeholder:text-night-softText"/>
      {suffix && (
        <span className="text-[12px] text-ink-mute dark:text-night-softText shrink-0">{suffix}</span>
      )}
    </div>
  );
}
function NumberInput({ id, value, onChange, suffix, placeholder = '0', step = '0.1', min }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl px-4 py-3
                    bg-paper-soft dark:bg-night-soft
                    border border-transparent focus-within:border-accent
                    focus-within:bg-white dark:focus-within:bg-night
                    transition-colors">
      <input id={id} type="number" inputMode="decimal"
        value={value === '' || value == null ? '' : value}
        step={step} min={min}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-[14.5px] tabular-nums
                   placeholder:text-ink-mute dark:placeholder:text-night-softText"/>
      {suffix && (
        <span className="text-[12px] text-ink-mute dark:text-night-softText shrink-0">{suffix}</span>
      )}
    </div>
  );
}


// ─── IngredienteFormDialog ─────────────────────────────────────────────────
// Crea o edita. Si `editing` viene null, es modo crear.
function IngredienteFormDialog({ open, editing, types, onClose, onSubmit, onCreateType }) {
  // empty form
  const empty = {
    name: '',
    typeId: types[0]?.id || '',
    protein: '', fat: '', carbs: '',
    calories: '', caloriesAuto: true,
    price: '', priceUnit: 'kg',
  };

  const [form, setForm] = React.useState(empty);
  const [creatingType, setCreatingType] = React.useState(false);
  const [newTypeName, setNewTypeName] = React.useState('');
  const [newTypeColor, setNewTypeColor] = React.useState('sage');

  // Reset cuando se (re)abre el diálogo
  React.useEffect(() => {
    if (!open) return;
    setCreatingType(false);
    setNewTypeName(''); setNewTypeColor('sage');
    if (editing) {
      setForm({
        name: editing.name,
        typeId: editing.typeId,
        protein: editing.protein ?? '',
        fat:     editing.fat     ?? '',
        carbs:   editing.carbs   ?? '',
        calories: editing.calories ?? '',
        caloriesAuto: !!editing.caloriesAuto,
        price: editing.price ?? '',
        priceUnit: editing.priceUnit || 'kg',
      });
    } else {
      setForm({ ...empty, typeId: types[0]?.id || '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  // Auto-cálculo de calorías
  const autoCalories = calcCalories(form.protein, form.carbs, form.fat);
  React.useEffect(() => {
    if (form.caloriesAuto) {
      setForm(f => ({ ...f, calories: autoCalories }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.protein, form.fat, form.carbs, form.caloriesAuto]);

  const canSubmit = form.name.trim().length > 0 && form.typeId;

  const submit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    const out = {
      name: form.name.trim(),
      typeId: form.typeId,
      protein: Number(form.protein) || 0,
      fat:     Number(form.fat)     || 0,
      carbs:   Number(form.carbs)   || 0,
      calories: form.caloriesAuto ? autoCalories : (Number(form.calories) || 0),
      caloriesAuto: form.caloriesAuto,
      price: Number(form.price) || 0,
      priceUnit: form.priceUnit,
    };
    onSubmit(out);
  };

  const confirmCreateType = () => {
    const name = newTypeName.trim();
    if (!name) return;
    const created = onCreateType({ name, color: newTypeColor });
    setForm(f => ({ ...f, typeId: created.id }));
    setCreatingType(false);
    setNewTypeName(''); setNewTypeColor('sage');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? 'Editar ingrediente' : 'Nuevo ingrediente'}
      subtitle="Macros y calorías son por cada 100 g (o 100 ml)."
      footer={
        <React.Fragment>
          <AlGhost onClick={onClose}>Cancelar</AlGhost>
          <AlPrimary onClick={submit} disabled={!canSubmit}>
            {editing ? 'Guardar cambios' : 'Guardar'}
          </AlPrimary>
        </React.Fragment>
      }>
      <form onSubmit={submit} className="space-y-5">
        {/* Nombre */}
        <div>
          <FormLabel htmlFor="al-name">Nombre</FormLabel>
          <TextInput id="al-name" autoFocus
            value={form.name}
            onChange={(v) => setForm(f => ({ ...f, name: v }))}
            placeholder="Ej. Pechuga de pollo"/>
        </div>

        {/* Tipo */}
        <div>
          <FormLabel>Tipo</FormLabel>
          {!creatingType ? (
            <React.Fragment>
              <div className="flex flex-wrap gap-1.5">
                {types.map(t => {
                  const sel = form.typeId === t.id;
                  const c = getPalette(t.color);
                  return (
                    <button key={t.id} type="button"
                      onClick={() => setForm(f => ({ ...f, typeId: t.id }))}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                  text-[11.5px] font-medium border transition-colors
                                  ${sel
                                    ? `${c.badge} border-transparent ring-2 ring-offset-1 ring-offset-white dark:ring-offset-night-card ring-accent`
                                    : 'border-black/[.08] dark:border-white/[.1] text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
                      <span className={`h-2 w-2 rounded-full ${c.swatch}`}/>
                      {t.name}
                    </button>
                  );
                })}
                <button type="button"
                  onClick={() => setCreatingType(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                             text-[11.5px] font-medium border border-dashed
                             border-black/[.15] dark:border-white/[.15]
                             text-ink-soft dark:text-night-softText
                             hover:border-accent hover:text-accent transition-colors">
                  <IconAlPlus width="12" height="12"/> Crear nuevo tipo
                </button>
              </div>
            </React.Fragment>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/[.12] dark:border-white/[.12]
                            p-3.5 space-y-3 bg-paper-soft/40 dark:bg-night-soft/40">
              <div>
                <FormLabel htmlFor="al-new-type">Nombre del tipo</FormLabel>
                <TextInput id="al-new-type" autoFocus
                  value={newTypeName} onChange={setNewTypeName}
                  placeholder="Ej. Pescado"/>
              </div>
              <div>
                <FormLabel>Color del badge</FormLabel>
                <ColorSwatchPicker value={newTypeColor} onChange={setNewTypeColor}/>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <AlGhost onClick={() => { setCreatingType(false); setNewTypeName(''); }}>
                  Cancelar
                </AlGhost>
                <AlPrimary onClick={confirmCreateType} disabled={!newTypeName.trim()}>
                  Crear tipo
                </AlPrimary>
              </div>
            </div>
          )}
        </div>

        {/* Macros: P / G / C */}
        <div>
          <FormLabel hint="por 100 g">Macros</FormLabel>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <NumberInput id="al-protein"
                value={form.protein} onChange={(v) => setForm(f => ({ ...f, protein: v }))}
                suffix="g · P" min="0"/>
            </div>
            <div>
              <NumberInput id="al-fat"
                value={form.fat} onChange={(v) => setForm(f => ({ ...f, fat: v }))}
                suffix="g · G" min="0"/>
            </div>
            <div>
              <NumberInput id="al-carbs"
                value={form.carbs} onChange={(v) => setForm(f => ({ ...f, carbs: v }))}
                suffix="g · C" min="0"/>
            </div>
          </div>
        </div>

        {/* Calorías + auto */}
        <div>
          <FormLabel hint={form.caloriesAuto ? 'Auto: 4·P + 4·C + 9·G' : 'Manual'}>
            Calorías
          </FormLabel>
          <div className="flex items-stretch gap-2">
            <div className="flex-1">
              <NumberInput id="al-calories"
                value={form.caloriesAuto ? autoCalories : form.calories}
                onChange={(v) => setForm(f => ({ ...f, calories: v }))}
                suffix="kcal" min="0"/>
            </div>
            <button type="button"
              onClick={() => setForm(f => ({ ...f, caloriesAuto: !f.caloriesAuto }))}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 rounded-2xl
                          text-[12px] font-medium border transition-colors
                          ${form.caloriesAuto
                            ? 'bg-accent-tint border-transparent text-accent'
                            : 'border-black/[.08] dark:border-white/[.1] text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft'}`}
              aria-pressed={form.caloriesAuto}>
              <IconAlCalc/> Auto
            </button>
          </div>
          {form.caloriesAuto && (
            <p className="mt-1.5 ml-1 text-[11.5px] text-ink-mute dark:text-night-softText">
              Se recalcula al editar macros. Toca «Auto» para introducir un valor manual.
            </p>
          )}
        </div>

        {/* Precio + unidad */}
        <div>
          <FormLabel htmlFor="al-price">Precio</FormLabel>
          <div className="flex items-stretch gap-2">
            <div className="flex-1">
              <NumberInput id="al-price"
                value={form.price} onChange={(v) => setForm(f => ({ ...f, price: v }))}
                suffix="CLP" min="0" step="1"/>
            </div>
            <div className="inline-flex p-1 rounded-2xl bg-paper-soft dark:bg-night-soft shrink-0">
              {[
                { id: 'kg', label: 'por kg' },
                { id: 'l',  label: 'por litro' },
              ].map(opt => {
                const sel = form.priceUnit === opt.id;
                return (
                  <button key={opt.id} type="button"
                    onClick={() => setForm(f => ({ ...f, priceUnit: opt.id }))}
                    className={`px-3 py-2 rounded-xl text-[12.5px] transition-colors
                                ${sel
                                  ? 'bg-white dark:bg-night-card text-ink dark:text-night-text font-medium shadow-subtle'
                                  : 'text-ink-soft dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

function ColorSwatchPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TYPE_PALETTE_IDS.map(id => {
        const c = getPalette(id);
        const sel = value === id;
        return (
          <button key={id} type="button"
            onClick={() => onChange(id)}
            aria-label={c.label}
            title={c.label}
            className={`h-8 w-8 rounded-full ${c.swatch}
                        flex items-center justify-center
                        transition-transform
                        ${sel ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-night-card ring-accent scale-105' : 'hover:scale-105'}`}>
            {sel && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                   className="text-white/95 mix-blend-overlay">
                <path d="m6 12 4 4 8-8"/>
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}


// ─── TiposPanel ────────────────────────────────────────────────────────────
function TiposPanel({ types, ingredients, onEdit, onDelete, onCreate }) {
  const countBy = React.useMemo(() => {
    const m = {};
    ingredients.forEach(i => { m[i.typeId] = (m[i.typeId] || 0) + 1; });
    return m;
  }, [ingredients]);

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-ink-soft dark:text-night-softText max-w-md">
        Define las categorías que aparecen como etiqueta en cada ingrediente.
        El color se aplica en toda la tabla al instante.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {types.map(t => {
          const c = getPalette(t.color);
          const count = countBy[t.id] || 0;
          return (
            <div key={t.id}
              className="group bg-white dark:bg-night-card rounded-2xl p-4
                         border border-black/[.04] dark:border-white/[.05] shadow-subtle
                         flex items-center gap-3">
              <div className={`h-10 w-10 rounded-2xl ${c.swatch} shrink-0`}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14.5px] font-medium text-ink dark:text-night-text truncate">
                    {t.name}
                  </span>
                  <AlBadge type={t}>Vista previa</AlBadge>
                </div>
                <div className="text-[11.5px] text-ink-mute dark:text-night-softText mt-0.5">
                  {count} {count === 1 ? 'ingrediente' : 'ingredientes'}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0
                              opacity-0 group-hover:opacity-100 sm:focus-within:opacity-100
                              transition-opacity"
                   style={{ opacity: 1 }}>
                <RowIcon label="Editar tipo" onClick={() => onEdit(t)}><IconAlEdit/></RowIcon>
                <RowIcon label="Borrar tipo" tone="danger" onClick={() => onDelete(t)}><IconAlTrash/></RowIcon>
              </div>
            </div>
          );
        })}
      </div>

      {types.length === 0 && (
        <div className="bg-white dark:bg-night-card rounded-2xl
                        border border-black/[.04] dark:border-white/[.05] shadow-subtle
                        p-10 text-center">
          <div className="h-14 w-14 mx-auto rounded-3xl bg-accent-tint text-accent
                          flex items-center justify-center mb-3">
            <IconAlTag/>
          </div>
          <h3 className="text-[14.5px] font-medium text-ink dark:text-night-text">
            Aún no hay tipos
          </h3>
          <p className="mt-1 text-[12.5px] text-ink-soft dark:text-night-softText">
            Crea uno para empezar a clasificar tus ingredientes.
          </p>
        </div>
      )}
    </div>
  );
}


// ─── TipoFormDialog (crear/editar) ─────────────────────────────────────────
function TipoFormDialog({ open, editing, onClose, onSubmit }) {
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState('sage');

  React.useEffect(() => {
    if (!open) return;
    if (editing) { setName(editing.name); setColor(editing.color); }
    else         { setName(''); setColor('sage'); }
  }, [open, editing]);

  const canSubmit = name.trim().length > 0;
  const submit = () => {
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), color });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxW="sm:max-w-md"
      title={editing ? 'Editar tipo' : 'Nuevo tipo'}
      subtitle="El color se aplicará al badge en toda la tabla."
      footer={
        <React.Fragment>
          <AlGhost onClick={onClose}>Cancelar</AlGhost>
          <AlPrimary onClick={submit} disabled={!canSubmit}>
            {editing ? 'Guardar cambios' : 'Crear tipo'}
          </AlPrimary>
        </React.Fragment>
      }>
      <div className="space-y-5">
        <div>
          <FormLabel htmlFor="al-tipo-name">Nombre</FormLabel>
          <TextInput id="al-tipo-name" autoFocus
            value={name} onChange={setName}
            placeholder="Ej. Pescado"/>
        </div>
        <div>
          <FormLabel>Color del badge</FormLabel>
          <ColorSwatchPicker value={color} onChange={setColor}/>
          <div className="mt-3">
            <span className="text-[11px] uppercase tracking-[.08em] text-ink-mute dark:text-night-softText mr-2">
              Vista previa
            </span>
            <AlBadge type={{ name: name.trim() || 'Nombre del tipo', color }}/>
          </div>
        </div>
      </div>
    </Dialog>
  );
}


// ─── ConfirmDialog ────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, confirmLabel = 'Borrar', tone = 'danger', onConfirm, onClose, children }) {
  const confirmBtn = tone === 'danger' ? (
    <button onClick={onConfirm}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full
                 bg-red-500 text-white font-medium text-[13.5px]
                 hover:bg-red-600 active:bg-red-700 transition-colors">
      {confirmLabel}
    </button>
  ) : (
    <AlPrimary onClick={onConfirm}>{confirmLabel}</AlPrimary>
  );
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxW="sm:max-w-sm"
      title={title}
      footer={
        <React.Fragment>
          <AlGhost onClick={onClose}>Cancelar</AlGhost>
          {confirmBtn}
        </React.Fragment>
      }>
      {message && (
        <p className="text-[14px] text-ink-soft dark:text-night-softText leading-relaxed">
          {message}
        </p>
      )}
      {children}
    </Dialog>
  );
}


// ─── AlimentacionPage (export) ────────────────────────────────────────────
// En el repo real el router resuelve /alimentacion, /alimentacion/ingredientes
// y /alimentacion/recetas; aquí simulamos eso con un único state `moduleTab`.
function AlimentacionPage({ currentUserId }) {
  // ─── State raíz (en el repo real: useIngredients, useIngredientTypes)
  const [types, setTypes]               = React.useState(buildDefaultTypes);
  const [ingredients, setIngredients]   = React.useState(buildDefaultIngredients);

  // ─── UI state — navegación del módulo
  const [moduleTab, setModuleTab]   = React.useState('general'); // 'general' | 'ingredientes' | 'recetas'
  const [innerTab, setInnerTab]     = React.useState('ingredientes'); // dentro de /ingredientes: 'ingredientes' | 'tipos'
  const [search, setSearch]         = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState(null);
  const [sort, setSort]             = React.useState({ key: 'name', dir: 'asc' });

  // ─── Dialogs
  const [ingDialog,   setIngDialog]   = React.useState({ open: false, editing: null });
  const [typeDialog,  setTypeDialog]  = React.useState({ open: false, editing: null });
  const [confirmDel,  setConfirmDel]  = React.useState(null);  // { kind:'ingredient'|'type', target, reassignTo? }

  // ─── Sort handler
  const onSort = (key) => {
    setSort(prev => prev.key === key
      ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: key === 'name' || key === 'type' ? 'asc' : 'desc' });
  };

  // ─── Ingredient ops
  const upsertIngredient = (data) => {
    if (ingDialog.editing) {
      const id = ingDialog.editing.id;
      setIngredients(list => list.map(i => i.id === id ? { ...i, ...data } : i));
    } else {
      const id = 'i-' + Date.now().toString(36);
      setIngredients(list => [{ id, ...data }, ...list]);
    }
    setIngDialog({ open: false, editing: null });
  };

  const deleteIngredient = (target) => {
    setIngredients(list => list.filter(i => i.id !== target.id));
    setConfirmDel(null);
  };

  // ─── Type ops
  const createType = ({ name, color }) => {
    const id = 't-' + Date.now().toString(36);
    const t = { id, name, color };
    setTypes(list => [...list, t]);
    return t;
  };

  const upsertType = (data) => {
    if (typeDialog.editing) {
      const id = typeDialog.editing.id;
      setTypes(list => list.map(t => t.id === id ? { ...t, ...data } : t));
    } else {
      createType(data);
    }
    setTypeDialog({ open: false, editing: null });
  };

  const deleteType = (target, reassignTo) => {
    // Reasigna ingredientes que usaban este tipo, si se indicó destino.
    if (reassignTo) {
      setIngredients(list => list.map(i => i.typeId === target.id ? { ...i, typeId: reassignTo } : i));
    } else {
      // sin reasignar: deja typeId huérfano (la tabla muestra "—"). En el repo
      // real, el endpoint DELETE devuelve 409 si hay refs y se exige reasignar.
      setIngredients(list => list.map(i => i.typeId === target.id ? { ...i, typeId: null } : i));
    }
    setTypes(list => list.filter(t => t.id !== target.id));
    setConfirmDel(null);
  };

  // Count usados al construir el confirm de borrado de tipo
  const inUseCount = (typeId) =>
    ingredients.filter(i => i.typeId === typeId).length;

  return (
    <PageShell title="">
      {/* ─── Header del módulo ───────────────────────────────────────────── */}
      <header className="mb-5">
        <h1 className="text-[28px] sm:text-[34px] font-medium tracking-tight
                       text-ink dark:text-night-text">
          Alimentación
        </h1>
        <p className="text-[13px] text-ink-soft dark:text-night-softText mt-0.5">
          Comidas, despensa y recetas de la casa.
        </p>
      </header>

      {/* ─── Subnavegación del módulo ────────────────────────────────────── */}
      <div className="mb-6">
        <AlTabs value={moduleTab} onChange={setModuleTab}>
          <AlTabsList>
            <AlTabsTrigger value="general" icon={<IconAlGrid/>}>
              Vista general
            </AlTabsTrigger>
            <AlTabsTrigger value="ingredientes" icon={<IconAlIngrd/>}>
              Ingredientes
            </AlTabsTrigger>
            <AlTabsTrigger value="recetas" icon={<IconAlBook/>}>
              Recetas
            </AlTabsTrigger>
          </AlTabsList>
        </AlTabs>
      </div>

      {/* ─── /alimentacion · Vista general ───────────────────────────────── */}
      {moduleTab === 'general' && (
        <VistaGeneralView currentUserId={currentUserId}/>
      )}

      {/* ─── /alimentacion/ingredientes ──────────────────────────────────── */}
      {moduleTab === 'ingredientes' && (
        <div className="route-fade space-y-4">
          {/* Toggle interno: lista / gestión de tipos */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <AlTabs value={innerTab} onChange={setInnerTab}>
              <AlTabsList>
                <AlTabsTrigger value="ingredientes">
                  Lista
                  <span className="ml-1 text-[11px] tabular-nums opacity-70">{ingredients.length}</span>
                </AlTabsTrigger>
                <AlTabsTrigger value="tipos">
                  Tipos
                  <span className="ml-1 text-[11px] tabular-nums opacity-70">{types.length}</span>
                </AlTabsTrigger>
              </AlTabsList>
            </AlTabs>

            {innerTab === 'ingredientes' ? (
              <AlPrimary
                icon={<IconAlPlus/>}
                onClick={() => setIngDialog({ open: true, editing: null })}>
                Nuevo ingrediente
              </AlPrimary>
            ) : (
              <AlPrimary
                icon={<IconAlPlus/>}
                onClick={() => setTypeDialog({ open: true, editing: null })}>
                Nuevo tipo
              </AlPrimary>
            )}
          </div>

          {innerTab === 'ingredientes' && (
            <div className="space-y-4 route-fade">
              {/* Búsqueda */}
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar por nombre o tipo…"/>

              {/* Chips de filtro por tipo */}
              <TypeFilterChips
                types={types}
                value={typeFilter}
                onChange={setTypeFilter}
                ingredients={ingredients}/>

              {/* Tabla */}
              <IngredientesTable
                ingredients={ingredients}
                types={types}
                search={search}
                typeFilter={typeFilter}
                sort={sort}
                onSort={onSort}
                onEdit={(i) => setIngDialog({ open: true, editing: i })}
                onDelete={(i) => setConfirmDel({ kind: 'ingredient', target: i })}/>
            </div>
          )}

          {innerTab === 'tipos' && (
            <div className="route-fade">
              <TiposPanel
                types={types}
                ingredients={ingredients}
                onEdit={(t) => setTypeDialog({ open: true, editing: t })}
                onDelete={(t) => setConfirmDel({ kind: 'type', target: t, reassignTo: '' })}
                onCreate={() => setTypeDialog({ open: true, editing: null })}/>
            </div>
          )}
        </div>
      )}

      {/* ─── /alimentacion/recetas ───────────────────────────────────────── */}
      {moduleTab === 'recetas' && (
        <RecetasView ingredients={ingredients} types={types} currentUserId={currentUserId}/>
      )}

      {/* ─── Dialogs ────────────────────────────────────────────────────── */}
      <IngredienteFormDialog
        open={ingDialog.open}
        editing={ingDialog.editing}
        types={types}
        onClose={() => setIngDialog({ open: false, editing: null })}
        onSubmit={upsertIngredient}
        onCreateType={createType}/>

      <TipoFormDialog
        open={typeDialog.open}
        editing={typeDialog.editing}
        onClose={() => setTypeDialog({ open: false, editing: null })}
        onSubmit={upsertType}/>

      {/* Confirm borrar ingrediente */}
      <ConfirmDialog
        open={!!(confirmDel && confirmDel.kind === 'ingredient')}
        title={`Borrar «${confirmDel?.target?.name}»`}
        message="Esta acción no se puede deshacer. El ingrediente se eliminará de la base de datos para todos los usuarios de la casa."
        confirmLabel="Borrar ingrediente"
        onClose={() => setConfirmDel(null)}
        onConfirm={() => deleteIngredient(confirmDel.target)}/>

      {/* Confirm borrar tipo (con advertencia + reasignación opcional) */}
      {confirmDel && confirmDel.kind === 'type' && (
        <ConfirmDelTipoDialog
          target={confirmDel.target}
          inUseCount={inUseCount(confirmDel.target.id)}
          types={types}
          reassignTo={confirmDel.reassignTo}
          setReassignTo={(v) => setConfirmDel(prev => ({ ...prev, reassignTo: v }))}
          onClose={() => setConfirmDel(null)}
          onConfirm={() => deleteType(confirmDel.target, confirmDel.reassignTo || null)}/>
      )}
    </PageShell>
  );
}

// Confirm específico para borrar tipo. Si hay ingredientes asociados muestra
// un selector de reasignación; si no, va directo.
function ConfirmDelTipoDialog({ target, inUseCount, types, reassignTo, setReassignTo, onClose, onConfirm }) {
  const hasRefs = inUseCount > 0;
  const otherTypes = types.filter(t => t.id !== target.id);

  return (
    <ConfirmDialog
      open={true}
      title={`Borrar tipo «${target.name}»`}
      confirmLabel="Borrar tipo"
      onClose={onClose}
      onConfirm={onConfirm}>
      {hasRefs ? (
        <div className="space-y-3.5">
          <div className="flex items-start gap-3 rounded-2xl px-3.5 py-3
                          bg-yellow-50 dark:bg-yellow-400/10
                          border border-yellow-200 dark:border-yellow-400/20">
            <span className="text-yellow-600 dark:text-yellow-300 mt-0.5">
              <IconAlWarn/>
            </span>
            <div className="text-[13px] text-yellow-800 dark:text-yellow-200 leading-relaxed">
              <strong className="font-medium">{inUseCount} {inUseCount === 1 ? 'ingrediente usa' : 'ingredientes usan'} este tipo.</strong>
              {' '}Puedes reasignarlos a otro tipo o dejarlos sin tipo (aparecerán
              como «—» en la tabla).
            </div>
          </div>

          <div>
            <FormLabel>Reasignar a</FormLabel>
            <div className="rounded-2xl bg-paper-soft dark:bg-night-soft px-2 py-1.5">
              <ul className="space-y-0.5 max-h-44 overflow-y-auto">
                <li>
                  <ReassignOption
                    selected={!reassignTo}
                    onClick={() => setReassignTo('')}
                    label="— Sin tipo —"
                    sub="Dejar los ingredientes sin etiqueta"/>
                </li>
                {otherTypes.map(t => (
                  <li key={t.id}>
                    <ReassignOption
                      selected={reassignTo === t.id}
                      onClick={() => setReassignTo(t.id)}
                      label={t.name}
                      swatch={getPalette(t.color).swatch}/>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-ink-soft dark:text-night-softText leading-relaxed">
          Ningún ingrediente usa este tipo. Se eliminará de la lista.
        </p>
      )}
    </ConfirmDialog>
  );
}

function ReassignOption({ selected, onClick, label, sub, swatch }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left
                  transition-colors
                  ${selected
                    ? 'bg-white dark:bg-night-card shadow-subtle'
                    : 'hover:bg-white/60 dark:hover:bg-night-card/60'}`}>
      {swatch
        ? <span className={`h-3.5 w-3.5 rounded-full ${swatch} shrink-0`}/>
        : <span className="h-3.5 w-3.5 rounded-full border border-dashed border-ink-mute/40 shrink-0"/>}
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] text-ink dark:text-night-text truncate">{label}</div>
        {sub && <div className="text-[11px] text-ink-mute dark:text-night-softText">{sub}</div>}
      </div>
      <span className={`h-4 w-4 rounded-full border-2 shrink-0
                        ${selected ? 'border-accent bg-accent' : 'border-black/[.15] dark:border-white/[.15]'}`}>
        {selected && (
          <span className="block h-full w-full rounded-full"
                style={{ boxShadow: 'inset 0 0 0 2px white' }}/>
        )}
      </span>
    </button>
  );
}


// ─── /alimentacion · Vista general ────────────────────────────────────────
// La implementación vive en alimentacion-general.jsx (window.VistaGeneralViewImpl).
function VistaGeneralView({ currentUserId }) {
  const Impl = window.VistaGeneralViewImpl;
  if (Impl) return <Impl currentUserId={currentUserId}/>;
  return (
    <div className="route-fade">
      <SectionPlaceholder
        icon={<IconAlMealCal/>}
        eyebrow="Vista general"
        title="Cargando planificador…"
        body="alimentacion-general.jsx no se cargó."
        height="h-48"/>
    </div>
  );
}

// ─── /alimentacion/recetas ────────────────────────────────────────────────
// La implementación vive en recetas.jsx (se inyecta en window.RecetasViewImpl).
function RecetasView({ ingredients, types, currentUserId }) {
  const Impl = window.RecetasViewImpl;
  if (Impl) return <Impl ingredients={ingredients} types={types} currentUserId={currentUserId}/>;
  return (
    <div className="route-fade">
      <SectionPlaceholder
        icon={<IconAlBook/>}
        eyebrow="Recetas"
        title="Cargando recetas…"
        body="recetas.jsx no se cargó."
        height="h-48"/>
    </div>
  );
}

// Placeholder consistente con WidgetPlaceholderGrid de pages.jsx, pero más
// expresivo: card grande con icono pastel, jerarquía textual y CTA fantasma.
function SectionPlaceholder({ icon, eyebrow, title, body, cta, height = 'h-64' }) {
  return (
    <div className={`relative ${height} rounded-3xl
                     bg-paper-soft/60 dark:bg-night-soft/60
                     border border-dashed border-black/[.08] dark:border-white/[.08]
                     hover:border-accent transition-colors
                     flex flex-col items-center justify-center text-center px-6 py-8 gap-3
                     group cursor-pointer`}>
      <div className="h-12 w-12 rounded-2xl bg-white dark:bg-night-card
                      border border-black/[.05] dark:border-white/[.06]
                      flex items-center justify-center
                      text-accent shadow-subtle">
        {icon}
      </div>
      <div className="max-w-md">
        <div className="text-[10.5px] font-medium uppercase tracking-[.1em]
                        text-ink-mute dark:text-night-softText">
          {eyebrow}
        </div>
        <h3 className="mt-1 text-[16px] sm:text-[17px] font-medium tracking-tight
                       text-ink dark:text-night-text">
          {title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed
                      text-ink-soft dark:text-night-softText">
          {body}
        </p>
      </div>
      {cta && (
        <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-full
                         text-[12.5px] font-medium
                         bg-white dark:bg-night-card
                         border border-black/[.06] dark:border-white/[.08]
                         text-ink-soft dark:text-night-softText
                         group-hover:text-accent group-hover:border-accent transition-colors">
          <IconAlPlus width="13" height="13"/> {cta}
        </span>
      )}
    </div>
  );
}

Object.assign(window, {
  AlimentacionPage,
  // helpers
  alCalcCalories: calcCalories,
  alFormatG: formatG,
  alFormatKcal: formatKcal,
  alGetPalette: getPalette,
  alTypePaletteIds: TYPE_PALETTE_IDS,
  // primitives
  AlBadge, AlPrimary, AlGhost, AlTabs, AlTabsList, AlTabsTrigger,
  AlDialog: Dialog,
  AlFormLabel: FormLabel,
  AlTextInput: TextInput,
  AlNumberInput: NumberInput,
  AlSearchInput: SearchInput,
  AlRowIcon: RowIcon,
  AlFilterChip: FilterChip,
  // icons
  IconAlSearch, IconAlPlus, IconAlEdit, IconAlTrash, IconAlClose,
  IconAlChevDown, IconAlChevUp, IconAlChevs, IconAlSort,
  IconAlFilter, IconAlBack, IconAlWarn, IconAlCalc,
  IconAlIngrd, IconAlTag, IconAlGrid, IconAlBook,
  IconAlMealCal, IconAlChartUp,
});
