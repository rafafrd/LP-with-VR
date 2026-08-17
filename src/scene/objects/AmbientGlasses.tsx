import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { PerfProfile } from "../../hooks/usePerfProfile";
import { createGltfLoader } from "../../lib/gltfLoader";

type AmbientGlassesProps = {
  reducedMotion: boolean;
  profile: PerfProfile;
};

type InstanceConfig = {
  modelType: "acid" | "violet" | "magenta";
  basePosition: [number, number, number];
  baseRotation: [number, number, number];
  scale: number;
  driftSpeed: [number, number, number];
  driftAmp: [number, number, number];
  rotSpeed: [number, number, number];
  scrollAnchor: number; // 0.0 a 1.0 (onde na página o modelo fica mais centrado)
  parallaxScale: number;
  seed: number;
  frameColor: string;
  lensColor: string;
  accentColor: string;
  metalness?: number;
  roughness?: number;
  isChrome?: boolean;
};

// Todas as posições base ficam dentro do frustum visível da câmera de AmbientCanvas
// (câmera em z=8, fov 45° → meia-altura visível de ~3.7 a ~4.3 unidades em z entre
// -1.3 e -2.0). O deslocamento de scroll (`scrollAnchor`/`parallaxScale`, aplicado no
// useFrame abaixo) soma um offset por cima disso — nunca desloca o objeto por uma
// distância vertical enorme e fixa, então nenhuma instância fica presa para sempre fora
// do campo de visão (bug corrigido nesta revisão: a 1ª versão usava basePosition.y entre
// -14.6 e +1.8, mas parallaxScale só ia até 12 — nunca trazia as últimas instâncias de
// volta ao centro da tela).
const INSTANCE_CONFIGS: InstanceConfig[] = [
  // 0: Titanium Slate Minimal (esquerda superior)
  {
    modelType: "acid",
    basePosition: [-3.0, 1.6, -1.3],
    baseRotation: [0.25, 0.45, -0.15],
    scale: 13.5,
    driftSpeed: [0.55, 0.75, 0.45],
    driftAmp: [0.35, 0.45, 0.25],
    rotSpeed: [0.12, 0.18, 0.08],
    scrollAnchor: 0.05,
    parallaxScale: 13,
    seed: 1.1,
    frameColor: "#242528",
    lensColor: "#10141e",
    accentColor: "#0071e3",
    metalness: 0.85,
    roughness: 0.2,
  },
  // 1: Metropolis Hex Cobalto (direita, um pouco abaixo do centro)
  {
    modelType: "violet",
    basePosition: [3.1, -1.2, -1.7],
    baseRotation: [-0.3, -0.55, 0.2],
    scale: 12.5,
    driftSpeed: [0.65, 0.5, 0.6],
    driftAmp: [0.4, 0.5, 0.3],
    rotSpeed: [0.15, -0.2, 0.1],
    scrollAnchor: 0.2,
    parallaxScale: 14,
    seed: 2.7,
    frameColor: "#3b4261",
    lensColor: "#0a1e3b",
    accentColor: "#6366f1",
    metalness: 0.8,
    roughness: 0.25,
  },
  // 2: Spatial Studio Visor Midnight Navy (esquerda, acima do centro)
  {
    modelType: "magenta",
    basePosition: [-2.8, 2.0, -1.5],
    baseRotation: [0.35, 0.65, 0.12],
    scale: 14.0,
    driftSpeed: [0.5, 0.7, 0.4],
    driftAmp: [0.45, 0.4, 0.25],
    rotSpeed: [-0.14, 0.22, 0.07],
    scrollAnchor: 0.35,
    parallaxScale: 12,
    seed: 4.3,
    frameColor: "#0f4c81",
    lensColor: "#07172b",
    accentColor: "#0071e3",
    metalness: 0.75,
    roughness: 0.18,
  },
  // 3: Titanium Chrome Translúcido (direita inferior)
  {
    modelType: "acid",
    basePosition: [3.3, -1.8, -2.0],
    baseRotation: [-0.22, 0.35, -0.2],
    scale: 12.0,
    driftSpeed: [0.6, 0.65, 0.5],
    driftAmp: [0.35, 0.45, 0.2],
    rotSpeed: [0.16, -0.18, 0.12],
    scrollAnchor: 0.5,
    parallaxScale: 15,
    seed: 5.9,
    frameColor: "#d4d8e2",
    lensColor: "#10141e",
    accentColor: "#38bdf8",
    metalness: 0.92,
    roughness: 0.12,
    isChrome: true,
  },
  // 4: Metropolis Hex Slate Dark (esquerda, um pouco acima do centro)
  {
    modelType: "violet",
    basePosition: [-3.2, 1.3, -1.4],
    baseRotation: [0.28, -0.45, 0.16],
    scale: 13.0,
    driftSpeed: [0.55, 0.7, 0.45],
    driftAmp: [0.4, 0.35, 0.3],
    rotSpeed: [-0.12, 0.24, -0.09],
    scrollAnchor: 0.65,
    parallaxScale: 13,
    seed: 7.5,
    frameColor: "#1e293b",
    lensColor: "#081326",
    accentColor: "#0071e3",
    metalness: 0.88,
    roughness: 0.22,
  },
  // 5: Spatial Studio Visor Chrome Sky (direita, abaixo do centro)
  {
    modelType: "magenta",
    basePosition: [3.0, -1.5, -1.8],
    baseRotation: [-0.28, 0.5, -0.15],
    scale: 13.2,
    driftSpeed: [0.68, 0.55, 0.55],
    driftAmp: [0.45, 0.45, 0.22],
    rotSpeed: [0.15, -0.19, 0.13],
    scrollAnchor: 0.8,
    parallaxScale: 14,
    seed: 8.8,
    frameColor: "#242528",
    lensColor: "#071b33",
    accentColor: "#38bdf8",
    metalness: 0.85,
    roughness: 0.15,
  },
  // 6: Cobalto Minimal (esquerda superior)
  {
    modelType: "acid",
    basePosition: [-2.9, 1.9, -1.6],
    baseRotation: [0.18, 0.4, 0.12],
    scale: 11.5,
    driftSpeed: [0.58, 0.62, 0.48],
    driftAmp: [0.35, 0.4, 0.25],
    rotSpeed: [0.14, 0.2, 0.1],
    scrollAnchor: 0.9,
    parallaxScale: 12,
    seed: 9.4,
    frameColor: "#3b4261",
    lensColor: "#10141e",
    accentColor: "#6366f1",
    metalness: 0.82,
    roughness: 0.24,
  },
  // 7: Ice Chrome Silver (direita inferior)
  {
    modelType: "violet",
    basePosition: [2.8, -1.6, -1.9],
    baseRotation: [-0.22, -0.32, 0.18],
    scale: 12.8,
    driftSpeed: [0.52, 0.68, 0.42],
    driftAmp: [0.38, 0.42, 0.28],
    rotSpeed: [-0.14, 0.17, -0.11],
    scrollAnchor: 0.98,
    parallaxScale: 13,
    seed: 10.7,
    frameColor: "#e2e8f0",
    lensColor: "#07172b",
    accentColor: "#0071e3",
    metalness: 0.94,
    roughness: 0.14,
    isChrome: true,
  },
];

