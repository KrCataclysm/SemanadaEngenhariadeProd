# Sistema de Credenciamento — Semana de Engenharia de Produção

Evento: 11, 12 e 13/11/2026. ~200 inscritos. Prazo: 9 dias a partir de 02/11/2026.
Realização: CAEPRO (Centro Acadêmico de Engenharia de Produção — UFPI).

> Status: **rascunho revisado (v2)**. Itens marcados com ⚠ são decisões propostas que ainda precisam de confirmação.

## 1. Arquitetura
- Banco: Google Sheets (conta do organizador). Backend: Google Apps Script publicado como Web App (API JSON) vinculado à planilha.
- Front-end no GitHub Pages (HTTPS): `inscricao/` (inscrição no evento e inscrição em atividades) e `scanner/` (leitor de QR da equipe, protegido por PIN).
- E-mail enviado pela conta Gmail comum do organizador (limite ≈ 100 e-mails/dia). Custo zero.
- Identidade visual do evento (paleta e fontes na seção 12) + logo da CAEPRO (`assets/logo-caepro.png`).

## 2. Planilha (abas)
- **Config**: INSCRIÇÕES = ABERTAS/FECHADAS, PIN, e-mail de alertas, nome do evento, contatos da CAEPRO.
- **Atividades**: id, dia, início, fim, título, tipo, **vagas máximas**, **vagas mínimas**, **inscrições abertas (SIM/NÃO)**, exige inscrição. Colunas calculadas pelo sistema: ocupadas, restantes, na fila. Editável a qualquer momento.
- **Inscritos**: id, token, nome, curso, período, matrícula (única), e-mail, data/hora, status ATIVA/CANCELADA, status do e-mail ENVIADO/PENDENTE/ERRO, tempo de envio.
- **Inscrições_Atividades**: inscrito, atividade, data/hora, status **CONFIRMADA / FILA / CANCELADA**, posição na fila.
- **Portaria**: log bruto — inscrito, dia, ENTRADA/SAÍDA, data/hora com segundos, operador.
- **Presença_Atividades**: apenas ENTRADA.
- **Permanência**: por pessoa/dia, soma dos pares entrada→saída; "saída pendente" sinalizada.
- **Certificados**: horas finais.
- **Alertas**: duplicidades, falhas de e-mail, pendências de envio, vagas esgotadas, atividade abaixo do mínimo.
- **Log**: tempos medidos, erros.

Nunca apagar fisicamente: cancelar = mudar status.

## 3. Inscrição no evento (fase 1)
- Campos: nome completo, curso, período, matrícula, e-mail. **Sem escolha de atividades nesta etapa.**
- Só aceita envio com INSCRIÇÕES = ABERTAS.
- Duplicidade por matrícula: a pessoa vê a mensagem de que já está inscrita, o QR é reenviado ao e-mail JÁ cadastrado e o organizador recebe alerta.
- **Tela de sucesso** (texto formal, completo): confirma a inscrição; exibe o QR na hora (com orientação para salvá-lo ou fazer captura de tela); informa que o e-mail de confirmação foi enviado e **pode demorar a chegar**; orienta a verificar caixa de spam e os dados informados; para qualquer dúvida, indica contato com a CAEPRO (Instagram e e-mail, seção 4).
- A pessoa **nunca é avisada de que sua inscrição está pendente**; isso é tratado só pelo organizador (seção 5).

## 4. Textos e contato
Todos os textos (tela, e-mails, erros) em tom formal, frases completas, sem ambiguidade, informando sempre o próximo passo. Toda mensagem termina com o canal de contato: "Em caso de dúvidas, entre em contato com a CAEPRO:" Instagram https://www.instagram.com/caeproufpi e e-mail caepro.ufpi1@gmail.com.

