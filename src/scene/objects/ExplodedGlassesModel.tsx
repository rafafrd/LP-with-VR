import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useModelSelection } from "../../hooks/useModelSelection";
import { createGltfLoader } from "../../lib/gltfLoader";

export type RenderMode = "pbr" | "wireframe" | "clay";

export type ComponentSpec = {
  id: string;
  name: string;
  category: string;
  material: string;
  mass: string;
  description: string;
  techHighlight: string;
  position: [number, number, number];
};

export const COMPONENT_SPECS: Record<string, ComponentSpec> = {
  lenses: {
    id: "lenses",
    name: "Lentes Polarizadas Ópticas",
    category: "SISTEMA ÓPTICO",
    material: "Polímero CR-39 com Bloqueio UV400",
    mass: "2.8g (o par)",
    description:
      "Tratamento oleofóbico e antirreflexo de 7 camadas. Curvatura base 6 para campo visual periférico sem aberrações prismáticas.",
    techHighlight: "99.8% Transmissão de Contraste",
    position: [0, 0.005, 0.05],
  },
  frame: {
    id: "frame",
    name: "Estrutura Frontal & Aros",
    category: "CHASSI ESTRUTURAL",
    material: "Titânio Usinado em CNC Grau 5 (Ti-6Al-4V)",
    mass: "4.6g",
    description:
      "Usinagem monobloco com tolerância de 12 mícrons. Alta resistência à tração e flexibilidade com memória elástica.",
    techHighlight: "Resistência de 950 MPa",
    position: [0.038, 0.015, 0.025],
  },
  temples: {
    id: "temples",
    name: "Hastes Anatômicas & Dobradiças",
    category: "ERGONOMIA & FIXAÇÃO",
    material: "Beta-Titânio com Ponteiras de Borracha Tátil",
    mass: "3.4g",
    description:
      "Micro-dobradiça inercial sem parafusos soltos. Pressão temporal auto-ajustável para conforto prolongado no uso urbano.",
    techHighlight: "100.000 Ciclos de Abertura",
    position: [0.075, 0.005, -0.04],
  },
  bridge: {
    id: "bridge",
    name: "Ponte Central & Apoio Nasal",
    category: "DISTRIBUIÇÃO DE CARGA",
    material: "Aço Cirúrgico 316L com Plaquetas de Silicone Médico",
    mass: "1.2g",
    description:
      "Distribuição balanceada do centro de gravidade. Elimina marcas de pressão na cartilagem nasal.",
    techHighlight: "100% Hipoalergênico",
    position: [0, 0.035, 0.01],
  },
};

type ExplodedGlassesModelProps = {
  explodedProgress: number; // 0.0 (Montado) a 1.0 (Totalmente Explodido)
  renderMode: RenderMode;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
};

function disposeSceneResources(object: THREE.Object3D | null): void {
  if (!object) return;
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else if (child.material) {
        child.material.dispose();
      }
    }
  });
}

