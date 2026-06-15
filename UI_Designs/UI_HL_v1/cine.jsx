// Home Lettuce — Cine
// ─────────────────────────────────────────────────────────────────────────────
// Prototipo integrado en AppShell. En el repo TS real, este archivo se divide en:
//   · src/types/media.ts            (tipo MediaItem)
//   · src/lib/time.ts               (formatRuntime)
//   · src/hooks/useMediaLibrary.ts  (hook + mock + TODO useQuery)
//   · src/components/app/cine/MediaCard.tsx
//   · src/components/app/cine/MediaDetailModal.tsx
//   · src/components/app/cine/CineFilters.tsx
//   · src/pages/CinePage.tsx
// Aquí están todos juntos para poder previsualizarlos en el shell de Babel.
// ─────────────────────────────────────────────────────────────────────────────


// ─── src/lib/time.ts  (extensión) ───────────────────────────────────────────
// Convierte minutos en string legible. 102 → "1h 42m"; 45 → "45m"; 0 → "".
function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}


// ─── src/types/media.ts ──────────────────────────────────────────────────────
// type MediaItem = {
//   id: string
//   name: string
//   type: 'Movie' | 'Series'
//   year: number | null
//   overview: string | null
//   runtime: number | null
//   genres: string[]
//   rating: string | null
//   communityRating: number | null
//   posterUrl: string | null
//   backdropUrl: string | null
//   directors: string[]
//   cast: string[]
//   status: string | null
//   episodeCount: number | null
// }


