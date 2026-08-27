/**
 * Wrapper único de eventos de analytics — ver
 * docs/vault/02-Arquitetura/Plano-de-Eventos.md.
 *
 * Stub: nenhum provider está ligado ainda (Umami entra junto da infra de
 * deploy). Em dev, eventos aparecem no console; nada sai da máquina.
 */

export type AnalyticsEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
};

export function track(event: AnalyticsEvent): void {
  if (import.meta.env.DEV) {
    console.debug("[analytics]", event);
  }
}
