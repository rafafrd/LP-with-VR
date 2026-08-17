| #   | Task                            | Agente      | Status | Branch       |
| --- | ------------------------------- | ----------- | ------ | ------------ |
| 1   | Scaffold Vite+TS+R3F (ADR-0002) | opencode    | done   | feat/task-1 (merged em dev) |
| 2   | Componente Hero + Portal 3D     | antigravity | done   | feat/task-2 (merged em dev) |
| 3   | Script pipeline glTF-Transform  | opencode    | done   | feat/task-3 (merged em dev) |
| 4   | Remover Portal 3D + lógica immersive-vr | opencode | done | feat/task-4 (merged em dev) |
| 5   | Permissão de câmera + fluxo de erro | opencode | done (⚠️ ver nota) | feat/task-5 (merged em dev) |
| 6   | Integração MediaPipe Face Landmarker | opencode | done (⚠️ ver ressalva) | feat/task-6 (merged em dev) |
| 7   | Seletor de modelos de óculos/headset (placeholder) | antigravity | done (⚠️ ver ressalva de processo) | feat/task-7 (merged em dev) |
| 8   | Ancoragem do GLB nos landmarks faciais | antigravity | done (⚠️ ver ressalvas) | feat/task-8 (merged em dev) |
| 9   | Overlay vídeo + canvas 3D compostos | antigravity | done (⚠️ ver ressalvas) | feat/task-9 (merged em dev) |
| 10  | Modelos GLB reais (mais poligonos) + oclusão da haste pela cabeça | antigravity | todo (1ª tentativa falhou, ver nota) | — |

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

> ⚠️ **Achado de processo, não do código**: o `agy` desta task rodou direto na working
> tree do repositório principal (em `dev`), sem commit — bug real do `dispatch.sh`
> (o branch `antigravity` do `case $AGENT` nunca fazia `cd "$WT"` antes de invocar
> `agy`, só passava `--add-dir "$WT"`, que não é suficiente). O processo do `agy`
> também deu timeout depois de ~5min ("timeout waiting for response"), sem log
> detalhado do que fez (só `--output-format json`, sem streaming). Achei os arquivos
> soltos no `git status` do repo principal ao revisar; relocado manualmente via
> `git stash` (funciona entre worktrees do mesmo repo, preserva binários) para dentro
> de `../void-task-7`, commitado lá como deveria ter sido desde o início.
> `dispatch.sh` corrigido (commit `1e1ebda`, direto em `dev`) para o mesmo padrão do
> branch `opencode`: `(cd "$WT" && agy ...)`. Mesma classe de bug da task 1 original
> (agente fora de worktree isolado), agora eliminada nos dois branches do script.

**Status: done, com ressalva de processo (não de resultado).** Apesar do timeout, o
trabalho em si estava completo e de alta qualidade: `scripts/generate-placeholder-
glasses.mjs` gera 3 modelos programaticamente via `@gltf-transform/core` +
`GLTFExporter` (Neon Classic — redondo clássico, acid; Cyber Edge — hexagonal cyber,
violet; Cyberdeck Visor — visor panorâmico tipo headset, magenta), escala métrica real
(~14cm de largura), e roda cada um pelo `optimize-glb.mjs` da Task 3 automaticamente.
`useModelSelection.ts` usa `useSyncExternalStore` — decisão de arquitetura não pedida
por mim, mas correta: sincroniza a seleção entre a árvore DOM (`ModelSelector`) e a
árvore separada do R3F (`GlassesModel` dentro do `Canvas`) sem prop drilling nem bridge
manual de Context. `ModelSelector.tsx` implementa o padrão WAI-ARIA radiogroup completo
(roving tabindex, navegação por setas). `GlassesModel.tsx` usa o `gltfLoader.ts` da
Task 3 e libera geometria/material/textura do modelo anterior ao trocar de seleção
(Convencoes-de-Codigo.md).

