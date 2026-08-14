import * as THREE from "three";

/**
 * Materiais reutilizáveis do Portal VOID (docs/vault/05-VR-e-3D/Orcamento-de-Performance.md).
 * Orçamento: ≤10 materiais únicos na cena para manter draw calls baixos e evitar recriação de shaders.
 */

// 1. Chassi metálico escuro cibernético (anéis principais)
export const chassisMaterial = new THREE.MeshStandardMaterial({
  color: 0x121216,
  metalness: 0.85,
  roughness: 0.25,
  wireframe: false,
});

// 2. Neon Acid (#cfff04) com emissividade brilhante
export const acidGlowMaterial = new THREE.MeshStandardMaterial({
  color: 0xcfff04,
  emissive: 0xcfff04,
  emissiveIntensity: 1.8,
  roughness: 0.15,
  metalness: 0.4,
});

// 3. Neon Violet (#8b5cf6)
export const violetGlowMaterial = new THREE.MeshStandardMaterial({
  color: 0x8b5cf6,
  emissive: 0x8b5cf6,
  emissiveIntensity: 1.6,
  roughness: 0.2,
  metalness: 0.3,
});

// 4. Neon Magenta (#ff2e6a)
export const magentaGlowMaterial = new THREE.MeshStandardMaterial({
  color: 0xff2e6a,
  emissive: 0xff2e6a,
  emissiveIntensity: 1.6,
  roughness: 0.2,
  metalness: 0.3,
});

// 5. Núcleo de Singularidade do Portal (Horizonte de eventos escuro com emissão acid interna)
export const singularityCoreMaterial = new THREE.MeshStandardMaterial({
  color: 0x08080a,
  emissive: 0xcfff04,
  emissiveIntensity: 1.2,
  roughness: 0.1,
  metalness: 0.9,
});

// 6. Aura / Glow suave semi-transparente
export const auraMaterial = new THREE.MeshBasicMaterial({
  color: 0xcfff04,
  transparent: true,
  opacity: 0.12,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  depthWrite: false,
});

// 7. Material para o enxame de partículas quânticas (Points)
export const particleMaterial = new THREE.PointsMaterial({
  color: 0xcfff04,
  size: 0.035,
  transparent: true,
  opacity: 0.75,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