/**
 * Cria um clone recolorido de uma cena GLTF aplicando materiais da paleta nova.
 */
function createRecoloredModel(
  sourceScene: THREE.Group,
  config: InstanceConfig
): THREE.Group {
  const clone = sourceScene.clone(true);
  const metalness = config.metalness ?? 0.85;
  const roughness = config.roughness ?? 0.22;
  const isChrome = config.isChrome ?? false;

  clone.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const origMatName = (child.material as THREE.Material)?.name || child.name || "";

      let newMat: THREE.Material;

      if (origMatName.includes("Lens") || origMatName.includes("Visor")) {
        newMat = new THREE.MeshPhysicalMaterial({
          name: `Ambient_Lens_${config.modelType}`,
          color: new THREE.Color(config.lensColor),
          metalness: isChrome ? 0.85 : 0.25,
          roughness: isChrome ? 0.08 : 0.12,
          transmission: isChrome ? 0.3 : 0.65,
          transparent: true,
          opacity: 0.72,
          ior: 1.5,
          side: THREE.DoubleSide,
        });
      } else if (
        origMatName.includes("Accent") ||
        origMatName.includes("Glow") ||
        origMatName.includes("LED") ||
        origMatName.includes("Light") ||
        origMatName.includes("Badge")
      ) {
        newMat = new THREE.MeshStandardMaterial({
          name: `Ambient_Accent_${config.modelType}`,
          color: new THREE.Color(config.accentColor),
          metalness: 0.7,
          roughness: 0.2,
          emissive: new THREE.Color(config.accentColor),
          emissiveIntensity: 0.45,
          side: THREE.DoubleSide,
        });
      } else {
        newMat = new THREE.MeshStandardMaterial({
          name: `Ambient_Frame_${config.modelType}`,
          color: new THREE.Color(config.frameColor),
          metalness: metalness,
          roughness: roughness,
          side: THREE.DoubleSide,
        });
      }

      child.material = newMat;
    }
  });

  clone.scale.setScalar(config.scale);
  return clone;
}

function disposeSceneTree(object: THREE.Object3D | null): void {
  if (!object) return;
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => mat.dispose());
      } else if (child.material) {
        child.material.dispose();
      }
    }
  });
}