## 5. Atividades (fase 2, abertas pelo organizador)
Visita técnica, minicurso, oficinas e demais atividades com inscrição são abertas **quando o organizador quiser**, marcando "inscrições abertas = SIM" na aba Atividades (cada atividade separadamente).
- Acesso (principal): **link pessoal** enviado no e-mail de confirmação e exibido na tela de sucesso (carrega o mesmo código secreto do QR). A pessoa clica em "Escolher atividades", entra já identificada e escolhe entre as atividades abertas. Só quem tem inscrição ATIVA no evento acessa.
- Acesso (alternativo): o organizador localiza o inscrito pelo nome na planilha e o inscreve manualmente (menu Administração, seção 9), respeitando vagas, conflitos e fila.
- **Controle de vagas automático**: ocupadas/restantes calculadas pelas inscrições CONFIRMADAS. O organizador pode alterar vagas máximas e mínimas a qualquer momento. Aumentar o máximo promove automaticamente a fila; diminuir abaixo do já ocupado não cancela ninguém (alerta ao organizador). ⚠ "Mínimo" = número mínimo para a atividade acontecer: o organizador recebe alerta quando a atividade está abaixo do mínimo no fechamento.
- Concorrência tratada com LockService (a última vaga nunca é concedida duas vezes).
- **Conflito de horário**: a mesma pessoa não pode ter duas atividades CONFIRMADAS ou em FILA cujos horários se sobreponham no mesmo dia (vale para minicurso × visita técnica, os dois turnos de oficina etc.). A tela explica o motivo da recusa.
- Cada nova confirmação envia e-mail com as atividades atualizadas e o QR.

## 6. Lista de espera
- Atividade lotada: a pessoa entra na **FILA**, em ordem de chegada, e é avisada por e-mail e na tela com a **posição**.
- Quando uma vaga é liberada (inscrição de atividade ou do evento cancelada/inativa, ou aumento do máximo), o primeiro da fila é promovido a CONFIRMADA **automaticamente** e recebe e-mail: saiu da fila de espera e entrou na atividade. Se o promovido tiver conflito de horário no momento, é pulado e permanece na fila (⚠).
- ⚠ Para poupar a cota de e-mails, mudanças de posição na fila **não** geram e-mail; a posição atual pode ser consultada na página de atividades, pelo link pessoal (alternativa válida). Só geram e-mail: entrada na fila e promoção.
- A fila é visível ao organizador na planilha.

## 7. E-mail
- Assunto: "Semana de Engenharia de Produção — Sua inscrição está confirmada" (variações para atividade confirmada, fila e promoção, sempre iniciando por "Semana de Engenharia de Produção"). Título no corpo: "Semana de Engenharia de Produção".
- Corpo: identidade visual, logo da CAEPRO, QR grande e nítido (imagem embutida), nome do inscrito, datas, atividades confirmadas/em fila, instruções (apresentar o QR na entrada e saída; celular com brilho alto ou impresso; QR pessoal e intransferível), contato da CAEPRO.
- Tempo de envio registrado no Log.
- **Falha ou cota excedida**: inscrição fica PENDENTE; gatilho de tempo reenvia automaticamente quando a cota renovar; **somente o organizador** é avisado (e-mail + aba Alertas). Prioridade de reenvio: confirmação de inscrição > promoção da fila > demais.
- ⚠ Risco: Gmail comum ≈ 100 e-mails/dia. Se muitas inscrições ocorrerem no mesmo dia, parte dos e-mails atrasa; por isso o QR também aparece na tela de sucesso.

## 8. Scanner
- PIN validado no servidor.
- **Modo Portaria**: escolhe o dia (1–3), leituras alternam ENTRADA/SAÍDA, mostra nome e status, correção manual.
- **Modo Atividade**: escolhe a atividade, registra só ENTRADA, leitura repetida = "já registrado", sinaliza quem não tem vaga CONFIRMADA em atividade com inscrição obrigatória.
- Velocidade: carrega a lista de inscritos no início, resultado na hora (alvo < 1 s), gravação em segundo plano com fila local e retentativa; tempos no Log.
- QR contém só token aleatório (nunca a matrícula). Inscrições canceladas são recusadas.

