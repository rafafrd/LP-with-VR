import type { WebGLRenderer } from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

/**
 * Monta um `GLTFLoader` pronto para assets otimizados pelo pipeline de
 * docs/vault/05-VR-e-3D/Pipeline-de-Assets-3D.md (scripts/optimize-glb.mjs).
 *
 * O pipeline gera três coisas que o loader precisa conhecer:
 *
 * - **KTX2** (`KHR_texture_basisu`): texturas comprimidas em
 *   `public/models/*.glb`. O transcoder Basis precisa estar em `public/basis/`
 *   (copiado por `npm run assets:sync-runtime-3d`) — esquecer isso é o erro de
 *   runtime mais comum do KTX2.
 * - **Meshopt** (`EXT_meshopt_compression`): geometria de modelos com
 *   animação/morph targets.
 * - **Draco** (`KHR_draco_mesh_compression`): geometria de modelos estáticos;
 *   decoders em `public/draco/`.
 *
 * O renderer é obrigatório porque o `KTX2Loader.detectSupport(renderer)` decide
 * quais formatos de GPU o transcoder pode emitir (ASTC no mobile, BC7 no desktop).
 *
 * Uso (depois de um WebGLRenderer existir — fora do `useFrame`):
 *
 * ```ts
 * const loader = createGltfLoader(renderer);
 * loader.load('/models/modelo.glb', (gltf) => scene.add(gltf.scene));
 * ```
 *
 * ## Liberação de recursos (Convencoes-de-Codigo.md — regra 2)
 *
 * Ao desmontar o componente, libere os recursos do GLB carregado — vazamento de
 * GPU não aparece no heap do JS:
 *
 * ```ts
 * gltf.scene.traverse((child) => {
 *   if (child instanceof Mesh) {
 *     child.geometry.dispose();
 *     if (Array.isArray(child.material)) {
 *       child.material.forEach((material) => disposeMaterial(material));
 *     } else {
 *       disposeMaterial(child.material);
 *     }
 *   }
 * });
 *
 * function disposeMaterial(material) {
 *   // Recursos 2D de um material (texturas) também precisam de dispose.
 *   for (const value of Object.values(material)) {
 *     if (value && typeof value === 'object' && 'dispose' in value && value.isTexture) {
 *       value.dispose();
 *     }
 *   }
 *   material.dispose();
 * }
 * ```
 *
 * O loader e seus workers (KTX2/Draco) são destinados a viver pelo tempo de vida
 * da aplicação — não crie um novo a cada frame. Se precisar de um loader
 * temporário, construa as peças manualmente e chame `dracoLoader.dispose()` e
 * `ktx2Loader.dispose()` ao terminar.
 */
export function createGltfLoader(renderer: WebGLRenderer): GLTFLoader {
  const ktx2Loader = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer);
  const dracoLoader = new DRACOLoader().setDecoderPath('/draco/');

  return new GLTFLoader()
    .setKTX2Loader(ktx2Loader)
    .setDRACOLoader(dracoLoader)
    .setMeshoptDecoder(MeshoptDecoder);
}
