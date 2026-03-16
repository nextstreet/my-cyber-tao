<template>
  <!-- GODLIKE 全屏故障特效 -->
  <div v-if="godlikeTriggered" class="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
    <div class="absolute inset-0 glitch-overlay"></div>
    <div class="absolute inset-0 rgb-dispersion"></div>
    <div class="absolute inset-0 scanlines-heavy"></div>
    <div class="absolute inset-0 flex items-center justify-center z-10">
      <div class="text-center screen-shake px-8">
        <div class="font-mono uppercase animate-pulse mb-4"
             style="font-size:10px;letter-spacing:1em;color:#f87171;text-shadow:0 0 20px rgba(239,68,68,0.8)">
          ⚠ GODLIKE SYNC ACHIEVED
        </div>
        <div class="font-serif animate-pulse"
             style="font-size:72px;color:#fca5a5;text-shadow:0 0 40px rgba(239,68,68,0.9),0 0 80px rgba(239,68,68,0.5)">
          {{ props.hexagramData?.nameZh }}
        </div>
      </div>
    </div>
  </div>

  <!-- 主弹窗 -->
  <div v-if="showModal"
       class="fixed inset-0 z-[100] flex flex-col items-center justify-start pt-4 pb-6 overflow-y-auto"
       style="background:rgba(2,3,6,0.98);backdrop-filter:blur(24px)">

    <!-- 稀有度标签 -->
    <div class="flex items-center gap-3 mb-4 w-full px-6 animate-fade-in" style="max-width:400px">
      <div class="h-px flex-1 opacity-60" :style="{ background: `linear-gradient(to right, transparent, ${rarityAccent})` }"></div>
      <div class="font-mono font-black uppercase px-4 py-1.5 border shrink-0"
           style="font-size:10px;letter-spacing:0.45em"
           :style="{ color: rarityAccent, borderColor: rarityAccent+'55', boxShadow: `0 0 20px ${rarityAccent}30, inset 0 0 14px ${rarityAccent}08` }">
        {{ rarityLabel }} ◈ {{ syncRate }}%
      </div>
      <div class="h-px flex-1 opacity-60" :style="{ background: `linear-gradient(to left, transparent, ${rarityAccent})` }"></div>
    </div>

    <!-- 卡片主体 -->
    <div class="perspective-2000 px-4 w-full shrink-0" style="max-width:400px">
      <div class="relative w-full transform-style-3d cursor-pointer transition-all duration-1000"
           style="aspect-ratio:9/16"
           :class="{ 'rotate-y-180': isFlipped }"
           :style="cardFilterStyle"
           @click="isFlipped = !isFlipped">

        <!-- ══════════════ 正面 ══════════════ -->
        <div class="absolute inset-0 backface-hidden flex flex-col overflow-hidden rounded-xl"
             :style="frontStyle">

          <!-- 背景噪点（视觉种子驱动）-->
          <div class="absolute inset-0 pointer-events-none rounded-xl" :style="noiseBgStyle"></div>
          <!-- 赛博网格 -->
          <div class="absolute inset-0 pointer-events-none rounded-xl cyber-grid-layer" :style="gridOffsetStyle"></div>

          <!-- 四角切角装饰 -->
          <div class="absolute inset-0 pointer-events-none z-20 rounded-xl">
            <div class="absolute top-0 left-0" :style="cornerDecor('tl')"></div>
            <div class="absolute top-0 right-0" :style="cornerDecor('tr')"></div>
            <div class="absolute bottom-0 left-0" :style="cornerDecor('bl')"></div>
            <div class="absolute bottom-0 right-0" :style="cornerDecor('br')"></div>
          </div>

          <!-- HUD 顶边 -->
          <div class="absolute top-0 inset-x-0 flex justify-between px-3 pt-2 z-30 pointer-events-none">
            <span class="font-mono" style="font-size:6px;letter-spacing:0.25em" :style="hudTextStyle">SYNC·{{ syncRate }}%</span>
            <span class="font-mono" style="font-size:6px;letter-spacing:0.25em" :style="hudTextStyle">ENTROPY·{{ entropyLabel }}</span>
          </div>

          <!-- 身份栏 -->
          <div class="relative z-10 flex justify-between items-center px-4 pt-7 pb-3 border-b shrink-0"
               :style="{ borderColor: rarityAccent+'20' }">
            <div class="flex items-center gap-2">
              <div class="flex items-center justify-center rounded" style="width:28px;height:28px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.15)">
                <span class="font-mono" style="font-size:7px;color:rgba(255,255,255,0.3)">ID</span>
              </div>
              <div>
                <div class="font-mono uppercase" style="font-size:8px;letter-spacing:0.35em;color:rgba(255,255,255,0.4)">TEMPORAL LINK</div>
                <div class="font-mono" style="font-size:7px;color:rgba(255,255,255,0.2);letter-spacing:0.2em">{{ userHash }}</div>
              </div>
            </div>
            <div class="text-right font-mono" style="font-size:7px" :style="hudTextStyle">
              <div>{{ lunarDateStamp }}</div>
              <div style="color:rgba(255,255,255,0.18);margin-top:2px">{{ cardDate }}</div>
            </div>
          </div>

          <!-- 雷达图 -->
          <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-5 border-b"
               :style="{ borderColor: rarityAccent+'15' }">
            <div class="font-serif text-white/80 uppercase mb-3" style="font-size:17px;letter-spacing:0.3em">
              {{ hexagramData.name }}
            </div>
            <div style="width:165px;height:165px;position:relative">
              <svg viewBox="0 0 100 100" class="w-full h-full"
                   :style="{ filter: `drop-shadow(0 0 6px ${rarityAccent}55)` }">
                <!-- 背景多边形 -->
                <polygon points="50,8 92,36 76,86 24,86 8,36"
                         fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
                <polygon points="50,22 74,40 66,71 34,71 26,40"
                         fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.4"/>
                <polygon points="50,36 65,46 58,63 42,63 35,46"
                         fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.3"/>
                <!-- 轴线 -->
                <line x1="50" y1="8"  x2="50" y2="86" stroke="rgba(255,255,255,0.04)" stroke-width="0.3"/>
                <line x1="8"  y1="36" x2="92" y2="36" stroke="rgba(255,255,255,0.04)" stroke-width="0.3"/>
                <line x1="24" y1="86" x2="76" y2="86" stroke="rgba(255,255,255,0.04)" stroke-width="0.3"/>
                <!-- 数据填充面 -->
                <polygon :points="radarPoints"
                         :fill="rarityAccent+'28'" :stroke="rarityAccent"
                         stroke-width="1.4" stroke-linejoin="round"/>
                <!-- 顶点光点 -->
                <circle v-for="(pt,i) in radarPointArr" :key="i"
                        :cx="pt.x" :cy="pt.y" r="2"
                        :fill="rarityAccent"
                        :style="{ filter: `drop-shadow(0 0 4px ${rarityAccent})` }"/>
                <!-- 轴标签 -->
                <text x="50"   y="5"  text-anchor="middle" font-family="monospace" font-size="3.8" :fill="rarityAccent+'90'">秩序</text>
                <text x="96"   y="37" text-anchor="start"  font-family="monospace" font-size="3.8" :fill="rarityAccent+'90'">感知</text>
                <text x="76"   y="93" text-anchor="middle" font-family="monospace" font-size="3.8" :fill="rarityAccent+'90'">根源</text>
                <text x="24"   y="93" text-anchor="middle" font-family="monospace" font-size="3.8" :fill="rarityAccent+'90'">同步</text>
                <text x="4"    y="37" text-anchor="end"    font-family="monospace" font-size="3.8" :fill="rarityAccent+'90'">混沌</text>
              </svg>
            </div>
          </div>

          <!-- 底部摘要 -->
          <div class="relative z-10 px-4 py-3 flex flex-col gap-2 shrink-0">
            <div class="w-6 h-px mb-1" :style="{ background: rarityAccent+'60' }"></div>
            <p class="font-mono italic leading-relaxed line-clamp-3"
               style="font-size:9px;color:rgba(255,255,255,0.62)">{{ shortAiText }}</p>
            <div class="flex justify-between items-end mt-1">
              <span class="font-serif"
                    style="font-size:8px;color:rgba(255,255,255,0.25);writing-mode:vertical-rl;letter-spacing:0.4em;border-left:1px solid rgba(255,255,255,0.1);padding-left:4px">
                {{ lunarDateStamp }}
              </span>
              <span class="font-mono" style="font-size:6px;color:rgba(255,255,255,0.14);letter-spacing:0.25em">SYS V2.0 // DECODED</span>
            </div>
          </div>

          <!-- HUD 侧边 -->
          <div class="absolute right-0 top-16 bottom-16 z-20 flex flex-col justify-between items-end pr-1.5 pointer-events-none">
            <span class="font-mono" style="font-size:5px;writing-mode:vertical-rl;letter-spacing:0.3em" :style="hudTextStyle">KARMA·{{ karmaIndex }}</span>
            <span class="font-mono" style="font-size:5px;writing-mode:vertical-rl;letter-spacing:0.3em" :style="hudTextStyle">FLUX·{{ fluxRate }}</span>
          </div>
          <div class="absolute left-0 top-16 bottom-16 z-20 flex flex-col justify-between items-start pl-1.5 pointer-events-none">
            <span class="font-mono" style="font-size:5px;writing-mode:vertical-rl;letter-spacing:0.3em;transform:rotate(180deg)" :style="hudTextStyle">NODE·{{ nodeId }}</span>
            <span class="font-mono" style="font-size:5px;writing-mode:vertical-rl;letter-spacing:0.3em;transform:rotate(180deg)" :style="hudTextStyle">VER·2.0.{{ versionSuffix }}</span>
          </div>

          <!-- HUD 底边 -->
          <div class="absolute bottom-0 inset-x-0 flex justify-between px-3 pb-2 z-30 pointer-events-none">
            <span class="font-mono" style="font-size:6px;letter-spacing:0.22em" :style="hudTextStyle">ARCHIVE·#CT-{{ archiveId }}</span>
            <span class="font-mono" style="font-size:6px;letter-spacing:0.22em" :style="hudTextStyle">{{ rarityLabel }}</span>
          </div>
        </div>

        <!-- ══════════════ 背面 ══════════════ -->
        <div class="absolute inset-0 backface-hidden rotate-y-180 flex flex-col overflow-hidden rounded-xl"
             :style="backStyle">

          <!-- ★ 神兽图（修复：移除 mix-blend-screen，使用正常混合 + 正确渐变遮罩）-->
          <div class="relative overflow-hidden shrink-0" style="height:58%">

            <!-- 神兽主图 - 正常显示 -->
            <img :src="beastImageUrl"
                 class="absolute inset-0 w-full h-full object-cover scale-110"
                 style="opacity:0.88; mix-blend-mode:normal; object-position:center 20%"/>

            <!-- 暗化叠层：让图像融入黑色卡片 -->
            <div class="absolute inset-0"
                 style="background:linear-gradient(180deg,rgba(4,4,8,0.15) 0%,rgba(4,4,8,0.1) 40%,rgba(4,4,8,0.7) 80%,rgba(4,4,8,0.98) 100%);z-index:2"></div>

            <!-- ★ 能量光晕层（稀有度驱动颜色）-->
            <div class="absolute inset-0 beast-aura-layer" :style="beastAuraStyle" style="z-index:3"></div>

            <!-- ★ 电路符咒 SVG 完整覆盖层 -->
            <svg class="absolute inset-0 w-full h-full"
                 viewBox="0 0 100 100" preserveAspectRatio="none"
                 :style="{ filter:`drop-shadow(0 0 5px ${rarityAccent}bb)`, zIndex:4, pointerEvents:'none' }">

              <!-- 主符咒笔画（流动效果）-->
              <g fill="none" :stroke="rarityAccent" opacity="0.75">
                <path v-for="(p,i) in talismanPaths" :key="`p${i}`" :d="p"
                      stroke-width="0.5" class="circuit-flow"
                      :style="`animation-delay:${i*0.85}s;animation-duration:${3.2+i*0.6}s`"/>
              </g>

              <!-- 连接线 -->
              <g fill="none" :stroke="rarityAccent+'80'">
                <line v-for="(ln,i) in circuitLines" :key="`l${i}`"
                      :x1="ln.x1" :y1="ln.y1" :x2="ln.x2" :y2="ln.y2"
                      stroke-width="0.35" class="circuit-flow"
                      :style="`animation-delay:${i*0.5}s;animation-duration:${4+i*0.4}s`"/>
              </g>

              <!-- 电路节点 -->
              <g :stroke="rarityAccent">
                <circle v-for="(n,i) in circuitNodes" :key="`n${i}`"
                        :cx="n.x" :cy="n.y" r="1.4"
                        :fill="n.filled ? rarityAccent : 'transparent'"
                        stroke-width="0.45" class="node-pulse"
                        :style="`animation-delay:${i*0.4}s`"/>
              </g>

              <!-- 浮动符文 -->
              <g :fill="rarityAccent+'70'" font-family="serif" font-size="4.5">
                <text v-for="(rune,i) in runePositions" :key="`r${i}`"
                      :x="rune.x" :y="rune.y"
                      class="rune-float"
                      :style="`animation-delay:${i*0.9}s`">{{ rune.char }}</text>
              </g>

              <!-- 四角华纹 -->
              <g :stroke="rarityAccent" stroke-width="0.8" fill="none" opacity="0.65">
                <path d="M3,3 L13,3 L13,6.5 M3,3 L3,13 L6.5,13"/>
                <path d="M97,3 L87,3 L87,6.5 M97,3 L97,13 L93.5,13"/>
                <path d="M3,97 L13,97 L13,93.5 M3,97 L3,87 L6.5,87"/>
                <path d="M97,97 L87,97 L87,93.5 M97,97 L97,87 L93.5,87"/>
              </g>

              <!-- 能量扫描线 -->
              <line x1="0" :y1="scanY" x2="100" :y2="scanY"
                    :stroke="rarityAccent" stroke-width="0.35" opacity="0.55"/>

              <!-- 神兽名文字水印 -->
              <text x="50" y="50" text-anchor="middle" dominant-baseline="central"
                    font-family="serif" :font-size="28"
                    :fill="rarityAccent+'08'" font-weight="bold">
                {{ hexagramData.nameZh }}
              </text>
            </svg>

            <!-- 标签 -->
            <div class="absolute top-3 left-3 font-serif uppercase"
                 style="font-size:7px;letter-spacing:0.5em;z-index:10"
                 :style="{ color: rarityAccent+'66' }">Sacred Entity</div>

            <!-- 神兽类型标签 -->
            <div class="absolute top-3 right-3 font-mono uppercase"
                 style="font-size:7px;letter-spacing:0.3em;z-index:10;padding:2px 6px;background:rgba(0,0,0,0.6)"
                 :style="{ color: rarityAccent+'88', border: `1px solid ${rarityAccent}30` }">
              {{ beastLabel }}
            </div>

            <!-- GODLIKE 标记 -->
            <div v-if="isGodlike" class="absolute bottom-14 right-3 z-10">
              <span class="font-mono animate-pulse"
                    style="font-size:8px;letter-spacing:0.3em;color:#f87171;border:1px solid rgba(239,68,68,0.45);padding:3px 8px;background:rgba(0,0,0,0.7);box-shadow:0 0 14px rgba(239,68,68,0.45)">
                ⚡ GODLIKE
              </span>
            </div>
          </div>

          <!-- ★ 下半部分：卦象信息 + HUD 数据 -->
          <div class="relative flex-1 flex flex-col overflow-hidden"
               style="background:linear-gradient(180deg,#040408 0%,#060609 100%)">

            <!-- 下半背景噪点 -->
            <div class="absolute inset-0 pointer-events-none" :style="{ ...noiseBgStyle, opacity:0.04 }"></div>
            <!-- 下半细网格 -->
            <div class="absolute inset-0 pointer-events-none cyber-grid-layer-faint"></div>

            <!-- HUD 数据条 -->
            <div class="shrink-0 flex items-center gap-3 px-4 py-2 border-b"
                 :style="{ borderColor: rarityAccent+'18' }">
              <span class="font-mono text-white/20" style="font-size:7px;letter-spacing:0.2em">◈</span>
              <span class="font-mono" style="font-size:7px;letter-spacing:0.2em" :style="hudTextStyle">SYNC {{ syncRate }}%</span>
              <span class="font-mono text-white/15" style="font-size:7px">|</span>
              <span class="font-mono" style="font-size:7px;letter-spacing:0.2em" :style="hudTextStyle">ENTROPY {{ entropyLabel }}</span>
              <span class="font-mono text-white/15" style="font-size:7px">|</span>
              <span class="font-mono" style="font-size:7px;letter-spacing:0.2em" :style="hudTextStyle">#CT-{{ archiveId }}</span>
            </div>

            <!-- 主内容区：卦名 + 卦辞 + 数据 -->
            <div class="flex-1 flex px-4 py-4 gap-4 overflow-hidden">

              <!-- 竖排卦名 -->
              <div class="flex gap-3 items-start h-full shrink-0">
                <h1 class="font-serif font-bold h-full"
                    style="font-size:48px;writing-mode:vertical-rl;letter-spacing:0.12em;line-height:1"
                    :style="{ color: rarityAccent, textShadow: `0 0 18px ${rarityAccent}55, 0 0 36px ${rarityAccent}25` }">
                  {{ hexagramData.nameZh }}
                </h1>
                <div class="w-px self-stretch my-2" :style="{ background: rarityAccent+'22' }"></div>
              </div>

              <!-- 卦辞 + 英文名 + 爻象 -->
              <div class="flex-1 flex flex-col justify-between h-full overflow-hidden">

                <!-- 英文名 -->
                <div>
                  <div class="font-mono uppercase mb-1" style="font-size:9px;letter-spacing:0.3em;color:rgba(255,255,255,0.5)">
                    {{ hexagramData.name }}
                  </div>
                  <!-- 卦辞竖排 -->
                  <p class="font-serif text-white/70"
                     style="font-size:13px;writing-mode:vertical-rl;letter-spacing:0.35em;line-height:1.6;max-height:80px;overflow:hidden">
                    {{ hexagramData.poemZh }}
                  </p>
                </div>

                <!-- 爻象迷你图 -->
                <div class="flex flex-col-reverse gap-1 mb-1">
                  <div v-for="(line, i) in (hexagramData.lines || [])" :key="i"
                       class="flex gap-1">
                    <template v-if="line === 1">
                      <div class="h-1.5 rounded-sm"
                           style="width:38px"
                           :style="{ background: rarityAccent, boxShadow: `0 0 6px ${rarityAccent}88` }"></div>
                    </template>
                    <template v-else>
                      <div class="h-1.5 rounded-sm"
                           style="width:16px"
                           :style="{ background: rarityAccent, boxShadow: `0 0 6px ${rarityAccent}88` }"></div>
                      <div class="h-1.5 rounded-sm"
                           style="width:16px"
                           :style="{ background: rarityAccent, boxShadow: `0 0 6px ${rarityAccent}88` }"></div>
                    </template>
                  </div>
                </div>
              </div>

              <!-- 右侧竖排数据 + QR -->
              <div class="flex flex-col items-end justify-between h-full shrink-0">
                <div class="font-serif uppercase"
                     style="font-size:7px;letter-spacing:0.6em;writing-mode:vertical-rl"
                     :style="{ color: rarityAccent+'30' }">Divine Archive</div>
                <div class="flex flex-col items-end gap-1.5">
                  <div class="font-mono" style="font-size:6px;letter-spacing:0.2em" :style="hudTextStyle">{{ rarityLabel }}</div>
                  <div class="font-mono" style="font-size:6px;letter-spacing:0.2em" :style="hudTextStyle">{{ lunarDateStamp }}</div>
                </div>
                <div class="p-1.5 border" :style="{ borderColor: rarityAccent+'28', background:'rgba(0,0,0,0.75)' }">
                  <img src="/qr-code.png" class="w-8 h-8" style="filter:grayscale(1) brightness(1.4) contrast(1.1)"/>
                </div>
              </div>
            </div>

            <!-- 底部 AI 摘要 -->
            <div class="shrink-0 px-4 py-2 border-t" :style="{ borderColor: rarityAccent+'15' }">
              <p class="font-mono italic leading-relaxed line-clamp-2"
                 style="font-size:8px;color:rgba(255,255,255,0.45)">
                {{ shortAiText }}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 翻转提示 -->
    <p class="font-mono mt-2 animate-pulse shrink-0"
       style="font-size:9px;letter-spacing:0.35em;color:rgba(200,170,110,0.3)">
      TAP TO FLIP
    </p>

    <!-- 操作按钮 -->
    <div class="mt-3 flex flex-col items-center gap-3 px-4 w-full shrink-0 animate-fade-up" style="max-width:400px">
      <div class="flex gap-3 w-full">
        <button @click="downloadImage('poster')"
                class="flex-1 border font-mono uppercase transition-all hover:bg-white/5"
                style="padding:10px 0;font-size:10px;letter-spacing:0.3em;border-color:rgba(255,255,255,0.18);color:rgba(255,255,255,0.55)">
          9:16 POSTER
        </button>
        <button @click="downloadImage('square')"
                class="flex-1 border font-mono uppercase font-bold transition-colors"
                style="padding:10px 0;font-size:10px;letter-spacing:0.3em"
                :style="{ borderColor:rarityAccent+'55', color:rarityAccent, background:rarityAccent+'12', boxShadow:`0 0 16px ${rarityAccent}22` }">
          1:1 SQUARE
        </button>
      </div>
      <button @click="close" class="font-mono uppercase transition-colors hover:text-white/60"
              style="font-size:9px;letter-spacing:0.4em;color:rgba(255,255,255,0.2)">Dismiss</button>
    </div>
  </div>

  <!-- 导出用隐藏 DOM（画质优先）-->
  <div class="fixed pointer-events-none" style="top:-9999px;left:-9999px">
    <!-- 9:16 海报 -->
    <div ref="posterRef" style="width:1080px;height:1920px;background:#050505;display:flex;flex-direction:column;overflow:hidden;position:relative;border:16px solid #0a0a0a">
      <img :src="beastImageUrl" style="position:absolute;inset:0;width:100%;height:55%;object-fit:cover;object-position:center 20%;opacity:0.75"/>
      <div style="position:absolute;top:0;left:0;right:0;height:55%;background:linear-gradient(180deg,rgba(5,5,5,0.2) 0%,rgba(5,5,5,0.1) 50%,rgba(5,5,5,0.95) 100%)"></div>
      <div style="position:relative;z-index:10;width:100%;padding:64px;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(200,170,110,0.2)">
        <div>
          <div style="font-family:serif;font-size:54px;color:rgba(255,255,255,0.9);letter-spacing:0.3em;text-transform:uppercase">{{ hexagramData.name }}</div>
          <div style="font-family:monospace;font-size:22px;color:rgba(255,255,255,0.3);margin-top:12px;letter-spacing:0.4em">HASH: {{ userHash }}</div>
          <div style="font-family:monospace;font-size:18px;margin-top:8px;letter-spacing:0.3em" :style="{ color: rarityAccent+'80' }">{{ rarityLabel }} · SYNC {{ syncRate }}%</div>
        </div>
        <div style="font-family:serif;font-size:26px;letter-spacing:0.5em;writing-mode:vertical-rl" :style="{ color: rarityAccent+'65' }">{{ lunarDateStamp }}</div>
      </div>
      <div style="position:relative;z-index:10;flex:1;padding:80px;display:flex;align-items:center;justify-content:center">
        <h1 style="font-family:serif;font-weight:bold;font-size:280px;letter-spacing:0.1em;writing-mode:vertical-rl;position:absolute;right:35%" :style="{ color: rarityAccent }">{{ hexagramData.nameZh }}</h1>
        <p style="font-family:serif;font-size:72px;letter-spacing:0.4em;writing-mode:vertical-rl;line-height:1.6;position:absolute;left:25%;color:rgba(255,255,255,0.88)">{{ hexagramData.poemZh }}</p>
      </div>
      <div style="position:relative;z-index:10;padding:64px;border-top:1px solid rgba(255,255,255,0.1);display:flex;gap:48px;align-items:flex-end;background:rgba(10,10,10,0.88)">
        <p style="flex:1;font-family:monospace;font-style:italic;font-size:34px;color:rgba(255,255,255,0.82);line-height:1.6;text-align:justify">{{ aiPredictionText }}</p>
        <div style="display:flex;flex-direction:column;align-items:center;gap:24px;border-left:1px solid rgba(200,170,110,0.2);padding-left:48px;flex-shrink:0">
          <span style="font-family:serif;font-size:18px;letter-spacing:0.7em;writing-mode:vertical-rl;text-transform:uppercase" :style="{ color: rarityAccent+'45' }">Sync {{ syncRate }}%</span>
          <img src="/qr-code.png" style="width:160px;height:160px;filter:grayscale(1) brightness(1.5);padding:16px;border:1px solid rgba(200,170,110,0.3);background:rgba(0,0,0,0.6)"/>
        </div>
      </div>
    </div>

    <!-- 1:1 方图 -->
    <div ref="squareRef" style="width:1080px;height:1080px;background:#050505;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;position:relative;padding:64px;border:20px solid #0a0a0a">
      <img :src="beastImageUrl" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;opacity:0.35;mix-blend-mode:normal"/>
      <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(5,5,5,0.6) 0%,rgba(5,5,5,0.4) 100%)"></div>
      <div style="position:relative;z-index:10;display:flex;justify-content:space-between;align-items:flex-start;width:100%">
        <div>
          <h2 style="font-family:serif;font-weight:bold;font-size:48px;letter-spacing:0.3em" :style="{ color: rarityAccent }">{{ hexagramData.nameZh }} // {{ hexagramData.name }}</h2>
          <div style="font-family:monospace;font-size:22px;color:rgba(255,255,255,0.45);margin-top:12px;letter-spacing:0.3em">SYNC: {{ syncRate }}% | {{ rarityLabel }}</div>
        </div>
        <div style="font-family:serif;font-size:22px;letter-spacing:0.5em;writing-mode:vertical-rl;height:200px" :style="{ color: rarityAccent+'45' }">{{ lunarDateStamp }}</div>
      </div>
      <div style="position:relative;z-index:10;display:flex;width:100%;gap:48px;align-items:flex-end">
        <div style="flex:1;border-top:1px solid rgba(200,170,110,0.25);padding-top:32px">
          <p style="font-family:monospace;font-style:italic;font-size:34px;color:rgba(255,255,255,0.9);line-height:1.6">{{ shortAiText }}</p>
        </div>
        <div style="flex-shrink:0;padding:16px;border:1px solid rgba(200,170,110,0.28);background:rgba(0,0,0,0.8)">
          <img src="/qr-code.png" style="width:128px;height:128px;filter:grayscale(1) brightness(1.5)"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { toPng } from 'html-to-image'

