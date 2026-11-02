# Roteiro de publicação (Fase 1)

Tempo estimado: 15 minutos. Faça com a conta Google que enviará os e-mails.

## 1. Planilha e Apps Script
1. Crie uma planilha nova no Google Sheets (nome sugerido: "Semana de Eng. Produção").
2. Menu **Extensões → Apps Script**. Apague o código padrão.
3. Para cada arquivo da pasta `apps-script/` deste repositório, crie um arquivo de mesmo nome (sem a extensão `.gs` no nome do arquivo do editor) e cole o conteúdo: `Config`, `Db`, `Setup`, `Inscricao`, `Atividades`, `Email`, `Api`, `Admin`, `Qrcode`.
4. Em **Configurações do projeto**, marque "Mostrar o arquivo de manifesto appsscript.json" e substitua o conteúdo pelo de `apps-script/appsscript.json`.
5. Salve, volte à planilha e **recarregue a página**. Aparece o menu **Semana de Eng. Produção**.
6. Menu → **Configurar planilha (primeira vez)** e aceite as permissões do Google (planilha, envio de e-mail, interface). Se aparecer "app não verificado": Avançado → Acessar (é o seu próprio script).
7. Na aba **Config**, preencha `SITE_URL` (endereço do GitHub Pages, passo 3), `EMAIL_ALERTAS` e `PIN`.
8. Menu → **Ativar envio automático (gatilho)**.

## 2. Publicar o Web App
1. No Apps Script: **Implantar → Nova implantação → Tipo: App da Web**.
2. Executar como: **Eu**. Quem pode acessar: **Qualquer pessoa**.
3. Copie a **URL do app da Web** (termina em `/exec`) e me envie.
   - A cada mudança no código, use **Implantar → Gerenciar implantações → Editar → Nova versão** (a URL se mantém).

## 3. GitHub Pages
1. No GitHub: Settings → Pages → Source: *Deploy from a branch* → branch `main`, pasta `/ (root)` → Save.
2. O endereço será `https://krcataclysm.github.io/SemanadaEngenhariadeProd` (confirme na própria tela).
3. Eu coloco a URL do Web App em `inscricao/config.js`; depois do merge, o site fica no ar em `…/inscricao/`.

## 4. Teste real (checklist)
- [ ] Com `INSCRICOES = FECHADAS`, a página mostra o aviso e não deixa enviar.
- [ ] Mude para `ABERTAS`, faça uma inscrição com seu e-mail: o QR aparece na tela e o e-mail chega com QR, título e contato da CAEPRO.
- [ ] Repita a mesma matrícula: aparece "já inscrito" e o e-mail é reenviado; você recebe o alerta (em até 30 min).
- [ ] Na aba **Atividades**, defina `vagas_max` (ex.: 1) e `inscricoes_abertas = SIM` em uma atividade; use o link pessoal do e-mail e inscreva-se. Com uma 2ª pessoa de teste, confira a fila e a posição.
- [ ] Cancele a vaga da 1ª pessoa (menu → Cancelar vaga em atividade): a 2ª é promovida e recebe e-mail.
- [ ] Tente duas atividades no mesmo horário (minicurso × visita): o sistema recusa com explicação.
- [ ] Apague as inscrições de teste (ou crie outra planilha limpa) antes de abrir ao público.

## 5. Scanner (Fase 2)
**Atualizar o backend (obrigatório, pois o código mudou):**
1. Apps Script: apague o código atual, cole o novo `Codigo.gs` e salve.
2. Planilha: menu **Configurar planilha (primeira vez)** de novo. Não apaga dados; só atualiza os cabeçalhos das abas Portaria e Presenca_Atividades.
3. **Implantar → Gerenciar implantações → lápis → Versão: Nova versão → Implantar.** A URL continua a mesma.
4. Aba **Config**: defina o `PIN` (obrigatório; sem PIN o scanner recusa todos).

**Usar:** `…/scanner/` no celular (Chrome/Safari), informe seu nome e o PIN, escolha **Portaria** (dia) ou **Atividade**, toque em *Iniciar leitura* e permita a câmera.

**Checklist de teste do scanner**
- [ ] PIN errado é recusado; PIN certo carrega a lista de inscritos.
- [ ] Portaria: 1ª leitura = ENTRADA (verde), 2ª = SAÍDA (azul); a linha aparece na aba Portaria com segundos e seu nome.
- [ ] Modo avião: leitura continua funcionando; ao reconectar, "Pendentes de envio" volta a 0 e as linhas chegam na planilha.
- [ ] Atividade com inscrição obrigatória: quem não está confirmado vê o aviso laranja e o botão "Registrar mesmo assim".
- [ ] Leitura repetida na atividade mostra "Já registrado".
- [ ] "Desfazer última leitura" marca a linha como ANULADO (não apaga).
- [ ] "Buscar por nome" registra quando o QR não puder ser lido.
- [ ] Menu → **Recalcular permanência e certificados** preenche as abas Permanencia e Certificados.