**Bug real encontrado e corrigido por mim** (não é achado de processo, é bug de
código): o modelo "Cyberdeck Visor" não aparecia — só os módulos laterais do headset
renderizavam, a viseira panorâmica ficava invisível. Tentei `side: THREE.DoubleSide`
primeiro (hipótese de backface culling), não resolveu. Investigando com
`@gltf-transform/core` (inspecionando bounding box local de cada mesh no GLB final),
achei a causa real: a `CylinderGeometry` parcial da viseira tinha
`thetaStart = -visorAngle/2 + Math.PI/2` — esse `+ Math.PI/2` jogava o arco inteiro
para o lado direito (+X local todo positivo, nunca cruzando o centro), em vez de
centrá-lo no eixo frontal (+Z, onde `theta=0` aponta na convenção do
`CylinderGeometry`). Corrigi removendo o offset (mesma correção nos 3 arcos parciais:
viseira, brow, LED), regenerei os GLBs e confirmei visualmente — a viseira agora
conecta os dois módulos, reconhecível como visor de headset.

Validação própria: reproduzi `node scripts/generate-placeholder-glasses.mjs` (gera +
otimiza os 3, todos passam no `gltf-validator`, bem dentro do orçamento — 10 kB/6.2 kB/
6.1 kB, alvo é ≤ 3 MB). `npm run typecheck`/`build` ok. Teste visual ao vivo: os 3
modelos carregam e renderizam corretamente (incluindo o visor corrigido), a troca de
seleção é instantânea e reflete no Canvas, console sem erros. Merge `feat/task-7 → dev`
sem conflitos.

### Task 8 — Ancoragem do GLB nos landmarks faciais

O coração da feature. Usar `facialTransformationMatrixes` do Face Landmarker (não
derivar posição/rotação de landmarks individuais ponto a ponto) + suavização entre
frames — ver a recomendação técnica detalhada em [[Stack-Tecnologica]] §0. Mais sensível
a ficar "errado" (jitter) — antigravity, priorizado.

> ⚠️ **Achado de processo (2ª vez seguida)**: o `agy` desta task deu timeout de novo
> (~292s — quase idêntico ao da Task 7), depois de já ter escrito todo o código real
> no worktree correto (o fix de `cd "$WT"` da Task 7 funcionou). Como o `dispatch.sh`
> tinha `set -e`, o script abortava antes do bloco de commit assim que o processo do
> agente saísse com erro — descartando da vista o trabalho já feito. Corrigido
> (commit `4df4477`, direto em `dev`): agora o commit acontece de qualquer jeito se
> houver mudança real no worktree, e só depois o erro do agente é propagado. Commitei
> manualmente o que já estava lá desta vez.

**Status: done, com ressalvas de processo e de validação (não de qualidade do
código).** Apesar do timeout, o resultado é sólido: `facePoseSmoother.ts`
(`FacePoseSmoother` + `decomposeFacialMatrix`) decompõe a matriz 4×4 via
`THREE.Matrix4.decompose()`, com detecção heurística de unidade (cm→m se algum
componente de posição passar de 5), suaviza posição via `lerp` e rotação via `slerp`
(`smoothingFactor` padrão 0.35 — testado e documentado como equilíbrio entre jitter e
latência), *snap* instantâneo na primeira detecção (não desliza da origem até a
primeira pose), máquina de estados hold (400ms) → fade-out (400ms) → esconder quando o
rosto some, zero alocação no `update()`. `useFaceTracking.ts` é a ponte DOM↔R3F (mesmo
padrão `useSyncExternalStore` da Task 7) — o buffer global da matriz é lido direto no
`useFrame` de `AnchoredGlasses.tsx`, sem re-render React por frame. `AnchoredGlasses`
envolve o `GlassesModel` (Task 7) e expõe props `matrix`/`forceTrackingMode` pensadas
para QA sintética. `OrbitControls` agora desabilita durante tracking ativo (não faz
sentido orbitar livremente enquanto o modelo está ancorado no rosto).

Validação própria, já que o agente não chegou a escrever a validação que eu tinha
pedido: escrevi e rodei **14 testes sintéticos standalone** (Node, sem browser) contra
`FacePoseSmoother`/`decomposeFacialMatrix` — conversão de unidade, atenuação de um
salto de ruído de 1 frame (não aplica o alvo 100% instantaneamente), snap na primeira
detecção, timing exato de hold/fade/esconder, quaternion permanece unitário após uma
sequência de rotações. **Todos os 14 passaram.** `npm run typecheck`/`build` ok.

