| #   | Task                            | Agente      | Status | Branch       |
| --- | ------------------------------- | ----------- | ------ | ------------ |
| 1   | Scaffold Vite+TS+R3F (ADR-0002) | opencode    | done   | feat/task-1 (merged em dev) |
| 2   | Componente Hero + Portal 3D     | antigravity | done   | feat/task-2 (merged em dev) |
| 3   | Script pipeline glTF-Transform  | opencode    | done   | feat/task-3 (merged em dev) |
| 4   | Remover Portal 3D + lógica immersive-vr | opencode | done | feat/task-4 (merged em dev) |
| 5   | Permissão de câmera + fluxo de erro | opencode | done (⚠️ ver nota) | feat/task-5 (merged em dev) |
| 6   | Integração MediaPipe Face Landmarker | opencode | done (⚠️ ver ressalva) | feat/task-6 (merged em dev) |
| 7   | Seletor de modelos de óculos/headset (placeholder) | antigravity | todo | - |
| 8   | Ancoragem do GLB nos landmarks faciais | antigravity | todo | - |
| 9   | Overlay vídeo + canvas 3D compostos | antigravity | todo | - |

> Tasks 4-9: pivô de escopo registrado em
> [[ADR-0003-Feature-Try-On-Facial|docs/vault/07-Decisoes/ADR-0003-Feature-Try-On-Facial.md]]
> (2026-08-14) — ver detalhes de cada uma abaixo, seção "Pivô — Try-on facial".

## Checklist final (build integrado em `dev`, commit `26eb8cc`, pré-pivô)

Rodado contra `dev` depois dos 3 merges (não contra worktree isolado) — `npm install`
limpo, `npm run typecheck`, `npm run build` e `npm run start` na raiz do repo.

### docs/vault/05-VR-e-3D/Orcamento-de-Performance.md — "Portões de qualidade"

- [x] **Peso da 1ª dobra ≤ 5 MB** — medido via `vite preview` + Network tab (Task 2):
  `index` (~50 kB) + `preload-helper` + CSS ≈ 260 kB no paint inicial; o chunk `Scene`
  (~1 MB / 282 kB gzip) chega logo depois, code-split. Total bem abaixo do teto de
  5 MB. Os chunks `emulate`/`living_room`/`music_room`/`office_*` (~6 MB, emulador do
  `@react-three/xr`) existem em `dist/` mas **não são baixados** em uso normal
  (confirmado via Network tab) — candidato a limpeza futura, não bloqueante.
- [x] **Nenhuma alocação nova no render loop** — verificado por leitura de código:
  `VoidPortal.tsx` reaproveita `_tempScale` e os `Float32Array` de partículas fora do
  `useFrame`; nenhum `new THREE.Vector3()`/`Quaternion` dentro do loop.
- [~] **`renderer.info.render.calls` ≤ 150** — não medido em runtime (sem devtools de
  profiling instalado nesta sessão); contagem manual pela árvore de `VoidPortal`
  (3 anéis × 2 meshes + 8 marcadores + core + aura + shockwave + partículas + hitbox)
  fica em torno de ~19 draw calls, bem dentro do alvo de ~100. Recomendo confirmar com
  `renderer.info` real antes do lançamento.
- [ ] **Throttle de CPU 4× no DevTools** — não testável com as ferramentas desta sessão
  (a extensão Claude-in-Chrome não expõe throttling de CPU). Pendente de teste manual.
- [ ] **≥ 72 fps por 60 s contínuos em dispositivo alvo** — exige hardware VR (Quest);
  fora do alcance desta sessão, como já sinalizado como "não testado" na própria nota
  do vault.

### docs/vault/05-VR-e-3D/Suporte-de-Dispositivos.md — "Plano de testes" + "Requisitos de entrega"

- [x] **Fallback 3D — Chrome desktop** — testado extensivamente (Tasks 1, 2 e nesta
  checklist): renderiza, orbit/zoom funcionam, console limpo.
