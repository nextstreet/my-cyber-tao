
# Cyber Tao — 项目状态快照
**更新时间：2026-03-18**

## 技术栈
- Vue 3 + TypeScript + Vite + Tailwind CSS v4
- Supabase（DB + Edge Functions）
- Vercel（部署）
- AI：DeepSeek `deepseek-chat` via Edge Function

## 仓库 & 部署
- GitHub: github.com/nextstreet/my-cyber-tao (PUBLIC)
- Vercel team: vincenzos-projects-c14793fb / project: prj_ztamI1og4umjfjWX9PWmCpDWzqKs
- 生产域名: https://www.cybertao.space
- 最新 READY 部署: dpl_AQWgK8UQuAvUFKtBkg88uMsxVs1g（Update HomeView.vue）

## 文件结构（已确认在 GitHub 上存在）
```
src/
  App.vue                    ← 3行纯壳：<RouterView />
  main.ts                    ← 挂载 router + pinia
  lib/supabase.js
  router/index.ts            ← 路由：/ → HomeView, /destiny/:cardId → DestinyView
  views/
    HomeView.vue             ← 主占卜界面（671行，全部逻辑在此）
    DestinyView.vue          ← 命运卡片页（需要重设计）
    AboutView.vue
  components/
    CoinToss.vue             ← 投硬币仪式
    SpiritBottle.vue         ← 灵力瓶（24点系统）
    TaijituCore.vue          ← 太极旋转核心
    SystemLog.vue            ← 系统日志滚动条
    TalismanCard.vue         ← 下载PNG卡片（弹窗，非路由页）
    HexagramLine.vue
supabase/
  functions/cyber-sage/
    index.ts                 ← Edge Function（DeepSeek + IP/Geo）
    data.ts
public/
  guardian-dragon.png
  guardian-phoenix.png
  guardian-tiger.png
  guardian-turtle.png
  guardian-qilin.png
  qr-code.png
  coin-*.png
  *.mp3
vercel.json                  ← SPA重写规则
```

## Supabase 表结构
### device_profiles
- device_id uuid PK
- is_unlimited bool（admin 无限灵力）
- spirit_points int DEFAULT 24（灵力值 0-24）
- last_reading_date date（用于判断每日重置）
- daily_readings int（今日占卜次数）
- last_reading_at timestamptz
- share_count int / last_share_date date
- ip_address text / geo_region text / geo_beast text

### divination_logs
- id, device_id, question, hexagram_code, name_zh, name_en
- interpretation（完整分析 150-300词）
- oracle（短句 ≤50词，直接展示）
- card_id TEXT UNIQUE（CT-XXXX-卦名-hash8）
- edition_number int
- verified_hash text（SHA-256前16位防伪）
- is_sealed bool DEFAULT FALSE
- ip_hash, geo_region, geo_beast

## 核心业务逻辑
### 灵力系统（24点满）
- 每次占卜：-8点
- 每次解锁完整分析：-8点
- 分享一次：+8点（每天最多3次 = +24点上限）
- 购买：TODO（暂显示 COMING SOON）
- Admin(is_unlimited=true)：不消耗灵力

### 占卜流程
1. HomeView → 输入问题 → CoinToss（6次）→ emit {lines, changingLines}
2. 调用 Edge Function cyber-sage → 返回 {hexName,hexEn,poem,oracle,interpretation,geoRegion,geoBeast,ipHash}
3. 写 divination_logs + 更新 device_profiles（spirit_points-8）
4. 结果页：Oracle框（直接展示）+ Analysis框（blur，8点解锁）
5. SEAL DESTINY → 生成 card_id → router.push('/destiny/CT-...')

### 命运卡片系统
- card_id 格式：`CT-0001-坎-D408CD68`
- 防伪链：SHA-256(cardId:deviceId:hexCode:timestamp).slice(0,16) = verified_hash
- DestinyView 加载时重算 hash 对比 DB，显示 VERIFIED/UNVERIFIED 徽章
- 卡片为独立分享 URL，无需登录可查看

### 神兽选择逻辑（IP方位 + 卦象名）
- EAST→dragon, SOUTH→phoenix, WEST→tiger, NORTH→turtle, CENTER→qilin
- 卦象名也影响：heaven/thunder/wind→dragon, fire/sun→phoenix, lake/mountain→tiger, water/moon→turtle

### 卡片稀有度（syncRate 决定）
- syncRate = hash(deviceId + timestamp + hexCode + geoRegion) → 80-99.9%
- GODLIKE: ≥99%（红色，#ef4444）
- ULTRA RARE: ≥95%（金色，#c8aa6e）
- RARE: ≥90%（青色，#67e8f9）
- COMMON: <90%（蓝青，#22d3ee）

## 当前待修复 / 待完成
1. **DestinyView 卡片外观** ← 当前任务：改为真正的卡牌形状
2. TalismanCard（下载PNG）可能也需要随稀有度系统更新
3. 付费购买灵力：COMING SOON（前端预留了按钮位）
4. OG meta tags（分享到社媒时的预览图）

## Tailwind 自定义颜色
```js
'tao-black': '#050505'
'tao-gold': '#C8AA6E'
'tao-gold-light': '#F2Dba5'
'tao-red': '#8A2A2A'
'bg-tao-white': '#ffddfa'
```
