---
title: Fluxo de Dados e Ciclo de Vida
tags:
  - arquitetura
  - fluxo-de-dados
  - lifecycle
  - sequence
criado: 2026-08-12
atualizado: 2026-08-17
status: estavel
---

# 🔄 Fluxo de Dados e Ciclo de Vida

Este documento detalha o fluxo de dados em tempo real da aplicação, descrevendo as máquinas de estado, os diagramas de sequência de cada funcionalidade e a interação entre a árvore DOM e o renderizador WebGL.

---

## 1. Ciclo de Vida da Câmera & Permissões (`useCamera`)

A obtenção de acesso à webcam segue uma máquina de estados estrita com recuperação graciosa de falhas e conformidade com a LGPD.

```mermaid
stateDiagram-v2
    [*] --> Idle: Usuário entra na página

    state Idle {
        [*] --> WaitingUserAction: Exibe CameraPermissionGate
        WaitingUserAction --> Requesting: Usuário clica em "Ligar Câmera"
    }

    state Requesting {
        [*] --> CheckSecureContext: Verifica window.isSecureContext
        CheckSecureContext --> CheckMediaDevices: Contexto Seguro (HTTPS / Localhost)
        CheckSecureContext --> ErrorInsecure: HTTP Inseguro

        CheckMediaDevices --> CallGetUserMedia: navigator.mediaDevices existe
        CheckMediaDevices --> ErrorNotFound: Sem suporte a mediaDevices

        CallGetUserMedia --> Granted: Usuário autorizou
        CallGetUserMedia --> ErrorDenied: NotAllowedError / Permission Denied
        CallGetUserMedia --> ErrorInUse: NotReadableError / Câmera em uso
        CallGetUserMedia --> ErrorNotFound: NotFoundError / Sem webcam
    }

    state Granted {
        [*] --> BindVideo: Conecta MediaStream ao HTMLVideoElement
        BindVideo --> StartFaceLandmarker: Notifica useFaceLandmarker (isLive = true)
        StartFaceLandmarker --> StreamingFrames: Feed ativo a 60 FPS
        StreamingFrames --> StopCamera: Usuário clica em "Desligar Câmera"
        StreamingFrames --> StreamInterrupted: Aba minimizada / Dispositivo desconectado
    }

    state ErrorState {
        ErrorInsecure --> ShowInsecureNotice: Orientação HTTPS
        ErrorDenied --> ShowUnlockGuide: Orientação de desbloqueio no navegador
        ErrorInUse --> ShowRetryBtn: Botão "Tentar novamente"
        ErrorNotFound --> ShowRetryBtn: Botão "Tentar novamente"
    }

    StopCamera --> Idle: MediaStream.getTracks().stop() & Limpeza
    StreamInterrupted --> ErrorInUse: Tratamento de exceção
    ShowRetryBtn --> Requesting: Novo clique em "Tentar novamente"
```

---

## 2. Pipeline de Tracking Facial & Render Loop a 60 FPS

O diagrama de sequência abaixo descreve o ciclo executado a cada frame durante a prova virtual ativa:

```mermaid
sequenceDiagram
    autonumber
    participant V as HTML5 Video Element
    participant FL as MediaPipe FaceLandmarker
    participant BR as FaceTracking Global Bridge
    participant SM as FacePoseSmoother
    participant AG as AnchoredGlasses (useFrame)
    participant GM as GlassesModel (Three.js)
    participant C as WebGL Canvas (GPU)

    loop Cada Frame de Render (~16.6ms / 60 FPS)
        V->>FL: detectForVideo(video, timestamp)
        activate FL
        FL-->>BR: facialTransformationMatrixes (Matriz 4x4)
        deactivate FL
        
        AG->>BR: getGlobalFacialTransformationMatrix()
        activate AG
        AG->>SM: update(matrix, performance.now())
        activate SM
        SM->>SM: SLERP Quaternion (alpha = 0.35)
        SM->>SM: LERP Vetor Posição (cm -> metros)
        SM->>SM: Aplica janela de retenção (400ms hold)
        SM-->>AG: Pose Suavizada (Position, Quaternion, Scale)
        deactivate SM

        AG->>AG: Aplica EYE_LEVEL_OFFSET_M (+2.2cm local)
        AG->>GM: Atualiza Group Transform (MatrixWorld)
        GM->>C: Draw Calls dos Shaders PBR (Draco/Meshopt)
        deactivate AG
    end
```