const props = defineProps(['hexagramData', 'aiPredictionText', 'userData'])

const showModal      = ref(false)
const isFlipped      = ref(false)
const godlikeTriggered = ref(false)
const posterRef      = ref(null)
const squareRef      = ref(null)
const generateTime   = ref(Date.now())
const scanY          = ref(10)

// 扫描线动画
let scanRaf = null
const animScan = () => {
  scanY.value = (scanY.value + 0.25) % 100
  scanRaf = requestAnimationFrame(animScan)
}
onMounted(() => { scanRaf = requestAnimationFrame(animScan) })
onUnmounted(() => { if (scanRaf) cancelAnimationFrame(scanRaf) })

// ── 视觉种子 ──
const seed = computed(() => {
  const uid  = props.userData?.id || 'guest'
  const hex  = props.hexagramData?.lines?.join('') || '000000'
  const str  = `${uid}-${generateTime.value}-${hex}`
  let h = 0
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0 }
  return Math.abs(h)
})

const userHash   = computed(() => `0x${seed.value.toString(16).toUpperCase().padStart(8,'0')}`)

// ── 同步率 / 稀有度 ──
const syncRate = computed(() => {
  const r = 80 + (seed.value % 200) / 10
  return (r > 99.9 ? 99.9 : r).toFixed(1)
})
const isGodlike = computed(() => parseFloat(syncRate.value) >= 99.0)

