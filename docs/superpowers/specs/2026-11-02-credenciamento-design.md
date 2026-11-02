# Sistema de Credenciamento — Semana de Engenharia de Produção

Evento: 11, 12 e 13/11/2026. ~200 inscritos. Prazo: 9 dias a partir de 02/11/2026.

> Status: **rascunho para revisão**. Premissas marcadas com ⚠ ainda precisam de confirmação.

## 1. Arquitetura
- Banco: Google Sheets (conta do organizador). Backend: Google Apps Script publicado como Web App (API JSON) vinculado à planilha.
- Front-end no GitHub Pages (HTTPS): `inscricao/` (formulário público) e `scanner/` (leitor de QR da equipe, protegido por PIN). Identidade visual do evento.
- E-mail enviado pela conta do organizador (GmailApp/MailApp), HTML com identidade visual.
- Custo zero.

## 2. Planilha (abas)
- **Config**: INSCRIÇÕES = ABERTAS/FECHADAS, PIN, e-mail de alertas, nome do evento.
- **Atividades**: id, dia, horário, título, tipo, vagas (vazio = sem limite), exige inscrição, aberta. Editável (palestrantes ainda pendentes).
- **Inscritos**: id, token, nome, curso, período, matrícula (única), e-mail, data/hora, status ATIVA/CANCELADA, status do e-mail ENVIADO/PENDENTE/ERRO, tempo de envio.
- **Inscrições_Atividades**: inscrito, atividade, data/hora, status.
- **Portaria**: log bruto — inscrito, dia, ENTRADA/SAÍDA, data/hora com segundos, operador.
- **Presença_Atividades**: apenas ENTRADA.
- **Permanência**: por pessoa/dia, soma dos pares entrada→saída; "saída pendente" sinalizada.
- **Certificados**: horas finais.
- **Alertas**: duplicidades, falhas de e-mail, vagas esgotadas.
- **Log**: tempos medidos, erros.

Nunca apagar fisicamente: cancelar = mudar status.

## 3. Inscrição
- Campos: nome completo, curso, período, matrícula, e-mail + escolha de atividades com vaga limitada (vagas restantes ao vivo).
- Só aceita envio com INSCRIÇÕES = ABERTAS.
- Controle de vagas com LockService. Visita técnica = 15, minicurso = 45.
- ⚠ Conflito: minicurso e visita técnica (ambos 13/11, 08h–12h) não podem ser escolhidos juntos; oficinas do dia 12 só um turno.
- ⚠ Sem lista de espera.
- Oficinas abrem em fase posterior (preencher vagas e marcar "aberta"; quem já está inscrito escolhe depois e recebe novo e-mail).
- Duplicidade por matrícula: o inscrito vê "você já está inscrito" e o QR é reenviado ao e-mail JÁ cadastrado; o organizador recebe alerta.
- Tela de sucesso mostra o QR na hora.

## 4. E-mail
- Assunto: "Semana de Engenharia de Produção — Sua inscrição está confirmada". Título no corpo: "Semana de Engenharia de Produção".
- Corpo: identidade visual, QR grande e nítido (imagem embutida), nome do inscrito, datas, atividades inscritas, instruções (apresentar o QR na entrada e saída; celular com brilho alto ou impresso; QR pessoal e intransferível).
- Tempo de envio registrado no Log.
- Falha ou cota excedida: inscrição fica PENDENTE; gatilho de tempo reenvia automaticamente quando a cota renovar; organizador avisado por e-mail e na aba Alertas.
- ⚠ Tipo de conta de envio (Gmail comum ≈ 100 e-mails/dia; Workspace maior) ainda não informado.

## 5. Scanner
- PIN validado no servidor.
- **Modo Portaria**: escolhe o dia (1–3), leituras alternam ENTRADA/SAÍDA, mostra nome e status, correção manual.
- **Modo Atividade**: escolhe a atividade, registra só ENTRADA, leitura repetida = "já registrado", sinaliza quem não está inscrito em atividade com inscrição obrigatória.
- Velocidade: carrega a lista de inscritos no início, resultado na hora (alvo < 1 s), gravação em segundo plano com fila local e retentativa; tempos no Log.
- QR contém só token aleatório (nunca a matrícula). Inscrições canceladas são recusadas.

