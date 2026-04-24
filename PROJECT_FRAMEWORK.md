# Cyber Tao — 项目框架文档
**整理时间：2026-04-24**

---

## 一、项目概述

**Cyber Tao（赛博道）** 是一款融合中国传统易经占卜与赛博朋克美学的 Web 应用。
用户通过投掷铜钱起卦，AI（DeepSeek）解读卦象，生成专属"命运卡片"并可永久分享。

- **生产域名**：https://www.cybertao.space
- **GitHub**：github.com/nextstreet/my-cyber-tao（PUBLIC）
- **部署平台**：Vercel

---

## 二、技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + TypeScript + Vite |
| 样式 | Tailwind CSS v4 + scoped CSS |
| 状态管理 | Pinia（目前仅有 counter.ts 示例，未深度使用） |
| 路由 | Vue Router v5 |
| 后端/DB | Supabase（PostgreSQL + Edge Functions） |
| AI | DeepSeek `deepseek-chat`（via Supabase Edge Function） |
| 图片导出 | html-to-image / html2canvas |
| 日期工具 | date-fns |
| 部署 | Vercel（SPA 重写规则） |
| 测试 | Vitest（单元）+ Playwright（E2E） |
| Lint | ESLint + OxLint + Prettier |

---

## 三、目录结构

```
my-cyber-tao/
├── src/
│   ├── App.vue                    # 3行纯壳：<RouterView />
│   ├── main.ts                    # 挂载 router + pinia
│   ├── env.d.ts
│   │
│   ├── router/
│   │   └── index.ts               # 路由配置（见下方路由表）
│   │
│   ├── views/                     # 页面级组件
│   │   ├── HomeView.vue           # 主占卜界面（315行）
│   │   ├── DestinyView.vue        # 命运卡片展示页（1067行）
│   │   ├── ResultView.vue         # 占卜结果页（186行，待确认路由接入）
│   │   └── AboutView.vue          # 关于页
│   │
│   ├── components/                # 可复用组件
│   │   ├── DivinationInput.vue    # 占卜输入（3步骤：问题→起卦→确认）
│   │   ├── TianjiPanel.vue        # 天机面板（干支/五行/星宿/宜忌）
│   │   ├── CoinToss.vue           # 投硬币仪式组件
│   │   ├── SpiritBottle.vue       # 灵力瓶（24点系统）
│   │   ├── TaijituCore.vue        # 太极旋转核心动画
│   │   ├── SystemLog.vue          # 系统日志滚动条
│   │   ├── TalismanCard.vue       # 符文卡片（下载PNG弹窗）
│   │   ├── HexagramLine.vue       # 单条爻线组件
│   │   ├── HexagramLoader.vue     # 卦象加载动画
│   │   ├── HexagramVisual.vue     # 卦象可视化
│   │   ├── MansionResonance.vue   # 星宿共鸣组件
│   │   ├── FortuneIndex.vue       # 运势指数仪表盘
│   │   ├── WuxingGauge.vue        # 五行能量仪表
│   │   └── icons/                 # 图标组件（默认模板残留）
│   │
│   ├── composables/
│   │   └── useSwipe.ts            # 移动端滑动手势
│   │
│   ├── stores/
│   │   └── counter.ts             # Pinia store（示例，未深度使用）
│   │
│   ├── utils/
│   │   ├── tianji.ts              # 天机数据计算引擎（干支/五行/星宿/宜忌）
│   │   └── hexagramData.ts        # 六十四卦数据（待确认内容）
│   │
│   ├── lib/
│   │   └── supabase.js            # Supabase 客户端初始化
│   │
│   └── assets/
│       ├── base.css
│       ├── main.css
│       └── data/
│           ├── mansions.ts        # 二十八星宿数据
│           └── yiji.ts            # 宜忌数据
│
├── supabase/
│   └── functions/
│       └── cyber-sage/
│           ├── index.ts           # Edge Function 主入口（DeepSeek + IP/Geo）
│           └── data.ts            # 辅助数据
│
├── public/                        # 静态资源
│   ├── guardian-*.png             # 五神兽图片（龙/凤/虎/龟/麒麟）
│   ├── coin-head.png / coin-tail.png
│   ├── *.mp3                      # 音效（ambient, coin-clink, glitch）
│   ├── bg-smoke.mp4               # 背景烟雾视频
│   ├── beast-*.mp4                # 神兽视频（phoenix/qilin/tiger/turtle）
│   ├── bagua-array.svg            # 八卦阵SVG
│   ├── cloud-divider.svg
│   ├── texture-rice-paper.png     # 宣纸纹理
│   └── noise.png
│
├── e2e/                           # Playwright E2E 测试
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── CLAUDE_CONTEXT.md              # 项目状态快照（AI协作上下文）
```

---

## 四、路由结构

