import * as THREE from "three";

/**
 * Configurações do algoritmo de suavização temporal e ancoragem (Task 8 / RF-04).
 */
export type FacePoseSmootherOptions = {
  /**
   * Fator de suavização (alpha) para interpolação entre frames.
   * Faixa: (0, 1].
   * - Valores menores (ex.: 0.15): ultra suave, porém com atraso (lag) perceptível.
   * - Valores maiores (ex.: 0.8): resposta instantânea, porém com jitter visível.
   * - Padrão recomendado: 0.35 (ótimo equilíbrio entre atenuação de ruído e baixa latência ~50ms).
   */
  smoothingFactor?: number;

  /**
   * Duração em milissegundos para reter a última pose conhecida quando a detecção
   * é temporariamente perdida (evita cintilação em frames perdidos isolados).
   * Padrão: 400ms (~12-15 frames a 30fps).
   */
  holdDurationMs?: number;

  /**
   * Duração em milissegundos para fazer fade-out suave após o período de hold.
   * Padrão: 400ms.
   */
  fadeDurationMs?: number;

  /**
   * Escala de translação. Se a matriz do MediaPipe estiver em centímetros (ex.: |z| > 5),
   * o conversor divide por 100 automaticamente para converter em metros (escala métrica Three.js).
   */
  autoUnitConversion?: boolean;
};

export type SmoothedPoseResult = {
  /** Posição 3D suavizada (metros). */
  position: THREE.Vector3;
  /** Rotação 3D suavizada (quaternion unitário). */
  quaternion: THREE.Quaternion;
  /** Escala normalizada do modelo (1.0 = tamanho nominal do GLB). */
  scale: THREE.Vector3;
  /** Se o objeto deve ser renderizado na cena. */
  visible: boolean;
  /** Opacidade calculada para transição/fade (0.0 a 1.0). */
  opacity: number;
  /** Se a detecção ao vivo está ativa no frame corrente. */
  isTracking: boolean;
};

// Objetos reutilizáveis fora de qualquer função para ZERO alocação em runtime (Convencoes-de-Codigo.md - Regra 1)
const _decomposeMatrix = new THREE.Matrix4();

/**
 * Decompõe uma matriz 4x4 bruta do MediaPipe Face Landmarker em posição,
 * rotação (quaternion) e escala, aplicando conversão de coordenadas e unidades.
 *
 * @param matrixArray Array de 16 números (coluna-principal) vindo de facialTransformationMatrixes
 * @param outPosition Vector3 de destino para a posição
 * @param outQuaternion Quaternion de destino para a rotação
 * @param outScale Vector3 de destino para a escala
 * @param autoUnitConversion Converte automaticamente de cm para metros se detectado
 */
export function decomposeFacialMatrix(
  matrixArray: Float32Array | readonly number[] | number[],
  outPosition: THREE.Vector3,
  outQuaternion: THREE.Quaternion,
  outScale: THREE.Vector3,
  autoUnitConversion = true,
): boolean {
  if (!matrixArray || matrixArray.length < 16) {
    return false;
  }

  // Carrega a matriz 4x4 em formato coluna-principal do Three.js
  _decomposeMatrix.fromArray(matrixArray);

  // Decompõe a matriz em componentes de transformação rígida
  _decomposeMatrix.decompose(outPosition, outQuaternion, outScale);

  // Verificação e conversão de unidades (centímetros -> metros):
  // No modelo métrico do MediaPipe, se a translação Z estiver na ordem de dezenas (ex.: -40 a -70 cm),
  // convertemos para a escala do Three.js (0.40 a 0.70 metros).
  if (autoUnitConversion) {
    const absZ = Math.abs(outPosition.z);
    const absX = Math.abs(outPosition.x);
    const absY = Math.abs(outPosition.y);
    if (absZ > 5.0 || absX > 5.0 || absY > 5.0) {
      outPosition.multiplyScalar(0.01);
    }
  }

  // Garante que o quaternion seja unitário
  outQuaternion.normalize();

  return true;
}

/**
 * Classe responsável por gerenciar a suavização temporal (lerp + slerp),
 * filtragem de ruído e máquina de estados de perda de rastreamento facial.
 *
 * Projetada para ZERO alocações durante chamadas repetidas de `update()`.
 */
export class FacePoseSmoother {
  private smoothingFactor: number;
  private holdDurationMs: number;
  private fadeDurationMs: number;
  private autoUnitConversion: boolean;

  // Estado suavizado corrente
  private readonly currentPosition = new THREE.Vector3(0, 0, 0);
  private readonly currentQuaternion = new THREE.Quaternion(0, 0, 0, 1);
  private readonly currentScale = new THREE.Vector3(1, 1, 1);

  // Alvos brutos do frame atual (reutilizados internamente)
  private readonly targetPosition = new THREE.Vector3(0, 0, 0);
  private readonly targetQuaternion = new THREE.Quaternion(0, 0, 0, 1);
  private readonly targetScale = new THREE.Vector3(1, 1, 1);