## 9. Administração (menu na planilha "Semana de Eng. Produção")
- Editar dados (validação de matrícula única e e-mail; reenviar QR ao e-mail corrigido).
- Cancelar inscrição no evento (cancela também atividades, libera vagas e promove a fila).
- Cancelar vaga em atividade (libera a vaga e promove a fila).
- Inscrever alguém manualmente em atividade (respeita vagas e conflitos).
- Reenviar QR / reprocessar pendentes.
- Recalcular permanência e certificados.

## 10. Certificados
Fora do escopo inicial; dados estruturados e prontos. Horas = permanência por pares entrada→saída (regra exata a definir depois do evento).

## 11. Fora de escopo
Autoedição pelo inscrito, PDF de certificado, múltiplos organizadores com permissões distintas.

## 12. Identidade visual e observações técnicas
- Cores: azul #0F1B2D, laranja #D65B1F, bege #D9D1C8, cinza #8C8C8C, grafite #222222; fontes Sora (títulos) e Inter (textos).
- Logo da CAEPRO recebida como captura de tela e recortada (486×486 px, `assets/logo-caepro.png`); serve para o cabeçalho e o e-mail. Se houver arquivo original (SVG/PNG alta resolução), substituir. A marca do evento (ícone azul-marinho/laranja) será recriada em CSS/SVG simples, se o arquivo não for enviado.
- GitHub Pages gratuito exige repositório público: nenhum segredo (PIN) no front-end.

## 13. Plano de entrega (9 dias)
1. Planilha estruturada, inscrição no evento, e-mail, alertas, administração.
2. Inscrição em atividades (vagas, conflito, fila) — pronta antes de abrir as atividades.
3. Scanner (Portaria e Atividade) — pronto antes de 11/11.
4. Permanência e certificados (podem terminar após o evento).

## 14. Testes
Concorrência na última vaga, duplicidade por matrícula, inscrições fechadas, atividade fechada/aberta, conflito de horário (inclusive sobreposição parcial), entrada na fila e posição, promoção automática ao cancelar, promoção ao aumentar vagas, e-mail pendente e reenvio após cota (sem aviso ao inscrito), alternância entrada/saída, leitura repetida em atividade, tempos de envio e de leitura.

## 15. Programação (carga inicial da aba Atividades)
**11/11** — Manhã: 09:00 Credenciamento; 10:00 Abertura institucional; 10:30 Palestra magna "Da Indústria 4.0 à Indústria 5.0" (Kaique, a confirmar). Tarde: 14:00 Produção inteligente na prática (SEBRAE, a confirmar); 15:30 Além da produtividade: o fator humano na Indústria 5.0 (Maria Mislene, pendente); 16:30 Mesa-redonda: O engenheiro de produção que o mercado procura (Gerson Rios, Evanderson); 17:50 Coffee break.

**12/11** — Manhã: 08:00 Recepção e Projeto de Extensão; 08:30 Palestra: Currículo Profissional e LinkedIn; 09:30–12:00 Oficina: Construção do Currículo + LinkedIn. Tarde: 14:00 Palestra: Currículo e LinkedIn como vitrine profissional; 15:00–16:30 Oficina (2º turno); 16:30 Pitches de um minuto (5 a 10 pessoas); 17:30 Desafio final "Meu Perfil Profissional em 60 segundos".

**13/11** — Manhã (08:00–12:00): Minicurso IA para análise de dados (Alexandre Barros dos Santos) e Visita técnica Só Aço (conflitam entre si). Tarde: 14:00 IA como assistente de trabalho (Lucas Costa); 15:00 IA e Decisões Orientadas por Dados (Prof. Vinicius Piau); 16:00 Mesa-redonda: Desafios e oportunidades para a transformação digital das empresas piauienses (Ricardo Lira, Flávio/SENAI, Gesella Ribeiro, Cledma); 17:50 Coffee break e encerramento.

Vagas e valores mínimo/máximo: definidos pelo organizador na aba Atividades (sem valor fixo no código).

## 16. Decisões confirmadas na revisão
1. Acesso às atividades: link pessoal (principal) + inscrição manual pelo organizador (alternativa).
2. "Vagas mínimas" = mínimo para a atividade acontecer (só gera alerta).
3. E-mail de fila só na entrada e na promoção; posição atual consultável na página.