```
/                          → HomeView.vue     （主占卜界面）
/destiny/:cardId           → DestinyView.vue  （命运卡片展示，懒加载）
```

> ⚠️ **待确认**：`ResultView.vue` 存在但未在路由中注册，可能是开发中的中间页面。

---

## 五、核心业务流程

### 5.1 完整占卜流程

```
用户访问 /
    │
    ├─ 左页：TianjiPanel（天机面板）
    │   └─ 展示当前时空干支、五行能量、星宿、宜忌
    │
    └─ 右页：DivinationInput（3步骤）
        │
        ├─ Step 1：输入问题（textarea，最多200字）
        ├─ Step 2：投掷铜钱起卦（6次，每次3枚铜钱）
        │   └─ 3正=老阳(9)，2正1反=少阳(7)，1正2反=少阴(8)，3反=老阴(6)
        │   └─ 奇数=阳爻，偶数=阴爻；老阳/老阴=变爻
        └─ Step 3：确认提交
            │
            ▼
        HomeView.handleSubmit()
            │
            ├─ 1. POST → Supabase Edge Function: cyber-sage
            │   └─ 传入：lines[], changingLines[], question, language
            │   └─ 返回：hexagramNameZh/En, poemZh, oracle, interpretation, geoRegion, geoBeast
            │
            ├─ 2. 生成 cardId（UUID）、deviceId（localStorage持久化）
            ├─ 3. SHA-256 计算 verified_hash（防伪链）
            ├─ 4. 写入 Supabase divination_logs 表
            └─ 5. router.push('/destiny/:cardId')
```

### 5.2 命运卡片展示流程（DestinyView）

```
加载 /destiny/:cardId
    │
    ├─ Phase: loading  → 显示加载动画
    ├─ Phase: seal     → 全屏SVG入场动画（神兽专属路径 + 粒子系统）
    ├─ Phase: converge → 粒子向中心汇聚（2秒过渡）
    └─ Phase: card     → 展示命运卡片
        ├─ 神兽视频背景（按 beastKey 选择）
        ├─ 卦象信息（名称/爻线/Oracle短句）
        ├─ 稀有度系统（GODLIKE/ULTRA RARE/RARE/COMMON）
        ├─ 防伪验证（重算SHA-256对比DB）
        └─ 操作按钮（分享/复制链接/新占卜）
```

---

## 六、数据层

### 6.1 Supabase 表结构

#### `device_profiles`（设备档案）
| 字段 | 类型 | 说明 |
|------|------|------|
| device_id | uuid PK | 设备唯一标识 |
| is_unlimited | bool | Admin无限灵力标志 |
| spirit_points | int DEFAULT 24 | 灵力值（0-24） |
| last_reading_date | date | 用于每日重置判断 |
| daily_readings | int | 今日占卜次数 |
| last_reading_at | timestamptz | 最后占卜时间 |
| share_count | int | 分享次数 |
| last_share_date | date | 最后分享日期 |
| ip_address | text | IP地址 |
| geo_region | text | 地理方位 |
| geo_beast | text | 对应神兽 |

#### `divination_logs`（占卜记录）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | - | 主键 |
| device_id | - | 关联设备 |
| question | text | 用户问题 |
| hexagram_code | text | 六爻编码（如"101010"） |
| name_zh / name_en | text | 卦名中英文 |
| interpretation | text | 完整分析（150-300词） |
| oracle | text | 短句（≤50词） |
| oracle_short_sentence | text | 更短的展示短句（新字段） |
| classical_quote | text | 古典引用（GODLIKE/EPIC专属） |
| fortune_scores | json | 运势评分 |
| resonance | json | 星宿共鸣数据 |
| rarity | text | 稀有度（后端字段，优先级高于前端计算） |
| card_id | text UNIQUE | 卡片ID（CT-XXXX-卦名-hash8） |
| edition_number | int | 版本编号 |
| verified_hash | text | SHA-256前16位防伪码 |
| is_sealed | bool DEFAULT FALSE | 是否已封印 |
| ip_hash / geo_region / geo_beast | text | 地理信息 |
| has_changing | bool | 是否有变爻 |
| created_at | timestamptz | 创建时间 |

### 6.2 Supabase Edge Function: `cyber-sage`

```
输入：{ lines, changingLines, question, language }
处理：
  1. 从请求头提取IP → 计算地理方位（NORTH/EAST/SOUTH/WEST/CENTER）
  2. 方位 → 神兽映射（turtle/dragon/phoenix/tiger/qilin）
  3. 构建 DeepSeek prompt（含变爻信息、地理方位语境）
  4. 调用 DeepSeek API（deepseek-chat，temperature=0.88）
输出：{ hexagramNameZh, hexagramNameEn, poemZh, oracle, interpretation,
        hasChangingLines, changingLinePositions, geoRegion, geoBeast, ipHash }
```

---

## 七、核心算法模块