const rarityInfo = computed(() => {
  const r = parseFloat(syncRate.value)
  if (r >= 99.0) return { label:'GODLIKE',    accent:'#ef4444', hue:'hue-rotate(-40deg)' }
  if (r >= 95.1) return { label:'ULTRA RARE', accent:'#c8aa6e', hue:'hue-rotate(18deg)'  }
  if (r >= 90.1) return { label:'RARE',       accent:'#67e8f9', hue:'hue-rotate(172deg)' }
  return               { label:'COMMON',     accent:'#22d3ee', hue:'hue-rotate(0deg)'   }
})
const rarityLabel  = computed(() => rarityInfo.value.label)
const rarityAccent = computed(() => rarityInfo.value.accent)
const cardFilterStyle = computed(() => ({ filter: rarityInfo.value.hue }))

// 视觉种子边框偏色（每张唯一）
const borderColor = computed(() => {
  const hShift = (seed.value % 28) - 14
  const sat    = 38 + (seed.value % 22)
  return `hsla(${38 + hShift}, ${sat}%, 52%, 0.48)`
})

const frontStyle = computed(() => ({
  background: '#04040a',
  border: `1px solid ${borderColor.value}`,
  boxShadow: `inset 0 0 50px rgba(0,0,0,0.8), 0 0 0 1px ${rarityAccent.value}12`,
}))
const backStyle = computed(() => ({
  background: '#040408',
  border: `1px solid ${borderColor.value}`,
  boxShadow: `0 0 0 1px ${rarityAccent.value}12`,
}))

