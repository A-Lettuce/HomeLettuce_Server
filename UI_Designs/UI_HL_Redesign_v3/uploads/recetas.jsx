// Home Lettuce — Alimentación · Recetas
// ─────────────────────────────────────────────────────────────────────────────
// En el repo TS real:
//   · src/types/recipe.ts
//   · src/lib/recipe-macros.ts                  (totales, por porción)
//   · src/hooks/useRecipes.ts                   (TODO useQuery)
//   · src/hooks/useHouseUsers.ts                (TODO useQuery + currentUser)
//   · src/components/app/alimentacion/recetas/RecetasToolbar.tsx
//   · src/components/app/alimentacion/recetas/RecetaCard.tsx
//   · src/components/app/alimentacion/recetas/RecetaDetailDialog.tsx
//   · src/components/app/alimentacion/recetas/RecetaFormDialog.tsx
//   · src/components/app/alimentacion/recetas/IngredientPicker.tsx
//   · src/pages/AlimentacionRecetasPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

// Usuarios de la casa — sincronizados con HL_USERS del store.
function rcGetUsers() { return window.HL_USERS || []; }

// ─── Visibility helpers ────────────────────────────────────────────────────
const RC_VIS_FAMILIAR = { id: 'familiar', name: 'Familiar', color: 'sage'     };
const RC_VIS_PERSONAL = { id: 'personal', name: 'Personal', color: 'lavender' };
function rcVisBadgeType(vis) { return vis === 'personal' ? RC_VIS_PERSONAL : RC_VIS_FAMILIAR; }

// ─── src/lib/recipe-macros.ts ──────────────────────────────────────────────
function rcMacrosForItem(item, ingredient) {
  if (!ingredient || !item) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  const f = (Number(item.amount) || 0) / 100;
  return {
    calories: (ingredient.calories || 0) * f,
    protein:  (ingredient.protein  || 0) * f,
    fat:      (ingredient.fat      || 0) * f,
    carbs:    (ingredient.carbs    || 0) * f,
  };
}
function rcTotalsFor(items, ingredientById) {
  return items.reduce((acc, it) => {
    const m = rcMacrosForItem(it, ingredientById[it.ingredientId]);
    acc.calories += m.calories;
    acc.protein  += m.protein;
    acc.fat      += m.fat;
    acc.carbs    += m.carbs;
    return acc;
  }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
}

// Ingredientes cuya unidad natural es ml (líquidos). En el repo real esto
// vendría como `unit: 'g' | 'ml'` sobre Ingredient; aquí lo derivamos del
// priceUnit ('l' → ml). Si no se sabe, se asume g.
function rcUnitFor(ingredient) {
  if (!ingredient) return 'g';
  return ingredient.priceUnit === 'l' ? 'ml' : 'g';
}

// ─── src/hooks/useRecipes.ts ───────────────────────────────────────────────
// Las recetas referencian ingredientes por id de la Capa 1.
function rcBuildDefaultRecipes() {
  return [
    {
      id: 'r-1',
      name: 'Pollo con arroz',
      visibility: 'familiar',
      authorId: 'u-andreu',
      portions: 2,
      items: [
        { id: 'it-1', ingredientId: 'i-1', amount: 200 },
        { id: 'it-2', ingredientId: 'i-2', amount: 150 },
        { id: 'it-3', ingredientId: 'i-8', amount: 10  },
      ],
      steps: [
        'Cocinar el arroz en agua con sal por 18 minutos.',
        'Sellar el pollo en sartén con aceite de oliva.',
        'Cocinar el pollo a fuego medio 6 minutos por lado.',
        'Servir el pollo sobre el arroz.',
      ],
    },
    {
      id: 'r-2',
      name: 'Tortilla de espinaca',
      visibility: 'personal',
      authorId: 'u-andreu',
      portions: 1,
      items: [
        { id: 'it-4', ingredientId: 'i-5', amount: 150 },
        { id: 'it-5', ingredientId: 'i-3', amount: 100 },
        { id: 'it-6', ingredientId: 'i-8', amount: 8   },
      ],
      steps: [
        'Saltear la espinaca en sartén con aceite hasta reducir.',
        'Batir los huevos y mezclar con la espinaca.',
        'Cocinar a fuego bajo, tapado, durante 5 minutos.',
      ],
    },
    {
      id: 'r-3',
      name: 'Lentejas guisadas',
      visibility: 'familiar',
      authorId: 'u-mama',
      portions: 3,
      items: [
        { id: 'it-7', ingredientId: 'i-7', amount: 180 },
        { id: 'it-8', ingredientId: 'i-8', amount: 12  },
      ],
      steps: [
        'Remojar las lentejas durante 30 minutos.',
        'Cocinar en agua con sal a fuego medio por 25 minutos.',
        'Escurrir y condimentar con aceite de oliva.',
      ],
    },
  ];
}

// ─── Avatar inicial con paleta ────────────────────────────────────────────
function RcUserChip({ user, size = 'sm' }) {
  if (!user) return null;
  const c = window.alGetPalette(user.color);
  const d = size === 'lg' ? 'h-6 w-6 text-[11px]' : 'h-4 w-4 text-[9px]';
  const initial = user.name.charAt(0).toUpperCase();
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px]
                     text-ink-soft dark:text-night-softText">
      <span className={`${d} rounded-full ${c.swatch}
                        inline-flex items-center justify-center
                        text-[hsl(var(--accent-strong))] font-medium
                        ring-1 ring-black/[.04] dark:ring-white/[.06]`}>
        {initial}
      </span>
      <span className="truncate">{user.name}</span>
    </span>
  );
}