  // Objeto de retorno estático (reutilizado a cada update)
  private readonly result: SmoothedPoseResult = {
    position: this.currentPosition,
    quaternion: this.currentQuaternion,
    scale: this.currentScale,
    visible: false,
    opacity: 0,
    isTracking: false,
  };

  private lastDetectedTimestamp = 0;
  private hasEverDetected = false;
  private isCurrentlyTracking = false;

  constructor(options: FacePoseSmootherOptions = {}) {
    this.smoothingFactor = Math.min(
      Math.max(options.smoothingFactor ?? 0.35, 0.01),
      1.0,
    );
    this.holdDurationMs = Math.max(options.holdDurationMs ?? 400, 0);
    this.fadeDurationMs = Math.max(options.fadeDurationMs ?? 400, 0);
    this.autoUnitConversion = options.autoUnitConversion ?? true;
  }

  /**
   * Atualiza o estado da pose com uma nova matriz 4x4 do MediaPipe (ou null se nenhum rosto).
   *
   * @param rawMatrix Float32Array com 16 elementos da matriz facial ou null
   * @param timestampMs Timestamp em milissegundos do frame atual (performance.now())
   * @returns Resultado contendo position, quaternion, scale, visibility e opacity
   */
  public update(
    rawMatrix: Float32Array | readonly number[] | null | undefined,
    timestampMs: number = performance.now(),
  ): SmoothedPoseResult {
    const hasRawMatrix =
      rawMatrix != null && rawMatrix.length >= 16;

    if (hasRawMatrix) {
      const decomposed = decomposeFacialMatrix(
        rawMatrix,
        this.targetPosition,
        this.targetQuaternion,
        this.targetScale,
        this.autoUnitConversion,
      );

      if (decomposed) {
        if (!this.hasEverDetected || !this.isCurrentlyTracking) {
          // Primeiro frame de detecção ou recuperação de rastreamento:
          // Ajusta instantaneamente a pose sem transição pelo espaço vazio.
          this.currentPosition.copy(this.targetPosition);
          this.currentQuaternion.copy(this.targetQuaternion);
          this.currentScale.set(1, 1, 1);
        } else {
          // Interpolação linear na posição (lerp)
          this.currentPosition.lerp(this.targetPosition, this.smoothingFactor);

          // Interpolação esférica linear na rotação (slerp)
          this.currentQuaternion.slerp(
            this.targetQuaternion,
            this.smoothingFactor,
          );
        }

        this.lastDetectedTimestamp = timestampMs;
        this.hasEverDetected = true;
        this.isCurrentlyTracking = true;

        this.result.visible = true;
        this.result.opacity = 1.0;
        this.result.isTracking = true;
        this.currentScale.set(1, 1, 1);
        return this.result;
      }
    }

    // Caso nenhum rosto detectado no frame atual
    this.isCurrentlyTracking = false;
    this.result.isTracking = false;

    if (!this.hasEverDetected) {
      // Nenhum rosto jamais detectado
      this.result.visible = false;
      this.result.opacity = 0;
      return this.result;
    }

    const elapsedLost = timestampMs - this.lastDetectedTimestamp;

    if (elapsedLost < this.holdDurationMs) {
      // 1. Período de retenção (Hold): mantém a última pose válida sem piscar
      this.result.visible = true;
      this.result.opacity = 1.0;
      this.currentScale.set(1, 1, 1);
      return this.result;
    }

    const totalGracePeriod = this.holdDurationMs + this.fadeDurationMs;
    if (elapsedLost < totalGracePeriod && this.fadeDurationMs > 0) {
      // 2. Período de atenuação (Fade-out progressivo)
      const fadeProgress =
        (elapsedLost - this.holdDurationMs) / this.fadeDurationMs;
      const opacity = Math.max(0, 1.0 - fadeProgress);

      this.result.visible = opacity > 0.01;
      this.result.opacity = opacity;
      // Aplica leve escala na atenuação para um desaparecimento orgânico
      this.currentScale.setScalar(0.85 + 0.15 * opacity);
      return this.result;
    }

    // 3. Detecção ausente por tempo prolongado: esconde o modelo
    this.result.visible = false;
    this.result.opacity = 0;
    return this.result;
  }

  /**
   * Reseta o histórico de suavização e rastreamento.
   */
  public reset(): void {
    this.hasEverDetected = false;
    this.isCurrentlyTracking = false;
    this.lastDetectedTimestamp = 0;
    this.currentPosition.set(0, 0, 0);
    this.currentQuaternion.set(0, 0, 0, 1);
    this.currentScale.set(1, 1, 1);
    this.result.visible = false;
    this.result.opacity = 0;
    this.result.isTracking = false;
  }

  public setSmoothingFactor(factor: number): void {
    this.smoothingFactor = Math.min(Math.max(factor, 0.01), 1.0);
  }

  public getSmoothingFactor(): number {
    return this.smoothingFactor;
  }

  public isTracking(): boolean {
    return this.isCurrentlyTracking;
  }

  public getSmoothedPosition(): THREE.Vector3 {
    return this.currentPosition;
  }

  public getSmoothedQuaternion(): THREE.Quaternion {
    return this.currentQuaternion;
  }
}
