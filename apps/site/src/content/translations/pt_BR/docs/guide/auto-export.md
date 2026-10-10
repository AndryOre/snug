---
title: Exportação automática
sourceHash: 5eb2acaa2e4867cc
---

O Snug pode exportar seus favoritos em um agendamento, sem nenhuma ação manual:

1. Abra a página **Exportação automática** do app.
2. Ative a exportação automática e escolha um ou mais dos seis formatos, onde
   salvá-los (Downloads ou uma Pasta personalizada), um intervalo e, se quiser,
   um caminho de subpasta para os arquivos exportados. Os intervalos são de hora
   em hora, a cada 12 horas, diário, a cada 3 dias ou semanal. As execuções
   diárias, a cada 3 dias e semanais acontecem em um horário preferido; as
   semanais também permitem escolher o dia. As execuções de hora em hora e a
   cada 12 horas ignoram o horário.
3. A partir daí, a extensão exporta seus favoritos nesse agendamento e salva os
   arquivos direto no lugar que você escolheu, Downloads por padrão, sem caixa
   de diálogo para salvar nem confirmações extras. Se o navegador estava fechado
   ou a extensão indisponível quando uma exportação agendada venceu, ela é
   recuperada automaticamente logo depois que o navegador iniciar de novo, em
   vez de esperar o próximo horário agendado.

**Salvar em** define o destino. **Downloads** (o padrão) salva na pasta
Downloads do navegador. **Pasta personalizada** salva em uma pasta que você
escolhe em qualquer lugar do computador: selecione **Escolher pasta…** e,
depois, **Alterar pasta** para escolher outra. Selecione **Downloads** de novo a
qualquer momento para voltar. O caminho da subpasta é relativo ao destino, então
nomeia uma pasta dentro da pasta escolhida. Se já existir um arquivo com o mesmo
nome, o Snug acrescenta o sufixo " (1)" e nunca o sobrescreve.

Depois da primeira reinicialização do navegador, o Chrome pede uma vez que você
confirme o acesso à Pasta personalizada. Escolha "Permitir em todas as visitas"
para que as execuções sem supervisão continuem funcionando.

Se faltar o acesso à pasta, o Snug avisa quando o navegador inicia. O popup e a
página **Exportação automática** mostram então "Acesso à pasta necessário" com
um botão **Permitir acesso**. Até você permitir o acesso, as execuções falham e
nada é salvo em Downloads no lugar.

**Manter as últimas N execuções** (Retenção, padrão 10) limita quantas
exportações se acumulam: depois de cada execução bem-sucedida, o Snug mantém as
N execuções mais recentes entre Downloads e a Pasta personalizada e exclui os
arquivos das suas próprias execuções mais antigas (todos os formatos de uma
execução mantida permanecem). Os arquivos salvos em Downloads também perdem suas
entradas no histórico de downloads do navegador. Ele só remove arquivos que o
próprio Snug salvou, nunca outros arquivos da pasta, e um arquivo que você já
excluiu ou moveu é simplesmente ignorado. Depois de trocar de pasta, os arquivos
da pasta antiga ficam como estão. Uma execução com falha não exclui nada. Defina
0 para manter tudo.

**Avisar-me quando uma exportação falhar** (ativado por padrão) mostra uma
notificação do sistema, com o título "Snug · Falha na exportação automática" e o
motivo, quando uma execução falha. Ao clicar nela, a página Exportação
automática abre. Execuções bem-sucedidas nunca notificam, e falhas repetidas
substituem a notificação anterior em vez de se empilhar. Uma execução agendada
ou de recuperação com falha também coloca um selo "!" no ícone da barra de
ferramentas até que uma execução seja bem-sucedida.

As alterações na página **Exportação automática** são salvas automaticamente. O
cartão de status mostra sempre o estado real do agendamento, independentemente
de qualquer alteração ainda não salva abaixo dele:

- **Última execução**: quando a exportação automática foi executada pela última
  vez, com o resultado e, em caso de falha, a mensagem de erro armazenada. O
  popup também mostra a próxima execução, ou um aviso de falha, na linha de
  status da exportação automática.
- **Próxima execução**: quando ela vence de novo, ou "A exportação automática
  está desativada" se a exportação automática estiver desativada no momento.

**Exportar agora** executa uma exportação imediatamente usando os formatos e o
caminho que estão na tela, mesmo que a chave Ativar esteja desligada. Mostra um
indicador de carregamento durante a execução e uma breve mensagem de sucesso ou
erro quando termina; a linha "Última execução" do cartão de status é atualizada
para refletir isso. Executá-la nunca altera seu agendamento automático nem o
horário da próxima execução.
