import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useModelSelection } from "../../hooks/useModelSelection";
import { createGltfLoader } from "../../lib/gltfLoader";

/**
 * Libera os recursos GPU de uma subárvore Three.js (Convencoes-de-Codigo.md — Regra 2).
 *
 * Vazamento de GPU não aparece no heap do JavaScript, por isso é obrigatório
 * fazer o dispose de geometrias, materiais e texturas ao trocar de modelo ou desmontar.
 */
function disposeSceneResources(object: THREE.Object3D | null): void {
  if (!object) return;

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }

      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => disposeMaterial(mat));
      } else if (child.material) {
        disposeMaterial(child.material);
      }
    }
  });
}

function disposeMaterial(material: THREE.Material): void {
  // Recursos 2D de um material (texturas) também precisam de dispose.
  for (const value of Object.values(material)) {
    if (
      value &&
      typeof value === "object" &&
      "dispose" in value &&
      (value as { isTexture?: boolean }).isTexture
    ) {
      (value as { dispose: () => void }).dispose();
    }
  }
  material.dispose();
}

/**
 * Componente 3D (R3F) que carrega e renderiza o GLB do modelo de óculos/headset
 * atualmente selecionado (Task 7).
 *
 * - Usa `createGltfLoader` de `src/lib/gltfLoader.ts` (suporte a Draco + KTX2 + Meshopt).
 * - Centralizado no Canvas na escala métrica real (~14cm de largura).
 * - Libera integralmente a memória GPU do modelo anterior ao trocar de seleção.
 * - Na Task 8, este componente receberá a matriz de transformação facial para ancoragem.
 */
export default function GlassesModel() {
  const gl = useThree((state) => state.gl);
  const { selectedModel } = useModelSelection();

  const [currentScene, setCurrentScene] = useState<THREE.Group | null>(null);
  const currentSceneRef = useRef<THREE.Group | null>(null);

  // Instância do GLTFLoader configurado com os decoders (Draco / KTX2 / Meshopt)
  const loader = useMemo(() => createGltfLoader(gl), [gl]);

  useEffect(() => {
    let isCurrentRequest = true;

    loader.load(
      selectedModel.path,
      (gltf: GLTF) => {
        if (!isCurrentRequest) {
          // Requisição cancelada antes de terminar — descarta imediatamente
          disposeSceneResources(gltf.scene);
          return;
        }

        // Libera a cena do modelo anterior
        if (currentSceneRef.current) {
          disposeSceneResources(currentSceneRef.current);
        }

        currentSceneRef.current = gltf.scene;
        setCurrentScene(gltf.scene);
      },
      undefined,
      (err) => {
        if (!isCurrentRequest) return;
        console.error(
          `[GlassesModel] Erro ao carregar modelo ${selectedModel.path}:`,
          err,
        );
      },
    );

    return () => {
      isCurrentRequest = false;
    };
  }, [loader, selectedModel.path]);

  // Cleanup geral ao desmontar o componente
  useEffect(() => {
    return () => {
      if (currentSceneRef.current) {
        disposeSceneResources(currentSceneRef.current);
        currentSceneRef.current = null;
      }
    };
  }, []);

  if (!currentScene) {
    return null;
  }

  return (
    <group name="SelectedGlasses" position={[0, 0, 0]}>
      <primitive object={currentScene} />
    </group>
  );
}