// 噪点纹理（频率由种子驱动）
const noiseBgStyle = computed(() => ({
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.${63+(seed.value%32)}' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
  backgroundSize: `${110+(seed.value%90)}px`,
  opacity: 0.05 + (seed.value % 3) * 0.012,
}))
const gridOffsetStyle = computed(() => ({
  backgroundPosition: `${seed.value%24}px ${seed.value%24}px`,
}))

// 四角装饰
const cornerDecor = (pos) => {
  const c = rarityAccent.value, s = '16px'
  const base = { position:'absolute', width:s, height:s }
  if (pos === 'tl') return { ...base, top:0,    left:0,  borderTop:`2px solid ${c}cc`,    borderLeft:`2px solid ${c}cc`  }
  if (pos === 'tr') return { ...base, top:0,    right:0, borderTop:`2px solid ${c}cc`,    borderRight:`2px solid ${c}cc` }
  if (pos === 'bl') return { ...base, bottom:0, left:0,  borderBottom:`2px solid ${c}cc`, borderLeft:`2px solid ${c}cc`  }
  return                   { ...base, bottom:0, right:0, borderBottom:`2px solid ${c}cc`, borderRight:`2px solid ${c}cc` }
}

const hudTextStyle = computed(() => ({
  color: `${rarityAccent.value}78`,
  textShadow: `0 0 6px ${rarityAccent.value}40`,
}))