## 6. Administração (menu na planilha "Semana de Eng. Produção")
- Editar dados (validação de matrícula única e e-mail; reenviar QR ao e-mail corrigido).
- Cancelar inscrição no evento (cancela também atividades e libera vagas).
- Cancelar vaga em atividade (libera a vaga).
- Inscrever em oficina/atividade (respeita vagas e conflitos, dispara e-mail).
- Reenviar QR / reprocessar pendentes.
- Recalcular permanência e certificados.

## 7. Certificados
Fora do escopo inicial; dados estruturados e prontos. Horas = permanência por pares entrada→saída (regra exata a definir depois do evento).

## 8. Fora de escopo
Autoedição pelo inscrito, lista de espera, PDF de certificado, múltiplos organizadores com permissões distintas.

## 9. Plano de entrega (9 dias)
1. Planilha estruturada, formulário, vagas, e-mail, alertas, administração.
2. Scanner (Portaria e Atividade).
3. Permanência e certificados (podem terminar após o evento).

## 10. Testes
Concorrência na última vaga, duplicidade por matrícula, inscrições fechadas, e-mail pendente e reenvio após cota, cancelamento liberando vaga, alternância entrada/saída, leitura repetida em atividade, tempos de envio e de leitura.

## 11. Programação (carga inicial da aba Atividades)
**11/11** — Manhã: 09:00 Credenciamento; 10:00 Abertura institucional; 10:30 Palestra magna "Da Indústria 4.0 à Indústria 5.0" (Kaique, a confirmar). Tarde: 14:00 Produção inteligente na prática (SEBRAE, a confirmar); 15:30 Além da produtividade: o fator humano na Indústria 5.0 (Maria Mislene, pendente); 16:30 Mesa-redonda: O engenheiro de produção que o mercado procura (Gerson Rios, Evanderson); 17:50 Coffee break.

**12/11** — Manhã: 08:00 Recepção e Projeto de Extensão; 08:30 Palestra: Currículo Profissional e LinkedIn; 09:30–12:00 Oficina: Construção do Currículo + LinkedIn. Tarde: 14:00 Palestra: Currículo e LinkedIn como vitrine profissional; 15:00–16:30 Oficina (2º turno); 16:30 Pitches de um minuto (5 a 10 pessoas); 17:30 Desafio final "Meu Perfil Profissional em 60 segundos".

**13/11** — Manhã (08:00–12:00): Minicurso IA para análise de dados (Alexandre Barros dos Santos; 45 vagas) **ou** Visita técnica Só Aço (15 vagas). Tarde: 14:00 IA como assistente de trabalho (Lucas Costa); 15:00 IA e Decisões Orientadas por Dados (Prof. Vinicius Piau); 16:00 Mesa-redonda: Desafios e oportunidades para a transformação digital das empresas piauienses (Ricardo Lira, Flávio/SENAI, Gesella Ribeiro, Cledma); 17:50 Coffee break e encerramento.

## 12. Observações técnicas
- GitHub Pages gratuito exige repositório público: nenhum segredo (PIN) no front-end.
- Identidade visual: azul #0F1B2D, laranja #D65B1F, bege #D9D1C8, cinza #8C8C8C, grafite #222222; fontes Sora (títulos) e Inter (textos). Logo/arquivo ainda não enviado — se não vier, recriar a marca em CSS/SVG simples.

## 13. Pendências para a revisão
1. Premissas ⚠ (conflito minicurso × visita, sem lista de espera, oficinas em dois turnos).
2. Vagas das oficinas.
3. Tipo de conta de envio (Gmail comum × Workspace).
4. Envio do logo (SVG/PNG).
