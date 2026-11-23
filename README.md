# Controle de Despesas

Sistema web para controlar despesas pessoais: cartões de crédito, compras parceladas, despesas fixas (água, luz, internet…) e visão futura do orçamento.

## Como usar
- **Pelo site publicado (GitHub Pages)** — recomendado; todos os recursos funcionam.
- **No computador:** `python3 -m http.server` na pasta do projeto e acesse `http://localhost:8000`.
  Abrindo o `index.html` direto (duplo clique) tudo funciona, exceto a leitura de PDF/prints.

O site começa **vazio** — não contém dados pessoais.

## Telas
- **Visão geral** — quanto posso gastar no mês, renda, valor comprometido, quanto já foi pago, vencimentos com marcação de “pago”, gastos por categoria e parcelas que terminam em breve.
- **Visão futura** — projeção de 6 a 24 meses (fixas + faturas), parcela máxima segura e simulador de nova compra parcelada.
- **Cartões e faturas** — faturas mês a mês por cartão, itens com “parcela X de Y”, valor oficial da fatura e uso do limite.
- **Parcelamentos** — todas as compras parceladas com andamento, saldo restante e mês da última parcela.
- **Despesas fixas** — água, luz, gás, internet, celular, aluguel etc., com vencimento e vigência.
- **Importar faturas** — lê o **PDF da fatura** ou **prints do app do banco** (OCR em português), detecta cartão, vencimento, total e parcelas, remove repetidos entre prints e marca o que já existe. Tudo é conferido numa tabela editável antes de gravar.
- **Lançamentos** — cadastro de gastos no cartão ou débito/Pix; a fatura da 1ª parcela é calculada pelo dia de fechamento.
- **Configurações** — renda, % de reserva, tema claro/escuro, cartões, backup (exportar/importar JSON).

## Onde ficam os dados
- No navegador (`localStorage`) e, se conectada, numa **pasta do seu computador** (Configurações → Pasta de dados — Chrome/Edge).
- Escolha uma pasta dentro do **OneDrive, Google Drive ou Dropbox** para ter os dados na nuvem e em outros computadores.
- O arquivo é `controle-despesas.json`; uma cópia diária fica em `backups/` (últimos 30 dias).
- Ao voltar para a aba, o sistema verifica se o arquivo foi alterado em outro computador e recarrega.

## Privacidade (LGPD)
Nenhum dado é enviado a servidores: PDF e imagens são processados no próprio navegador (pdf.js e Tesseract.js estão em `vendor/`).
Nome, CPF, endereço e número do cartão presentes nos PDFs não são gravados. O `.gitignore` impede versionar arquivos de dados e PDFs.

## Bibliotecas incluídas
- [pdf.js](https://github.com/mozilla/pdf.js) 3.11 — Apache 2.0
- [Tesseract.js](https://github.com/naptha/tesseract.js) 5.1 + dados de idioma português — Apache 2.0

## Design
- Tipografia: **Plus Jakarta Sans** (títulos) + **Inter** (interface, com números tabulares para valores alinhados).
- Paleta de gráficos categórica validada para daltonismo; tema claro e escuro; layout responsivo.
- Sem dependências externas além das fontes do Google Fonts (com fallback para fontes do sistema).