// 神兽光晕
const beastAuraStyle = computed(() => ({
  background: `radial-gradient(ellipse at 50% 65%, ${rarityAccent.value}22 0%, ${rarityAccent.value}08 40%, transparent 70%)`,
  animation: 'beast-aura-pulse 3.5s ease-in-out infinite',
}))

// HUD 数据
const entropyLabel  = computed(() => ['STABLE','NOMINAL','OPTIMAL','CRITICAL'][seed.value % 4])
const karmaIndex    = computed(() => ((seed.value % 9999) / 100).toFixed(2))
const fluxRate      = computed(() => `${((seed.value % 100) / 10).toFixed(1)}GHz`)
const nodeId        = computed(() => `N${(seed.value % 9999).toString().padStart(4,'0')}`)
const versionSuffix = computed(() => (seed.value % 999).toString().padStart(3,'0'))
const archiveId     = computed(() => seed.value.toString(16).toUpperCase().slice(-4))
const cardDate      = computed(() => {
  const d = new Date(generateTime.value)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
})

// 雷达图
const radarPointArr = computed(() => {
  const gv = (o) => 30 + ((seed.value >> o) % 60)
  return [
    { x:50,                    y:50-(gv(1)*0.4)   },
    { x:50+(gv(2)*0.38),       y:50-(gv(2)*0.12)  },
    { x:50+(gv(3)*0.23),       y:50+(gv(3)*0.35)  },
    { x:50-(gv(4)*0.23),       y:50+(gv(4)*0.35)  },
    { x:50-(gv(5)*0.38),       y:50-(gv(5)*0.12)  },
  ]
})
const radarPoints = computed(() => radarPointArr.value.map(p=>`${p.x},${p.y}`).join(' '))