// ─── src/hooks/useMediaLibrary.ts ────────────────────────────────────────────
const MOCK_LIBRARY = [
  {
    id: 'mv-001', name: 'El faro encendido', type: 'Movie', year: 2022,
    overview: 'En un pueblo de la costa norte, una farera relevada del servicio descubre que la luz de su antigua torre sigue encendiéndose sola cada noche. Una crónica luminosa sobre las costumbres que se niegan a apagarse y los pequeños misterios que sostienen una vida.',
    runtime: 102, genres: ['Drama', 'Misterio'],
    rating: 'PG', communityRating: 7.8,
    posterUrl: null, backdropUrl: null,
    directors: ['Inés Marqués'],
    cast: ['Laia Costa', 'Eduard Fernández', 'Greta Fernández', 'Pep Tosar', 'Aina Clotet'],
    status: null, episodeCount: null,
    _tint: 'teal',
  },
  {
    id: 'mv-002', name: 'Cartografía del jardín', type: 'Movie', year: 2024,
    overview: 'Tres hermanas regresan a la casa familiar para inventariar las plantas que su madre catalogó durante cuarenta años. Lo que empieza como una tarea botánica se vuelve una conversación postergada.',
    runtime: 118, genres: ['Drama'],
    rating: 'PG-13', communityRating: 8.1,
    posterUrl: null, backdropUrl: null,
    directors: ['Carlota Pereda'],
    cast: ['Bárbara Lennie', 'Vicky Luengo', 'Patricia López Arnaiz', 'José Coronado', 'Anna Castillo'],
    status: null, episodeCount: null,
    _tint: 'sage',
  },
  {
    id: 'tv-001', name: 'Noches de invernadero', type: 'Series', year: 2023,
    overview: 'En un instituto de botánica de Lisboa, un grupo de investigadores nocturnos descubre que una de las orquídeas raras de la colección emite una frecuencia que no debería existir.',
    runtime: 52, genres: ['Drama', 'Ciencia ficción', 'Misterio'],
    rating: 'TV-14', communityRating: 8.4,
    posterUrl: null, backdropUrl: null,
    directors: [],
    cast: ['Joana Ribeiro', 'Albano Jerónimo', 'Maria de Medeiros', 'Diogo Morgado', 'Beatriz Batarda'],
    status: 'Continuing', episodeCount: 16,
    _tint: 'lavender',
  },
  {
    id: 'mv-003', name: 'Lengua materna', type: 'Movie', year: 2021,
    overview: null,
    runtime: 94, genres: ['Documental'],
    rating: null, communityRating: 7.2,
    posterUrl: null, backdropUrl: null,
    directors: ['Mateo Iribarren', 'Sofía Otero'],
    cast: [],
    status: null, episodeCount: null,
    _tint: 'wheat',
  },
  {
    id: 'tv-002', name: 'La casa de las cosas pequeñas', type: 'Series', year: 2020,
    overview: 'Un anticuario, su sobrina y un gato persa con muy mal carácter resuelven encargos a domicilio. Comedia ligera de capítulos cortos.',
    runtime: 26, genres: ['Comedia', 'Familiar'],
    rating: 'TV-PG', communityRating: 7.6,
    posterUrl: null, backdropUrl: null,
    directors: [],
    cast: ['Macarena García', 'Brays Efe', 'Antonia San Juan', 'Carlos Areces'],
    status: 'Ended', episodeCount: 24,
    _tint: 'peach',
  },
  {
    id: 'mv-004', name: 'Tres veces el mar', type: 'Movie', year: 2019,
    overview: 'Una nadadora retirada vuelve al pueblo donde aprendió a bracear para acompañar a su entrenadora en sus últimas semanas. El agua, como siempre, recuerda mejor que las personas.',
    runtime: 137, genres: ['Drama'],
    rating: 'R', communityRating: 8.9,
    posterUrl: null, backdropUrl: null,
    directors: ['Isaki Lacuesta'],
    cast: ['Blanca Suárez', 'Petra Martínez', 'Nora Navas', 'Aitana Sánchez-Gijón'],
    status: null, episodeCount: null,
    _tint: 'sky',
  },
  {
    id: 'tv-003', name: 'Operación Quinoto', type: 'Series', year: 2025,
    overview: 'Sátira política sobre una agencia gubernamental dedicada a regular el uso indebido de cítricos en discursos públicos. Mezcla de mockumentary y noticiero.',
    runtime: 32, genres: ['Comedia', 'Sátira'],
    rating: 'TV-MA', communityRating: null,
    posterUrl: null, backdropUrl: null,
    directors: [],
    cast: ['Berto Romero', 'Eva Ugarte', 'Javier Cámara'],
    status: 'Continuing', episodeCount: 6,
    _tint: 'rose',
  },
  {
    id: 'mv-005', name: 'Pequeño teorema', type: 'Movie', year: null,
    overview: 'Cortometraje de animación stop-motion sobre una matemática que intenta demostrar, antes de jubilarse, que todas las palomas de su balcón comparten un único nombre verdadero.',
    runtime: 18, genres: ['Animación', 'Cortometraje'],
    rating: null, communityRating: 8.0,
    posterUrl: null, backdropUrl: null,
    directors: ['Anaïs Caura'],
    cast: [],
    status: null, episodeCount: null,
    _tint: 'mint',
  },
  {
    id: 'tv-004', name: 'Frecuencia 87.4', type: 'Series', year: 2018,
    overview: 'Tres locutores del turno de madrugada en una emisora provincial reciben llamadas que sólo ellos pueden oír. Drama nocturno, semanal, con score de jazz lento.',
    runtime: 48, genres: ['Drama', 'Misterio'],
    rating: 'TV-14', communityRating: 7.4,
    posterUrl: null, backdropUrl: null,
    directors: [],
    cast: ['Tristán Ulloa', 'Najwa Nimri', 'Luis Bermejo', 'Manolo Solo', 'Itziar Ituño'],
    status: 'Ended', episodeCount: 30,
    _tint: 'indigo',
  },
  {
    id: 'mv-006', name: 'Manual de invierno', type: 'Movie', year: 2023,
    overview: 'Una pareja recién separada queda atrapada por una nevada inesperada en la misma cabaña que alquilaron diez años antes para empezar la relación.',
    runtime: 88, genres: ['Drama', 'Romance'],
    rating: 'PG-13', communityRating: 7.0,
    posterUrl: null, backdropUrl: null,
    directors: ['Pilar Palomero'],
    cast: ['Patricia López Arnaiz', 'Israel Elejalde'],
    status: null, episodeCount: null,
    _tint: 'stone',
  },
];