export default function AmbientGlasses({ reducedMotion, profile }: AmbientGlassesProps) {
  const gl = useThree((state) => state.gl);
  const loader = useMemo(() => createGltfLoader(gl), [gl]);

  const [instances, setInstances] = useState<THREE.Group[]>([]);
  const instanceRefs = useRef<(THREE.Group | null)[]>([]);
  const scrollProgressRef = useRef(0);

  // Quantidade de instâncias de acordo com o hardware
  const instanceCount = useMemo(() => {
    if (profile === "low") return 4;
    if (profile === "medium") return 6;
    return 8;
  }, [profile]);

  // Listener de scroll passivo de alta performance para o parallax 3D
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgressRef.current = totalHeight > 0 ? window.scrollY / totalHeight : 0;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Carrega os 3 GLBs básicos e constrói as instâncias com override de material
  useEffect(() => {
    let isCancelled = false;

    const rawGltfs: Record<string, THREE.Group> = {};

    const loadModel = (path: string, key: "acid" | "violet" | "magenta") => {
      return new Promise<void>((resolve, reject) => {
        loader.load(
          path,
          (gltf: GLTF) => {
            if (!isCancelled) {
              rawGltfs[key] = gltf.scene;
            }
            resolve();
          },
          undefined,
          reject
        );
      });
    };

    Promise.all([
      loadModel("/models/glasses-acid.glb", "acid"),
      loadModel("/models/glasses-violet.glb", "violet"),
      loadModel("/models/glasses-magenta.glb", "magenta"),
    ])
      .then(() => {
        if (isCancelled) return;

        const builtInstances: THREE.Group[] = [];
        for (let i = 0; i < INSTANCE_CONFIGS.length; i++) {
          const config = INSTANCE_CONFIGS[i];
          const rawScene = rawGltfs[config.modelType];
          if (!rawScene) continue;

          const instance = createRecoloredModel(rawScene, config);
          instance.position.set(...config.basePosition);
          instance.rotation.set(...config.baseRotation);
          builtInstances.push(instance);
        }

        setInstances(builtInstances);

        // Libera os materiais originais dos GLBs-template (Convencoes-de-Codigo.md —
        // Regra 2): createRecoloredModel substitui o material de cada clone por um novo
        // (via `child.material = newMat`), então os materiais originais carregados do
        // GLB não são mais referenciados por ninguém a partir daqui. A geometria NÃO é
        // liberada aqui — .clone(true) compartilha o mesmo BufferGeometry por referência
        // com todos os clones, que continuam usando-a para renderizar.
        Object.values(rawGltfs).forEach((scene) => {
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
        });
      })
      .catch((err) => {
        console.warn("[AmbientGlasses] Não foi possível carregar modelos para a camada ambiente:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [loader]);

  // Cleanup de recursos GPU ao desmontar
  useEffect(() => {
    return () => {
      instances.forEach((inst) => disposeSceneTree(inst));
    };
  }, [instances]);

  // Render loop fluido: zero alocação de objetos a cada frame (Convencoes-de-Codigo.md - Regra 1)
  useFrame((state) => {
    if (reducedMotion) return;

    const time = state.clock.getElapsedTime();
    const scrollProgress = scrollProgressRef.current;
    const count = Math.min(instances.length, instanceCount);

    for (let i = 0; i < count; i++) {
      const group = instanceRefs.current[i];
      const config = INSTANCE_CONFIGS[i];
      if (!group || !config) continue;

      // Drift orgânico suave via seno e cosseno
      const dx = Math.sin(time * config.driftSpeed[0] + config.seed) * config.driftAmp[0];
      const dy = Math.cos(time * config.driftSpeed[1] + config.seed * 1.3) * config.driftAmp[1];
      const dz = Math.sin(time * config.driftSpeed[2] + config.seed * 0.7) * config.driftAmp[2];

      // Parallax ligado ao scroll da página inteira: a distância "scrollProgress -
      // scrollAnchor" é enrolada (wrap) para o intervalo [-0.5, 0.5) via
      // `x - Math.round(x)` — o caminho mais curto até o próximo ponto de ancoragem.
      // Isso garante por construção que o deslocamento nunca passa de
      // ±0.5 * parallaxScale: a instância está sempre perto do centro (offset ≈ 0)
      // quando o scroll está perto do seu scrollAnchor, sai de quadro suavemente quando
      // se afasta, e volta a entrar (pelo lado oposto) quando o scroll dá a volta —
      // efeito de "campo infinito" sem nenhuma instância presa fora da tela pra sempre.
      let scrollOffset = scrollProgress - config.scrollAnchor;
      scrollOffset -= Math.round(scrollOffset);
      const scrollParallaxY = scrollOffset * config.parallaxScale;

      group.position.set(
        config.basePosition[0] + dx,
        config.basePosition[1] + dy + scrollParallaxY,
        config.basePosition[2] + dz
      );

      // Rotação suave contínua
      const rx = config.baseRotation[0] + Math.sin(time * config.rotSpeed[0] + config.seed) * 0.2;
      const ry = config.baseRotation[1] + time * config.rotSpeed[1];
      const rz = config.baseRotation[2] + Math.cos(time * config.rotSpeed[2] + config.seed) * 0.12;

      group.rotation.set(rx, ry, rz);
    }
  });

  if (instances.length === 0) {
    return null;
  }

  const activeInstances = instances.slice(0, instanceCount);

  return (
    <group name="AmbientGlassesLayer">
      {activeInstances.map((inst, index) => (
        <primitive
          key={`ambient-instance-${index}`}
          object={inst}
          ref={(el: THREE.Group | null) => {
            instanceRefs.current[index] = el;
          }}
        />
      ))}
    </group>
  );
}
