---
title: Perguntas frequentes
sourceHash: 304e0622b68c13d7
description:
  'Respostas às dúvidas mais comuns sobre o Snug: importar vários arquivos,
  permissões, formatos e navegadores compatíveis, segurança e pastas de backup.'
seoTitle: 'FAQ do Snug: formatos, navegadores e backups'
---

Respostas curtas para as perguntas mais comuns sobre o Snug.

## Posso importar vários arquivos de uma vez?

Sim. Escolha ou solte vários arquivos na página Importar ou no pop-up da barra
de ferramentas e o Snug os importa de uma só vez.

## Por que ele precisa de acesso a todos os meus favoritos?

Ler e gravar os favoritos é a única forma de uma extensão exportá-los e
importá-los. O Snug não faz chamadas de rede, então nada do que ele lê pode sair
do seu dispositivo.

## Quais formatos ele aceita?

Exporte em HTML, JSON, CSV, Markdown, OPML ou XBEL. Importe HTML, JSON, CSV ou
XBEL, um arquivo "Bookmarks" de um perfil do Chrome ou uma exportação do Safari.

## Em quais navegadores funciona?

No Chrome e em outros navegadores baseados em Chromium, como Edge, Brave e
Opera.

## É seguro instalar a extensão de um desenvolvedor independente?

O código-fonte é público, o CodeQL o analisa, o projeto tem os selos OpenSSF
Scorecard e Best Practices, e a CI usa versões fixadas. Julgue você mesmo no
repositório público.

## Os backups podem ir para uma pasta diferente de Downloads?

Sim. Na página [Exportação automática](auto-export.md), escolha uma pasta
personalizada. Depois de reiniciar o Chrome, ele pede uma vez que você confirme
o acesso; escolha "Permitir em todas as visitas" para que as execuções sem
supervisão continuem funcionando. Se faltar o acesso, o Snug avisa e a execução
falha em vez de salvar em outro lugar.