---

## 3. Sincronização Reativa do Seletor de Modelos (`useSyncExternalStore`)

Como o React Three Fiber roda em um loop de renderização independente da árvore DOM, o compartilhamento do modelo selecionado utiliza uma store externa reativa sem causar re-renderizações no DOM:

```mermaid
sequenceDiagram
    participant U as Usuário
    participant MS as ModelSelector (DOM)
    participant Store as useModelSelection Store
    participant GM as GlassesModel (R3F)
    participant Disp as GPU Resource Disposer
    participant L as GLTFLoader (Draco/KTX2)
    participant GPU as VRAM (GPU)

    U->>MS: Clica no modelo (ex: "Metropolis Hex")
    MS->>Store: setGlobalSelectedModel("violet")
    Store->>Store: currentSelectedId = "violet"
    Store-->>MS: Notifica listeners DOM (atualiza pill de ativo)
    Store-->>GM: Notifica listener R3F (dispara useEffect)

    activate GM
    GM->>Disp: disposeSceneResources(currentScene)
    Disp->>GPU: Geometrias.dispose() + Materiais.dispose()
    
    GM->>L: loader.load("/models/glasses-violet.glb")
    activate L
    L-->>GM: gltf.scene (Grupo Three.js instanciado)
    deactivate L

    GM->>GPU: Upload de buffers para nova geometria
    GM->>GM: setCurrentScene(gltf.scene)
    deactivate GM
```

---

## 4. Fluxo do Sistema de Acessibilidade & Temas

O motor de acessibilidade orquestra o tamanho de fonte, modo claro/escuro e preferências de movimento através de variáveis CSS dinâmicas:

```mermaid
flowchart LR
    A[Ação do Usuário no AccessibilityWidget] --> B{Tipo de Ajuste}
    
    B -->|Tamanho do Texto A±| C[setFontScale: 0.88x a 1.38x]
    B -->|Troca de Tema ☀️/🌙| D[setTheme: light / dark]
    B -->|Reduzir Movimento| E[setReducedMotion: boolean]
    B -->|Alto Contraste| F[setHighContrast: boolean]

    C --> G[localStorage.setItem]
    D --> G
    E --> G
    F --> G

    G --> H["document.documentElement (Tag HTML)"]
    H --> I["style.setProperty('--font-scale', scale)"]
    H --> J["setAttribute('data-theme', 'light' | 'dark')"]
    H --> K["setAttribute('data-reduced-motion', 'true')"]
    H --> L["setAttribute('data-high-contrast', 'true')"]

    I --> M[Todos os textos, botões e tabelas escalam via REM]
    J --> N[Cores Branco-Nuvem ↔ Azul Midnight propagadas]
    K --> O[Transições CSS e animações suprimidas]
    L --> P[Bordas reforçadas e contraste AA máximo]
```

---

## 5. Fluxo do Formulário de Acesso Antecipado (`Cta.tsx`)

O formulário de conversão de early access aplica validação segura de dados via schema Zod no cliente:

```mermaid
sequenceDiagram
    participant U as Visitante
    participant Form as Cta Component (DOM)
    participant Zod as Zod Schema (parseAccessEmail)
    participant Track as Analytics Tracker (Local Stub)

    U->>Form: Digita e-mail e clica em "Quero Acesso"
    Form->>Zod: parseAccessEmail(rawEmail)
    
    alt E-mail Inválido
        Zod-->>Form: success: false
        Form->>Track: track("access_submit_invalid")
        Form->>Form: setNote("Por favor, insira um e-mail válido") + isError: true
        Form-->>U: Exibe mensagem de erro em vermelho
    else E-mail Válido
        Zod-->>Form: success: true (email normalizado)
        Form->>Track: track("access_submit", label: email)
        Form->>Form: setNote("Convite confirmado!") + isSuccess: true
        Form->>Form: form.reset()
        Form-->>U: Exibe confirmação em verde com ícone de check
    end
```

---

## 📚 Documentos Relacionados

- [[02-Arquitetura]] — Visão geral da arquitetura de sistema
- [[Como-Funciona-o-Tracking]] — Detalhes matemáticos e parâmetros de ancoragem
- [[Orcamento-de-Performance]] — Métricas de tempo de quadro e orçamento de draw calls
- [[LGPD-e-Consentimento]] — Diretrizes de proteção de dados biométricos

⬅ [[02-Arquitetura]]