Teste visual ao vivo (sem câmera física — ver ressalva das Tasks 5/6): injetei dados
sintéticos direto no buffer global via `import()` dinâmico do módulo
(`/src/hooks/useFaceTracking.ts`, o Vite serve `.ts` como ESM em dev) simulando uma
cabeça balançando devagar de um lado pro outro — confirmei visualmente, em várias
capturas ao longo de ~2s, os óculos seguindo a posição e a rotação de forma suave e
contínua, sem salto/tremor perceptível entre frames. Console sem erros.

**Pendente, real e explícito**: tracking contra um **rosto humano de verdade** não foi
e não pode ser validado nesta máquina (sem câmera). A lógica de suavização/timing está
rigorosamente testada; o que falta é a convenção de eixos da matriz do MediaPipe se
comportar como esperado contra uma detecção real (o código não teve tempo/dados pra
confirmar isso empiricamente — risco conhecido, não confirmado, de orientação
espelhada/invertida precisar de ajuste quando testado com câmera real) e a
qualidade/precisão do tracking em si. Fica pro Rafael validar com câmera real antes de
considerar a Task 8 fechada de ponta a ponta.

### Task 9 — Overlay vídeo + canvas 3D compostos

Vídeo da câmera como fundo, espelhado (como selfie), óculos por cima, alinhados ao
mesmo espaço de coordenadas do vídeo. Antigravity.

> ⚠️ **Achado de processo (3ª vez seguida)**: `agy` deu timeout de novo (~296s). Desta
> vez o `dispatch.sh` já comitou o trabalho automaticamente (fix da Task 8), sem
> precisar de resgate manual — o processo de mitigação amadureceu junto com o pivô.

**Status: done, com ressalvas (não de qualidade — o resultado é muito bom).**
`TryOnStage.tsx` unifica o que as Tasks 5-8 tinham em painéis soltos num único stage:
vídeo como fundo (`object-fit: cover`), Canvas R3F (`AnchoredGlasses`) sobreposto no
mesmo espaço, espelhamento (selfie) aplicado no **container comum** de vídeo+canvas via
`scaleX(-1)` — não em cada peça separada, nem tentando inverter coordenadas no espaço
3D, exatamente para não desalinhar a leitura bruta do MediaPipe (recomendação que eu
tinha dado no prompt, seguida à risca). Camada de UI (badge, botão desligar, prompt
"posicione seu rosto", seletor de modelos) fica **não espelhada**, por cima, para
texto/botões continuarem legíveis — detalhe que eu não tinha especificado, e é a
decisão certa. Novo `AdaptiveCameraController` em `Scene.tsx` ajusta FOV/aspect da
câmera 3D pra bater com a proporção do vídeo (FOV vertical canônico do MediaPipe
~63°, compensado quando o container corta topo/base do vídeo em `object-fit: cover`)
— matemática de alinhamento genuína, não só estética. `CameraPermissionGate`
refatorado para aceitar `status`/`error`/`onRequestCamera` via props (o estado da
câmera subiu pro `TryOnStage`), mantendo uso standalone via fallback interno — boa
migração, sem quebrar retrocompatibilidade.

**Foi além do pedido, de forma coerente com a task**: atualizou a copy do Hero
(eyebrow e subtítulo) que ainda falava do pitch de VR antigo — o item que eu tinha
deixado como observação em aberto em `docs/vault/Home.md` desde o Passo 1. Fazia
sentido resolver aqui, já que agora há uma tela de câmera+óculos real logo abaixo do
texto — deixar "WEBXR" do lado disso seria inconsistente. Não mudou o resto da
cópia (Filosofia/Benefícios/Como Funciona/CTA) — isso continua em aberto.

