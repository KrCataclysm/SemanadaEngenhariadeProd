# Roteiro geral — Credenciamento da Semana de Engenharia de Produção

Semana: 11 a 13/11/2026 · CAEPRO/UFPI · ~200 inscritos · custo zero (Google Planilhas + Apps Script + GitHub Pages)

## 1. Visão em uma frase
O participante se inscreve no site, recebe um **QR Code pessoal** por e-mail, e a equipe **lê o QR na entrada/saída** para registrar presença. Tudo cai numa planilha que serve de banco de dados e gera os certificados no fim.

## 2. As 4 peças
| Peça | Quem usa | Para quê |
|---|---|---|
| **Site de inscrição** (`/inscricao/`) | Participante | Fazer a inscrição, ver/ampliar o "Meu QR", escolher atividades (quando abertas) |
| **Scanner** (`/scanner/`) | Equipe na porta | Ler QR, registrar ENTRADA/SAÍDA, funciona com internet instável |
| **Painel admin** (`/admin/`) | Organização (Lilian e equipe) | Controlar inscritos, atividades, alertas, e-mails, dados |
| **Planilha** | Organização | Banco de dados: Inscritos, Portaria, Presença, Atividades, E-mails, Permanência, Certificados |

## 3. Jornada do participante
1. Preenche o formulário (nome, matrícula, curso etc.).
2. Vê o QR na tela + aviso "Novidades em breve: acompanhe o Instagram da CAEPRO".
3. Recebe **e-mail de confirmação** com o QR (imagem embutida + anexo + botão "Abrir meu QR Code").
4. O QR fica **salvo no aparelho** e abre mesmo sem internet (página "Meu QR", com botão de ampliar).
5. Quando a organização **abre uma atividade**, aparece o botão **"Escolher atividades"** (na tela do QR e no e-mail) — sem novo e-mail.
6. No evento: apresenta o QR na entrada e na saída.

## 4. Operação no evento (credenciamento)
1. Antes: abrir o scanner no celular, informar o **PIN do scanner**, carregar a lista (fica no aparelho só como *hash*, não como dados abertos).
2. Na porta: apontar a câmera para o QR → o sistema mostra **nome/matrícula** e registra.
3. **ENTRADA ou SAÍDA** é definida pela ordem dos horários (1ª leitura entra, 2ª sai, e assim por diante).
4. Leitura repetida/duplicada é ignorada (idempotente); é possível **desfazer** uma leitura.
5. Sem internet: o scanner guarda as leituras e envia quando a conexão volta.
6. Vários aparelhos ao mesmo tempo (ex.: 3 organizadores) funcionam; o servidor serializa as gravações.
7. Fim do dia/evento: **"Sair e limpar este aparelho"** apaga a lista local (segurança). Não é necessário a cada dia se o aparelho ficar com a equipe; use ao devolver/trocar de pessoa ou no fim do evento.

## 5. Painel admin (abas)
- **Início**: resumo (inscritos, presenças, pendências).
- **Inscritos**: lista por período, com filtro instantâneo; editar, **gerar novo QR** (invalida o anterior), reenviar QR.
- **Atividades**: abrir/fechar inscrição, vagas, "exige inscrição". Abrir faz o botão aparecer para os participantes.
- **Alertas e e-mails**: fila de envio, falhas, cota diária do Gmail.
- **Registro**: histórico de alterações feitas no painel.
- **Dados**: duplicidades, backup/cópia sob demanda, troca do PIN do scanner.
- Acesso protegido por **PIN do admin** (com bloqueio após tentativas erradas). Instalável como app (PWA).

## 6. Depois do evento
- Permanência calculada a partir das entradas/saídas → aba **Permanência**.
- **Certificados** gerados pelos critérios definidos (presença/permanência).
- Limpeza: revogar acesso de publicação (clasp), apagar o segredo `CLASPRC_JSON`, anonimizar/arquivar dados.

## 7. Segurança e confiabilidade (o que dizer à equipe)
- QR contém um token longo e imprevisível; o scanner só guarda **hash**.
- PINs com bloqueio por tentativas erradas; ações do painel registradas.
- Atualização automática dos apps (sem versão velha em cache); deploy com checagem e **rollback automático**.
- Testes automatizados (lógica, simulação de evento com 200 pessoas, interface, responsividade) rodam a cada mudança.

## 8. Limites e cuidados
- **Cota de e-mail do Gmail (~100/dia)**: inscrições em levas; as demais ficam na fila e saem no dia seguinte.
- Definir **vagas** das atividades antes de abri-las.
- Não testado em condições reais: câmera em todos os modelos de celular, iOS Safari, concorrência real no Google. **Fazer um ensaio geral** (ver abaixo).

## 9. Ensaio geral sugerido (véspera)
1. 3 pessoas da equipe se inscrevem com e-mails reais → conferir e-mail (claro/escuro) e QR.
2. Cada organizador abre o scanner no próprio celular, loga com PIN e lê QRs dos colegas.
3. Testar entrada, saída, leitura repetida e desfazer; testar modo avião e voltar.
4. Abrir uma atividade no painel → conferir botão "Escolher atividades" no celular de teste.
5. Conferir planilha (Portaria/Presença) e **apagar os cadastros de teste**.
6. Combinar quem fica em qual porta e quem responde dúvidas/problemas.
