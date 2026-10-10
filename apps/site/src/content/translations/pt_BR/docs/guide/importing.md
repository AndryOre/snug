---
title: Importar favoritos
sourceHash: 4c537c8e1b7a7231
---

1. Importação rápida, a partir do popup:
   - Se quiser, mude o modo de importação padrão (veja
     [**Configurações**](settings.md)); ele começa em **Restaurar — mesclar**.
   - Clique em "Escolher arquivos…" e selecione um ou mais arquivos de favoritos
     (veja **Origens de importação** abaixo), ou solte-os na seção Importar do
     popup. Uma sobreposição "Solte os arquivos para importar" aparece enquanto
     você arrasta. Arquivos soltos enquanto uma importação está em andamento são
     ignorados.
   - A extensão detecta cada formato automaticamente e importa os favoritos na
     hora, usando o modo de importação padrão. Um arquivo CSV, ou qualquer outro
     arquivo sem dados da Barra de favoritos/Outros favoritos, sempre é
     importado para uma nova pasta "Favoritos importados", independentemente do
     modo padrão.
   - Vários arquivos são importados juntos como um **lote de importação** (veja
     abaixo). Um arquivo que o Snug não consegue ler fica de fora. O aviso lista
     até três arquivos ignorados como `nome: motivo`, e depois "e mais N".
   - Se o modo padrão for **Restaurar — substituir**, o popup mostra apenas um
     aviso em linha de que seus favoritos existentes serão substituídos. Ao
     escolher um arquivo, a página **Importar** do app abre, onde você revisa a
     substituição e a confirma (um instantâneo de segurança é salvo antes, para
     você poder desfazer). Importações muito grandes também abrem a página
     **Importar**.
2. Pré-visualização primeiro, a partir da página **Importar** do app:
   - Solte ou selecione um ou mais arquivos de favoritos. Cada arquivo ganha uma
     linha com o formato detectado e a contagem de favoritos, ou o motivo de não
     poder ser lido. Você pode remover um arquivo ou usar **Adicionar arquivos**
     para incluir mais.
   - Uma pré-visualização detalhada mostra a árvore de favoritos como seria
     importada. Os favoritos que Ignorar duplicados deixaria de fora levam um
     selo `Duplicado · ignorado`, para você avaliar o arquivo antes de qualquer
     mudança.
   - Escolha um modo de importação (pré-selecionado a partir do seu padrão):
     - **Criar pasta**: adiciona todos os favoritos a uma nova pasta "Favoritos
       importados". Disponível para qualquer arquivo, inclusive CSV (que não tem
       estrutura de pastas para restaurar).
     - **Restaurar — mesclar**: coloca os favoritos nos locais originais, junto
       com os que você já tem. Só disponível para arquivos JSON/HTML que trazem
       dados de localização.
     - **Restaurar — substituir**: primeiro esvazia sua Barra de favoritos e
       Outros favoritos, depois restaura os favoritos nos locais originais. Só
       disponível para arquivos que trazem dados de localização, e para um
       arquivo por vez.
   - Selecionar "Restaurar — substituir" mostra quantos favoritos a substituição
     vai remover e adicionar, lista os favoritos que serão excluídos e exige
     confirmar um diálogo de aviso antes de a importação ser executada.
   - **Ignorar duplicados** (ativado por padrão) deixa de fora qualquer favorito
     cuja URL já exista no seu navegador e informa quantos dos favoritos
     selecionados serão ignorados. Vale para Criar pasta e Restaurar — mesclar,
     não para Restaurar — substituir. A chave é compartilhada com a importação
     rápida.

## Seleção de importação

Em Criar pasta e Restaurar — mesclar, a árvore de pré-visualização tem caixas de
seleção. Marque favoritos individuais, pastas inteiras ou uma mistura, e o Snug
importa apenas a **seleção de importação**. Restaurar — substituir não tem
seleção: sempre importa tudo.

## Lote de importação

Vários arquivos importados de uma vez são executados como um **lote de
importação**: um modo de importação, uma pré-visualização e um progresso. O Snug
verifica as URLs existentes uma única vez, então Ignorar duplicados também deixa
de fora um favorito que aparece em dois dos arquivos.

- Em Criar pasta com dois ou mais arquivos, cada arquivo vai para a sua própria
  pasta, com o nome do arquivo (sem a extensão). Um único arquivo mantém a pasta
  "Favoritos importados", e os arquivos CSV sempre a usam.
- Restaurar — substituir exige exatamente um arquivo. Com dois ou mais arquivos
  ele fica desativado, porque o segundo arquivo apagaria o primeiro.
- Um arquivo que não pode ser lido fica de fora na pré-visualização e aparece
  listado no resultado.
- Cancelar, ou uma falha no meio do caminho, devolve seus favoritos ao estado em
  que estavam antes de o lote começar.

## Origens de importação

O Snug detecta o formato pelo tipo MIME do arquivo, depois pela extensão e, por
fim, pelo conteúdo. Ele lê:

- Exportações do Snug e de navegadores: HTML (arquivo de favoritos Netscape),
  JSON, CSV e XBEL.
- Um arquivo `Bookmarks` de perfil do Chrome (o arquivo JSON bruto dentro da
  pasta de um perfil do Chrome). Suas pastas voltam aos locais originais.
- Uma exportação do Safari (HTML). Favoritos vira a Barra de favoritos; a Lista
  de Leitura e as outras pastas do Safari ficam em Outros favoritos, com a Lista
  de Leitura em uma pasta própria.

## O instantâneo de segurança e Desfazer

Antes de toda Restauração — substituir, o Snug salva um **instantâneo de
segurança** da sua Barra de favoritos e de Outros favoritos: um arquivo JSON na
sua pasta Downloads (`snug-safety-snapshot-<data>.json`), além de uma cópia
mantida dentro da extensão. A confirmação da substituição informa isso e leva ao
cartão de instantâneos de segurança em Configurações. Se o instantâneo não puder
ser salvo, nada é excluído.

- Depois de uma substituição, **Desfazer importação** no resultado restaura o
  instantâneo.
- Em **Configurações**, o cartão de instantâneos de segurança lista os cinco
  mais recentes. Você pode restaurar ou baixar qualquer um deles, depois de
  confirmar, e criar um novo a qualquer momento.

O Snug guarda os cinco instantâneos mais recentes, então o sexto substitui o
mais antigo, exceto que o instantâneo mais novo que contenha algum favorito
nunca é descartado. Restaurar um instantâneo é, em si, uma substituição, então o
Snug salva antes um novo instantâneo dos seus favoritos atuais. Tudo fica no seu
dispositivo e o Snug não faz nenhuma requisição de rede.
