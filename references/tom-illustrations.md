# 正文插图：Visual IP 的 Tom

用户已选择 Tom 作为本写作 skill 的正文插图角色。使用 [visual-ip-illustrations](../../visual-ip-illustrations/SKILL.md) 时在请求中显式写明 Tom（路由 ID `tom`）；该 skill 的全局默认仍是 Xiaohei，不能省略角色后依赖默认值。这里只配置写作流程，不修改 Visual IP 的全局默认或其他角色包。

## 读取与执行

读取 [路由规则](../../visual-ip-illustrations/references/routing.md) 和 [Tom 入口](../../visual-ip-illustrations/references/ips/tom/index.md)，再按阶段读取 Tom 的身份、风格、构图、提示词与 QA 参考。已有的角色选择持续有效，不每张图重新询问选哪一个 IP。

- 每张图表达一个正文观点或隐喻，让 Tom 通过整理、连接、修补、寻找等具体动作承担主要含义，避免只在角落放一个装饰角色。
- 默认 16:9 横向，白色或近白底、彩色手绘、充分留白和少量短标签。保持 Tom 的灰蓝身体、白色口鼻与腹部、耳朵、长尾及可识别轮廓；细节以 [Tom 风格](../../visual-ip-illustrations/references/ips/tom/style-dna.md) 为准。
- 不自动加入 Jerry 或其他角色，不套用其他 IP 的形象规则；场景服务当前文章，不照搬动画画面或片头。
- 结构关系需要逐项读懂时，按 [配图指南](article-visuals.md) 选择 Baoyu 架构图；不把大量节点和协议标签挤进 Tom 插图。

生成前保存完整提示词，使用该 skill 解析出的原生生图能力。成图后检查 Tom 身份、动作与观点的对应、文字及画面留白。默认资产目录遵循 Tom 的 `assets/<article-slug>-tom/`，用户指定保存位置时以其要求为准。

角色包中的 [rights.md](../../visual-ip-illustrations/references/ips/tom/rights.md) 保留其来源和 `gated-authorized` 维护状态；本配置只记录用户的角色选择，不把该状态改写为版权方授权，也不向上游公开样例目录发布图片。当前只配置角色时不生成样例；以后按用户实际配图请求执行。
