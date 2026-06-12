// Resultado discriminado dos services: a rota só mapeia para HTTP.
// `error` já vem em pt-BR pronto para o contrato { error: string }.

export type Ok<T> = { ok: true; data: T };
export type Err = { ok: false; status: 400 | 403 | 404 | 409; error: string };
export type Result<T> = Ok<T> | Err;

export const ok = <T>(data: T): Ok<T> => ({ ok: true, data });
export const err = (status: Err["status"], error: string): Err => ({
  ok: false,
  status,
  error,
});