export default function ExplodedGlassesModel({
  explodedProgress,
  renderMode,
  selectedComponentId,
  onSelectComponent,
}: ExplodedGlassesModelProps) {
  const gl = useThree((state) => state.gl);
  const { selectedModel } = useModelSelection();

  const [currentScene, setCurrentScene] = useState<THREE.Group | null>(null);
  const initialLocalTransforms = useRef<
    Map<
      string,
      {
        pos: THREE.Vector3;
        rot: THREE.Euler;
        scale: THREE.Vector3;
        origMat: THREE.Material | THREE.Material[];
      }
    >
  >(new Map());

  const loader = useMemo(() => createGltfLoader(gl), [gl]);

  // Carrega e clona a cena do modelo selecionado
  useEffect(() => {
    let isCurrent = true;

    loader.load(
      selectedModel.path,
      (gltf: GLTF) => {
        if (!isCurrent) {
          disposeSceneResources(gltf.scene);
          return;
        }

        const sceneClone = gltf.scene.clone(true);
        initialLocalTransforms.current.clear();

        // Mapeia posições iniciais de cada mesh da armação
        sceneClone.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            initialLocalTransforms.current.set(child.name, {
              pos: child.position.clone(),
              rot: child.rotation.clone(),
              scale: child.scale.clone(),
              origMat: Array.isArray(child.material)
                ? child.material.map((m) => m.clone())
                : child.material.clone(),
            });
          }
        });

        setCurrentScene(sceneClone);
      },
      undefined,
      (err) => console.error("[ExplodedGlassesModel] Erro ao carregar:", err)
    );

    return () => {
      isCurrent = false;
    };
  }, [loader, selectedModel.path]);

  // Cleanup de recursos ao desmontar
  useEffect(() => {
    return () => {
      if (currentScene) {
        disposeSceneResources(currentScene);
      }
    };
  }, [currentScene]);

  // Atualiza materiais com base no modo de renderização (PBR / Wireframe / Clay)
  useEffect(() => {
    if (!currentScene) return;

    currentScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const initial = initialLocalTransforms.current.get(child.name);
        if (!initial) return;

        const isLens =
          child.name.toLowerCase().includes("lens") ||
          child.name.toLowerCase().includes("visor");
        const isSelected =
          (selectedComponentId === "lenses" && isLens) ||
          (selectedComponentId === "frame" &&
            (child.name.includes("Rim") || child.name.includes("Frame"))) ||
          (selectedComponentId === "temples" &&
            (child.name.includes("Temple") ||
              child.name.includes("Tip") ||
              child.name.includes("Strap"))) ||
          (selectedComponentId === "bridge" &&
            (child.name.includes("Bridge") || child.name.includes("Top_Bar")));

        if (renderMode === "wireframe") {
          child.material = new THREE.MeshBasicMaterial({
            color: isSelected ? 0x38bdf8 : isLens ? 0x0071e3 : 0x94a3b8,
            wireframe: true,
            transparent: true,
            opacity: isSelected ? 1.0 : 0.75,
          });
        } else if (renderMode === "clay") {
          child.material = new THREE.MeshStandardMaterial({
            color: isSelected ? 0x38bdf8 : 0xededf2,
            roughness: 0.85,
            metalness: 0.05,
            wireframe: false,
          });
        } else {
          // PBR Realista Original
          const baseMat = Array.isArray(initial.origMat)
            ? initial.origMat[0]
            : initial.origMat;
          const cloned = baseMat.clone();

          if (isSelected && cloned instanceof THREE.MeshStandardMaterial) {
            cloned.emissive = new THREE.Color(0x0071e3);
            cloned.emissiveIntensity = 0.45;
          }
          child.material = cloned;
        }
      }
    });
  }, [currentScene, renderMode, selectedComponentId]);

  // Loop de animação frame a frame com interpolação física dos componentes
  useFrame((_, delta) => {
    if (!currentScene) return;

    const dampFactor = 6.0;

    currentScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const initial = initialLocalTransforms.current.get(child.name);
        if (!initial) return;

        const name = child.name;
        let targetX = initial.pos.x;
        let targetY = initial.pos.y;
        let targetZ = initial.pos.z;
        let targetRotY = initial.rot.y;

        // Regras de deslocamento espacial calculadas para cada parte anatômica
        if (name.includes("Lens") || name.includes("Visor")) {
          // Lentes projetadas para frente no eixo Z
          targetZ = initial.pos.z + explodedProgress * 0.048;
          targetY = initial.pos.y + explodedProgress * 0.005;
        } else if (name.includes("Rim_Left") || name.includes("Hex_Rim_Left")) {
          // Aro Esquerdo se desloca para a esquerda (-X) e ligeiramente para frente (+Z)
          targetX = initial.pos.x - explodedProgress * 0.024;
          targetZ = initial.pos.z + explodedProgress * 0.02;
        } else if (name.includes("Rim_Right") || name.includes("Hex_Rim_Right")) {
          // Aro Direito se desloca para a direita (+X) e para frente (+Z)
          targetX = initial.pos.x + explodedProgress * 0.024;
          targetZ = initial.pos.z + explodedProgress * 0.02;
        } else if (name.includes("Temple_Left") || name.includes("Tip_Left")) {
          // Haste Esquerda se afasta para o lado (-X), recua (-Z) e abre ângulo
          targetX = initial.pos.x - explodedProgress * 0.055;
          targetZ = initial.pos.z - explodedProgress * 0.015;
          targetRotY = initial.rot.y - explodedProgress * (Math.PI / 14);
        } else if (name.includes("Temple_Right") || name.includes("Tip_Right")) {
          // Haste Direita se afasta (+X), recua (-Z) e abre ângulo
          targetX = initial.pos.x + explodedProgress * 0.055;
          targetZ = initial.pos.z - explodedProgress * 0.015;
          targetRotY = initial.rot.y + explodedProgress * (Math.PI / 14);
        } else if (name.includes("Bridge") || name.includes("Top_Bar")) {
          // Ponte central e barra superior sobem (+Y)
          targetY = initial.pos.y + explodedProgress * 0.032;
        } else if (name.includes("Brow") || name.includes("Frame_Main")) {
          // Estrutura do visor sobe no eixo Y
          targetY = initial.pos.y + explodedProgress * 0.038;
        } else if (name.includes("Badge") || name.includes("Emitter")) {
          // Acentos laterais se projetam lateralmente
          const isLeft = name.includes("Left");
          targetX = initial.pos.x + (isLeft ? -1 : 1) * explodedProgress * 0.065;
        }

        // Interpolação inercial suave com damping (Three.js MathUtils.damp)
        child.position.x = THREE.MathUtils.damp(
          child.position.x,
          targetX,
          dampFactor,
          delta
        );
        child.position.y = THREE.MathUtils.damp(
          child.position.y,
          targetY,
          dampFactor,
          delta
        );
        child.position.z = THREE.MathUtils.damp(
          child.position.z,
          targetZ,
          dampFactor,
          delta
        );
        child.rotation.y = THREE.MathUtils.damp(
          child.rotation.y,
          targetRotY,
          dampFactor,
          delta
        );
      }
    });
  });

  if (!currentScene) return null;

  return (
    <group
      name="ExplodedGlassesRig"
      position={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        const meshName = e.object.name;
        if (meshName.includes("Lens") || meshName.includes("Visor")) {
          onSelectComponent("lenses");
        } else if (
          meshName.includes("Temple") ||
          meshName.includes("Tip") ||
          meshName.includes("Strap")
        ) {
          onSelectComponent("temples");
        } else if (meshName.includes("Bridge") || meshName.includes("Top_Bar")) {
          onSelectComponent("bridge");
        } else {
          onSelectComponent("frame");
        }
      }}
    >
      <primitive object={currentScene} />
    </group>
  );
}
