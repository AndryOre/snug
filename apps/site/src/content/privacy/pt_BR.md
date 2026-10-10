---
englishLastUpdated: October 10, 2026
---

# Política de Privacidade do Snug

Última atualização: 10 de outubro de 2026

## Introdução

O Snug se compromete a proteger a sua privacidade. Esta Política de Privacidade
explica as nossas práticas de coleta, uso e divulgação das informações que
recebemos por meio da nossa extensão de navegador.

## Coleta e uso de informações

O Snug não coleta, armazena nem transmite nenhuma informação pessoal sobre seus
usuários. Nossa extensão funciona inteiramente dentro do seu navegador e não
envia nenhum dado a servidores externos.

### Dados dos favoritos

- A extensão acessa os favoritos do seu navegador apenas para exportá-los para
  arquivos HTML, JSON, CSV, Markdown, OPML ou XBEL, ou para importá-los de
  arquivos HTML, JSON, CSV ou XBEL, de um arquivo `Bookmarks` de perfil do
  Chrome ou de uma exportação do Safari. A página Duplicados também lê seus
  favoritos para encontrar cópias do mesmo endereço, e só os exclui quando você
  confirma.
- Esse acesso ocorre apenas quando você inicia explicitamente uma operação de
  importação ou exportação, ou quando uma exportação automática agendada que
  você configurou é executada (veja "Exportação automática" abaixo).
- Os dados dos seus favoritos são processados localmente no seu dispositivo e
  não são transmitidos a nós nem a terceiros.

### Favicons

- Para exibir os ícones dos sites ao lado dos seus favoritos, a extensão lê os
  favicons por meio da API `_favicon` integrada ao navegador. Essa consulta
  busca favicons que o seu navegador já tem em cache e não faz nenhuma
  requisição de rede a nós nem aos sites dos favoritos.

### Exportação automática

- Você pode ativar, se quiser, a exportação automática agendada dos seus
  favoritos. Quando ativada, a extensão exporta seus favoritos no intervalo que
  você configurar e salva os arquivos resultantes sem exibir uma caixa para
  escolher o local de salvamento. Por padrão, eles são gravados diretamente na
  pasta Downloads do seu dispositivo usando o recurso de download do navegador.
  Se você escolher uma pasta personalizada, eles são gravados, em vez disso, em
  uma pasta que você selecionou no seu computador, por meio da File System
  Access API do navegador.
- Isso só acontece se você ativar explicitamente a exportação automática e
  configurar um agendamento; ela vem desativada por padrão.
- Retenção: após cada exportação automática bem-sucedida, o Snug exclui os seus
  próprios arquivos exportados mais antigos que excedam o número que você
  definir (10 por padrão; 0 mantém tudo). Ele só remove arquivos que ele mesmo
  salvou, na pasta Downloads ou na sua pasta personalizada, e nunca toca em
  outros arquivos.
- Pasta personalizada: a pasta que você escolhe fica guardada no seu dispositivo
  para que as exportações automáticas possam continuar gravando nela. O
  navegador pode pedir que você confirme o acesso novamente. Os arquivos nunca
  são enviados a nenhum servidor, e escolher uma pasta não exige nenhuma
  permissão adicional.
- Notificações: se uma exportação automática falhar, o Snug mostra uma
  notificação do sistema no seu dispositivo com o motivo. Você pode desativá-la
  na página Exportação automática. Exportações bem-sucedidas nunca notificam, e
  nenhum conteúdo das notificações sai do seu dispositivo.

## Armazenamento de dados

- O Snug não armazena nenhum dado do usuário, incluindo favoritos, em servidores
  externos.
- Todos os arquivos criados durante a exportação (manual ou automática) são
  salvos diretamente no seu dispositivo local: na pasta Downloads, por meio do
  recurso de download do navegador, ou, nas exportações automáticas, na pasta
  personalizada que você escolheu, por meio da File System Access API do
  navegador. As exportações manuais usam um link `<a download>` padrão e não
  precisam da permissão `downloads`; as exportações automáticas e o arquivo de
  instantâneo de segurança usam a permissão `downloads`.
