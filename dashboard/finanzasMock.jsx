// Home Lettuce — Mock de Fintoc
// Para conectar Fintoc real: reemplazar FAMILIA_A, FAMILIA_B y GASTOS_COMPARTIDOS
// por los arrays que retorna el fetch a /api/v1/fintoc/accounts y /movements.
// Ningún componente cambia — solo cambia el origen de estos tres exports.

const _fm_now = new Date();
const _fm_ym  = `${_fm_now.getFullYear()}-${String(_fm_now.getMonth()+1).padStart(2,'0')}`;
const _fm_day = (n) => `${_fm_ym}-${String(n).padStart(2,'0')}`;
const _fm_ts  = `${_fm_ym}-${String(_fm_now.getDate()).padStart(2,'0')}T10:30:00`;

// ── Familia A: Mamá · Hermano · Andreu ──────────────────────────────────────
const FAMILIA_A = [
  {
    id: 'mama', name: 'Mamá', initial: 'M', color: '#F4C0D1', textColor: '#72243E',
    accounts: [
      {
        id: 'mama-deb-4821', type: 'checking_account',
        name: 'Cuenta Corriente BancoEstado', number: '000000004821',
        holder_name: 'Nombre Mamá', currency: 'CLP',
        balance: { available: 2345900, current: 2345900 },
        refreshed_at: _fm_ts,
      },
      {
        id: 'mama-cred-1077', type: 'credit_card',
        name: 'Tarjeta de Crédito Santander', number: '000000001077',
        holder_name: 'Nombre Mamá', currency: 'CLP',
        balance: { available: 1187550, current: -312450, limit: 1500000 },
        refreshed_at: _fm_ts,
      },
    ],
    movements: [
      { id: 'mm-1', amount:  1850000, post_date: _fm_day(2),  description: 'Sueldo',           type: 'transfer', pending: false, currency: 'CLP', account_id: 'mama-deb-4821'  },
      { id: 'mm-2', amount:   -82490, post_date: _fm_day(3),  description: 'Mercado Líder',    type: 'payment',  pending: false, currency: 'CLP', account_id: 'mama-deb-4821'  },
      { id: 'mm-3', amount:  -720000, post_date: _fm_day(5),  description: 'Arriendo',         type: 'transfer', pending: false, currency: 'CLP', account_id: 'mama-deb-4821'  },
      { id: 'mm-4', amount:   -34500, post_date: _fm_day(6),  description: 'Cena Don Tito',   type: 'payment',  pending: false, currency: 'CLP', account_id: 'mama-cred-1077' },
      { id: 'mm-5', amount:   -64300, post_date: _fm_day(10), description: 'Mercado Líder',   type: 'payment',  pending: false, currency: 'CLP', account_id: 'mama-deb-4821'  },
      { id: 'mm-6', amount:   -29990, post_date: _fm_day(12), description: 'Internet Mundo',  type: 'payment',  pending: false, currency: 'CLP', account_id: 'mama-deb-4821'  },
      { id: 'mm-7', amount:    -9990, post_date: _fm_day(14), description: 'Netflix',         type: 'payment',  pending: false, currency: 'CLP', account_id: 'mama-cred-1077' },
      { id: 'mm-8', amount:    45000, post_date: _fm_day(15), description: 'Reembolso Sofía', type: 'transfer', pending: false, currency: 'CLP', account_id: 'mama-deb-4821'  },
      { id: 'mm-9', amount:  -102110, post_date: _fm_day(17), description: 'Mercado Jumbo',   type: 'payment',  pending: false, currency: 'CLP', account_id: 'mama-deb-4821'  },
      { id: 'mm-10',amount:   -56700, post_date: _fm_day(16), description: 'Mall Costanera',  type: 'payment',  pending: false, currency: 'CLP', account_id: 'mama-cred-1077' },
    ],
  },
  {
    id: 'hermano', name: 'Hermano', initial: 'H', color: '#C0DD97', textColor: '#27500A',
    accounts: [
      {
        id: 'hermano-deb-2093', type: 'checking_account',
        name: 'Cuenta Vista BancoEstado', number: '000000002093',
        holder_name: 'Nombre Hermano', currency: 'CLP',
        balance: { available: 612300, current: 612300 },
        refreshed_at: _fm_ts,
      },
      {
        id: 'hermano-cred-8841', type: 'credit_card',
        name: 'Tarjeta CMR Falabella', number: '000000008841',
        holder_name: 'Nombre Hermano', currency: 'CLP',
        balance: { available: 601100, current: -198900, limit: 800000 },
        refreshed_at: _fm_ts,
      },
    ],
    movements: [
      { id: 'hm-1', amount:  920000, post_date: _fm_day(3),  description: 'Sueldo',       type: 'transfer', pending: false, currency: 'CLP', account_id: 'hermano-deb-2093'  },
      { id: 'hm-2', amount:  -28700, post_date: _fm_day(8),  description: 'Bencina Copec',type: 'payment',  pending: false, currency: 'CLP', account_id: 'hermano-cred-8841' },
      { id: 'hm-3', amount:   -8900, post_date: _fm_day(13), description: 'Café Altura',  type: 'payment',  pending: false, currency: 'CLP', account_id: 'hermano-cred-8841' },
      { id: 'hm-4', amount:  -15500, post_date: _fm_day(14), description: 'Uber',         type: 'payment',  pending: false, currency: 'CLP', account_id: 'hermano-cred-8841' },
      { id: 'hm-5', amount:  -24990, post_date: _fm_day(16), description: 'Gimnasio',     type: 'payment',  pending: false, currency: 'CLP', account_id: 'hermano-deb-2093'  },
    ],
  },
  {
    id: 'andreu', name: 'Andreu', initial: 'A', color: '#B5D4F4', textColor: '#0C447C',
    accounts: [
      {
        id: 'andreu-deb-5510', type: 'checking_account',
        name: 'Cuenta Vista BancoEstado', number: '000000005510',
        holder_name: 'Andreu', currency: 'CLP',
        balance: { available: 1120400, current: 1120400 },
        refreshed_at: _fm_ts,
      },
      {
        id: 'andreu-cred-6204', type: 'credit_card',
        name: 'Tarjeta de Crédito Santander', number: '000000006204',
        holder_name: 'Andreu', currency: 'CLP',
        balance: { available: 843300, current: -156700, limit: 1000000 },
        refreshed_at: _fm_ts,
      },
    ],
    movements: [
      { id: 'am-1', amount: 1500000, post_date: _fm_day(2),  description: 'Sueldo HomeLettuce',  type: 'transfer', pending: false, currency: 'CLP', account_id: 'andreu-deb-5510'  },
      { id: 'am-2', amount:   -5990, post_date: _fm_day(6),  description: 'Spotify',             type: 'payment',  pending: false, currency: 'CLP', account_id: 'andreu-cred-6204' },
      { id: 'am-3', amount:  -23400, post_date: _fm_day(7),  description: 'Farmacia Cruz Verde', type: 'payment',  pending: false, currency: 'CLP', account_id: 'andreu-deb-5510'  },
      { id: 'am-4', amount:  -18990, post_date: _fm_day(9),  description: 'Librería Antártica',  type: 'payment',  pending: false, currency: 'CLP', account_id: 'andreu-deb-5510'  },
      { id: 'am-5', amount:  -19800, post_date: _fm_day(11), description: 'Cine Hoyts',          type: 'payment',  pending: false, currency: 'CLP', account_id: 'andreu-cred-6204' },
      { id: 'am-6', amount:  -78700, post_date: _fm_day(13), description: 'Concierto Caupolicán',type: 'payment',  pending: false, currency: 'CLP', account_id: 'andreu-cred-6204' },
      { id: 'am-7', amount:  -46100, post_date: _fm_day(15), description: 'Mercado para mí',     type: 'payment',  pending: false, currency: 'CLP', account_id: 'andreu-deb-5510'  },
    ],
  },
];

