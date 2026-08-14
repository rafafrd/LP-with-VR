import { XROrigin } from "@react-three/xr";

/**
 * Camada XR dentro do Canvas Three.js / R3F.
 * Gerencia a origem do participante (espaço de referência 'local-floor').
 * Não adiciona movimentação forçada de câmera nem cutscenes.
 */
export default function XRExperience() {
  return (
    <>
      {/* Origem dos pés do usuário no mundo virtual */}
      <XROrigin position={[0, 0, 0]} />
    </>
  );
}