// 电路符咒路径
const talismanPaths = computed(() => {
  const s = seed.value
  return [
    `M ${18+(s%16)},${8+(s%22)} Q ${38+(s%28)},${46+(s%14)} 50,${70+(s%18)} T ${72+(s%16)},${86+(s%10)}`,
    `M 8,${40+(s%24)} L ${30+(s%22)},${46+(s%14)} L ${46+(s%14)},${82+(s%14)}`,
    `M ${72+(s%16)},8 C ${52+(s%22)},26 ${36+(s%18)},60 ${16+(s%18)},${74+(s%16)}`,
    `M 46,${6+(s%16)} L ${50+(s%6)},${34+(s%30)} L ${72+(s%18)},${74+(s%16)}`,
    `M ${22+(s%22)},${18+(s%18)} Q ${58+(s%18)},${32+(s%18)} ${76+(s%14)},${52+(s%22)}`,
  ].slice(0, 3 + (s % 2))
})

const circuitNodes = computed(() => {
  const s = seed.value
  return [
    { x:16+(s%24), y:26+(s%24), filled:(s%3)===0 },
    { x:66+(s%18), y:20+(s%18), filled:(s%3)===1 },
    { x:50,         y:50,        filled:true       },
    { x:26+(s%14), y:66+(s%14), filled:(s%2)===0  },
    { x:72+(s%14), y:60+(s%14), filled:(s%2)===1  },
    { x:38+(s%20), y:36+(s%20), filled:(s%4)===0  },
  ]
})

