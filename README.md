# Semana de Engenharia de Produção — Credenciamento

Sistema de inscrição e credenciamento da **Semana de Engenharia de Produção** (11, 12 e 13/11/2026), realizada pela CAEPRO — UFPI.
Custo zero: **Google Sheets** (banco e painel do organizador) + **Google Apps Script** (API, e-mails e regras) + **GitHub Pages** (páginas públicas).

## Estrutura
| Pasta | Conteúdo |
|---|---|
| `index.html`, `inscricao/` | Páginas públicas: inscrição no evento, escolha de atividades (link pessoal) e privacidade |
| `admin/` | Painel de administração (senha própria): inscritos, atividades, vagas, alertas e exportação |
| `scanner/` | Aplicativo da equipe (instalável, funciona offline): leitura de QR, portaria e presença em atividades |
| `apps-script/` | Backend (`*.gs`) e `dist/Codigo.gs`, arquivo único para colar no editor do Apps Script |
| `assets/` | CSS, fontes hospedadas no próprio site, logos e ícones |
| `tests/` | Testes da lógica (33 cenários), decodificação de QR e auditoria de interface (WCAG AA, 9 tamanhos de tela) |
| `docs/` | Especificação, plano e **roteiro de publicação** (`docs/publicacao.md`) |

## Comandos
```bash
npm test            # lógica: inscrição, vagas, conflito, fila, e-mails, scanner, permanência
npm run test:ui     # responsividade e acessibilidade (requer: npm install && npx playwright install chromium)
npm run build       # regenera apps-script/dist/Codigo.gs
```

## Operação (resumo)
- **Abrir/fechar inscrições:** aba `Config` → `INSCRICOES` (ABERTAS/FECHADAS). Atividades: aba `Atividades` → `inscricoes_abertas`, `vagas_max`, `vagas_min`.
- **Cancelamentos, reenvio de QR, inscrição manual e recálculo de permanência:** menu **Semana de Eng. Produção** na planilha.
- **Publicação e testes:** `docs/publicacao.md`.

Componentes de terceiros: `THIRD_PARTY_NOTICES.md`.
