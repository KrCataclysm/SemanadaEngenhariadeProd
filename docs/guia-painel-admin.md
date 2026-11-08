# Guia do painel de administração (`/admin/`)

Tela por tela, com a função de cada botão. Para a equipe da organização.

## Antes de tudo
- **Acesso**: abra `/admin/`, informe **Seu nome** (aparece no Registro como autor das alterações) e a **Senha de administrador**, e clique em **Entrar**. Várias tentativas erradas bloqueiam o acesso por um tempo.
- **Instalar aplicativo** (aparece quando o navegador permite): coloca o painel na tela inicial como app. No iPhone/iPad: Compartilhar → Adicionar à Tela de Início.
- **Atualizar agora** (faixa que aparece sozinha): há versão nova do painel; clique para carregar.
- **Faixa "Sem conexão"**: sem internet o painel só mostra; qualquer alteração exige conexão.
- **Barra superior (depois do login)**: mostra "Administrador: seu nome", mais:
  - **Abrir scanner**: vai para o scanner de QR da portaria.
  - **Sair**: encerra a sessão neste aparelho.
- **Janela de confirmação** (Cancelar / Confirmar): toda ação sensível pede confirmação antes de executar.

---

## 1. Início — visão geral e inscrições do evento
- **Inscrições no evento**: mostra se estão ABERTAS ou FECHADAS.
  - **Abrir inscrições / Fechar inscrições**: liga ou desliga o formulário de inscrição para o público. Fechar não afeta quem já está inscrito.
- **Números do dia** (cartões): inscritos ativos, inscrições canceladas, e-mails pendentes, e-mails com erro, alertas não lidos e e-mails restantes hoje (cota do Gmail). Ficam destacados quando pedem atenção.
- **Por curso / Por período**: contagem de inscritos.
- **Versão do sistema**: útil para conferir se a atualização foi publicada.
- **Atenção: possíveis duplicidades** (só aparece se houver): pessoas com mesmo nome ou e-mail.
  - **Abrir ficha**: abre a ficha da pessoa para conferir matrícula e, se for cadastro repetido, cancelar um deles.

## 2. Inscritos — lista e ficha
- **Filtrar por nome, matrícula ou e-mail**: filtra a lista na hora enquanto você digita.
- **Lista**: agrupada por período, com contagem; mostra nome, matrícula, curso e e-mail. Selo "Nome repetido" ou situação (ex.: cancelada).
  - **Abrir ficha**: abre a ficha completa logo abaixo.
- **Ficha do inscrito**:
  - Cabeçalho: situação da inscrição e se o QR por e-mail foi enviado.
  - Campos editáveis: nome, curso, período, matrícula, e-mail.
  - **Salvar alterações**: grava as mudanças (se mudou o e-mail, o QR é reenviado ao novo endereço).
  - **Reenviar QR por e-mail**: manda de novo o e-mail de confirmação (há limite de reenvios por pessoa).
  - **Gerar novo QR Code**: cria um QR novo e **invalida o antigo** (inclusive o salvo no celular da pessoa); envia o novo por e-mail. Use se o QR vazou ou foi compartilhado.
  - **Cancelar inscrição no evento**: cancela o inscrito e todas as vagas dele; libera vagas e avança a fila de espera.
  - **Reativar inscrição** (aparece se estiver cancelada): volta a ativa; as vagas em atividades não são restauradas.
- **Atividades (da pessoa)**: lista as atividades dela com situação (confirmada, fila com posição, cancelada).
  - **Cancelar vaga**: tira a pessoa de uma atividade e promove o primeiro da fila.
  - **Seletor + Inscrever nesta atividade**: inscreve a pessoa manualmente (entra na fila se lotada).
- **Presença e portaria**: entradas/saídas e presenças em atividades dessa pessoa (operador, horário, válida/anulada).
- **E-mails enviados ao inscrito**: histórico de e-mails (tipo, situação, tentativas).

## 3. Atividades — vagas e abertura
Cada atividade é um cartão com título, código, dia e horário, e os números: confirmados, vagas restantes e na fila.
- **Vagas máximas**: limite de participantes (vazio = sem limite). Aumentar promove a fila automaticamente.
- **Vagas mínimas**: referência de mínimo para a atividade acontecer.
- **Exige inscrição prévia** (caixa): se desmarcada, a atividade não aparece para inscrição.
- **Inscrições abertas** (caixa): libera a atividade para os participantes escolherem. Marcar já marca "Exige inscrição prévia". Enquanto nenhuma estiver aberta, o botão "Escolher atividades" não aparece para os participantes.
- **Salvar**: grava vagas e caixas daquela atividade.
- **Ver inscritos**: lista de quem está inscrito (nome, matrícula, situação, fila, presença).
  - **Baixar CSV**: baixa essa lista como planilha.
- **Atividades sem inscrição prévia** (seção recolhível): palestras, mesas, credenciamento etc. Para abrir inscrição em uma delas, marque uma das caixas e clique em Salvar.

## 4. Alertas e e-mails
- **E-mails pendentes ou com erro**: fila de envio com tipo, situação, inscrito, tentativas e erro.
  - **Reenviar pendentes agora**: tenta enviar a fila imediatamente (respeita a cota diária do Gmail; o que passar do limite sai no dia seguinte).
- **Alertas recentes**: avisos automáticos do sistema (ex.: falhas, tentativas de PIN, cota), com data e mensagem.

## 5. Registro — quem fez o quê
- Lista as alterações mais recentes: **quando**, **ação** (dados editados, inscrição cancelada/reativada, QR reenviado, novo QR, vaga cancelada, atividade alterada, inscrições abertas/fechadas, e-mails reenviados, cópia de segurança, PIN trocado) e **detalhe**.
- Mostra o nome informado no login. Não guarda senhas nem QR Codes.

## 6. Dados — exportação e segurança
- **Exportar dados**: um **Baixar CSV** para cada tabela: base de análise (uma linha por inscrito), inscritos, inscrições em atividades, portaria, presença, permanência por dia, horas para certificados. Os arquivos têm dados pessoais: guarde com cuidado e apague quando não precisar mais.
- **Cópia de segurança → Criar cópia agora**: cria uma cópia da planilha no Google Drive da conta dona (o sistema já faz uma por dia). Depois aparece **Abrir a cópia criada**. Use antes de alterações grandes.
- **PIN do scanner → Trocar PIN do scanner**: informe o novo PIN (4 a 20 caracteres) e confirme. Quem estiver com o PIN antigo perde o acesso; avise a equipe da portaria. Use se um aparelho foi perdido ou emprestado.

---

## Atalhos de uso no evento
| Situação | Onde resolver |
|---|---|
| Pessoa perdeu o QR | Inscritos → ficha → **Reenviar QR por e-mail** |
| QR vazou / foi compartilhado | Inscritos → ficha → **Gerar novo QR Code** |
| Errou o e-mail ou nome | Inscritos → ficha → editar → **Salvar alterações** |
| Abrir uma oficina | Atividades → definir vagas → marcar **Inscrições abertas** → **Salvar** |
| Atividade lotou | Atividades → aumentar **Vagas máximas** → **Salvar** (fila é promovida) |
| E-mails não saíram | Alertas e e-mails → **Reenviar pendentes agora** (ver cota) |
| Aparelho do scanner perdido | Dados → **Trocar PIN do scanner** |
| Quer lista de presença | Dados → **Baixar CSV** (portaria / presença / permanência) |
