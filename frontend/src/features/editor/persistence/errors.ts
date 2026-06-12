/**
 * Limite de salvamento atingido (rascunho anônimo ou plano gratuito).
 * A UI converte em upsell — nunca em erro genérico.
 */
export class PlanLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanLimitError";
  }
}