- [x] **Fallback estático / nível de experiência** — `useExperienceLevel` cobre
  sem-WebGL, `prefers-reduced-motion` e `saveData` (verificado por leitura de código,
  Task 2); não simulado via DevTools nesta sessão (sem acesso a emulação de mídia via
  Claude-in-Chrome).
- [x] **Botão "Entrar em VR" nunca aparece sem `isSessionSupported`** — confirmado ao
  vivo neste Chrome desktop (sem WebXR): o link não existe na árvore de acessibilidade
  da página.
- [x] **Sessão XR só inicia por gesto do usuário** — confirmado por leitura de código:
  `EnterVRButton` só chama `xrStore.enterVR()` dentro do `onClick`.
- [ ] **Fluxo completo em VR (Quest 3)** — sem hardware; não testado (mesmo status da
  nota do vault).
- [ ] **Fallback 3D — Safari iOS** / **Gaze-and-pinch — Vision Pro** — sem hardware;
  não testado.
- **HTTPS obrigatório** — não se aplica ainda (só rodou em `localhost`, isento pela
  spec do WebXR); vale revisitar no runbook de deploy quando houver domínio real.

### RF/RNF verificados diretamente nesta sessão

- [x] RF-01 — CTA acima da dobra, independente do Canvas (`Suspense`+`lazy`, testado
  com o servidor real).
- [x] RF-02 — órbita/scroll funcionam no Portal (drag testado ao vivo).
- [x] RF-03 — WebXR real via `@react-three/xr`, botão condicional confirmado.
- [~] RF-04 (formulário de lead) — validação client existe (`zod` em
  `src/lib/validation.ts`, usada em `Cta.tsx`); **não há validação server** — não há
  backend nesta fase do projeto, fora do escopo das 3 tasks executadas.
- [x] RNF-08 — fallback funciona sem WebXR (é o caminho testado o tempo todo nesta
  sessão, já que este ambiente não tem WebXR).

### Itens não cobertos por nenhuma das 3 tasks (fora de escopo, não pendência de bug)

- RNF-05 (contraste AA dentro do canvas) — botão de VR é overlay DOM com contraste
  verificado por design (Task 2), mas não medido com ferramenta de contraste.
- RNF-07 / LGPD — nenhum coletor de analytics real foi ligado (`analytics.ts` é stub);
  revisar antes de apontar para um provedor de verdade (Umami, per ADR-0002).
- Pipeline-de-Assets-3D: o **binário `ktx` (KTX-Software) não está instalado** nesta
  máquina — o pipeline funciona e foi validado no caminho "KTX2 pulado com aviso".
  Instalar KTX-Software antes de otimizar o primeiro asset de verdade para ganhar o
  benefício de VRAM do KTX2.

## Detalhes

### Task 1 — Scaffold Vite+TS+R3F (ADR-0002)

Base técnica: [ADR-0002](docs/vault/07-Decisoes/ADR-0002-Stack-Base.md) +
[Estrutura de Pastas](docs/vault/02-Arquitetura/Estrutura-de-Pastas.md).

Requisitos não negociáveis:

- **Todo código-fonte da aplicação em `/src`** — nada solto na raiz além de config
  (`package.json`, `vite.config.ts`, `tsconfig*.json`, `tailwind.config.*`, etc.).
- **`index.html` na raiz** apontando para `/src/main.tsx` (padrão Vite) — não duplicar HTML.
- **`npm run start` sobe tudo com um único comando** — hoje isso é só o dev server
  do Vite (`vite`, servindo `/src`). Se no futuro entrar um processo companheiro
  (ex.: Umami local), `start` passa a orquestrar via `concurrently`; por ora o
  mínimo já cobre o requisito.
- **Migrar o design existente** (`index.html`, `assets/css/style.css`,
  `assets/js/main.js` atuais) para dentro de `/src`, respeitando
  `sections/` / `scene/` / `components/` — não descartar o visual atual.