const circuitLines = computed(() => {
  const n = circuitNodes.value
  return [
    {x1:n[0].x,y1:n[0].y,x2:n[2].x,y2:n[2].y},
    {x1:n[1].x,y1:n[1].y,x2:n[2].x,y2:n[2].y},
    {x1:n[2].x,y1:n[2].y,x2:n[3].x,y2:n[3].y},
    {x1:n[2].x,y1:n[2].y,x2:n[4].x,y2:n[4].y},
    {x1:n[5].x,y1:n[5].y,x2:n[1].x,y2:n[1].y},
    {x1:n[0].x,y1:n[0].y,x2:n[5].x,y2:n[5].y},
  ]
})

const runePositions = computed(() => {
  const s = seed.value
  const chars = ['乾','坤','坎','离','震','巽','艮','兑','☯','◈','⬡','⚡']
  return [
    {x:8+(s%12),  y:16+(s%12), char:chars[s%chars.length]     },
    {x:74+(s%14), y:14+(s%14), char:chars[(s+1)%chars.length] },
    {x:12+(s%14), y:74+(s%14), char:chars[(s+2)%chars.length] },
    {x:72+(s%14), y:72+(s%14), char:chars[(s+3)%chars.length] },
    {x:44+(s%10), y:10+(s%12), char:chars[(s+4)%chars.length] },
    {x:18+(s%10), y:44+(s%10), char:chars[(s+5)%chars.length] },
  ]
})

// 时间印章
const lunarDateStamp = computed(() => {
  const stems    = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
  const yr = new Date(generateTime.value).getFullYear()
  return `${stems[(yr-4)%10]}${branches[(yr-4)%12]}年·极数时空`
})

// AI 摘要
const shortAiText = computed(() => {
  if (!props.aiPredictionText) return ''
  const s = props.aiPredictionText.match(/[^.!?。！？]+[.!?。！？]+/g) || [props.aiPredictionText]
  return s.slice(0,2).join(' ').trim()
})