### 7.1 天机数据引擎（`src/utils/tianji.ts`）
零依赖纯算法，本地计算：
- **干支四柱**：年柱/月柱/日柱/时柱（五虎遁年起月、五鼠遁日起时）
- **五行能量**：统计四柱八字的五行分布，百分比展示
- **二十八星宿**：以2000-01-07为基准日推算当日星宿
- **农历日期**：简化版（精度±1天，覆盖2020-2040年）
- **宜忌**：基于日期种子的伪随机抽取（传统+赛博双语）

### 7.2 稀有度系统（前端计算）
```
seed = hash(deviceId + timestamp + hexCode)
syncRate = 80 + (seed % 200) / 10  → 范围 80.0% ~ 99.9%

GODLIKE:   syncRate ≥ 99%   → 红色 #ef4444
ULTRA RARE: syncRate ≥ 95.1% → 金色 #c8aa6e
RARE:       syncRate ≥ 90.1% → 青色 #67e8f9
COMMON:     syncRate < 90.1% → 蓝青 #22d3ee
```
> 后端 `rarity` 字段优先级高于前端计算（fallback机制）

### 7.3 防伪验证链
```
rawStr = `${cardId}:${deviceId}:${hexCode}:${createdAt}`
verifiedHash = SHA-256(rawStr).slice(0, 16)
```
DestinyView 加载时重算并对比 DB，显示 VERIFIED / UNVERIFIED 徽章。

### 7.4 神兽选择逻辑
- **IP方位**：IP各段求和 % 5 → NORTH/EAST/SOUTH/WEST/CENTER → 对应神兽
- **卦象名**（前端fallback）：
  - heaven/thunder/wind → dragon（青龙）
  - fire/sun/bright → phoenix（朱雀）
  - lake/mountain/metal → tiger（白虎）
  - water/rain/moon → turtle（玄武）
  - 其他 → qilin（麒麟）

---

## 八、UI/UX 设计系统

### 8.1 视觉风格
- **主题**：赛博朋克 × 中国传统文化（"赛博道"）
- **配色**：深黑底色 + 霓虹强调色（随稀有度变化）
- **字体**：Share Tech Mono（等宽/HUD风格）+ Noto Serif SC（中文衬线）
- **动效**：粒子系统、SVG路径动画、扫描线、发光效果

### 8.2 Tailwind 自定义颜色
```js
'tao-black':      '#050505'
'tao-gold':       '#C8AA6E'
'tao-gold-light': '#F2Dba5'
'tao-red':        '#8A2A2A'
'bg-tao-white':   '#ffddfa'
```

### 8.3 响应式布局
- **桌面（≥768px）**：书页双栏布局（左：天机面板，右：占卜输入）
- **移动端（<768px）**：横向翻页（滑动手势 + 指示点）

---

## 九、灵力系统（Spirit Points）

> ⚠️ **当前状态**：前端有UI预留，但核心扣减逻辑尚未完整接入

| 操作 | 灵力变化 |
|------|---------|
| 每次占卜 | -8点 |
| 解锁完整分析 | -8点 |
| 分享一次 | +8点（每天最多3次，上限+24） |
| 购买灵力 | COMING SOON |
| Admin（is_unlimited=true） | 不消耗 |

---

## 十、待完成 / 已知问题

### 高优先级
1. **ResultView.vue 未接入路由** — 存在但未注册，与 DestinyView 的关系需厘清
2. **灵力系统未完整实现** — device_profiles 表已设计，前端扣减逻辑缺失
3. **Pinia Store 未使用** — 仅有示例 counter.ts，设备状态/灵力等全局状态散落在各组件

### 中优先级
4. **TalismanCard.vue（下载PNG）** — 需随稀有度系统更新样式
5. **OG Meta Tags** — 分享到社媒时的预览图缺失
6. **付费购买灵力** — 前端预留按钮，后端逻辑待实现

### 低优先级 / 优化
7. **DestinyView.vue 体积过大**（1067行）— 粒子系统、SVG动画、卡片逻辑混在一起，可拆分
8. **HomeView 中 EDGE_FN_URL 硬编码** — 应移至环境变量
9. **supabase.js 使用 .js 扩展名** — 项目其余均为 TypeScript，建议统一
10. **hexagramData.ts 内容待确认** — 是否与 Edge Function 的卦象解读有重叠

---

## 十一、扩展方向（TODO）

- [ ] 完整灵力系统（扣减 + 分享奖励 + 购买）
- [ ] 付费功能（Stripe/支付宝接入）
- [ ] OG 预览图生成（分享卡片截图）
- [ ] 占卜历史记录页
- [ ] 多语言完善（i18n 框架化，目前散落在各组件）
- [ ] PWA 支持（离线缓存）
- [ ] 动画性能优化（Canvas粒子系统在低端设备的降级方案）
