# ds_todo 后续优化清单

## 小型优化（高收益 / 低风险）

### 1. TodoInput 回调稳定性
- **位置**: `src/components/TodoInput.tsx`
- **现状**: `handleAdd` 依赖 `text`/`priority`/`dueDate`，每次按键时重建
- **方案**: 用 `useRef` 存储这些值，`handleAdd` 内通过 ref 读取，使其变为稳定引用

### 2. TodoInput shake 定时器未清理
- **位置**: `src/components/TodoInput.tsx:27`
- **现状**: `setTimeout(() => setShake(false), 400)` 未在 useEffect 中管理
- **风险**: 组件在 400ms 内卸载时会在已卸载组件上 setState
- **方案**: 用 `useEffect` 管理定时器生命周期，或用 ref 追踪挂载状态

### 3. tsconfig 缺少编译选项
- **位置**: `tsconfig.json`
- **建议添加**:
  - `noUnusedLocals: true` — 编译时报未使用的局部变量
  - `noUnusedParameters: true` — 编译时报未使用的参数
  - `forceConsistentCasingInFileNames: true` — 文件名大小写一致性
- **价值**: 上次发现的 3 处死代码如果有这些选项，编译器会直接拦截

### 4. CSS 后台动画持续消耗 GPU
- **位置**: `src/app/globals.css:54-83`
- **现状**: `body::before` (bgShift 20s) 和 `body::after` (orbFloat 15s) 即使在窗口最小化时也通过 compositor 持续运行
- **方案**: 在 `visibilitychange` 事件中暂停/恢复动画，或使用 `animation-play-state`

---

## 中型优化（值得做）

### 5. localStorage 写入与状态更新解耦
- **位置**: `src/hooks/useTodos.ts` — 每个 CRUD 操作
- **现状**: `saveTodos()` 在 `setTodos` updater 回调内调用，状态变更和持久化紧耦合
- **方案**: 改为 `useEffect(() => { saveTodos(todos) }, [todos])`，单一职责，更易测试
- **注意**: 需排除首次 mount 时的写入

### 6. reorder 性能优化
- **位置**: `src/hooks/useTodos.ts:174-186`
- **现状**: 拖拽一个项目后，调用 `next.map((t, i) => ({ ...t, order: i }))` 重写整个数组的 `order` 字段（O(n) + n 个对象拷贝）
- **方案**: 只交换源和目标位置的 `order` 值，或在渲染时用 `index` 隐式排序而不存 `order` 字段

### 7. Electron Content Security Policy
- **位置**: `electron/main.js` — BrowserWindow 创建处
- **现状**: 未设置 CSP 头，静态文件服务器无安全响应头
- **方案**: 添加 `webPreferences` 的 CSP 配置，或在 `main.js` 的 HTTP 服务器中注入安全头

### 8. localStorage 容量溢出处理
- **位置**: `src/hooks/useTodos.ts` — `saveTodos()`
- **现状**: `localStorage.setItem` 可能因容量满而抛出 `QuotaExceededError`
- **风险**: React 状态已更新但持久化失败，UI 和存储脱节
- **方案**: try-catch 包裹 `setItem`，失败时用 Toast 提示用户清理数据

---

## 大型优化（需较多改动）

### 9. 状态管理迁移至 Zustand
- **现状**: 8 个回调函数通过 props 从 page → TodoList → TodoItem 层层传递
- **方案**: 引入 Zustand（~1KB），在一个 store 中管理所有 todo 状态和操作
- **收益**: 消除 prop drilling，新增操作只需改 store，组件接口大幅简化
- **改动范围**: `useTodos`、`useUndo` 合并为一个 store，page.tsx、TodoList、TodoItem 精简

### 10. 测试覆盖
- **现状**: 零测试（无单元测试、集成测试、E2E 测试）
- **方案**:
  - Vitest + React Testing Library — 组件渲染和交互测试
  - useTodos / useUndo / sortUtils — 纯逻辑单元测试
  - Playwright — 关键用户流程 E2E（添加 → 编辑 → 删除 → 撤销）
- **最低目标**: `useTodos` hook + `sortUtils` 的单元测试

### 11. 拖拽升级至 @dnd-kit/core
- **现状**: HTML5 原生 Drag & Drop，不支持触屏设备，无拖拽预览动画，无键盘重排
- **方案**: 替换为 `@dnd-kit/core`（~5KB）
- **收益**: 触屏支持、拖拽预览、键盘无障碍重排、更平滑的动画

### 12. PWA 支持
- **现状**: 已使用 `output: "export"` 静态导出，天然适合 PWA
- **方案**:
  - 添加 `manifest.json`（应用名称、图标、主题色）
  - 注册 Service Worker（离线缓存策略）
  - 生成各尺寸应用图标
- **收益**: 用户可在浏览器中"安装"应用，支持离线使用，移动端体验接近原生

---

## 优先级建议

| 优先级 | 项目 | 预计耗时 |
|--------|------|----------|
| P0 | #3 tsconfig 选项 | 5 min |
| P0 | #1 TodoInput ref 优化 | 10 min |
| P0 | #2 Shake 定时器清理 | 5 min |
| P0 | #8 localStorage 溢出处理 | 10 min |
| P1 | #6 reorder 性能 | 15 min |
| P1 | #4 CSS 动画暂停策略 | 15 min |
| P1 | #5 持久化解耦 | 20 min |
| P1 | #7 Electron CSP | 15 min |
| P2 | #9 Zustand 迁移 | 2-3 h |
| P2 | #11 @dnd-kit 替换 | 1-2 h |
| P2 | #12 PWA 支持 | 1-2 h |
| P2 | #10 测试覆盖 | 持续 |
