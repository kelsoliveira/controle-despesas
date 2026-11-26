/* Estrutura inicial VAZIA — o site publicado não contém dados pessoais.
 * Seus dados ficam no navegador (localStorage) e, se você conectar,
 * no arquivo `controle-despesas.json` da pasta escolhida (OneDrive/Drive/Dropbox).
 *
 * Convenção de mês: "AAAA-MM" = mês de VENCIMENTO da fatura.
 * Para compras parceladas, `firstMonth` = fatura da parcela 1.
 */
window.SEED = {
  version: 1,
  updatedAt: '',
  settings: {
    income: 0,            // renda líquida mensal — preencha em Configurações
    savingsGoal: 10,      // % da renda reservada para poupança/investimento
    theme: 'auto',
    startMonth: ''
  },
  cards: [],
  extraIncome: [],   // rendas extras: { id, name, kind: 'ferias'|'13'|'bonus'|'outro', amount, month: 'AAAA-MM', yearly }
  invoiceOverrides: {},
  invoicePaid: {},
  fixedPaid: {},
  aliases: {},     // nomes corrigidos na importação: { chaveDoNomeOriginal: { desc, category } }
  dupIgnore: {},   // pares marcados como "não são duplicados"
  // Modelos de despesas fixas — preencha os valores
  fixed: [
    { id: 'f1', name: 'Energia elétrica',     category: 'moradia',  amount: 0, dueDay: 10, start: '', end: '', estimated: true },
    { id: 'f2', name: 'Água e esgoto',        category: 'moradia',  amount: 0, dueDay: 15, start: '', end: '', estimated: true },
    { id: 'f3', name: 'Internet',             category: 'servicos', amount: 0, dueDay: 20, start: '', end: '', estimated: true },
    { id: 'f4', name: 'Celular',              category: 'servicos', amount: 0, dueDay: 12, start: '', end: '', estimated: true },
    { id: 'f5', name: 'Gás de cozinha',       category: 'moradia',  amount: 0, dueDay: 5,  start: '', end: '', estimated: true },
    { id: 'f6', name: 'Aluguel / Condomínio', category: 'moradia',  amount: 0, dueDay: 5,  start: '', end: '', estimated: true }
  ],
  transactions: []
};
