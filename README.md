# ds_todo

功能丰富的待办事项应用，基于 Next.js 16 + TypeScript + Tailwind CSS v4 构建。

## 功能

- 添加/编辑/删除任务，支持优先级（高/中/低）和截止日期
- 子任务（可展开，含勾选和进度显示）
- 备注（可展开文字说明）
- 置顶任务
- 搜索 + 筛选（全部/未完成/已完成）
- 排序（手动拖拽/按优先级/按日期）
- 拖拽排序 + 入场/退场动画（framer-motion）
- 暗色模式（自动检测系统偏好，无闪烁）
- 撤销删除（Toast 4 秒自动消失）
- 导出/导入 JSON
- 全部完成彩带庆祝
- 键盘快捷键：Ctrl+N 新建、Ctrl+K 搜索、Esc 清除

## 技术栈

Next.js 16 · TypeScript · Tailwind CSS v4 · framer-motion · localStorage

## 开发

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 生产构建
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript 类型检查
```