- A extensão armazena suas preferências e configurações locais — como tema,
  opções de exibição, opções de exportação, o modelo de nome de arquivo e a
  configuração da exportação automática — usando o armazenamento local do
  navegador (`storage.local`). Esses dados ficam no seu dispositivo e nunca são
  transmitidos para lugar nenhum.
- Se você escolher uma pasta personalizada para as exportações automáticas, o
  Snug mantém a referência do navegador a essa pasta (um identificador de pasta,
  não seus favoritos nem o conteúdo da pasta) no armazenamento local do
  navegador da extensão (IndexedDB). Ela fica no seu dispositivo e nunca é
  transmitida para lugar nenhum.
- O Snug pode mostrar no popup um cartão único e dispensável que convida você a
  avaliar a extensão na loja em que ela foi instalada (Chrome Web Store ou
  Microsoft Edge Add-ons) após a sua primeira exportação bem-sucedida. Para
  mostrá-lo apenas uma vez, o Snug armazena dois carimbos de data e hora locais
  em `storage.local`: quando o cartão ficou disponível e quando você o
  dispensou. Eles não contêm conteúdo de favoritos, informações pessoais nem
  identificadores, e nunca são transmitidos para lugar nenhum. O cartão é apenas
  um link: abrir a página da loja é uma escolha sua, e o próprio Snug não faz
  nenhuma requisição de rede para isso.
- Antes de cada importação com "Restaurar — substituir", e sempre que você
  decidir criar um em Configurações, o Snug salva um instantâneo de segurança da
  sua barra de favoritos e de Outros favoritos para que a importação possa ser
  desfeita. Isso armazena o conteúdo dos seus favoritos (títulos, endereços e
  estrutura de pastas) localmente no armazenamento local do navegador, mantendo
  os cinco instantâneos mais recentes, e também salva cada um como arquivo na
  sua pasta Downloads. Ele nunca sai do seu dispositivo.

## Permissões

O Snug solicita as seguintes permissões do navegador, cada uma usada apenas para
a finalidade descrita:

| Permissão          | Finalidade                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bookmarks`        | Ler e gravar os favoritos do seu navegador para permitir a importação e a exportação.                                                                                           |
| `favicon`          | Exibir os ícones dos sites ao lado dos favoritos por meio da API `_favicon` integrada ao navegador.                                                                             |
| `storage`          | Salvar suas preferências e configurações locais no seu dispositivo.                                                                                                             |
| `alarms`           | Agendar e disparar as exportações automáticas de favoritos no intervalo configurado.                                                                                            |
| `downloads`        | Salvar no seu dispositivo as exportações automáticas e os arquivos de instantâneo de segurança, e excluir os arquivos de exportação automática antigos do Snug (Retenção).      |
| `notifications`    | Mostrar uma notificação no seu dispositivo quando uma exportação automática falhar. Você pode desativá-la.                                                                      |
| `unlimitedStorage` | Manter no seu dispositivo os cinco instantâneos de segurança mais recentes dos seus favoritos, que podem ser grandes em bibliotecas extensas.                                   |
| `offscreen`        | Criar um documento oculto de curta duração para que uma exportação automática seja convertida em um arquivo para download. Ele não tem interface e não carrega conteúdo remoto. |

## Serviços de terceiros

Nossa extensão não se integra a nenhum serviço de terceiros nem ferramenta de
análise, nem os utiliza.

## Alterações nesta Política de Privacidade

Podemos atualizar a nossa Política de Privacidade de tempos em tempos.
Avisaremos você sobre quaisquer alterações publicando a nova Política de
Privacidade nesta página e atualizando a data de "Última atualização" no topo
desta política.

## Fale conosco

Se você tiver qualquer dúvida sobre esta Política de Privacidade, entre em
contato conosco:

- Por e-mail: hello@andryore.dev
- Abrindo uma issue no nosso repositório do GitHub:
  https://github.com/AndryOre/snug/issues

## Consentimento

Ao usar o Snug, você consente com a nossa Política de Privacidade e concorda com
os seus termos.
