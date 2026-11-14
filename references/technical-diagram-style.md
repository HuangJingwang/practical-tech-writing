# 旧工程图风格：sincerely-tech-v1（按需维护）

本文件只用于用户明确指定 `sincerely-tech-v1` 或维护已有该风格资产时，保留视觉约定和渲染器用法。文章架构图现已默认采用 `baoyu-infographic / craft-handmade`，不得因图中出现真实接口、协议或时序而自动加载本文件。图型选择见 [配图指南](article-visuals.md)，内容语义见 [工程图规范](engineering-diagrams.md)。这里的参数不约束 Tom 或 Baoyu 图片。

## 基准与参数来源

- [theme.json](../assets/technical-diagrams/theme.json) 是工程主题的唯一数值来源，包含字体、色值、字号、几何与导出倍率。
- [baseline.png](../assets/technical-diagrams/baseline.png) 和 [baseline.svg](../assets/technical-diagrams/baseline.svg) 是当前 `1.0.1` 主题的视觉样本，对应 [baseline.scene.json](../assets/technical-diagrams/baseline.scene.json)。它们不是用户项目的架构证据，也不声称复原了此前丢失的图片。
- 同目录 `baseline-warm-draft.*` 是保留的历史草稿，使用旧主题；不作为当前基准。

当前默认逻辑画布为 `1200 × 720`（5:3），PNG 按主题倍率导出。高度可以随内容调整，短横图也可用 `1200 × 675`；不另设所有工程图必须 16:9 的规则。

## 视觉语言与角色

浅色低饱和背景、深色文字、细描边、小圆角、充分留白。背景可在场景中调整，不改变语义色。避免渐变、发光、复杂立体效果、装饰性大阴影和与结构无关的图标。

| 主题角色 | 含义 |
| --- | --- |
| `neutral` | 普通组件、存储和非重点服务 |
| `core` | 当前图正在解释的核心处理 |
| `external` | 实际第三方依赖，不泛指所有模型 |
| `pending` | 待处理状态或真实人工确认点 |
| `failure` | 真实失败、取消或拒绝 |

精确颜色从主题读取，不在别处维护第二份色表。通常中性色加一两种强调色即可，不必用全。绿色不兼作成功状态；状态通过标签表达。相同系列中组件的角色含义保持稳定。

## 文字与布局

- 字体与字号读取主题，当前为 `PingFang SC` 与代码字体 `Menlo`。API 和代码名保持准确大小写，不裁掉长名称或用省略号。
- 节点保留名称及必要的短职责；长解释移到正文。根据文字定节点尺寸，再排版，避免用缩小字适应已排满的框。
- 主链路清楚，边从节点边缘连接，不穿过无关节点或文字。普通流程可左到右，时序时间向下，回流走外围通道。
- 画幅、留白、网格和线宽以主题为起点；内容多时优先拆成总览与局部图。节点数量没有硬性上限，最终以正文宽度下的可读性判断。
- 导出前确认实际使用的字体。默认字体缺失时，可在本次文章的主题副本或其他可编辑制图工具中用可用的 `Noto Sans CJK SC` 等中文字体及等宽字体替代，说明替代并检查效果；这是环境适配，不要求用户再批准。现有脚本的 PNG 导出限制见下文。

## 连线与边界的默认语义

| 图型 | 线型 |
| --- | --- |
| 架构、流程、数据流 | 实线表示调用或传递，虚线可用于异步通知 |
| 时序 | 请求与事件发送用实线，返回用虚线；异步发送标 `async`，生命线用更浅的点线 |
| 状态 | 实线表示事件触发的迁移，条件写在线上 |
| 分组与边界 | 实线框表示包含，虚线框可表示并标明信任边界 |

同一图中一种线型只承担一个明确含义。领域图有其他约定时可以用图例说明，不强套上表；消息边与边界框分别解释。双向数据传输与无向结构关联使用不同表达，不能用双向箭头含糊表示“有关联”。

## 选择能表达图型的工具

[technical-diagram-kit.cjs](../scripts/technical-diagram-kit.cjs) 是**简单方框流程图渲染器**，支持 `box`、`decision`、节点端口、直角有向边和短标签，可复用 [示例场景](../assets/technical-diagrams/baseline.scene.json)。它不支持容器、生命线、`alt/loop`、专用状态节点或无向边；不要把复杂时序或部署硬塞进现有 scene。

超出这些能力时，直接使用能准确表达结构并保存源文件的 SVG、draw.io、Mermaid 或其他合适工具。用户指定编辑工具时遵从其要求。常规作图无需先扩展共享脚本；尽量应用本主题的视觉语言，并查看实际导出效果，不直接拿未校准的默认主题截图交付。

## 现有脚本用法与限制

在 skill 根目录运行，输入和输出替换为当前文章的路径：

```sh
node scripts/technical-diagram-kit.cjs /path/to/input.scene.json /path/to/output-prefix
```

上述命令生成 SVG。需要 PNG 且字体、`sharp` 已就绪时使用：

```sh
node scripts/technical-diagram-kit.cjs /path/to/input.scene.json /path/to/output-prefix --png
```

- scene 的 `height` 可调高度，`background` 可指定六位十六进制的浅色背景；其余结构参照示例和脚本，不能假设任意主题字段都支持 scene 覆盖。
- 脚本总是从自身相对路径 `../assets/technical-diagrams/theme.json` 读取主题。它检查部分坐标、文字长度、节点重叠和穿框连线；不验证业务关系，也不保证没有所有视觉遮挡。
- `--png` 需要 `sharp`；可用 `NODE_PATH` 指向已有依赖目录，不在业务项目安装绘图依赖。脚本在 macOS 检查 `PingFang.ttc` 与 `Menlo.ttc`，在其他系统要求先确认这些字体并设置 `DIAGRAM_FONT_CONFIRMED=1`；仅改 theme 的字体不会改变这个检查，不要把该变量当作绕过缺字体的方法。
- PNG 的依赖或字体检查失败时，此次调用不会落盘 SVG。先去掉 `--png` 生成可编辑 SVG，再用支持实际字体的渲染工具完成需要的 PNG；不能仅因导出依赖问题停止整项任务。
- 脚本拒绝覆盖同名前缀的目标文件。重复生成使用新前缀；不通过删除用户文件绕过保护。

## 重现与风格维护

使用该脚本时，保存 scene、所需的 SVG/PNG，以及能重现的工具副本。副本保留下面的相对关系，不能只把脚本和 theme 平铺到同一目录：

```text
source/
  scripts/technical-diagram-kit.cjs
  assets/technical-diagrams/theme.json
  figure.scene.json
```

记录所用命令与字体、导出依赖。其他工具保存其真实工程源，不强制补造 `.scene.json`；只需要 SVG 的任务无需额外生成 PNG。

普通文章只调整自己的场景或主题副本。用户要求更新共用工程风格时，制作代表样图、保留旧版并更新对应主题版本；不顺带重画历史文章。共享渲染器发生变化时回看基准样图。信息图选用已认可的 `craft-handmade` 不属于工程主题迁移。