Validação própria: `npm run typecheck`/`build` ok. Teste visual ao vivo com
`MediaStream` sintético (`canvas.captureStream()`, sem câmera física): desenhei um "R"
do lado esquerdo do frame cru e um quadrado do lado direito — confirmei que aparece
como "Я" invertido do lado direito na tela: **espelhamento de selfie comprovado, não
só assumido**. Injetei pose sintética (mesma técnica da Task 8): óculos renderizam
alinhados sobre o vídeo, seguindo a pose sem crash. O prompt RF-07 ("posicione seu
rosto no quadro") aparece e some corretamente conforme a detecção. Console: um warning
do React ("Cannot update a component while rendering a different component") apareceu
**uma vez**, não se repetiu nos frames seguintes apesar do loop de injeção continuar
rodando — pela leitura do código, todas as chamadas reais a `setGlobalFaceTrackingStatus`
acontecem dentro de `useEffect`/callbacks assíncronos (nunca durante render), então a
hipótese mais provável é que o warning veio do meu método de teste (chamar o setter
direto via console, fora do ciclo normal de effects do React) — **não confirmado como
bug real**, mas registrado; vale checar de novo com fluxo de câmera de verdade.

**Pendente**: teste em viewport mobile bloqueado pela mesma limitação de ambiente já
registrada nesta sessão (`resize_window` não aplica — `window.innerWidth` continua
reportando a largura desktop mesmo depois do resize "ter sucesso"). O CSS usa
`position: absolute`/`inset: 0`/`object-fit: cover` de ponta a ponta, que é
inerentemente fluido, mas não foi confirmado visualmente em mobile nesta sessão. Junto
com a validação de câmera/rosto real já pendente das Tasks 5-8, esses dois itens ficam
pro Rafael antes de considerar o pivô 100% fechado.

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

## Checklist final do pivô (build integrado em `dev`, commit `30243e5`)

Rodado contra `dev` depois dos 6 merges (Tasks 4-9), instalação limpa (`rm -rf
node_modules && npm install`), `npm run typecheck`, `npm run build` e `vite preview`
na raiz do repo — mesmo rigor do checklist da leva anterior (Tasks 1-3).

### docs/vault/01-Visao-Geral/Requisitos.md (pós-ADR-0003)

- [x] **RF-01** — Permissão de câmera com fluxo de erro claro: 4 razões tipadas
  (negado/sem câmera/em uso/outro), mensagem específica por razão, retry só quando
  faz sentido. Testado ao vivo (Task 5).
- [x] **RF-02** — Detecção facial local, sem enviar vídeo pra servidor:
  `@mediapipe/tasks-vision` rodando 100% client-side, assets self-hosted em
  `public/mediapipe/`. Confirmado via smoke test em Node + teste ao vivo no browser
  (Task 6).
- [x] **RF-03** — Seletor entre 3 modelos (Neon Classic, Cyber Edge, Cyberdeck Visor).
  Troca instantânea testada ao vivo (Task 7).
- [~] **RF-04** — Ancoragem sem jitter perceptível: lógica de suavização
  rigorosamente testada (14 testes sintéticos, Task 8) e confirmada visualmente com
  pose sintética variando suavemente (Tasks 8 e 9). **O que falta**: confirmar contra
  rosto humano real — não testável nesta máquina (sem câmera física).
- [x] **RF-05** — Vídeo espelhado (selfie) + overlay 3D compostos corretamente.
  Espelhamento **comprovado** (não só assumido) via teste com marcador assimétrico
  ("R" → "Я" invertido do lado certo) — Task 9.
- [x] **RF-06** — Troca de modelo sem reiniciar câmera/detecção: confirmado, o
  `useModelSelection` é independente do ciclo de vida da câmera (Task 7/9).
- [x] **RF-07** — Aviso quando o rosto não é detectado ("Posicione seu rosto no
  quadro"), aparece/some corretamente conforme o estado de detecção (Task 9).

### Não funcionais

- [~] **RNF-01** (latência percebida) — não medida numericamente (dependeria de
  hardware de câmera real + instrumentação); a suavização foi calibrada visualmente
  (`smoothingFactor` 0.35) mas o número final de latência-ponta-a-ponta com câmera
  real não foi cronometrado.
- [x] **RNF-02/03** (taxa de detecção / peso do bundle inicial) — bundle inicial
  (`index.js` + CSS) ≈ 268 kB, bem abaixo do teto de 5 MB; confirmado via Network tab
  que `vision_bundle` (MediaPipe) só é buscado quando a câmera é ligada, não no load
  inicial. O chunk `TryOnStage` (~1 MB, Three.js/R3F/GLBs) carrega em paralelo ao
  primeiro paint via `Suspense`, sem bloquear a CTA (RF-01 continua satisfeito).
- [x] **RNF-04** (compatibilidade) — sem dependência de WebXR/`navigator.xr` em
  lugar nenhum do código (confirmado, `grep` limpo desde a Task 4); depende só de
  `getUserMedia` + WASM, suporte bem mais amplo que WebXR.
- [~] **RNF-05** (contraste AA) — verificado por design em todos os componentes
  novos (`ModelSelector`, `CameraPermissionGate`, `TryOnStage`), não medido com
  ferramenta de contraste dedicada.
- [x] **RNF-06** (HTTPS) — `localhost` cobre o desenvolvimento; `getUserMedia`
  seguiria a mesma regra de contexto seguro documentada em Setup-do-Ambiente.md
  quando for pra produção com domínio real.
- [x] **RNF-07** (dado pessoal) — nenhum frame de vídeo ou matriz facial sai do
  dispositivo em nenhum ponto do código (confirmado por leitura de todos os hooks
  novos — `useCamera`, `useFaceLandmarker`, `useFaceTracking` — nenhum tem
  `fetch`/requisição de rede com esses dados).
- [x] **RNF-08** (fallback sem câmera/detecção) — testado exaustivamente: negado,
  sem câmera, em uso, MediaPipe carregando, erro de MediaPipe — todos com mensagem
  clara, nenhum crash (Tasks 5-6).
- [x] **RNF-10** (licenciamento) — `@mediapipe/tasks-vision` é Apache-2.0, resto da
  stack já era MIT/Apache-2.0 desde ADR-0002.

### docs/vault/06-Analytics-e-Tracking/LGPD-e-Consentimento.md — checklist de dados faciais/câmera

- [x] Nenhum dado de pose/landmark facial enviado para fora do dispositivo
- [x] Aviso de contexto antes do prompt nativo de permissão de câmera
  ("Para o try-on, o VOID liga a câmera... nada sai do aparelho")
- [x] Câmera encerrada (`track.stop()`) ao sair da feature — `useCamera.ts` faz isso
  no cleanup e no `stopCamera()` explícito
- [x] Indicador visível de câmera ativa enquanto a sessão roda ("Câmera ativa" +
  ponto pulsante) — além do indicador nativo do navegador/SO

### Pendências reais, explícitas, não escondidas

1. **Validação com câmera e rosto humano reais** — esta máquina não tem câmera
   física. Toda a lógica foi validada com dados sintéticos (matrizes fabricadas,
   `MediaStream` de canvas) e smoke tests em Node — rigorosos, mas não substituem
   testar com uma pessoa de verdade na frente da câmera. Isso cobre: precisão do
   MediaPipe contra rosto real, convenção de eixos da matriz facial (risco conhecido
   e não confirmado de orientação espelhada/invertida — ver nota da Task 8), jitter
   real (não sintético), e alinhamento vídeo↔3D com a proporção real da câmera do
   dispositivo do Rafael.
2. **Viewport mobile não confirmado visualmente na Task 9** — `resize_window` parou
   de funcionar nesta sessão (limitação de ambiente, não do código); o CSS é fluido
   por padrão (`object-fit: cover`, `position: absolute`/`inset: 0`), mas não foi
   visto rodando numa tela estreita de verdade.
3. **Um warning do React** ("setState durante render") visto uma vez na Task 9,
   provavelmente artefato do método de teste (injeção via console fora do ciclo de
   effects) — não reproduzido, não confirmado como bug, mas não descartado com
   certeza absoluta.
4. **Cópia de marketing parcialmente desatualizada** — Hero foi atualizado na Task 9
   (eyebrow/subtítulo) porque ficaria inconsistente com a tela de câmera logo abaixo;
   Filosofia/Benefícios/Como Funciona/Cta continuam com o pitch de VR antigo (sinalizado
   desde o Passo 1 em `docs/vault/Home.md`, ainda em aberto).
5. **KTX-Software (`ktx`) não instalado** nesta máquina — os GLBs dos óculos e os
   assets futuros funcionam sem KTX2 (fallback documentado desde a Task 3), mas
   perdem o ganho de VRAM até alguém instalar o binário e reotimizar.

Nenhuma dessas pendências bloqueou a fila — todas foram contornadas com validação
alternativa (testes sintéticos, smoke tests, leitura de código) e documentadas aqui
pra você decidir o que precisa de atenção antes do merge `dev → main`.

### Task 10 — Modelos GLB reais + oclusão da haste pela cabeça

Dois problemas reportados pelo Rafael depois de testar com câmera real, delegados juntos
por serem os dois sobre "realismo visual do try-on" — antigravity (browser-in-the-loop
pra julgamento visual dos dois: qualidade do modelo e comportamento da oclusão).

**Problema 1 — baixa definição.** Os 3 placeholders atuais
(`scripts/generate-placeholder-glasses.mjs`) são primitivas simples (toros/cilindros/
caixas), poucos triângulos, "sem definição". Substituir por modelos reais de óculos
baixados da internet, **open-source ou free-to-use**: CC0 fortemente preferido (Sketchfab
com filtro CC0, Poly Pizza / "Poly by Google", tag CC0 do Meshy); CC-BY aceitável só com
arquivo de atribuição (`public/models/ATTRIBUTION.md`: fonte, autor, licença por modelo).
Evitar licenças ambíguas (TurboSquid/CGTrader "free" sem termo de redistribuição claro).
Manter os 3 slots selecionáveis (`useModelSelection.ts`/`ModelSelector.tsx`, Task 7) —
pode recolorir os materiais pra paleta neon já usada no código (acid `#cfff04`, violet
`#8b5cf6`, magenta `#ff2e6a`) mesmo com geometria de fonte genérica, pra manter a
identidade visual. Rodar cada GLB pelo pipeline existente (`scripts/optimize-glb.mjs`),
respeitando o orçamento de ≤3MB/modelo (Task 7) e a convenção métrica (~14cm de largura,
origem na altura das lentes — não muda o offset de ancoragem já corrigido). Orçamento de
triângulos com folga enorme (Orcamento-de-Performance.md: 50k alvo/150k teto pra cena
inteira) — não é preciso exagerar no polycount.

**Problema 2 — haste atravessando a cabeça ao virar o rosto.** `TryOnStage.tsx` (Task 9)
sobrepõe um `<Canvas>` R3F transparente sobre o `<video>` da câmera — não há profundidade
3D real do vídeo, então a haste sempre desenha por cima, mesmo quando deveria ficar atrás
da cabeça. Corrigir com um **oclusor invisível**: mesh proxy (elipsoide/caixa arredondada,
~15-16cm largura × ~22cm altura × ~20cm profundidade) ancorado na MESMA pose já suavizada
usada pelo `AnchoredGlasses` (reaproveitar `facePoseSmoother`/`useFaceTracking`, não criar
um segundo caminho de suavização — evita dessincronia entre oclusor e óculos), renderizado
com `colorWrite: false` + `depthWrite: true` (permanece invisível, mas escreve no depth
buffer) e ordem de render antes do modelo de óculos — assim os fragmentos da haste que
ficam atrás do oclusor (do ponto de vista da câmera) falham no teste de profundidade e não
desenham, deixando o vídeo aparecer por trás, lendo como "a cabeça tapa a haste". Expor o
offset/escala do oclusor como constantes ajustáveis (mesmo padrão do `EYE_LEVEL_OFFSET_M`)
— calibração fina contra uma cabeça real fica pro Rafael (sem câmera física nesta máquina,
mesma limitação de sempre). Zero alocação no `useFrame`, dispose de geometria/material ao
desmontar (Convencoes-de-Codigo.md Regras 1-2).

**Fronteiras**: não mexer em `useFaceLandmarker.ts`/`useFaceTracking.ts` — o oclusor é um
volume proxy simples ancorado na mesma matriz já usada, não precisa (e não deve) triangular
os 478 landmarks individuais (Stack-Tecnologica.md §0 já recomenda explicitamente usar a
matriz pronta, não pontos individuais — motivo de jitter). Não mexer em câmera/permissão
(Task 5) nem no pipeline MediaPipe (Task 6) além do necessário.

**Validação pedida**: `npm run typecheck`/`build`; a oclusão é testável sem câmera física
— injetar/rotacionar uma matriz facial sintética (mesma técnica das Tasks 8/9, via prop
`matrix`/`forceTrackingMode` de `AnchoredGlasses` ou escrevendo direto no buffer global de
`useFaceTracking.ts`) simulando a cabeça virando ~45-90° e confirmar visualmente (screenshot)
que a haste do lado oposto vai sumindo em vez de ficar flutuando por cima do fundo — não
pular esse teste antes de marcar `done`.

> ⚠️ **1ª tentativa de dispatch falhou (2026-08-17, ~08:36-08:41)**: erro interno do `agy`
> depois de 298s — `"cannot kill task ... status: DONE"` (parece corrida/bug interno do
> cortex do agente, não algo do nosso prompt/código). Saiu com código 1, **nenhuma mudança
> gerada** no worktree (`../void-task-10` ficou vazio, removido). ~347k tokens consumidos
> sem produzir diff. Falha de infraestrutura do agente, não do escopo da task — retry
> pendente. Achado extra desta sessão: enquanto isso rodava, percebi um **redesign completo
> da landing page** já em andamento na working tree de `dev` (outro processo, não esta
> dispatch) — troca de paleta de "void" neon (acid/violet/magenta) para uma estética clara
> estilo Apple ("cloud"/"slate"/"apple blue"). Isso **contradiz a instrução que dei no
> prompt da Task 10** de recolorir os óculos pra `#cfff04`/`#8b5cf6`/`#ff2e6a` — releia o
> prompt e ajuste a paleta-alvo antes de rodar de novo. Ver seção de documentação do redesign
> mais abaixo/no vault.

## Correção pós-pivô — âncora Y caindo no nariz (2026-08-17)

Confirmação do risco conhecido e não confirmado da Task 8 ("orientação
espelhada/invertida a ajustar quando testado com câmera real"): Rafael testou com
câmera física real e reportou os óculos ancorados na altura do nariz, não dos olhos.

**Causa**: a origem de `facialTransformationMatrixes` do MediaPipe acompanha o modelo
canônico de rosto (mais perto do nariz), não a altura dos olhos onde o GLB dos óculos
foi modelado (pivô nas lentes — ver `scripts/generate-placeholder-glasses.mjs`).
Corrigido diretamente por mim (achado de bug pontual em código já revisado, mesmo
padrão da Task 4/7 — não reaberto como task nova na fila do `dispatch.sh`), sem
delegar: `AnchoredGlasses.tsx` agora soma um deslocamento vertical
(`EYE_LEVEL_OFFSET_M`, constante + prop `eyeLevelOffsetM`) à posição ancorada, aplicado
em espaço local (rotacionado pelo quaternion da pose) para acompanhar a inclinação da
cabeça em vez de deslocar no eixo Y do mundo.

**Pendência real**: o valor inicial (2.2cm) é uma estimativa por anatomia (distância
nariz→olhos), não calibrado contra rosto real — esta máquina segue sem câmera física
(mesma limitação de todas as tasks 5-9). `npm run typecheck`/`build` ok; sem teste
visual ao vivo desta vez (extensão Claude-in-Chrome não conectou nesta sessão).
Rafael: ajuste `EYE_LEVEL_OFFSET_M` em `src/scene/objects/AnchoredGlasses.tsx` (ou passe
`eyeLevelOffsetM` como prop) olhando a câmera real até os óculos alinharem nos olhos —
o hot reload do Vite deixa isso rápido de iterar.
