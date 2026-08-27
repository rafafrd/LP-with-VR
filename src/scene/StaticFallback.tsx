/**
 * Fallback estático de 3º nível (docs/vault/05-VR-e-3D/Suporte-de-Dispositivos.md).
 * Renderizado quando:
 * 1. WebGL não está disponível no dispositivo.
 * 2. O usuário ativou prefers-reduced-motion: reduce.
 * 3. A conexão está em modo de economia (navigator.connection.saveData).
 * 4. Enquanto o chunk lazy do Canvas R3F é carregado via Suspense.
 */
export default function StaticFallback() {
  return (
    <div
      className="hero__static-fallback"
      role="img"
      aria-label="Representação visual estilizada do Portal VOID"
    >
      <div className="static-portal">
        <div className="static-portal__ring static-portal__ring--outer" />
        <div className="static-portal__ring static-portal__ring--mid" />
        <div className="static-portal__ring static-portal__ring--inner" />
        <div className="static-portal__core" />
      </div>
    </div>
  );
}
