\---
description: Sobe o servidor local de desenvolvimento (web_v2) e abre no navegador
---

Suba o servidor de desenvolvimento do Grifo e confirme que está no ar.

Passos:

1. Verifique se já há algo escutando (o Vite sobe em `localhost:8080` por
   padrão — o `vite.config.ts` usa o preset Lovable, não a porta 3000 citada no
   CLAUDE.md):

   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 --max-time 3 || echo "DOWN"
   ```

   - Se responder `200`, o servidor já está rodando — só informe a URL e pare.
   - Se `DOWN`/`000`, siga para o passo 2.

2. Inicie o dev server **em background**, de dentro de `web_v2/`:

   ```bash
   cd web_v2 && npm run dev
   ```

   Use `run_in_background: true` no Bash — o processo precisa continuar vivo
   após o comando retornar.

3. Aguarde o "ready" e descubra a porta real lendo o output do processo
   (o Vite imprime `Local: http://localhost:<porta>/`). Não fixe 8080 às cegas:
   se a porta estiver ocupada, o Vite escolhe outra.

4. Confirme que está no ar e reporte a URL final ao usuário:

   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:<porta> --max-time 5
   ```

Notas:
- Rode **sempre de dentro de `web_v2/`** (`npm run dev`).
- Deixe o processo rodando em background — não o finalize ao terminar.
