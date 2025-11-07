# ✅ 执行清单 - 扩展与优化

> 基于 `EXPANSION_AND_OPTIMIZATION_PLAN.md` 的可执行任务清单

---

## 🔴 阶段 1: 基础完善（必须执行）

### Task 1.1: 构建系统 ⏱️ 5 分钟

```bash
# 执行命令
pnpm build

# 预期结果
✅ packages/cli/dist/index.js
✅ packages/cli/dist/cli.js
✅ packages/eslint-plugin-ssr-doctor/dist/index.js
✅ packages/action/dist/index.js

# 验证
node packages/cli/dist/cli.js --version
```

**状态**: ⬜ 待执行

---

### Task 1.2: 测试验证 ⏱️ 10 分钟

```bash
# 执行命令
pnpm test

# 检查覆盖率
pnpm test --coverage

# 预期结果
✅ 所有测试通过
✅ 覆盖率 > 70%（当前目标）
```

**状态**: ⬜ 待执行

---

### Task 1.3: 本地 CLI 测试 ⏱️ 15 分钟

```bash
# 测试 CLI
cd packages/cli
npm link
ssr-doctor scan --path ../../examples/next-app/src

# 预期结果
✅ 检测到 4 个违规
✅ 输出格式正确
```

**状态**: ⬜ 待执行

---

### Task 1.4: 修复构建/测试错误 ⏱️ 30-60 分钟

**预期问题**:
- TypeScript 类型错误
- 缺少依赖
- 测试用例过时

**行动**:
- 逐个修复编译错误
- 更新测试用例匹配新代码
- 确保所有测试通过

**状态**: ⬜ 待执行

---

## 🟡 阶段 2: 快速优化（推荐执行）

### Task 2.1: 添加缺失的 check 命令 ⏱️ 30 分钟

**文件**: `packages/cli/src/commands/check.ts`

```typescript
export async function check(files: string[], options: CheckOptions) {
  // 检查特定文件
  // 比 scan 更轻量
}
```

**状态**: ⬜ 待执行

---

### Task 2.2: 添加覆盖率配置 ⏱️ 15 分钟

**文件**: `vitest.config.ts`（各包）

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
});
```

**状态**: ⬜ 待执行

---

### Task 2.3: 完善 tsconfig.json ⏱️ 10 分钟

确保所有包的 TypeScript 配置一致且正确。

**状态**: ⬜ 待执行

---

### Task 2.4: 添加 .npmignore ⏱️ 5 分钟

**文件**: `packages/*/​.npmignore`

```
src/
tests/
*.test.ts
*.spec.ts
tsconfig.json
vitest.config.ts
.DS_Store
```

**状态**: ⬜ 待执行

---

## 🟢 阶段 3: 增强功能（可选执行）

### Task 3.1: 配置文件支持 ⏱️ 2 小时

- [ ] 创建 `packages/cli/src/config.ts`
- [ ] 支持 `.ssrdoctorrc.json`
- [ ] 支持 `package.json` 中的配置
- [ ] 添加配置验证

**状态**: ⬜ 待执行

---

### Task 3.2: 性能优化 ⏱️ 2 小时

- [ ] 添加正则缓存
- [ ] 优化文件读取
- [ ] 添加基准测试

**状态**: ⬜ 待执行

---

### Task 3.3: 进度条改进 ⏱️ 30 分钟

使用 `cli-progress` 替代 `ora`。

**状态**: ⬜ 待执行

---

## 📊 执行统计

### 时间估算

| 阶段 | 任务数 | 预计时间 | 必须性 |
|------|--------|----------|--------|
| 阶段 1 | 4 | 1-2 小时 | 🔴 必须 |
| 阶段 2 | 4 | 1 小时 | 🟡 推荐 |
| 阶段 3 | 3 | 4.5 小时 | 🟢 可选 |

### 建议执行顺序

**今天**:
1. ✅ Task 1.1 - 构建
2. ✅ Task 1.2 - 测试
3. ✅ Task 1.4 - 修复错误（如有）

**明天**:
4. ✅ Task 1.3 - CLI 验证
5. ✅ Task 2.1 - check 命令
6. ✅ Task 2.2 - 覆盖率配置

**后续**（根据需求）:
7. Task 2.3, 2.4
8. Task 3.x（可选）

---

## 🎯 完成标准

### 阶段 1 完成标准

- [x] `pnpm build` 成功，无错误
- [x] `pnpm test` 通过，覆盖率 > 70%
- [x] CLI 可以本地运行
- [x] 检测功能正常工作
- [x] 可以发布到 npm

### 阶段 2 完成标准

- [ ] 覆盖率 > 80%
- [ ] check 命令可用
- [ ] TypeScript 零错误
- [ ] npm 包配置正确

### 阶段 3 完成标准

- [ ] 配置文件功能完整
- [ ] 性能提升可测量
- [ ] 用户体验明显改善

---

## 🚀 立即可执行的命令

### 1. 安装依赖（如果需要）

```bash
pnpm install
```

### 2. 构建所有包

```bash
pnpm build
```

### 3. 运行测试

```bash
pnpm test
```

### 4. 检查 lint

```bash
pnpm lint
```

### 5. 本地测试 CLI

```bash
cd packages/cli
npm link
cd ../..
ssr-doctor scan --path examples/next-app/src --verbose
```

---

## ❓ 决策点

### 🔴 必须决策（现在）

**Q1**: 是否立即执行阶段 1？
- [ ] 是 → 开始构建和测试
- [ ] 否 → 先审查代码

**Q2**: 发现错误时如何处理？
- [ ] 立即修复
- [ ] 记录后续处理

### 🟡 可以稍后决策

**Q3**: 是否执行阶段 2？
**Q4**: 是否需要配置文件支持？
**Q5**: 性能优化优先级？

---

## 📝 执行日志模板

```markdown
## 执行日志 - [日期]

### Task 1.1: 构建系统
- 开始时间:
- 执行命令: pnpm build
- 结果: ✅ 成功 / ❌ 失败
- 错误（如有）:
- 解决方案:
- 完成时间:
- 耗时:

### Task 1.2: 测试验证
- ...
```

---

<p align="center">
  <strong>准备开始执行！请确认执行哪个阶段。</strong>
</p>