// 神兽选取 + 名称标签
const beastKey = computed(() => {
  const n = (props.hexagramData?.name || '').toLowerCase()
  if (n.match(/heaven|sky|thunder|wind|wood/)) return 'dragon'
  if (n.match(/fire|sun|bright|south|clinging/)) return 'phoenix'
  if (n.match(/lake|mountain|metal|gold/)) return 'tiger'
  if (n.match(/water|rain|moon|north|abyss/)) return 'turtle'
  return 'qilin'
})
const beastImageUrl = computed(() => `/guardian-${beastKey.value}.png`)
const beastLabel = computed(() => ({
  dragon:'AZURE DRAGON', phoenix:'VERMILION PHOENIX', tiger:'WHITE TIGER',
  turtle:'BLACK TORTOISE', qilin:'SACRED QILIN'
})[beastKey.value])

// GODLIKE
const triggerGodlike = () => {
  if (!isGodlike.value) return
  godlikeTriggered.value = true
  setTimeout(() => { godlikeTriggered.value = false }, 2800)
}

const generate = () => {
  generateTime.value = Date.now()
  isFlipped.value    = false
  showModal.value    = true
  setTimeout(triggerGodlike, 550)
}

const downloadImage = async (format) => {
  const el = format === 'poster' ? posterRef.value : squareRef.value
  if (!el) return
  try {
    const url = await toPng(el, { quality:1, pixelRatio:2, backgroundColor:'#050505' })
    const a = document.createElement('a')
    a.download = `CyberTao-${format}-${props.hexagramData?.nameZh||'card'}.png`
    a.href = url; a.click()
  } catch(e) { console.error('Export failed:', e) }
}

const close = () => { showModal.value = false }
defineExpose({ generate })
</script>

<style scoped>
/* 3D */
.perspective-2000   { perspective: 2000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden    { backface-visibility: hidden; }
.rotate-y-180       { transform: rotateY(180deg); }

/* 背景网格 */
.cyber-grid-layer {
  background-image:
    linear-gradient(rgba(200,170,110,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200,170,110,0.04) 1px, transparent 1px);
  background-size: 22px 22px;
}
.cyber-grid-layer-faint {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(200,170,110,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200,170,110,0.025) 1px, transparent 1px);
  background-size: 16px 16px;
}

/* 电路符咒流动 */
@keyframes circuit-flow {
  0%   { stroke-dashoffset: 220; opacity: 0.15; }
  25%  { opacity: 0.85; }
  75%  { opacity: 0.85; }
  100% { stroke-dashoffset: 0;   opacity: 0.15; }
}
.circuit-flow {
  stroke-dasharray: 35 12;
  animation: circuit-flow linear infinite;
}

/* 节点脉冲 */
@keyframes node-pulse {
  0%,100% { opacity: 0.3; }
  50%      { opacity: 1.0; filter: brightness(1.5); }
}
.node-pulse { animation: node-pulse 2.2s ease-in-out infinite; }

/* 符文浮动 */
@keyframes rune-float {
  0%,100% { opacity: 0.1; transform: translateY(0); }
  50%      { opacity: 0.7; transform: translateY(-2.5px); }
}
.rune-float { animation: rune-float 4.5s ease-in-out infinite; }

/* 神兽光晕脉冲 */
@keyframes beast-aura-pulse {
  0%,100% { opacity: 0.35; }
  50%      { opacity: 0.85; }
}

/* 卡片动画 */
@keyframes fade-in { from{opacity:0} to{opacity:1} }
@keyframes fade-up { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
.animate-fade-in { animation: fade-in 0.9s ease-out forwards; }
.animate-fade-up { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

/* GODLIKE */
@keyframes glitch {
  0%,87%,100%{opacity:0}
  88%{clip-path:inset(8% 0 82% 0);opacity:0.75;transform:translate(-6px);background:rgba(239,68,68,0.2)}
  90%{clip-path:inset(52% 0 28% 0);opacity:0.75;transform:translate(6px);background:rgba(6,182,212,0.2)}
  92%{clip-path:inset(26% 0 54% 0);opacity:0.65;transform:translate(-4px)}
  94%{opacity:0.3}
}
.glitch-overlay { background:transparent; animation:glitch 0.9s steps(1) 3; position:absolute; inset:0; }

@keyframes rgb-split { 0%,100%{opacity:0} 12%,88%{opacity:0.1} 50%{opacity:0.2} }
.rgb-dispersion {
  background:
    radial-gradient(ellipse at 28% 50%,rgba(239,68,68,0.4) 0%,transparent 58%),
    radial-gradient(ellipse at 72% 50%,rgba(6,182,212,0.4) 0%,transparent 58%);
  mix-blend-mode: screen;
  animation: rgb-split 2.8s ease-in-out forwards;
}
.scanlines-heavy {
  background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.32) 2px,rgba(0,0,0,0.32) 4px);
  animation: rgb-split 2.8s ease-in-out forwards;
}
@keyframes godlike-shake {
  0%,100%{transform:none}
  20%{transform:translateX(-6px)} 40%{transform:translateX(6px)}
  60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
}
.screen-shake { animation: godlike-shake 0.38s ease-in-out 4; }
</style>