// ─── Recipe card ──────────────────────────────────────────────────────────
function RcRecipeCard({ recipe, ingredientById, userById, onOpen, onEdit, onDelete }) {
  const author  = userById[recipe.authorId];
  const visType = rcVisBadgeType(recipe.visibility);
  const totals  = rcTotalsFor(recipe.items, ingredientById);
  const count   = recipe.items.length;
  const preview = recipe.items
    .slice(0, 4)
    .map(it => ingredientById[it.ingredientId]?.name)
    .filter(Boolean);
  const more = Math.max(0, count - preview.length);

  return (
    <button onClick={onOpen} type="button"
      className="group text-left bg-white dark:bg-night-card rounded-3xl
                 p-5 sm:p-5
                 border border-black/[.045] dark:border-white/[.05] shadow-subtle
                 hover:border-accent hover:shadow-[0_4px_18px_-6px_rgba(20,28,24,.08)]
                 dark:hover:shadow-none
                 focus-visible:border-accent
                 transition-all flex flex-col gap-3.5">

      {/* Top: badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[18px] font-medium tracking-tight leading-snug
                       text-ink dark:text-night-text text-balance">
          {recipe.name}
        </h3>
        <window.AlBadge type={visType}/>
      </div>

      {/* Author + count */}
      <div className="flex items-center gap-3 text-[12px] text-ink-soft dark:text-night-softText -mt-1.5">
        <RcUserChip user={author}/>
        <span className="opacity-30">·</span>
        <span>{count} {count === 1 ? 'ingrediente' : 'ingredientes'}</span>
      </div>

      {/* Macros block */}
      <div className="grid grid-cols-4 rounded-2xl overflow-hidden
                      bg-paper-soft dark:bg-night-soft">
        <RcStatCell big value={window.alFormatKcal(totals.calories)} label="kcal" accent/>
        <RcStatCell value={window.alFormatG(totals.protein)} label="prot · g" sep/>
        <RcStatCell value={window.alFormatG(totals.fat)}     label="gras · g" sep/>
        <RcStatCell value={window.alFormatG(totals.carbs)}   label="carb · g" sep/>
      </div>

      {/* Ingredient preview */}
      {preview.length > 0 && (
        <p className="text-[12.5px] text-ink-soft dark:text-night-softText leading-snug line-clamp-2">
          <span className="text-ink-mute dark:text-night-softText/70">Con </span>
          {preview.join(' · ')}
          {more > 0 && <span className="text-ink-mute dark:text-night-softText/70"> · +{more}</span>}
        </p>
      )}

      {/* Footer: Ver detalle + actions */}
      <div className="flex items-center justify-between pt-2 mt-auto
                      border-t border-dashed border-black/[.06] dark:border-white/[.06]">
        <span className="text-[12px] text-ink-mute dark:text-night-softText
                         group-hover:text-accent transition-colors inline-flex items-center gap-1">
          Ver detalle <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
        <div className="flex items-center gap-0.5
                        opacity-60 group-hover:opacity-100 transition-opacity">
          <RcStopProp>
            <window.AlRowIcon label="Editar receta" onClick={onEdit}>
              <window.IconAlEdit/>
            </window.AlRowIcon>
          </RcStopProp>
          <RcStopProp>
            <window.AlRowIcon label="Borrar receta" tone="danger" onClick={onDelete}>
              <window.IconAlTrash/>
            </window.AlRowIcon>
          </RcStopProp>
        </div>
      </div>
    </button>
  );
}

// Helper para que los iconos del footer no disparen el click de la card
function RcStopProp({ children }) {
  return (
    <span onClick={(e) => e.stopPropagation()}>{children}</span>
  );
}