**Status: done.** Refeita do zero em `../void-task-1` contra `dev` (a primeira
tentativa nunca rodou de verdade — nenhum worktree/branch existia; um
`frontend/public/img` órfão apareceu direto em `main`, removido). Achados e
correções no processo, não no código da task:

- `dispatch.sh` criava o worktree a partir do HEAD implícito (`main`) em vez
  de `dev` — corrigido para `git worktree add ... dev` explícito.
- `dispatch.sh` chamava `opencode run --model anthropic/claude-sonnet-4-6`,
  um slug que não existe em nenhum provider autenticado (`opencode providers
  list` só tem OpenRouter e GitHub Copilot) — todo run falhava com
  "Unexpected server error".
- Trocado para `openrouter/anthropic/claude-sonnet-5`: rodou, mas a conta
  OpenRouter não tem crédito suficiente ("requested up to 32000 tokens, but
  can only afford 4000") — **`opencode` não é de fato "sem limite de crédito
  relevante" quando o modelo passa por OpenRouter**, ao contrário do que
  CLAUDE.md assumia.
- Trocado para `opencode/big-pickle` (catálogo free do próprio opencode, sem
  essa trava) — completou o scaffold inteiro numa rodada: deps, configs,
  migração pixel-equivalente do design, `npm run build` e smoke test do dev
  server, tudo validado pelo próprio agente antes de commitar.

Revisão manual: diff de 37 arquivos ok, estrutura bate com
Estrutura-de-Pastas.md, fronteira `scene/`↛`sections/` respeitada. Corrigi
manualmente 4 atributos SVG kebab-case→camelCase em `Beneficios.tsx`
(`stroke-width` etc. — warning de console, sem impacto visual). Validado por
mim: `npm run build` e `npm run start` no worktree, teste visual via
Claude-in-Chrome (desktop 1440px + mobile ~500px de viewport): console sem
erros, CTA acima da dobra sem depender do canvas (RF-01), sem overflow
horizontal em mobile, form de acesso funcional. Nav sem hambúrguer em mobile
é comportamento herdado do design original (confirmado no CSS antigo em
`dev`), não regressão da migração. Merge `feat/task-1 → dev` sem conflitos.

### Task 2 — Componente Hero + Portal 3D

**Status: done.** `antigravity` rodou de primeira contra `dev` atualizado (sem
os problemas de infraestrutura da task 1 — `dispatch.sh` já estava correto).
Prompt cobriu docs/vault/05-VR-e-3D/ (Como-Funciona-o-Tracking,
Orcamento-de-Performance, Suporte-de-Dispositivos) e
docs/vault/04-Design-e-UX/Acessibilidade-e-Conforto-VR.md.

Entregue: `VoidPortal` (anéis contra-rotativos + singularidade + 160
partículas + shockwave ao ativar, via `src/scene/objects/`), `OrbitControls`
calibrado (RF-02, sem pan, limites de distância/ângulo, autoRotate suspenso
em `prefers-reduced-motion` e em sessão XR), WebXR real via `@react-three/xr`
(`xrStore`, `XROrigin`, botão "Entrar em VR" que nunca aparece sem
`isSessionSupported('immersive-vr')` — RF-03), estratégia de fallback em 3
níveis (`useExperienceLevel`: estático / 3D / 3D+XR, cobrindo sem-WebGL,
`prefers-reduced-motion` e `saveData`), code-splitting do Canvas via
`React.lazy`+`Suspense` com `StaticFallback` como placeholder. 7 materiais
únicos, ~19 draw calls, zero alocação no `useFrame` — dentro do orçamento de
Orcamento-de-Performance.md.

Revisão manual + validação própria: `npm run build` ok; `vite preview` +
Network tab confirmam que só `index` (~50 kB), `preload-helper`, CSS e
`Scene` (~1 MB, code-split, carrega depois do primeiro paint) são baixados no
load normal — os chunks `emulate`/`living_room`/`music_room`/`office_*`
(~6 MB somados) são o emulador de dispositivo do próprio `@react-three/xr` e
**não são buscados** em uso normal (achado registrado, não bloqueante; vale
investigar depois se dá pra excluir do bundle). Console limpo (só o aviso
inofensivo de depreciação do `THREE.Clock`). Drag/orbit testado e funcional;
botão de VR corretamente ausente no Chrome desktop sem WebXR. Merge
`feat/task-2 → dev` sem conflitos.

### Task 3 — Script pipeline glTF-Transform

**Status: done.** `opencode` (agente corrente, este repositório) rodou direto
no worktree `../void-task-3` (branch `feat/task-3`) contra a receita de
docs/vault/05-VR-e-3D/Pipeline-de-Assets-3D.md +
Orcamento-de-Performance.md.

Entregue: `scripts/optimize-glb.mjs` (pipeline de 6 etapas: `dedup` → `prune`
→ `resize` max 1024×1024 → compressão de geometria `draco` (edgebreaker) ou
`meshopt` (medium) conforme animação/morph targets → KTX2 opcional via binário
externo `ktx` → validação final com `gltf-validator`, falhando com exit 1 em
saída inválida), `scripts/sync-runtime-3d.mjs` (copia transcoders do three →
`public/`), `src/lib/gltfLoader.ts` (GLTFLoader com KTX2 + Draco + Meshopt e
JSDoc de dispose), transcoders commitados em `public/basis/` e `public/draco/`,
`scripts/README.md` (uso, dependência de sistema KTX-Software, desvios) e os
scripts `assets:optimize` / `assets:sync-runtime-3d` no `package.json`.

Achados/correções no processo:

- **KTX2 via binário de sistema** (decisão do orquestrador): o CLI v4 do
  glTF-Transform (`toktx.ts`) chama `spawn('ktx', ...)`. `ktx` (KTX-Software ≥
  4.3.0) **não está instalado nesta máquina** — o passo 5 foi validado no
  caminho de "pula com aviso, GLB continua válido". Com o binário, faz
  ETC1S (qlevel 128/clevel 1) p/ albedo/AO/máscaras e UASTC (quality 2) p/
  normal maps, alinhando dimensões a múltiplos de 4 sem nunca ampliar.
- **Realidades do v4** (desvios documentados no README): sem `resize`/`etc1s`/
  `uastc` standalone — resize via `textureCompress({ resize })` com fallback
  puro JS (ndarray + ndarray-pixels + ndarray-lanczos); `draco()` exige
  `draco3dgltf` e `meshopt()` exige `meshoptimizer` (encoders WASM npm, sem
  binário de sistema). DevDeps = 4 da nota + `draco3dgltf`, `meshoptimizer`,
  `ndarray`, `ndarray-pixels`, `ndarray-lanczos`.
- **Bug real do meshopt**: sem registrar `KHRMeshQuantization` no IO, o meshopt
  quantizava POSITION p/ SHORT normalized mas a extensão não era escrita →
  GLB inválido (`MESH_PRIMITIVE_ATTRIBUTES_ACCESSOR_INVALID_FORMAT`). Corrigido
  registrando a extensão.
- **`prune` remove texturas sólidas** (`pruneSolidTextures`): num teste com
  texturas de cor única, albedo/normal foram trocadas por cor constante de
  material (comportamento correto do gltf-transform, não bug — revisto o asset
  de teste com padrão texturizado).

Validação própria: `npm run typecheck` e `npm run build` ok; testes de asset
com texturas (draco: 178.8 kB → 78.9 kB, resize 2048×1536 → 1024×768, 3
texturas e slots preservados) e animado (meshopt) passaram no validador; paths
de erro testados (sem args/arquivo inexistente → exit 2, GLB corrompido → exit
1, `--help` → exit 0). Scratch de teste em `tmp/` removido antes do commit.

## Pivô — Try-on facial (2026-08-14)

Escopo do produto mudou: de landing page com sessão `immersive-vr` para feature isolada
de try-on facial (câmera → detecção de rosto → modelo 3D ancorado no rosto). Registrado
em [[ADR-0003-Feature-Try-On-Facial]]; Escopo/Requisitos/Stack-Tecnologica reescritos no
mesmo commit da documentação (Passo 1, feito diretamente, não delegado).

### Task 4 — Remover Portal 3D + lógica immersive-vr

Remoção mecânica, delegada ao opencode. Escopo:

- Remover: `src/scene/xr/` inteiro (`EnterVRButton.tsx`, `XRExperience.tsx`,
  `xrStore.ts`), `src/hooks/useXRSupport.ts`, `src/scene/objects/VoidPortal.tsx`,
  `src/scene/materials/portalMaterials.ts`, dependência `@react-three/xr` do
  `package.json`, estilos `.xr-btn*`/`.xr-button-wrapper` de `site.css`.
- Simplificar `Scene.tsx`: tirar o wrapper `<XR store={xrStore}>`, os checks de
  `isPresenting` no `OrbitControls`, a renderização de `<VoidPortal>` — deixar um
  placeholder mínimo comentado no lugar (a Task 8 entra com o conteúdo real).
- Simplificar `useExperienceLevel` (`usePerfProfile.ts`): remover o tier
  `3d-com-xr-possivel` atrelado a `navigator.xr` — não existe mais distinção de XR
  possível, só `estatico`/`3d`.
- **Manter**: `Scene.tsx` como componente lazy-loaded via `React.lazy`+`Suspense` em
  `Hero.tsx` (code-splitting), `StaticFallback.tsx` e o padrão de fallback por
  `prefers-reduced-motion`/`usePerfProfile`/sem-WebGL — são a base reaproveitável pra
  Task 7-9 construírem em cima.
- Não mexer em cópia/marketing (Hero/Filosofia/Beneficios/ComoFunciona/Cta) — fora do
  escopo desta task (ver observação em `docs/vault/Home.md`).

**Status: done.** `opencode` rodou de primeira, sem intercorrências (esbarrou só na
mesma restrição de sandbox fora do worktree ao tentar seu próprio smoke test em `/tmp`
— comportamento esperado, não travou a task, só deixou de rodar `npm run start`
sozinho). Diff limpo: 12 arquivos, -1088/+14 linhas — só remoção + as duas
simplificações pedidas (`Scene.tsx`, `useExperienceLevel`). `grep` de confirmação sem
resultados fora do comentário TODO permitido. Corrigi eu mesmo um `aria-label` residual
que ainda dizia "Portal 3D interativo do VOID". Validado por mim: `npm run typecheck`,
`npm run build` (chunk `Scene` caiu de ~1 MB para 898 kB — sumiu o emulador do
`@react-three/xr`), `npm run start` + teste visual (placeholder renderiza, console
limpo, nenhum "Entrar em VR" na árvore de acessibilidade). Merge `feat/task-4 → dev`
sem conflitos.

### Task 5 — Permissão de câmera + fluxo de erro

`getUserMedia`, tratamento de `NotAllowedError`/`NotFoundError`/contexto inseguro, com
mensagem clara e acionável em cada caso — ver RF-01/RNF-08 em [[Requisitos]] e a tabela
"Problemas comuns" de [[Setup-do-Ambiente]]. Delegado ao opencode (bem especificado,
sem ambiguidade visual).

### Task 6 — Integração MediaPipe Face Landmarker

`@mediapipe/tasks-vision`, loop de detecção rodando sobre o `MediaStream` da Task 5.
Carregar o runtime/modelo do MediaPipe fora do caminho crítico (mesmo princípio de
lazy-load já usado pro Canvas — RNF-03 em [[Requisitos]]). Delegado ao opencode.

**Status Task 6: done, com ressalva** (a mesma limitação de câmera da Task 5 se
aplica — ver ressalva da Task 5 acima). `opencode` entregou:

- `src/hooks/useFaceLandmarker.ts` — hook puro (sem JSX): `import()` dinâmico do
  `@mediapipe/tasks-vision` (chunk code-splitted, fora do bundle inicial), assets
  locais de `public/mediapipe/` (sem CDN em runtime, mesmo princípio da Task 3),
  `createFromOptions` com `delegate: "CPU"`, `runningMode: "VIDEO"`, `numFaces: 1`,
  `outputFaceBlendshapes: false`, `outputFacialTransformationMatrixes: true`;
  loop de detecção via `requestVideoFrameCallback` (fallback `requestAnimationFrame`)
  com pausa quando o vídeo não está tocando; retorna `{ status, detected,
  facialTransformationMatrix: Float32Array|null, error, frameCount }`. **Sem
  suavização** — a matriz 4×4 crua por frame é o input da Task 8 (smoothing lá).
  Fronteiras respeitadas: não tocou em `useCamera.ts`, não implementou ancoragem
  (Task 8) nem layout (Task 9).
- `scripts/sync-mediapipe-assets.mjs` (`assets:sync-mediapipe`) — copia o runtime
  WASM de `node_modules/@mediapipe/tasks-vision/` e baixa o modelo
  `face_landmarker.task` (float16) do storage oficial do MediaPipe; assets
  commitados em `public/mediapipe/` (~27 MB).
- `scripts/smoke-mediapipe.mjs` (`assets:smoke-mediapipe`) — smoke test **em Node**
  (shims de `document`/`fetch`/WebGL): valida que os 5 arquivos existem, que
  `FilesetResolver.forVisionTasks` resolve, que `createFromOptions` sobe o grafo
  ("Graph successfully started running.") e que `detect()` roda inferência real
  (frame em branco 64×64 → 0 rostos/0 matrizes). Rodou 100% verde.
- Integração temporária em `CameraPermissionGate.tsx`: quando a câmera está ativa,
  roda o hook sobre o `<video>` e mostra "Rosto detectado" / "Nenhum rosto
  detectado" + contador de frames + indicador da matriz 4×4 (`aria-live`), com
  estados de carregando/erro. CSS `.camera-gate__detection*` seguindo o padrão BEM
  do gate.

Achados técnicos registrados (importantes pra Task 8):

- **API real do `@mediapipe/tasks-vision@1.0.1`**: `FaceLandmarker.createFromOptions`
  recebe o `WasmFileset` (retorno de `forVisionTasks`) como 1º argumento, não um
  path. `detectForVideo(video, timestampMs)` exige timestamp em ms **estritamente
  crescente**. `facialTransformationMatrixes[].data` é `number[]` (não
  `Float32Array`) — o hook converte pra `Float32Array` (buffer próprio do chamador).
- **O modelo `.task` não vem no pacote npm** — só o runtime WASM (`wasm/`). E o
  export map do pacote não expõe `.../wasm/...`: o caminho válido é
  `@mediapipe/tasks-vision/vision_wasm_internal.js`.
- **`forVisionTasks` monta os caminhos como `vision_wasm[_module][_nosimd]_internal`
  sem renomear** — basePath `/mediapipe` + `public/mediapipe/` resolve.

Validação própria: `npm run typecheck` e `npm run build` ok; o build confirma o
code-splitting (chunk `vision_bundle-*.js` = 153 kB / 45 kB gzip separado do
bundle inicial; `dist/index.html` não o referencia) e o `dist/mediapipe/` com os 5
assets foi servido 200 via `vite preview`. **Pendente**: detecção de rosto real
com câmera física (ver ressalva da Task 5 — máquina sem câmera); o smoke test cobre
o "carregou + inferência roda", o frame com rosto de verdade fica pro Rafael.

Validação adicional minha: reproduzi o `assets:smoke-mediapipe` de forma independente
(mesmo resultado). Fui além do smoke test em Node e testei o loop **ao vivo no
browser**: simulei `getUserMedia` devolvendo um `MediaStream` real via
`canvas.captureStream()` (canvas animado, sem câmera física nenhuma) — confirmei
visualmente que o vídeo toca, `frameCount` incrementa continuamente (0→4 em ~3s),
"Nenhum rosto detectado" aparece corretamente (o canvas não tem rosto de verdade —
resultado esperado, não falha) e "Desligar câmera" limpa tudo de volta pro estado
idle. Isso prova o pipeline completo (vídeo → MediaPipe WASM → `detectForVideo` →
estado React → UI) funcionando de ponta a ponta, mesmo sem câmera física — só falta
mesmo um rosto humano real na frente da câmera pra validar a detecção em si.

Decisão registrada (perguntei via `AskUserQuestion`): manter os ~27 MB de assets do
MediaPipe comitados no git (não gerar via `postinstall`) — Rafael confirmou essa
preferência em 2026-08-14.

### Task 7 — Seletor de modelos de óculos/headset

2-3 modelos placeholder em GLB (geometria primitiva aceitável se não houver asset
final — não bloquear a feature por falta de modelo bonito, ver [[Escopo]]). Julgamento
visual — antigravity.

### Task 8 — Ancoragem do GLB nos landmarks faciais

O coração da feature. Usar `facialTransformationMatrixes` do Face Landmarker (não
derivar posição/rotação de landmarks individuais ponto a ponto) + suavização entre
frames — ver a recomendação técnica detalhada em [[Stack-Tecnologica]] §0. Mais sensível
a ficar "errado" (jitter) — antigravity, priorizado.

### Task 9 — Overlay vídeo + canvas 3D compostos

Vídeo da câmera como fundo, espelhado (como selfie), óculos por cima, alinhados ao
mesmo espaço de coordenadas do vídeo. Antigravity.

### Regra de teste visual para as tasks 5-9

Além do teste visual padrão via extensão Chrome, testar com câmera real (não só
"renderizou sem erro") e conferir jitter/lag no tracking antes de marcar `done`.

> ⚠️ **Limitação descoberta na Task 5, vale para 6/8/9 também**: esta máquina não tem
> câmera física (confirmado pelo Rafael em 2026-08-14). A extensão Claude-in-Chrome
> também não consegue clicar no diálogo nativo de permissão do navegador (é UI do
> browser, fora do DOM da página — `navigator.permissions.query` confirma que fica
> parado em `"prompt"` indefinidamente). Ou seja: **o caminho "câmera concedida com
> vídeo real" não é testável nesta sessão**, nem simulando nem via extensão. Ajuste de
> validação: testo tudo que dá pra testar sem hardware (build, typecheck, fluxo de erro
> simulado via patch de `navigator.mediaDevices.getUserMedia`, revisão de código), marco
> a task como `done` com essa ressalva explícita, e o Rafael valida o caminho de vídeo
> real/jitter depois, num dispositivo com câmera — isso não trava a fila.

**Status Task 5: done, com ressalva.** `opencode` entregou `useCamera.ts` (máquina de
estados idle/requesting/granted/error, checa `isSecureContext` antes de chamar
`getUserMedia`, mapeia `DOMException` por nome cobrindo nomes MDN + legados de
Chrome/Firefox, guarda contra double-request e set-state pós-unmount, libera todas as
tracks no cleanup — LGPD) e `CameraPermissionGate.tsx` (aviso de contexto antes do
prompt nativo, vídeo espelhado, `aria-live`/`aria-busy`, retry só pros motivos que fazem
sentido). Integrado temporariamente em `Scene.tsx` (comentário apontando pra Task 9).

Validação própria: `npm run typecheck`/`build` ok. Testei os 4 caminhos de erro **ao
vivo no browser**, simulando `getUserMedia` via `navigator.mediaDevices.getUserMedia =
() => Promise.reject(new DOMException(...))` antes de clicar "Ligar câmera" — não
precisa de hardware pra isso: `denied` (mensagem certa, sem "Tentar de novo" — correto,
negação é definitiva), `not-found`, `in-use` (mensagem certa + retry presente, cliquei
"Tentar de novo" e confirmei que reinvoca `requestCamera()` de verdade). O caminho
`granted` (vídeo real aparecendo espelhado) fica pendente — ver ressalva acima.
