---
description: Para o servidor local de desenvolvimento (web_v2 / Vite)
---

Pare o servidor de desenvolvimento do Grifo que estiver rodando.

Passos:

1. Se você iniciou o dev server nesta sessão via background task, pare-o pelo
   `task_id` com a ferramenta de stop de tasks — é o jeito mais limpo.

2. Caso contrário (ou em dúvida), encontre e finalize o processo que escuta a
   porta do Vite (8080 por padrão; ajuste se o `/dev` reportou outra):

   ```bash
   lsof -ti tcp:8080 | xargs -r kill
   ```

   Se ainda resistir, force:

   ```bash
   lsof -ti tcp:8080 | xargs -r kill -9
   ```

3. Confirme que a porta ficou livre e reporte ao usuário:

   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 --max-time 3 || echo "DOWN (porta livre)"
   ```

   - `DOWN`/`000` = servidor parado com sucesso.
   - `200` = ainda há algo no ar; investigue (pode ser outra porta/processo).

Notas:
- Não mate processos de porta sem confirmar que são o dev server (`lsof -i tcp:8080`
  mostra o comando antes de finalizar, se quiser inspecionar).
- Se o `/dev` reportou uma porta diferente de 8080, troque `8080` por ela.
