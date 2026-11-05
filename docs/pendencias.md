# Pendências e lembretes

Atualizado em 05/11/2026. Evento: **11, 12 e 13/11/2026**. Estado do sistema: tudo mesclado e publicado (backend `06336e4`).

## 1. Sua parte (antes do evento)
- [ ] Cancelar no painel o cadastro **"Teste Robo"** e as inscrições de teste.
- [ ] **Teste real do e-mail:** painel → Inscritos → ficha de um inscrito de teste → "Reenviar QR por e-mail". Abrir no celular e anotar: em qual app (Gmail, Outlook, Apple Mail…) e o que apareceu (imagem do QR, botão "Abrir meu QR Code" ou anexo).
- [ ] **Teste real da câmera** do scanner em um celular de verdade (portaria entrada/saída e presença em atividade, com e sem internet).
- [ ] Instalar o painel no aparelho da Lilian (Android: "Instalar aplicativo"; iPhone: Compartilhar → Adicionar à Tela de Início).
- [ ] **Cota de e-mail:** conta Gmail comum envia cerca de 100 por dia; com ~200 inscritos só as confirmações já passam disso. Decidir: usar Google Workspace (1500/dia) ou abrir as inscrições em levas.
- [ ] Definir quem fica com o PIN do scanner e com a senha do painel; trocar o PIN pelo painel (Dados) se algum aparelho for perdido.

## 2. Minha parte (próximos passos)
- [ ] **Simulação de pico de inscrições** numa cópia da planilha, sem enviar e-mails (ponto fraco conhecido: escritas em fila, 2 a 3 s cada).
- [ ] **Ensaio geral** com a equipe: inscrição → e-mail → atividades → scanner → painel, antes do dia 11.
- [ ] Conferir a planilha real (só leitura) se você passar o ID da planilha.
- [ ] Desempenho da primeira visita à página de inscrição (o formulário espera a confirmação do sistema; visitas seguintes já abrem na hora).

## 3. Decisão em aberto: Supabase
Objetivo principal: desempenho no evento, dados para minerar depois ou portfólio?
- **A:** evento no sistema atual; Supabase depois (próximas edições).
- **B:** sistema atual manda; dados espelhados no Supabase só para consulta (SQL/dashboards), sem risco ao evento.
- **C:** troca completa agora (exige ensaio geral até 8/11 e plano de volta).
Riscos do Supabase: projeto gratuito pausa após 7 dias sem uso; regras de acesso (RLS) cuidadosas para dados pessoais; e-mail precisaria de outro serviço.

## 4. Depois do evento
- [ ] Revogar o acesso do clasp: myaccount.google.com/permissions.
- [ ] Apagar o segredo `CLASPRC_JSON` no GitHub (e, se quiser, desativar o workflow de deploy).
- [ ] Anonimizar/eliminar os dados pessoais conforme a política de privacidade.
- [ ] Exportar a base de análise e as horas para certificados antes de anonimizar.

## 5. Já entregue (referência)
Inscrição pública, e-mail com QR (imagem, botão e anexo), atividades com fila de espera e conflito de horário, scanner offline (só hashes no aparelho), painel de administração instalável (lista por período, novo QR, registro, duplicidades, backup, PIN do scanner), atualização forçada de todos os aplicativos, QR do participante guardado e ampliado, testes automáticos (lógica, interface, PWA, 14 aparelhos, e-mail, HTML válido) e deploy automático com volta à versão anterior em caso de falha.