function useMediaLibrary() {
  // TODO(real-api): reemplazar por:
  //   const { data, isLoading, error } = useQuery({
  //     queryKey: ['media-library'],
  //     queryFn: () => fetch('/api/jellyfin/items').then(r => r.json()),
  //     staleTime: 1000 * 60 * 5,
  //   })
  //   return { data: data ?? [], isLoading, error }
  const [state, setState] = React.useState({ data: [], isLoading: true, error: null });
  React.useEffect(() => {
    const t = setTimeout(() => setState({ data: MOCK_LIBRARY, isLoading: false, error: null }), 650);
    return () => clearTimeout(t);
  }, []);
  return state;
}


// ─── Iconos extra para Cine ─────────────────────────────────────────────────
const J = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" width="18" height="18" {...props}/>
);
const IconFilm = (p) => (
  <J {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/>
    <path d="M3.5 9h17M3.5 15h17M8 4.5v15M16 4.5v15"/>
  </J>
);
const IconSearch = (p) => (
  <J {...p}>
    <circle cx="11" cy="11" r="6.5"/>
    <path d="m20 20-4.2-4.2"/>
  </J>
);
const IconStar = (p) => (
  <J {...p}>
    <path d="M12 4.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.9l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"
          fill="currentColor" stroke="currentColor" strokeLinejoin="round"/>
  </J>
);
const IconClose = (p) => (
  <J {...p}>
    <path d="M6 6l12 12M18 6 6 18"/>
  </J>
);
const IconExternal = (p) => (
  <J {...p}>
    <path d="M14 5h5v5"/>
    <path d="M19 5l-8 8"/>
    <path d="M19 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18V7a1.5 1.5 0 0 1 1.5-1.5H10.5"/>
  </J>
);
const IconChevronDown = (p) => (
  <J {...p}>
    <path d="m6 9 6 6 6-6"/>
  </J>
);


// ─── Paleta de "póster placeholder" — tintes pastel suaves ──────────────────
// Sin imitar carteles reales (copyright). Bloque abstracto con tipografía del sistema.
const TINTS = {
  sage:     { bg: '#d8e7d7', accent: '#86a78a', ink: '#37503a' },
  lavender: { bg: '#dfd6ec', accent: '#9a86bc', ink: '#3f3157' },
  peach:    { bg: '#f4d8c6', accent: '#c98863', ink: '#5a3220' },
  teal:     { bg: '#c8dfdd', accent: '#6f9a98', ink: '#2c4848' },
  wheat:    { bg: '#ece2c8', accent: '#b59a5a', ink: '#5a4818' },
  sky:      { bg: '#cfdde9', accent: '#7494b1', ink: '#2a445a' },
  rose:     { bg: '#ebd0d4', accent: '#b67882', ink: '#4f2832' },
  mint:     { bg: '#cce5dc', accent: '#71a892', ink: '#234d3d' },
  indigo:   { bg: '#cdd1e6', accent: '#7378ad', ink: '#272c52' },
  stone:    { bg: '#dcd7d0', accent: '#8c857d', ink: '#3a3530' },
};

function PosterPlaceholder({ name, tint = 'sage', size = 'card' }) {
  const t = TINTS[tint] || TINTS.sage;
  // tipografía adaptativa según tamaño
  const tx = size === 'small' ? 'text-[11px]' : 'text-[13px] sm:text-[14px]';
  const title = size === 'small' ? 'text-[14px] leading-[1.05]' : 'text-[17px] sm:text-[19px] leading-[1.02]';
  // partir título en hasta 3 líneas por longitud
  const words = (name || '').split(/\s+/);
  let lines = [];
  if (words.length <= 2) lines = words;
  else if (words.length === 3) lines = words;
  else {
    // agrupar de a ~2
    const mid = Math.ceil(words.length / 2);
    lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }

  return (
    <div className="relative w-full h-full overflow-hidden"
         style={{ background: t.bg }}>
      {/* franja decorativa superior */}
      <div className="absolute inset-x-0 top-0 h-[28%]" style={{ background: t.accent, opacity: .55 }}/>
      <div className="absolute left-3 top-3 right-3 flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[.14em] uppercase"
              style={{ color: t.ink, opacity: .7 }}>
          poster
        </span>
        <span className="font-mono text-[9px] tracking-[.14em] uppercase"
              style={{ color: t.ink, opacity: .7 }}>
          2:3
        </span>
      </div>
      {/* punto / "spine" */}
      <div className="absolute left-3 top-[34%] h-1.5 w-6 rounded-full"
           style={{ background: t.ink, opacity: .25 }}/>

      {/* título */}
      <div className="absolute left-3 right-3 bottom-3 flex flex-col gap-1">
        <div className={`${title} font-medium tracking-tight`} style={{ color: t.ink }}>
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ─── MediaCard ──────────────────────────────────────────────────────────────
function MediaCard({ item, onOpen }) {
  // TODO(real-api): cuando exista posterUrl, sustituir el placeholder por:
  //   <img src={`/api/jellyfin/items/${item.id}/poster`} ... />
  //   donde el backend Go llama GET /Items/{id}/Images/Primary con header X-Emby-Token.
  const isMovie = item.type === 'Movie';
  return (
    <button
      onClick={() => onOpen(item)}
      className="group text-left flex flex-col gap-2 transition-transform
                 hover:scale-[1.02] focus-visible:scale-[1.02]
                 focus:outline-none">
      <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden
                      bg-paper-soft dark:bg-night-soft
                      border border-black/[.05] dark:border-white/[.06]
                      shadow-subtle">
        {item.posterUrl
          ? <img src={item.posterUrl} alt={item.name}
                 className="absolute inset-0 w-full h-full object-cover"/>
          : <PosterPlaceholder name={item.name} tint={item._tint}/>}

        {/* badge tipo */}
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full
                         text-[10.5px] font-medium tracking-[.02em]
                         bg-white/85 dark:bg-night/85 backdrop-blur-sm
                         text-ink dark:text-night-text
                         border border-black/[.04] dark:border-white/[.06]">
          {isMovie ? 'Película' : 'Serie'}
        </span>
      </div>

      <div className="px-0.5 min-w-0">
        <div className="text-[13.5px] font-medium text-ink dark:text-night-text
                        truncate group-hover:text-accent transition-colors">
          {item.name}
        </div>
        <div className="text-[11.5px] text-ink-mute dark:text-night-softText mt-0.5
                        flex items-center gap-1.5">
          {item.year != null && <span>{item.year}</span>}
          {item.year != null && item.communityRating != null && <span aria-hidden>·</span>}
          {item.communityRating != null && (
            <span className="inline-flex items-center gap-0.5">
              <IconStar width="11" height="11" className="text-accent"/>
              {item.communityRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function MediaCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full aspect-[2/3] rounded-2xl bg-paper-soft dark:bg-night-soft
                      animate-pulse"/>
      <div className="h-3.5 w-3/4 rounded-full bg-paper-soft dark:bg-night-soft animate-pulse"/>
      <div className="h-2.5 w-1/3 rounded-full bg-paper-soft dark:bg-night-soft animate-pulse"/>
    </div>
  );
}


// ─── MediaDetailModal ───────────────────────────────────────────────────────
function MediaDetailModal({ item, onClose }) {
  const [expanded, setExpanded] = React.useState(false);
  const dialogRef = React.useRef(null);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!item) return null;

  const formattedRuntime = formatRuntime(item.runtime);
  const isMovie = item.type === 'Movie';

  // TODO(real-api): construir link a Jellyfin del entorno:
  //   `${import.meta.env.VITE_JELLYFIN_PUBLIC_URL}/web/#/details?id=${item.id}`
  const jellyfinHref = `#/jellyfin/details?id=${item.id}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/40 backdrop-blur-[2px] animate-[fadein_.18s_ease]"
      onClick={onClose}
      role="dialog" aria-modal="true" aria-labelledby="media-modal-title">
      <style>{`
        @keyframes fadein  { from { opacity:0 } to { opacity:1 } }
        @keyframes riseup  { from { opacity:0; transform: translateY(16px) } to { opacity:1; transform:none } }
      `}</style>

      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl
                   h-[92vh] sm:h-auto sm:max-h-[88vh]
                   bg-white dark:bg-night-card
                   rounded-t-3xl sm:rounded-3xl
                   border border-black/[.06] dark:border-white/[.06]
                   shadow-subtle overflow-hidden
                   animate-[riseup_.22s_ease] flex flex-col">

        {/* close button (always visible, top-right) */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute z-10 top-3 right-3 h-9 w-9 rounded-full
                     bg-white/85 dark:bg-night-soft/85 backdrop-blur-sm
                     border border-black/[.06] dark:border-white/[.08]
                     text-ink dark:text-night-text
                     hover:bg-white dark:hover:bg-night-soft
                     flex items-center justify-center transition-colors">
          <IconClose/>
        </button>

        {/* mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-black/10 dark:bg-white/15"/>
        </div>

        {/* body — scroll vertical */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">

              {/* póster */}
              <div className="shrink-0 mx-auto sm:mx-0">
                <div className="w-[140px] sm:w-[120px] aspect-[2/3] rounded-2xl
                                overflow-hidden border border-black/[.05] dark:border-white/[.06]
                                shadow-subtle">
                  {item.posterUrl
                    ? <img src={item.posterUrl} alt={item.name}
                           className="w-full h-full object-cover"/>
                    : <PosterPlaceholder name={item.name} tint={item._tint} size="small"/>}
                </div>
              </div>

              {/* info */}
              <div className="flex-1 min-w-0">
                <h2 id="media-modal-title"
                    className="text-[22px] sm:text-[26px] font-medium tracking-tight
                               text-ink dark:text-night-text leading-[1.15]">
                  {item.name}
                </h2>

                {/* badges fila — tipo + año + rating */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="px-2.5 py-1 rounded-full text-[11.5px] font-medium
                                   bg-accent-tint text-accent">
                    {isMovie ? 'Película' : 'Serie'}
                  </span>
                  {item.year != null && (
                    <span className="px-2.5 py-1 rounded-full text-[11.5px]
                                     bg-paper-soft dark:bg-night-soft
                                     text-ink-soft dark:text-night-softText">
                      {item.year}
                    </span>
                  )}
                  {item.rating && (
                    <span className="px-2 py-1 rounded-md text-[10.5px] font-mono uppercase tracking-[.06em]
                                     border border-black/[.1] dark:border-white/[.12]
                                     text-ink-soft dark:text-night-softText">
                      {item.rating}
                    </span>
                  )}
                  {formattedRuntime && (
                    <span className="text-[11.5px] text-ink-mute dark:text-night-softText
                                     ml-1">
                      {formattedRuntime}
                    </span>
                  )}
                </div>

                {/* community rating */}
                {item.communityRating != null && (
                  <div className="mt-3 inline-flex items-center gap-1.5">
                    <IconStar width="15" height="15" className="text-accent"/>
                    <span className="text-[14px] font-medium text-ink dark:text-night-text">
                      {item.communityRating.toFixed(1)}
                    </span>
                    <span className="text-[12px] text-ink-mute dark:text-night-softText">/ 10</span>
                  </div>
                )}

                {/* géneros */}
                {item.genres && item.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {item.genres.map((g) => (
                      <span key={g}
                            className="px-2.5 py-1 rounded-full text-[11.5px]
                                       bg-paper-soft dark:bg-night-soft
                                       text-ink-soft dark:text-night-softText">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* sinopsis */}
            {item.overview && (
              <div className="mt-6">
                <div className="text-[10.5px] font-medium uppercase tracking-[.1em]
                                text-ink-mute dark:text-night-softText mb-2">
                  Sinopsis
                </div>
                <p className={`text-[14px] leading-[1.55] text-ink dark:text-night-text
                              ${expanded ? '' : 'line-clamp-3'}`}>
                  {item.overview}
                </p>
                {item.overview.length > 160 && (
                  <button
                    onClick={() => setExpanded(e => !e)}
                    className="mt-1.5 text-[12.5px] font-medium text-accent
                               inline-flex items-center gap-0.5 hover:underline">
                    {expanded ? 'Ver menos' : 'Ver más'}
                    <IconChevronDown width="13" height="13"
                                     style={{ transform: expanded ? 'rotate(180deg)' : 'none',
                                              transition: 'transform .2s' }}/>
                  </button>
                )}
              </div>
            )}

            {/* metadatos: directores / cast / series-info */}
            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {isMovie && item.directors && item.directors.length > 0 && (
                <MetaRow label={item.directors.length === 1 ? 'Dirección' : 'Dirección'}>
                  {item.directors.join(', ')}
                </MetaRow>
              )}
              {item.cast && item.cast.length > 0 && (
                <MetaRow label="Reparto">
                  {item.cast.slice(0, 5).join(', ')}
                </MetaRow>
              )}
              {!isMovie && item.status && (
                <MetaRow label="Estado">
                  {item.status === 'Ended' ? 'Finalizada'
                   : item.status === 'Continuing' ? 'En emisión'
                   : item.status}
                </MetaRow>
              )}
              {!isMovie && item.episodeCount != null && (
                <MetaRow label="Episodios">
                  {item.episodeCount}
                </MetaRow>
              )}
            </dl>

            {/* CTA */}
            <div className="mt-7 flex flex-col sm:flex-row gap-2.5">
              <a href={jellyfinHref}
                 target="_blank" rel="noreferrer noopener"
                 className="inline-flex items-center justify-center gap-2
                            rounded-full px-5 py-3 text-[14px] font-medium
                            bg-accent text-[hsl(var(--accent-strong))]
                            hover:brightness-[.96] transition">
                Ver en Jellyfin
                <IconExternal/>
              </a>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center
                           rounded-full px-5 py-3 text-[14px] font-medium
                           border border-black/[.08] dark:border-white/[.1]
                           text-ink dark:text-night-text
                           hover:bg-paper-soft dark:hover:bg-night-soft transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, children }) {
  return (
    <div>
      <dt className="text-[10.5px] font-medium uppercase tracking-[.1em]
                     text-ink-mute dark:text-night-softText mb-1">
        {label}
      </dt>
      <dd className="text-[13.5px] text-ink dark:text-night-text leading-[1.5]">
        {children}
      </dd>
    </div>
  );
}


// ─── CineFilters ────────────────────────────────────────────────────────────
function CineFilters({ filter, onFilter, query, onQuery, sort, onSort }) {
  const tabs = [
    { id: 'all',    label: 'Todo' },
    { id: 'movie',  label: 'Películas' },
    { id: 'series', label: 'Series' },
  ];
  const sorts = [
    { id: 'name',   label: 'Nombre A–Z' },
    { id: 'year',   label: 'Más nuevo' },
    { id: 'rating', label: 'Mejor valorado' },
  ];
  const [sortOpen, setSortOpen] = React.useState(false);
  const sortRef = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
      {/* Tipo */}
      <div className="inline-flex p-1 rounded-full
                      bg-paper-soft dark:bg-night-soft
                      border border-black/[.04] dark:border-white/[.06]
                      self-start">
        {tabs.map((tab) => {
          const active = filter === tab.id;
          return (
            <button key={tab.id}
              onClick={() => onFilter(tab.id)}
              className={`px-3.5 sm:px-4 h-8 rounded-full text-[12.5px] transition-colors
                          ${active
                            ? 'bg-white dark:bg-night-card text-ink dark:text-night-text shadow-subtle font-medium'
                            : 'text-ink-soft dark:text-night-softText hover:text-ink dark:hover:text-night-text'}`}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* búsqueda */}
      <div className="flex-1 min-w-0">
        <label className="flex items-center gap-2.5 rounded-full px-4 h-10
                          bg-paper-soft dark:bg-night-soft
                          border border-transparent focus-within:border-accent
                          focus-within:bg-white dark:focus-within:bg-night
                          transition-colors">
          <span className="text-ink-mute dark:text-night-softText shrink-0">
            <IconSearch/>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full bg-transparent outline-none text-[13.5px]
                       placeholder:text-ink-mute dark:placeholder:text-night-softText
                       text-ink dark:text-night-text"/>
          {query && (
            <button onClick={() => onQuery('')}
                    className="text-ink-mute dark:text-night-softText hover:text-ink dark:hover:text-night-text
                               -mr-1 p-1 rounded-full">
              <IconClose width="14" height="14"/>
            </button>
          )}
        </label>
      </div>

      {/* sort */}
      <div className="relative self-start md:self-auto" ref={sortRef}>
        <button
          onClick={() => setSortOpen((o) => !o)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full
                     bg-paper-soft dark:bg-night-soft
                     border border-black/[.04] dark:border-white/[.06]
                     text-[12.5px] text-ink dark:text-night-text
                     hover:bg-white dark:hover:bg-night-card transition-colors">
          <span className="text-ink-mute dark:text-night-softText">Ordenar:</span>
          <span className="font-medium">{sorts.find(s => s.id === sort)?.label}</span>
          <IconChevronDown width="14" height="14"
                           className="text-ink-mute dark:text-night-softText"
                           style={{ transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/>
        </button>
        {sortOpen && (
          <div className="absolute right-0 mt-1.5 w-52 rounded-2xl
                          bg-white dark:bg-night-card
                          border border-black/[.05] dark:border-white/[.05]
                          shadow-subtle p-1.5 z-20">
            {sorts.map((s) => (
              <button key={s.id}
                onClick={() => { onSort(s.id); setSortOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-[13px]
                            ${sort === s.id
                              ? 'bg-accent-tint text-accent font-medium'
                              : 'text-ink dark:text-night-text hover:bg-paper-soft dark:hover:bg-night-soft'} `}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── CinePage ────────────────────────────────────────────────────────────────
function CinePage() {
  const { data, isLoading, error } = useMediaLibrary();
  const [filter, setFilter] = React.useState('all');     // 'all' | 'movie' | 'series'
  const [query, setQuery]   = React.useState('');
  const [sort, setSort]     = React.useState('name');    // 'name' | 'year' | 'rating'
  const [openItem, setOpenItem] = React.useState(null);

  // debounce de búsqueda (200ms) — defensivo para librerías grandes
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = React.useMemo(() => {
    if (!data) return [];
    let out = data;
    if (filter === 'movie')  out = out.filter(i => i.type === 'Movie');
    if (filter === 'series') out = out.filter(i => i.type === 'Series');
    if (debouncedQuery) out = out.filter(i => i.name.toLowerCase().includes(debouncedQuery));
    out = [...out].sort((a, b) => {
      if (sort === 'name')   return a.name.localeCompare(b.name, 'es');
      if (sort === 'year')   return (b.year ?? -Infinity) - (a.year ?? -Infinity);
      if (sort === 'rating') return (b.communityRating ?? -Infinity) - (a.communityRating ?? -Infinity);
      return 0;
    });
    return out;
  }, [data, filter, debouncedQuery, sort]);

  const totalCount = data?.length ?? 0;

  return (
    <div className="route-fade max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-10 pb-28 md:pb-10">

      {/* header */}
      <header className="mb-6 sm:mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[.1em]
                          text-ink-mute dark:text-night-softText mb-1.5">
            Vida diaria
          </div>
          <h1 className="text-[28px] sm:text-[34px] font-medium tracking-tight
                         text-ink dark:text-night-text">
            Cine
            {!isLoading && (
              <span className="text-ink-mute dark:text-night-softText font-normal ml-2">
                ({totalCount} {totalCount === 1 ? 'título' : 'títulos'})
              </span>
            )}
          </h1>
        </div>
      </header>

      {/* filtros */}
      <div className="mb-6 sm:mb-8">
        <CineFilters
          filter={filter} onFilter={setFilter}
          query={query} onQuery={setQuery}
          sort={sort} onSort={setSort}/>
      </div>

      {/* contenido */}
      {error ? (
        <div className="py-20 text-center text-ink-soft dark:text-night-softText text-[14px]">
          No se pudo cargar la biblioteca. Reintenta en un momento.
        </div>
      ) : isLoading ? (
        <Grid>
          {Array.from({ length: 10 }).map((_, i) => <MediaCardSkeleton key={i}/>)}
        </Grid>
      ) : filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center text-center max-w-md mx-auto">
          <div className="h-16 w-16 rounded-3xl bg-accent-tint flex items-center justify-center mb-4 text-accent">
            <IconFilm width="24" height="24"/>
          </div>
          <h2 className="text-[15px] font-medium text-ink dark:text-night-text">Sin resultados</h2>
          <p className="text-[13px] text-ink-soft dark:text-night-softText mt-1.5 leading-relaxed">
            Prueba con otra búsqueda o cambia el filtro.
          </p>
        </div>
      ) : (
        <Grid>
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} onOpen={setOpenItem}/>
          ))}
        </Grid>
      )}

      {openItem && (
        <MediaDetailModal item={openItem} onClose={() => setOpenItem(null)}/>
      )}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
                    gap-4 sm:gap-5 md:gap-6">
      {children}
    </div>
  );
}


Object.assign(window, { CinePage });