function RcStatCell({ value, label, big, accent, sep }) {
  return (
    <div className={`px-2 py-2.5 text-center
                     ${sep ? 'border-l border-black/[.05] dark:border-white/[.06]' : ''}`}>
      <div className={`tabular-nums leading-none
                       ${big ? 'text-[18px]' : 'text-[14.5px]'}
                       ${accent ? 'text-[hsl(var(--accent-strong))] font-medium'
                                 : 'text-ink dark:text-night-text font-medium'}`}>
        {value}
      </div>
      <div className="mt-1 text-[9.5px] uppercase tracking-[.08em]
                      text-ink-mute dark:text-night-softText">
        {label}
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────
function RcEmpty({ hasFilter, scope, onCreate }) {
  return (
    <div className="bg-white dark:bg-night-card rounded-3xl
                    border border-black/[.04] dark:border-white/[.05] shadow-subtle
                    p-10 sm:p-14 flex flex-col items-center text-center">
      <div className="h-16 w-16 rounded-3xl bg-accent-tint flex items-center justify-center
                      text-accent mb-4">
        <span style={{ transform: 'scale(1.6)' }}><window.IconAlBook/></span>
      </div>
      <h3 className="text-[15px] font-medium text-ink dark:text-night-text">
        {hasFilter
          ? 'Sin resultados'
          : scope === 'mine'      ? 'Aún no has creado recetas'
          : scope === 'familiar'  ? 'Aún no hay recetas familiares'
          :                          'Aún no hay recetas'}
      </h3>
      <p className="mt-1.5 text-[13px] text-ink-soft dark:text-night-softText max-w-xs">
        {hasFilter
          ? 'Prueba con otro término o limpia el filtro.'
          : 'Crea tu primera receta para empezar a planificar comidas y ver sus macros.'}
      </p>
      {!hasFilter && (
        <div className="mt-5">
          <window.AlPrimary icon={<window.IconAlPlus/>} onClick={onCreate}>
            Nueva receta
          </window.AlPrimary>
        </div>
      )}
    </div>
  );
}


// ─── RecetaDetailDialog ────────────────────────────────────────────────────
function RcDetailDialog({ recipe, ingredientById, typeById, userById, onClose, onEdit, onDelete }) {
  if (!recipe) return null;
  const author  = userById[recipe.authorId];
  const visType = rcVisBadgeType(recipe.visibility);
  const totals  = rcTotalsFor(recipe.items, ingredientById);
  const portions = recipe.portions || 1;
  const perPortion = {
    calories: totals.calories / portions,
    protein:  totals.protein  / portions,
    fat:      totals.fat      / portions,
    carbs:    totals.carbs    / portions,
  };

  return (
    <window.AlDialog
      open={true}
      onClose={onClose}
      maxW="sm:max-w-3xl"
      title={recipe.name}
      subtitle={null}
      footer={
        <React.Fragment>
          <window.AlGhost tone="danger" icon={<window.IconAlTrash/>} onClick={onDelete}>
            Borrar
          </window.AlGhost>
          <div className="flex-1"/>
          <window.AlGhost onClick={onClose}>Cerrar</window.AlGhost>
          <window.AlPrimary icon={<window.IconAlEdit/>} onClick={onEdit}>
            Editar receta
          </window.AlPrimary>
        </React.Fragment>
      }>

      {/* Meta row */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-2 -mt-1 mb-5">
        <window.AlBadge type={visType}/>
        <RcUserChip user={author} size="lg"/>
        <span className="text-[12px] text-ink-mute dark:text-night-softText">
          {portions} {portions === 1 ? 'porción' : 'porciones'}
          {' · '}
          {recipe.items.length} {recipe.items.length === 1 ? 'ingrediente' : 'ingredientes'}
        </span>
      </div>

      {/* Macros summary big */}
      <div className="rounded-2xl bg-accent-tint border border-accent/30 px-4 py-3.5 mb-6">
        <div className="text-[10.5px] font-medium uppercase tracking-[.08em]
                        text-[hsl(var(--accent-strong))]/80 mb-2">
          Totales de la receta
        </div>
        <div className="grid grid-cols-4 gap-3">
          <RcBigStat label="Calorías" value={window.alFormatKcal(totals.calories)} suffix="kcal" hint={`${window.alFormatKcal(perPortion.calories)} kcal/porción`}/>
          <RcBigStat label="Proteínas" value={window.alFormatG(totals.protein)} suffix="g" hint={`${window.alFormatG(perPortion.protein)} g/porción`}/>
          <RcBigStat label="Grasas" value={window.alFormatG(totals.fat)} suffix="g" hint={`${window.alFormatG(perPortion.fat)} g/porción`}/>
          <RcBigStat label="Carbohid." value={window.alFormatG(totals.carbs)} suffix="g" hint={`${window.alFormatG(perPortion.carbs)} g/porción`}/>
        </div>
      </div>

      {/* Ingredients table */}
      <section className="mb-6">
        <header className="mb-2.5 flex items-baseline justify-between">
          <h3 className="text-[15px] font-medium text-ink dark:text-night-text">
            Ingredientes
          </h3>
          <span className="text-[11px] text-ink-mute dark:text-night-softText">
            Cantidad real · macros calculados
          </span>
        </header>

        <div className="rounded-2xl border border-black/[.04] dark:border-white/[.05]
                        overflow-hidden">
          {/* Desktop */}
          <div className="hidden md:block">
            <div className="grid gap-3 px-4 py-2.5
                            text-[10.5px] font-medium uppercase tracking-[.08em]
                            text-ink-mute dark:text-night-softText
                            bg-paper-soft/60 dark:bg-night-soft/60"
                 style={{ gridTemplateColumns: 'minmax(160px,1.6fr) 120px 90px 90px 80px 90px' }}>
              <div>Nombre</div>
              <div>Tipo</div>
              <div className="text-right">Cantidad</div>
              <div className="text-right">kcal</div>
              <div className="text-right">P · G · C</div>
              <div className="text-right">por porción</div>
            </div>
            <ul>
              {recipe.items.map((it, idx) => {
                const ing = ingredientById[it.ingredientId];
                const m = rcMacrosForItem(it, ing);
                const t = ing ? typeById[ing.typeId] : null;
                const unit = rcUnitFor(ing);
                return (
                  <li key={it.id}
                      className={`grid gap-3 px-4 py-3 items-center
                                  ${idx === 0 ? '' : 'border-t border-black/[.04] dark:border-white/[.05]'}`}
                      style={{ gridTemplateColumns: 'minmax(160px,1.6fr) 120px 90px 90px 80px 90px' }}>
                    <div className="text-[13.5px] text-ink dark:text-night-text font-medium truncate">
                      {ing?.name || <span className="text-ink-mute italic">Ingrediente eliminado</span>}
                    </div>
                    <div>{t ? <window.AlBadge type={t}/> : <span className="text-[12px] text-ink-mute">—</span>}</div>
                    <div className="text-right text-[13.5px] tabular-nums text-ink dark:text-night-text">
                      {it.amount}<span className="text-ink-mute dark:text-night-softText"> {unit}</span>
                    </div>
                    <div className="text-right text-[13.5px] tabular-nums text-ink dark:text-night-text font-medium">
                      {window.alFormatKcal(m.calories)}
                    </div>
                    <div className="text-right text-[12.5px] tabular-nums text-ink-soft dark:text-night-softText whitespace-nowrap">
                      {window.alFormatG(m.protein)} · {window.alFormatG(m.fat)} · {window.alFormatG(m.carbs)}
                    </div>
                    <div className="text-right text-[11.5px] tabular-nums text-ink-mute dark:text-night-softText">
                      {window.alFormatKcal(m.calories / portions)} kcal
                    </div>
                  </li>
                );
              })}
            </ul>
            {/* Totals row */}
            <div className="grid gap-3 px-4 py-3 items-center
                            bg-accent-tint border-t border-accent/30"
                 style={{ gridTemplateColumns: 'minmax(160px,1.6fr) 120px 90px 90px 80px 90px' }}>
              <div className="text-[13.5px] font-medium text-[hsl(var(--accent-strong))]">Totales</div>
              <div className="text-[11.5px] text-[hsl(var(--accent-strong))]/70">
                {recipe.items.length} {recipe.items.length === 1 ? 'item' : 'items'}
              </div>
              <div></div>
              <div className="text-right text-[14px] tabular-nums font-medium text-[hsl(var(--accent-strong))]">
                {window.alFormatKcal(totals.calories)}
              </div>
              <div className="text-right text-[12.5px] tabular-nums font-medium text-[hsl(var(--accent-strong))] whitespace-nowrap">
                {window.alFormatG(totals.protein)} · {window.alFormatG(totals.fat)} · {window.alFormatG(totals.carbs)}
              </div>
              <div className="text-right text-[12px] tabular-nums text-[hsl(var(--accent-strong))]/80">
                {window.alFormatKcal(perPortion.calories)} kcal
              </div>
            </div>
          </div>

          {/* Mobile */}
          <ul className="md:hidden divide-y divide-black/[.04] dark:divide-white/[.05]">
            {recipe.items.map((it) => {
              const ing = ingredientById[it.ingredientId];
              const m = rcMacrosForItem(it, ing);
              const t = ing ? typeById[ing.typeId] : null;
              const unit = rcUnitFor(ing);
              return (
                <li key={it.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-medium text-ink dark:text-night-text">
                      {ing?.name || 'Ingrediente eliminado'}
                    </span>
                    {t && <window.AlBadge type={t}/>}
                    <span className="ml-auto text-[12.5px] tabular-nums text-ink-soft dark:text-night-softText">
                      {it.amount} {unit}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-[11.5px] tabular-nums">
                    <RcMobileStat label="kcal" value={window.alFormatKcal(m.calories)} strong/>
                    <RcMobileStat label="P" value={window.alFormatG(m.protein) + 'g'}/>
                    <RcMobileStat label="G" value={window.alFormatG(m.fat) + 'g'}/>
                    <RcMobileStat label="C" value={window.alFormatG(m.carbs) + 'g'}/>
                  </div>
                </li>
              );
            })}
            <li className="px-4 py-3 bg-accent-tint">
              <div className="text-[10.5px] font-medium uppercase tracking-[.08em] text-[hsl(var(--accent-strong))]/80 mb-1.5">
                Totales
              </div>
              <div className="grid grid-cols-4 gap-2 text-[12px] tabular-nums">
                <RcMobileStat label="kcal" value={window.alFormatKcal(totals.calories)} strong accent/>
                <RcMobileStat label="P" value={window.alFormatG(totals.protein) + 'g'} accent/>
                <RcMobileStat label="G" value={window.alFormatG(totals.fat) + 'g'} accent/>
                <RcMobileStat label="C" value={window.alFormatG(totals.carbs) + 'g'} accent/>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Instructions */}
      <section>
        <h3 className="text-[15px] font-medium text-ink dark:text-night-text mb-2.5">
          Instrucciones
        </h3>
        {recipe.steps.length === 0 ? (
          <p className="text-[13px] text-ink-mute dark:text-night-softText italic">
            Esta receta no tiene pasos.
          </p>
        ) : (
          <ol className="space-y-2">
            {recipe.steps.map((s, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="h-7 w-7 rounded-full bg-paper-soft dark:bg-night-soft
                                 flex items-center justify-center shrink-0
                                 text-[12px] tabular-nums font-medium
                                 text-ink-soft dark:text-night-softText">
                  {i + 1}
                </span>
                <p className="text-[14px] leading-relaxed text-ink dark:text-night-text pt-0.5">
                  {s}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </window.AlDialog>
  );
}

function RcBigStat({ label, value, suffix, hint }) {
  return (
    <div>
      <div className="text-[10.5px] font-medium uppercase tracking-[.06em]
                      text-[hsl(var(--accent-strong))]/70">
        {label}
      </div>
      <div className="mt-1 leading-none">
        <span className="text-[24px] font-medium tabular-nums text-[hsl(var(--accent-strong))]">
          {value}
        </span>
        <span className="ml-1 text-[12px] text-[hsl(var(--accent-strong))]/80">{suffix}</span>
      </div>
      <div className="mt-1 text-[10.5px] text-[hsl(var(--accent-strong))]/70 tabular-nums">
        {hint}
      </div>
    </div>
  );
}
function RcMobileStat({ label, value, strong, accent }) {
  return (
    <div className="text-center">
      <div className={`text-[10px] uppercase tracking-[.06em]
                       ${accent ? 'text-[hsl(var(--accent-strong))]/70' : 'text-ink-mute dark:text-night-softText'}`}>
        {label}
      </div>
      <div className={`mt-0.5
                       ${accent ? 'text-[hsl(var(--accent-strong))] font-medium'
                               : strong ? 'text-ink dark:text-night-text font-medium'
                                        : 'text-ink-soft dark:text-night-softText'}`}>
        {value}
      </div>
    </div>
  );
}


// ─── IngredientPicker (popover combobox) ──────────────────────────────────
function RcIngredientPicker({ ingredients, typeById, exclude, onPick }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ingredients.filter(i => {
      if (exclude.has(i.id)) return false;
      if (!needle) return true;
      const t = typeById[i.typeId];
      return i.name.toLowerCase().includes(needle)
          || (t && t.name.toLowerCase().includes(needle));
    });
  }, [ingredients, q, exclude, typeById]);

  return (
    <div className="relative" ref={ref}>
      <button type="button"
        onClick={() => { setOpen(o => !o); setQ(''); }}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full
                   text-[13.5px] font-medium
                   border border-dashed border-black/[.15] dark:border-white/[.15]
                   text-ink-soft dark:text-night-softText
                   hover:border-accent hover:text-accent transition-colors">
        <window.IconAlPlus/> Agregar ingrediente
      </button>

      {open && (
        <div className="absolute z-30 top-full mt-2 left-0 w-[320px]
                        bg-white dark:bg-night-card rounded-2xl
                        border border-black/[.06] dark:border-white/[.08]
                        shadow-[0_12px_32px_-12px_rgba(20,28,24,.18)] dark:shadow-none
                        overflow-hidden">
          <div className="p-2.5 border-b border-black/[.04] dark:border-white/[.05]">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2
                            bg-paper-soft dark:bg-night-soft">
              <span className="text-ink-mute dark:text-night-softText shrink-0"><window.IconAlSearch/></span>
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar ingrediente…"
                className="w-full bg-transparent outline-none text-[13.5px]
                           placeholder:text-ink-mute dark:placeholder:text-night-softText"/>
            </div>
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-[12.5px] text-ink-mute dark:text-night-softText">
                {ingredients.length - exclude.size === 0
                  ? 'Ya añadiste todos los ingredientes disponibles.'
                  : 'Sin resultados.'}
              </li>
            ) : filtered.map(i => {
              const t = typeById[i.typeId];
              const c = window.alGetPalette(t?.color);
              return (
                <li key={i.id}>
                  <button type="button"
                    onClick={() => { onPick(i); setOpen(false); }}
                    className="w-full text-left px-3 py-2 flex items-center gap-3
                               hover:bg-paper-soft dark:hover:bg-night-soft rounded-lg transition-colors">
                    <span className={`h-2.5 w-2.5 rounded-full ${c.swatch} shrink-0`}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] text-ink dark:text-night-text truncate">{i.name}</div>
                      <div className="text-[11px] text-ink-mute dark:text-night-softText">
                        {t?.name || 'Sin tipo'} · {window.alFormatKcal(i.calories)} kcal/100{rcUnitFor(i)}
                      </div>
                    </div>
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


// ─── RecetaFormDialog (crear / editar) ────────────────────────────────────
function RcFormDialog({ open, editing, ingredients, typeById, currentUserId, onClose, onSubmit }) {
  const ingredientById = React.useMemo(
    () => Object.fromEntries(ingredients.map(i => [i.id, i])),
    [ingredients]
  );

  const empty = {
    name: '',
    visibility: 'familiar',
    portions: 2,
    items: [],
    steps: [''],
  };

  const [form, setForm] = React.useState(empty);

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name,
        visibility: editing.visibility,
        portions: editing.portions || 1,
        items: editing.items.map(it => ({ ...it })),
        steps: editing.steps.length ? [...editing.steps] : [''],
      });
    } else {
      setForm(empty);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  if (!open) return null;

  const totals = rcTotalsFor(form.items, ingredientById);
  const excludeIds = new Set(form.items.map(it => it.ingredientId));
  const canSubmit = form.name.trim().length > 0 && form.items.length > 0;

  const addItem = (ingredient) => {
    setForm(f => ({
      ...f,
      items: [...f.items, {
        id: 'it-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,5),
        ingredientId: ingredient.id,
        amount: 100,
      }],
    }));
  };
  const updateAmount = (id, amount) => {
    setForm(f => ({
      ...f,
      items: f.items.map(it => it.id === id ? { ...it, amount } : it),
    }));
  };
  const removeItem = (id) => {
    setForm(f => ({ ...f, items: f.items.filter(it => it.id !== id) }));
  };

  const updateStep = (idx, value) => {
    setForm(f => ({ ...f, steps: f.steps.map((s, i) => i === idx ? value : s) }));
  };
  const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, ''] }));
  const removeStep = (idx) => {
    setForm(f => {
      const next = f.steps.filter((_, i) => i !== idx);
      return { ...f, steps: next.length ? next : [''] };
    });
  };
  const moveStep = (idx, dir) => {
    setForm(f => {
      const next = [...f.steps];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return f;
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...f, steps: next };
    });
  };

  const submit = () => {
    if (!canSubmit) return;
    const cleanSteps = form.steps.map(s => s.trim()).filter(Boolean);
    onSubmit({
      name: form.name.trim(),
      visibility: form.visibility,
      portions: Number(form.portions) || 1,
      authorId: editing ? editing.authorId : currentUserId,
      items: form.items.map(it => ({ ...it, amount: Number(it.amount) || 0 })),
      steps: cleanSteps,
    });
  };

  return (
    <window.AlDialog
      open={true}
      onClose={onClose}
      maxW="sm:max-w-3xl"
      title={editing ? 'Editar receta' : 'Nueva receta'}
      subtitle="Los macros se calculan en tiempo real desde los ingredientes."
      footer={
        <React.Fragment>
          <window.AlGhost onClick={onClose}>Cancelar</window.AlGhost>
          <window.AlPrimary onClick={submit} disabled={!canSubmit}>
            {editing ? 'Guardar cambios' : 'Crear receta'}
          </window.AlPrimary>
        </React.Fragment>
      }>

      <div className="space-y-7">

        {/* ── SECCIÓN A · Información general ── */}
        <section>
          <RcSectionHeader letter="A" title="Información general"/>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_120px] gap-3">
            <div>
              <window.AlFormLabel htmlFor="rc-name">Nombre</window.AlFormLabel>
              <window.AlTextInput id="rc-name" autoFocus
                value={form.name}
                onChange={(v) => setForm(f => ({ ...f, name: v }))}
                placeholder="Ej. Pollo al limón"/>
            </div>
            <div>
              <window.AlFormLabel>Visibilidad</window.AlFormLabel>
              <RcVisibilityToggle
                value={form.visibility}
                onChange={(v) => setForm(f => ({ ...f, visibility: v }))}/>
            </div>
            <div>
              <window.AlFormLabel>Porciones</window.AlFormLabel>
              <window.AlNumberInput
                value={form.portions}
                onChange={(v) => setForm(f => ({ ...f, portions: v }))}
                step="1" min="1" suffix="pers."/>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN B · Ingredientes ── */}
        <section>
          <RcSectionHeader letter="B" title="Ingredientes"
            right={
              <span className="text-[11px] text-ink-mute dark:text-night-softText">
                {form.items.length} {form.items.length === 1 ? 'añadido' : 'añadidos'}
              </span>
            }/>

          {/* Empty state for items */}
          {form.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/[.1] dark:border-white/[.1]
                            p-6 text-center bg-paper-soft/30 dark:bg-night-soft/30">
              <p className="text-[13px] text-ink-soft dark:text-night-softText mb-4">
                Empieza añadiendo ingredientes desde el catálogo de la casa.
              </p>
              <div className="inline-block">
                <RcIngredientPicker
                  ingredients={ingredients}
                  typeById={typeById}
                  exclude={excludeIds}
                  onPick={addItem}/>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-black/[.05] dark:border-white/[.05]
                            overflow-hidden bg-white dark:bg-night-card">
              <RcItemsTable
                items={form.items}
                ingredientById={ingredientById}
                typeById={typeById}
                totals={totals}
                onAmount={updateAmount}
                onRemove={removeItem}/>
              <div className="px-4 py-3 border-t border-black/[.04] dark:border-white/[.05]
                              flex items-center justify-between gap-3 flex-wrap">
                <RcIngredientPicker
                  ingredients={ingredients}
                  typeById={typeById}
                  exclude={excludeIds}
                  onPick={addItem}/>
                <div className="text-[11.5px] text-ink-mute dark:text-night-softText">
                  Valores por 100 g/ml en la Capa 1 · cantidades reales aquí
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── SECCIÓN C · Instrucciones ── */}
        <section>
          <RcSectionHeader letter="C" title="Instrucciones"
            right={
              <span className="text-[11px] text-ink-mute dark:text-night-softText">
                Pasos en orden
              </span>
            }/>
          <ol className="space-y-2">
            {form.steps.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 group">
                <button type="button"
                  className="mt-3 shrink-0 h-7 w-5 rounded-md
                             text-ink-mute dark:text-night-softText
                             hover:text-ink dark:hover:text-night-text
                             cursor-grab active:cursor-grabbing transition-colors
                             flex flex-col items-center justify-center gap-0.5"
                  title="Arrastra para reordenar (usa las flechas)">
                  <span className="block h-[3px] w-[3px] rounded-full bg-current"/>
                  <span className="block h-[3px] w-[3px] rounded-full bg-current"/>
                  <span className="block h-[3px] w-[3px] rounded-full bg-current"/>
                </button>
                <span className="mt-2.5 h-7 w-7 rounded-full bg-paper-soft dark:bg-night-soft
                                 flex items-center justify-center shrink-0
                                 text-[12px] tabular-nums font-medium
                                 text-ink-soft dark:text-night-softText">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <RcStepInput
                    value={s}
                    onChange={(v) => updateStep(idx, v)}
                    placeholder={`Paso ${idx + 1}…`}/>
                </div>
                <div className="flex items-center gap-0.5 mt-1.5
                                opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <window.AlRowIcon label="Subir" onClick={() => moveStep(idx, -1)}>
                    <window.IconAlChevUp/>
                  </window.AlRowIcon>
                  <window.AlRowIcon label="Bajar" onClick={() => moveStep(idx, +1)}>
                    <window.IconAlChevDown/>
                  </window.AlRowIcon>
                  <window.AlRowIcon label="Eliminar paso" tone="danger" onClick={() => removeStep(idx)}>
                    <window.IconAlTrash/>
                  </window.AlRowIcon>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-3">
            <button type="button" onClick={addStep}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full
                         text-[12.5px] font-medium
                         border border-dashed border-black/[.15] dark:border-white/[.15]
                         text-ink-soft dark:text-night-softText
                         hover:border-accent hover:text-accent transition-colors">
              <window.IconAlPlus/> Agregar paso
            </button>
          </div>
        </section>
      </div>
    </window.AlDialog>
  );
}

function RcSectionHeader({ letter, title, right }) {
  return (
    <div className="flex items-baseline justify-between mb-3 gap-3">
      <div className="flex items-baseline gap-2.5">
        <span className="text-[10px] font-medium uppercase tracking-[.12em]
                         text-[hsl(var(--accent-strong))]/80
                         bg-accent-tint rounded-full px-2 py-0.5">
          {letter}
        </span>
        <h3 className="text-[15.5px] font-medium text-ink dark:text-night-text">
          {title}
        </h3>
      </div>
      {right}
    </div>
  );
}

function RcVisibilityToggle({ value, onChange }) {
  const opts = [
    { id: 'familiar', label: 'Familiar' },
    { id: 'personal', label: 'Personal' },
  ];
  return (
    <div className="inline-flex p-1 rounded-2xl bg-paper-soft dark:bg-night-soft">
      {opts.map(o => {
        const sel = value === o.id;
        const palette = o.id === 'familiar' ? 'sage' : 'lavender';
        const c = window.alGetPalette(palette);
        return (
          <button key={o.id} type="button"
            onClick={() => onChange(o.id)}
            className={`px-3.5 py-2 rounded-xl text-[12.5px] inline-flex items-center gap-1.5 transition-colors
                        ${sel
                          ? 'bg-white dark:bg-night-card text-ink dark:text-night-text font-medium shadow-subtle'
                          : 'text-ink-soft dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
            <span className={`h-2 w-2 rounded-full ${c.swatch}`}/>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function RcStepInput({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      onInput={(e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 240) + 'px';
      }}
      className="w-full resize-none rounded-2xl px-4 py-3
                 bg-paper-soft dark:bg-night-soft
                 border border-transparent focus:border-accent
                 focus:bg-white dark:focus:bg-night
                 transition-colors outline-none text-[14px] leading-relaxed
                 placeholder:text-ink-mute dark:placeholder:text-night-softText"/>
  );
}


// ─── Items table inside the form ──────────────────────────────────────────
function RcItemsTable({ items, ingredientById, typeById, totals, onAmount, onRemove }) {
  const GRID = 'minmax(140px,1.4fr) 110px 90px 70px 70px 80px 44px';
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[680px]">
        {/* Header */}
        <div className="grid gap-3 px-4 py-2.5
                        text-[10.5px] font-medium uppercase tracking-[.08em]
                        text-ink-mute dark:text-night-softText
                        bg-paper-soft/60 dark:bg-night-soft/60
                        border-b border-black/[.04] dark:border-white/[.05]"
             style={{ gridTemplateColumns: GRID }}>
          <div>Nombre</div>
          <div>Cantidad</div>
          <div className="text-right">kcal</div>
          <div className="text-right">Prot</div>
          <div className="text-right">Gras</div>
          <div className="text-right">Carb</div>
          <div></div>
        </div>

        <ul>
          {items.map((it, idx) => {
            const ing = ingredientById[it.ingredientId];
            const m = rcMacrosForItem(it, ing);
            const t = ing ? typeById[ing.typeId] : null;
            const unit = rcUnitFor(ing);
            return (
              <li key={it.id}
                  className={`grid gap-3 px-4 py-2.5 items-center
                              ${idx === 0 ? '' : 'border-t border-black/[.04] dark:border-white/[.05]'}`}
                  style={{ gridTemplateColumns: GRID }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] text-ink dark:text-night-text font-medium truncate">
                      {ing?.name || '—'}
                    </span>
                    {t && <window.AlBadge type={t}/>}
                  </div>
                </div>
                <div>
                  <RcAmountInput
                    value={it.amount}
                    unit={unit}
                    onChange={(v) => onAmount(it.id, v)}/>
                </div>
                <div className="text-right text-[13px] tabular-nums text-ink dark:text-night-text font-medium">
                  {window.alFormatKcal(m.calories)}
                </div>
                <div className="text-right text-[12.5px] tabular-nums text-ink-soft dark:text-night-softText">
                  {window.alFormatG(m.protein)}
                </div>
                <div className="text-right text-[12.5px] tabular-nums text-ink-soft dark:text-night-softText">
                  {window.alFormatG(m.fat)}
                </div>
                <div className="text-right text-[12.5px] tabular-nums text-ink-soft dark:text-night-softText">
                  {window.alFormatG(m.carbs)}
                </div>
                <div className="flex justify-end">
                  <window.AlRowIcon label="Quitar" tone="danger" onClick={() => onRemove(it.id)}>
                    <window.IconAlTrash/>
                  </window.AlRowIcon>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Totals */}
        <div className="grid gap-3 px-4 py-3 items-center
                        bg-accent-tint border-t border-accent/30"
             style={{ gridTemplateColumns: GRID }}>
          <div className="text-[13px] font-medium text-[hsl(var(--accent-strong))]">Totales</div>
          <div className="text-[11px] text-[hsl(var(--accent-strong))]/70">
            {items.length} {items.length === 1 ? 'ingrediente' : 'ingredientes'}
          </div>
          <div className="text-right text-[14px] tabular-nums font-medium text-[hsl(var(--accent-strong))]">
            {window.alFormatKcal(totals.calories)}
          </div>
          <div className="text-right text-[13px] tabular-nums font-medium text-[hsl(var(--accent-strong))]">
            {window.alFormatG(totals.protein)}
          </div>
          <div className="text-right text-[13px] tabular-nums font-medium text-[hsl(var(--accent-strong))]">
            {window.alFormatG(totals.fat)}
          </div>
          <div className="text-right text-[13px] tabular-nums font-medium text-[hsl(var(--accent-strong))]">
            {window.alFormatG(totals.carbs)}
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
}

function RcAmountInput({ value, unit, onChange }) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5
                    bg-paper-soft dark:bg-night-soft
                    border border-transparent focus-within:border-accent
                    focus-within:bg-white dark:focus-within:bg-night
                    transition-colors">
      <input
        type="number" inputMode="decimal"
        value={value === '' || value == null ? '' : value}
        step="1" min="0"
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className="w-full bg-transparent outline-none text-[13.5px] tabular-nums text-right
                   placeholder:text-ink-mute dark:placeholder:text-night-softText"/>
      <span className="text-[11px] text-ink-mute dark:text-night-softText shrink-0">{unit}</span>
    </div>
  );
}


// ─── Confirm delete (recipe) ──────────────────────────────────────────────
function RcConfirmDelete({ recipe, onClose, onConfirm }) {
  if (!recipe) return null;
  return (
    <window.AlDialog
      open={true}
      onClose={onClose}
      maxW="sm:max-w-sm"
      title={`Borrar «${recipe.name}»`}
      footer={
        <React.Fragment>
          <window.AlGhost onClick={onClose}>Cancelar</window.AlGhost>
          <button onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full
                       bg-red-500 text-white font-medium text-[13.5px]
                       hover:bg-red-600 active:bg-red-700 transition-colors">
            Borrar receta
          </button>
        </React.Fragment>
      }>
      <p className="text-[14px] text-ink-soft dark:text-night-softText leading-relaxed">
        Esta acción no se puede deshacer.
        {recipe.visibility === 'familiar'
          ? ' La receta dejará de estar disponible para todos los usuarios de la casa.'
          : ' La receta solo estaba en tu colección personal.'}
      </p>
    </window.AlDialog>
  );
}


// ─── RecetasViewImpl (export) ─────────────────────────────────────────────
function RecetasViewImpl({ ingredients, types, currentUserId }) {
  const currentUserIdSafe = currentUserId || 'u-andreu';
  const [recipes, setRecipes] = React.useState(rcBuildDefaultRecipes);

  // UI state
  const [search, setSearch] = React.useState('');
  const [scope, setScope]   = React.useState('all'); // 'all' | 'familiar' | 'mine'

  // Dialogs
  const [detailOpen, setDetailOpen] = React.useState(null);   // recipeId | null
  const [formDialog, setFormDialog] = React.useState({ open: false, editing: null });
  const [confirmDel, setConfirmDel] = React.useState(null);   // recipe | null

  // Indexes
  const ingredientById = React.useMemo(
    () => Object.fromEntries(ingredients.map(i => [i.id, i])),
    [ingredients]
  );
  const typeById = React.useMemo(
    () => Object.fromEntries(types.map(t => [t.id, t])),
    [types]
  );
  const userById = React.useMemo(
    () => Object.fromEntries(rcGetUsers().map(u => [u.id, u])),
    []
  );

  // Filter logic — Personal solo visible para su autor (lógica real de Capa 2)
  const visibleRecipes = React.useMemo(
    () => recipes.filter(r => r.visibility === 'familiar' || r.authorId === currentUserIdSafe),
    [recipes]
  );

  const filtered = React.useMemo(() => {
    let r = visibleRecipes;
    if (scope === 'familiar') r = r.filter(x => x.visibility === 'familiar');
    if (scope === 'mine')     r = r.filter(x => x.authorId === currentUserIdSafe);
    const needle = search.trim().toLowerCase();
    if (needle) {
      r = r.filter(x => {
        if (x.name.toLowerCase().includes(needle)) return true;
        return x.items.some(it => {
          const ing = ingredientById[it.ingredientId];
          return ing && ing.name.toLowerCase().includes(needle);
        });
      });
    }
    return r;
  }, [visibleRecipes, scope, search, ingredientById]);

  // Counts for chips
  const counts = React.useMemo(() => ({
    all:      visibleRecipes.length,
    familiar: visibleRecipes.filter(r => r.visibility === 'familiar').length,
    mine:     visibleRecipes.filter(r => r.authorId === currentUserIdSafe).length,
  }), [visibleRecipes]);

  // Ops
  const upsertRecipe = (data) => {
    if (formDialog.editing) {
      const id = formDialog.editing.id;
      setRecipes(list => list.map(r => r.id === id ? { ...r, ...data } : r));
    } else {
      const id = 'r-' + Date.now().toString(36);
      setRecipes(list => [{ id, ...data }, ...list]);
    }
    setFormDialog({ open: false, editing: null });
  };
  const deleteRecipe = (recipe) => {
    setRecipes(list => list.filter(r => r.id !== recipe.id));
    setConfirmDel(null);
    if (detailOpen === recipe.id) setDetailOpen(null);
  };

  const currentDetail = detailOpen ? recipes.find(r => r.id === detailOpen) : null;
  const me = userById[currentUserIdSafe];

  return (
    <div className="route-fade space-y-5">

      {/* Toolbar */}
      <div className="flex items-stretch gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <window.AlSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre o ingrediente…"/>
        </div>
        <window.AlPrimary
          icon={<window.IconAlPlus/>}
          onClick={() => setFormDialog({ open: true, editing: null })}>
          Nueva receta
        </window.AlPrimary>
      </div>

      {/* Scope chips */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <RcScopeChip selected={scope === 'all'}      onClick={() => setScope('all')}      icon={<window.IconAlFilter/>}>
            Todas <span className="opacity-60 tabular-nums">{counts.all}</span>
          </RcScopeChip>
          <RcScopeChip selected={scope === 'familiar'} onClick={() => setScope('familiar')} swatchPalette="sage">
            Familiares <span className="opacity-60 tabular-nums">{counts.familiar}</span>
          </RcScopeChip>
          <RcScopeChip selected={scope === 'mine'}     onClick={() => setScope('mine')}     swatchPalette="lavender">
            Mis recetas <span className="opacity-60 tabular-nums">{counts.mine}</span>
          </RcScopeChip>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[12px] text-ink-mute dark:text-night-softText">
          Sesión:
          <RcUserChip user={me} size="lg"/>
        </div>
      </div>

      {/* Grid / Empty */}
      {filtered.length === 0 ? (
        <RcEmpty
          hasFilter={!!search || scope !== 'all'}
          scope={scope}
          onCreate={() => setFormDialog({ open: true, editing: null })}/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filtered.map(r => (
            <RcRecipeCard
              key={r.id}
              recipe={r}
              ingredientById={ingredientById}
              userById={userById}
              onOpen={() => setDetailOpen(r.id)}
              onEdit={() => setFormDialog({ open: true, editing: r })}
              onDelete={() => setConfirmDel(r)}/>
          ))}
        </div>
      )}

      {/* Footnote count */}
      {filtered.length > 0 && (
        <div className="text-[11.5px] text-ink-mute dark:text-night-softText text-center pt-1">
          {filtered.length} {filtered.length === 1 ? 'receta' : 'recetas'}
          {filtered.length !== visibleRecipes.length && (
            <span> · de {visibleRecipes.length} disponibles</span>
          )}
        </div>
      )}

      {/* Detail dialog */}
      {currentDetail && (
        <RcDetailDialog
          recipe={currentDetail}
          ingredientById={ingredientById}
          typeById={typeById}
          userById={userById}
          onClose={() => setDetailOpen(null)}
          onEdit={() => {
            setFormDialog({ open: true, editing: currentDetail });
            setDetailOpen(null);
          }}
          onDelete={() => setConfirmDel(currentDetail)}/>
      )}

      {/* Form dialog */}
      <RcFormDialog
        open={formDialog.open}
        editing={formDialog.editing}
        ingredients={ingredients}
        typeById={typeById}
        currentUserId={currentUserIdSafe}
        onClose={() => setFormDialog({ open: false, editing: null })}
        onSubmit={upsertRecipe}/>

      {/* Confirm delete */}
      {confirmDel && (
        <RcConfirmDelete
          recipe={confirmDel}
          onClose={() => setConfirmDel(null)}
          onConfirm={() => deleteRecipe(confirmDel)}/>
      )}
    </div>
  );
}

function RcScopeChip({ selected, onClick, swatchPalette, icon, children }) {
  const c = swatchPalette ? window.alGetPalette(swatchPalette) : null;
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px]
                  border transition-colors whitespace-nowrap
                  ${selected
                    ? 'bg-accent border-transparent text-[hsl(var(--accent-strong))] font-medium'
                    : 'border-black/[.08] dark:border-white/[.1] text-ink-soft dark:text-night-softText hover:bg-paper-soft dark:hover:bg-night-soft'}`}>
      {c ? <span className={`h-2.5 w-2.5 rounded-full ${c.swatch}`}/> : icon}
      {children}
    </button>
  );
}

Object.assign(window, { RecetasViewImpl });
