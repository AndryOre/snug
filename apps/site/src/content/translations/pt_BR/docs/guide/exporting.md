---
title: Exportar favoritos
sourceHash: 2c9f860aa372f840
---

1. Exportação rápida: no popup, escolha um formato e clique em "Exportar tudo"
   para exportar toda a sua árvore de favoritos.
2. Para controlar o que é exportado, abra a página **Exportar** do app:
   - Use a caixa de pesquisa para encontrar favoritos específicos.
   - Marque favoritos individuais ou pastas inteiras (ou use "Selecionar tudo").
   - Ajuste o painel **Opções de exportação** (ícones, datas, ocultar pastas,
     modelo de nome de arquivo).
   - Escolha o formato de exportação e clique em "Exportar N favoritos".

## Formatos de exportação

O Snug exporta seis formatos:

| Formato  | Extensão | Bom para                                                               |
| -------- | -------- | ---------------------------------------------------------------------- |
| HTML     | `.html`  | Importar em qualquer navegador (arquivo de favoritos Netscape).        |
| JSON     | `.json`  | Restaurar no Snug com as pastas e os locais raiz intactos.             |
| CSV      | `.csv`   | Planilhas; uma linha por favorito com uma coluna `folder`.             |
| Markdown | `.md`    | Notas e wikis; as pastas viram títulos e listas.                       |
| OPML     | `.opml`  | Leitores de feeds e organizadores de tópicos.                          |
| XBEL     | `.xbel`  | Outros gerenciadores de favoritos que leem o formato XML de favoritos. |

Markdown e OPML são só de exportação: o Snug não consegue importá-los de volta.

## Progresso e Cancelar

Uma exportação ou importação longa mostra um cartão de progresso com uma
contagem em andamento. Clique em **Cancelar** para parar. Uma exportação
cancelada não baixa nenhum arquivo. Uma importação cancelada remove os favoritos
que já tinha adicionado, e uma Restauração — substituir cancelada devolve seus
favoritos anteriores a partir do instantâneo de segurança. Cancelar um lote de
importação devolve seus favoritos ao estado em que estavam antes de o lote
começar.

## Nomear os arquivos exportados

Por padrão, os arquivos exportados se chamam `Bookmarks_<data>_<hora>` (por
exemplo, `Bookmarks_2026-10-03_14-05-09`). Para personalizar:

1. Abra a página **Exportar** do app (o mesmo painel aparece em **Exportação
   automática**).
2. Em **Opções de exportação**, edite "Modelo de nome de arquivo". Uma
   pré-visualização ao vivo mostra o nome de arquivo resultante enquanto você
   digita.
3. Use estes marcadores (sem diferenciar maiúsculas de minúsculas) para incluir
   a data e a hora atuais:

   | Marcador | Valor   |
   | -------- | ------- |
   | `%yyyy`  | Ano (4) |
   | `%yy`    | Ano (2) |
   | `%mm`    | Mês     |
   | `%dd`    | Dia     |
   | `%hh`    | Hora    |
   | `%min`   | Minuto  |
   | `%sec`   | Segundo |

   Por exemplo, `%yyyy%mm%dd myPc` produz `20260930 myPc.html` (e a extensão
   correspondente para os outros formatos).

O modelo vale em todo lugar onde um nome de arquivo é gerado: a exportação
básica do popup, a página Exportar e a Exportação automática. Os caracteres não
permitidos em nomes de arquivo (`/ \ : * ? " < > |`) são substituídos por `_`, e
um modelo que acabe vazio volta para "Bookmarks".