// ── Familia B: Papá ──────────────────────────────────────────────────────────
const FAMILIA_B = [
  {
    id: 'papa', name: 'Papá', initial: 'P', color: '#FAC775', textColor: '#633806',
    accounts: [
      {
        id: 'papa-deb-3301', type: 'checking_account',
        name: 'Cuenta Corriente Santander', number: '000000003301',
        holder_name: 'Nombre Papá', currency: 'CLP',
        balance: { available: 1980400, current: 1980400 },
        refreshed_at: _fm_ts,
      },
      {
        id: 'papa-cred-7782', type: 'credit_card',
        name: 'Tarjeta de Crédito Banco de Chile', number: '000000007782',
        holder_name: 'Nombre Papá', currency: 'CLP',
        balance: { available: 1315500, current: -184500, limit: 1500000 },
        refreshed_at: _fm_ts,
      },
    ],
    movements: [
      { id: 'pm-1', amount:  2450000, post_date: _fm_day(1),  description: 'Sueldo',              type: 'transfer', pending: false, currency: 'CLP', account_id: 'papa-deb-3301'  },
      { id: 'pm-2', amount:  -180000, post_date: _fm_day(1),  description: 'Supermercado Jumbo',  type: 'payment',  pending: false, currency: 'CLP', account_id: 'papa-deb-3301'  },
      { id: 'pm-3', amount:  -350000, post_date: _fm_day(5),  description: 'Arriendo',            type: 'transfer', pending: false, currency: 'CLP', account_id: 'papa-deb-3301'  },
      { id: 'pm-4', amount:   -32400, post_date: _fm_day(9),  description: 'Bencina Copec',       type: 'payment',  pending: false, currency: 'CLP', account_id: 'papa-cred-7782' },
      { id: 'pm-5', amount:   -18900, post_date: _fm_day(13), description: 'Farmacia Salcobrand', type: 'payment',  pending: false, currency: 'CLP', account_id: 'papa-deb-3301'  },
      { id: 'pm-6', amount:   -27500, post_date: _fm_day(18), description: 'Almuerzo Tarragona',  type: 'payment',  pending: false, currency: 'CLP', account_id: 'papa-cred-7782' },
    ],
  },
];

// ── Gastos compartidos (entre familias) ─────────────────────────────────────
const GASTOS_COMPARTIDOS = [
  {
    id: 'sc-1', name: 'Plan celular familia', category: 'Servicios',
    totalAmount: 29900, splitCount: 4, myPortionCount: 3, nextBillingDate: '20 jun',
  },
  {
    id: 'sc-2', name: 'Google One', category: 'Suscripciones',
    totalAmount: 4500,  splitCount: 4, myPortionCount: 3, nextBillingDate: '8 jun',
  },
];

Object.assign(window, { FAMILIA_A, FAMILIA_B, GASTOS_COMPARTIDOS });
