# ds_todo

> 功能丰富的待办事项桌面应用 — Next.js + TypeScript + Tailwind CSS + Electron

一个从零构建的全功能待办事项管理工具，支持优先级、截止日期、子任务、拖拽排序、暗色模式等 20+ 实用功能，已打包为 Windows 单文件可执行程序，双击即用。

---

## 快速开始

### 桌面版（推荐）

下载 `ds_todo_portable.exe`，双击启动，无需安装任何依赖。

### 开发版

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev                    # Next.js dev server (http://localhost:3000)

# 启动 Electron 桌面开发模式
npm run dev:electron           # Next.js + Electron 同时启动

# 打包桌面应用
npm run build:electron         # 构建便携版 exe
npm run build:electron:setup   # 构建安装程序 (NSIS)

# 代码检查
npm run lint                   # ESLint
npx tsc --noEmit              # TypeScript 类型检查
```

---

## 功能特性

### 任务管理
- **添加/编辑/删除** — 回车快捷提交，双击编辑文本，空文本自动删除
- **三级优先级** — 高 (红) / 中 (橙) / 低 (灰)，左侧彩色边框标识
- **截止日期** — 日期选择器 + 智能相对日期显示（今天 / 明天 / 逾期 X 天）
- **置顶任务** — 图钉按钮，置顶项始终排在最前

### 子任务 & 备注
- **子任务** — 展开式嵌套清单，独立勾选/删除，显示完成进度 (2/5)
- **备注** — 每个任务可附加文字说明，实时保存

### 搜索 & 筛选 & 排序
- **实时搜索** — 文本模糊匹配，与状态筛选联动
- **状态筛选** — 全部 / 未完成 / 已完成
- **三种排序** — 手动拖拽 / 按优先级 / 按日期
- **拖拽排序** — HTML5 Drag & Drop，自定义任务顺序

### 数据管理
- **撤销删除** — 删除后 4 秒内可撤销，弹性动画 Toast 提示
- **导出/导入** — JSON 格式备份与恢复，智能合并去重
- **localStorage 持久化** — 所有数据自动保存在本地

### 视觉 & 交互
- **暗色模式** — CSS 变量双层主题，自动检测系统偏好，手动切换无闪烁
- **入场/退场动画** — framer-motion AnimatePresence，列表项交错滑入
- **按钮涟漪** — 点击位置扩散圆形波纹
- **进度条** — 实时完成百分比，变化时脉冲高亮，全部完成变绿色
- **彩带庆祝** — 全部任务完成时触发 60 个彩色粒子动画
- **输入抖动反馈** — 空提交时输入框左右震动
- **悬浮微交互** — 卡片 hover 上浮，按钮发光，菜单缩放弹出

### 快捷键
| 快捷键 | 功能 |
|--------|------|
| `Ctrl + N` | 聚焦新建任务输入框 |
| `Ctrl + K` | 聚焦搜索框 |
| `Escape` | 清除搜索 / 取消编辑 |

---

## 技术架构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # Tailwind v4 + CSS 自定义属性 + keyframes
│   ├── layout.tsx          # 根布局 + 防闪烁主题注入脚本
│   └── page.tsx            # 唯一客户端页面，组合所有组件
├── components/             # 8 个 React 组件（全部 "use client"）
│   ├── Header.tsx          # 标题 + 主题切换旋转动画
│   ├── TodoInput.tsx       # 文本输入 + 日期选择 + 优先级按钮
│   ├── Toolbar.tsx         # 搜索 + 筛选标签 + 排序菜单 + 导出/导入
│   ├── ProgressBar.tsx     # 动画进度条 (framer-motion)
│   ├── TodoList.tsx        # AnimatePresence 包裹的列表
│   ├── TodoItem.tsx        # 单条 todo — 拖拽/编辑/子任务/涟漪
│   ├── SubtaskSection.tsx  # 可展开子任务 + 备注
│   ├── Toast.tsx           # 撤销删除弹窗 (spring 动画)
│   └── Confetti.tsx        # 60 粒子彩带
├── hooks/                  # 3 个自定义 Hook
│   ├── useTodos.ts         # 核心状态 — CRUD + localStorage 持久化
│   ├── useTheme.ts         # 暗色模式 — 系统偏好 + 手动切换
│   ├── useUndo.ts          # 撤销栈 — 4 秒自动消失
│   └── sortUtils.ts        # 排序算法 — manual/priority/date
├── types/index.ts          # Todo, SubTask, SortMode 等类型
└── lib/utils.ts            # getDateLabel, priorityWeight 纯函数
```

### 数据模型

```typescript
interface SubTask {
  id: number;
  text: string;
  done: boolean;
}

interface Todo {
  id: number;
  text: string;
  done: boolean;
  priority: "" | "high" | "medium" | "low";
  dueDate: string;       // YYYY-MM-DD
  order: number;         // 排序序号
  pinned: boolean;       // 是否置顶
  note: string;          // 备注文字
  subtasks: SubTask[];   // 子任务列表
}
```

### 状态管理

所有状态由 `useTodos` hook 统一管理，通过 props 向下传递回调函数，无外部状态库依赖。

### 主题系统

- CSS 自定义属性定义在 `:root` 和 `[data-theme="dark"]`
- 组件使用 `bg-[var(--surface)]` 等 Tailwind 任意值语法引用
- `layout.tsx` 注入内联 `<script>`，在 DOM 解析前应用保存的主题，防止 FOUC
- 暗色模式下动画渐变背景、装饰光斑、卡片阴影同步切换

### 动画系统

- **列表动画**: framer-motion `<AnimatePresence mode="popLayout">` + `layout` prop
- **CSS keyframes**: `shakeX`, `popIn`, `menuIn`, `confettiFall`, `ripple`, `spin360`
- **背景动画**: `bgShift` (20s 无限循环), `orbFloat` (15s)
- **交互动画**: `hover:translateY(-1px)`, `active:scale-[0.97]`, `transition-all`

### 桌面打包

- **Electron 42** — `electron/main.js` 主进程 + `electron/preload.js` 预加载
- **electron-builder** — 打包为 Windows 便携版 (portable) + 安装程序 (NSIS)
- **Next.js static export** — `output: "export"` 生成纯静态文件供电子加载
- 签名需管理员权限（Windows 软链接限制）

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16 | 前端框架 (App Router) |
| TypeScript | 5 | 类型安全 |
| Tailwind CSS | 4 | 原子化样式 + CSS 变量主题 |
| framer-motion | 12 | 声明式动画 (AnimatePresence) |
| Electron | 42 | 桌面应用壳 |
| electron-builder | 26 | 打包发布 |

---

## 项目统计

- **源文件**: 19 个 (.tsx / .ts / .css)
- **React 组件**: 9 个
- **自定义 Hook**: 3 个
- **代码行数**: ~2000+
- **打包体积**: ~131 MB (包含 Chromium + Node.js)

---

## 许可证

MIT License — [jackaaron01](https://github.com/jackaaron01)
