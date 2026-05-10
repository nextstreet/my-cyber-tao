import { ref, computed } from 'vue'

export type LineValue = 6 | 7 | 8 | 9
export type HexagramLines = [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue]

export type Hexagram = {
  index: number
  symbol: string
  nameCn: string
  nameEn: string
  judgement: string
  fortune: string
  fortuneEn: string
}

const HEX: Hexagram[] = [
  {index:1, symbol:"䷀",nameCn:"乾",nameEn:"Heaven",judgement:"元亨利贞",fortune:"天行健，君子以自强不息。刚健中正，大展宏图之象。时机已至，宜积极进取。",fortuneEn:"Heaven moves with vigor. The time is ripe — act with determination."},
  {index:2, symbol:"䷁",nameCn:"坤",nameEn:"Earth",judgement:"元亨利牝马之贞",fortune:"地势坤，君子以厚德载物。厚积薄发，静守待机，宜蓄力而后动。",fortuneEn:"Earth nurtures all. Accumulate virtue and wait for the right moment."},
  {index:3, symbol:"䷂",nameCn:"屯",nameEn:"Difficulty",judgement:"元亨利贞，勿用有攸往",fortune:"云雷屯，万物始生之际。初涉险境，宜静守待机，不可急进。守正则吉。",fortuneEn:"Clouds and thunder — difficulty at the beginning. Hold steady."},
  {index:4, symbol:"䷃",nameCn:"蒙",nameEn:"Youthful Folly",judgement:"亨，匪我求童蒙",fortune:"山下有泉，启蒙之象。虚心求教，广纳良言，前途光明。",fortuneEn:"A spring beneath the mountain. Seek guidance with humility."},
  {index:5, symbol:"䷄",nameCn:"需",nameEn:"Waiting",judgement:"有孚，光亨，贞吉",fortune:"云上于天，等待时机。坚守诚信，耐心等候，时至则行。",fortuneEn:"Clouds in the sky. Hold sincerity; the right moment will come."},
  {index:6, symbol:"䷅",nameCn:"讼",nameEn:"Conflict",judgement:"有孚，窒惕，中吉",fortune:"天水相违，争讼之象。宜和解，避正面冲突，中道而行则吉。",fortuneEn:"Seek compromise rather than open conflict."},
  {index:7, symbol:"䷆",nameCn:"师",nameEn:"The Army",judgement:"贞，丈人吉，无咎",fortune:"地中有水，众志成城。以正道统领，团结则胜。",fortuneEn:"Strength in unity. Lead with righteousness to achieve victory."},
  {index:8, symbol:"䷇",nameCn:"比",nameEn:"Union",judgement:"吉，原筮，元永贞",fortune:"水上于地，亲比之象。诚信相交，广结善缘，群策群力。",fortuneEn:"Sincerity binds allies. Work together toward a common goal."},
  {index:9, symbol:"䷈",nameCn:"小畜",nameEn:"Small Taming",judgement:"亨，密云不雨",fortune:"风行天上，小有积蓄。厚积待发，柔道可行，润物无声。",fortuneEn:"Small accumulations bring great results over time."},
  {index:10,symbol:"䷉",nameCn:"履",nameEn:"Treading",judgement:"履虎尾，不咥人，亨",fortune:"天泽履，谨慎而行。步步为营，守礼从正，可化险为夷。",fortuneEn:"Tread carefully and observe propriety to transform danger into safety."},
  {index:11,symbol:"䷊",nameCn:"泰",nameEn:"Peace",judgement:"小往大来，吉亨",fortune:"天地交泰，阴阳和谐。大吉大利，万事亨通，进取有成。",fortuneEn:"Heaven and Earth in harmony — great peace and prosperity."},
  {index:12,symbol:"䷋",nameCn:"否",nameEn:"Standstill",judgement:"否之匪人，不利君子贞",fortune:"天地不交，闭塞之象。时运不济，宜退守蓄力，待时而动。",fortuneEn:"Withdraw and conserve strength; wait for better times."},
  {index:13,symbol:"䷌",nameCn:"同人",nameEn:"Fellowship",judgement:"同人于野，亨",fortune:"天火同人，志同道合。广结同仁，协力共进，大事可成。",fortuneEn:"Work with like-minded companions to achieve great things."},
  {index:14,symbol:"䷍",nameCn:"大有",nameEn:"Great Possessing",judgement:"元亨",fortune:"火在天上，大有之象。运势旺盛，财禄丰盈，宜把握良机。",fortuneEn:"Fortune is at its peak; seize the opportunity without hesitation."},
  {index:15,symbol:"䷎",nameCn:"谦",nameEn:"Modesty",judgement:"亨，君子有终",fortune:"山藏于地，谦逊之象。低调处世，厚德积善，终获尊荣。",fortuneEn:"The virtue of modesty brings lasting honor."},
  {index:16,symbol:"䷏",nameCn:"豫",nameEn:"Enthusiasm",judgement:"利建侯行师",fortune:"雷出地奋，豫乐之象。时机已到，大力推进，众人景从。",fortuneEn:"The moment has come; lead with vigor and enthusiasm."},
  {index:17,symbol:"䷐",nameCn:"随",nameEn:"Following",judgement:"元亨利贞，无咎",fortune:"泽中有雷，顺势而为。随时应变，顺应大势，灵活处世。",fortuneEn:"Adapt and follow the natural flow of events."},
  {index:18,symbol:"䷑",nameCn:"蛊",nameEn:"Work on Decay",judgement:"元亨，利涉大川",fortune:"山下有风，整饬旧弊。清除积弊，革故鼎新，重获生机。",fortuneEn:"Address old problems at their root to bring renewal."},
  {index:19,symbol:"䷒",nameCn:"临",nameEn:"Approach",judgement:"元亨利贞，至于八月有凶",fortune:"地上有泽，临近之象。把握当前，积极主动，但须居安思危。",fortuneEn:"Opportunity approaches. Act decisively but remain mindful of reversal."},
  {index:20,symbol:"䷓",nameCn:"观",nameEn:"Contemplation",judgement:"盥而不荐，有孚颙若",fortune:"风行地上，观察四方。审时度势，静观其变，知己知彼。",fortuneEn:"Observe carefully before acting. Knowledge brings power."},
  {index:21,symbol:"䷔",nameCn:"噬嗑",nameEn:"Biting Through",judgement:"亨，利用狱",fortune:"电雷噬嗑，决断之象。当机立断，排除障碍，公正严明。",fortuneEn:"Bite through obstacles with decisiveness and impartiality."},
  {index:22,symbol:"䷕",nameCn:"贲",nameEn:"Grace",judgement:"亨，小利有攸往",fortune:"山下有火，文饰之象。注重仪表，内外兼修，以礼待人。",fortuneEn:"Cultivate both inner and outer grace."},
  {index:23,symbol:"䷖",nameCn:"剥",nameEn:"Splitting Apart",judgement:"不利有攸往",fortune:"山附于地，剥落之象。时运艰难，宜守不宜进，静待否极泰来。",fortuneEn:"Hold steady and wait for the cycle to turn."},
  {index:24,symbol:"䷗",nameCn:"复",nameEn:"Return",judgement:"亨，出入无疾",fortune:"雷在地中，一阳来复。否极泰来，新的开始，生机勃发。",fortuneEn:"A new cycle begins; spring follows winter."},
  {index:25,symbol:"䷘",nameCn:"无妄",nameEn:"Innocence",judgement:"元亨利贞，其匪正有眚",fortune:"天下有雷，无妄之象。保持纯真，行事正直，不谋私利则吉。",fortuneEn:"Success comes to those who act without ulterior motives."},
  {index:26,symbol:"䷙",nameCn:"大畜",nameEn:"Great Taming",judgement:"利贞，不家食吉",fortune:"山中有天，大有积蓄。积累学识，储备能量，时机成熟大展宏图。",fortuneEn:"Great accumulation of wisdom before the grand release."},
  {index:27,symbol:"䷚",nameCn:"颐",nameEn:"Nourishment",judgement:"贞吉，观颐，自求口实",fortune:"山下有雷，颐养之象。注重身心养护，慎言慎食，自强不息。",fortuneEn:"Nourish both body and spirit with care."},
  {index:28,symbol:"䷛",nameCn:"大过",nameEn:"Great Excess",judgement:"栋桡，利有攸往，亨",fortune:"泽灭木，过重之象。当前负荷过大，宜减负前行，量力而为。",fortuneEn:"Excess strains the structure. Lighten the load and proceed carefully."},
  {index:29,symbol:"䷜",nameCn:"坎",nameEn:"The Abyss",judgement:"有孚，维心亨，行有尚",fortune:"水流不息，险中求进。坚守诚信，以智慧化险为夷，终得亨通。",fortuneEn:"Maintain sincerity through danger; wisdom finds a way through."},
  {index:30,symbol:"䷝",nameCn:"离",nameEn:"The Clinging",judgement:"利贞，亨，畜牝牛吉",fortune:"明两作，离之象。以智慧之火照耀前路，依附正道则光明在前。",fortuneEn:"Cling to what is correct and your light will shine far."},
  {index:31,symbol:"䷞",nameCn:"咸",nameEn:"Influence",judgement:"亨利贞，取女吉",fortune:"山上有泽，感应之象。以诚感人，相互影响，心心相印。",fortuneEn:"Sincerity resonates deeply. Mutual influence and genuine connection."},
  {index:32,symbol:"䷟",nameCn:"恒",nameEn:"Duration",judgement:"亨，无咎，利贞",fortune:"雷风相薄，恒久之道。坚守正道，持之以恒，终有所成。",fortuneEn:"Perseverance on the righteous path brings enduring success."},
  {index:33,symbol:"䷠",nameCn:"遯",nameEn:"Retreat",judgement:"亨，小利贞",fortune:"天下有山，遁世之象。时势不利，宜暂退以保实力，进退有度。",fortuneEn:"Strategic retreat preserves strength for the right moment."},
  {index:34,symbol:"䷡",nameCn:"大壮",nameEn:"Great Power",judgement:"利贞",fortune:"雷在天上，大壮之象。势力强盛，宜正大光明，不可恃强凌弱。",fortuneEn:"Use strength righteously; brute force without principle leads to ruin."},
  {index:35,symbol:"䷢",nameCn:"晋",nameEn:"Progress",judgement:"康侯用锡马蕃庶",fortune:"明出地上，晋升之象。时运上升，光明在前，宜积极进取。",fortuneEn:"The sun rises above the earth. The path forward is bright."},
  {index:36,symbol:"䷣",nameCn:"明夷",nameEn:"Darkening",judgement:"利艰贞",fortune:"光入地中，明夷之象。时运晦暗，韬光养晦，守正待时。",fortuneEn:"Conceal your brilliance and wait for the light to return."},
  {index:37,symbol:"䷤",nameCn:"家人",nameEn:"The Family",judgement:"利女贞",fortune:"风自火出，家庭之象。和睦相处，各守本分，家和万事兴。",fortuneEn:"Harmony within the family brings abundance without."},
  {index:38,symbol:"䷥",nameCn:"睽",nameEn:"Opposition",judgement:"小事吉",fortune:"上火下泽，乖违之象。同中求异，小事可为，大事宜协调。",fortuneEn:"In small matters independence works; for greater goals seek reconciliation."},
  {index:39,symbol:"䷦",nameCn:"蹇",nameEn:"Obstruction",judgement:"利西南，不利东北",fortune:"山上有水，蹇难之象。前路多阻，宜借助他人之力，迂回前进。",fortuneEn:"Seek wise counsel; the direct route is blocked."},
  {index:40,symbol:"䷧",nameCn:"解",nameEn:"Deliverance",judgement:"利西南，无所往",fortune:"雷雨作，解困之象。困境已解，雷雨后天晴，宜趁势推进。",fortuneEn:"The difficulty dissolves. Move forward while the path is clear."},
  {index:41,symbol:"䷨",nameCn:"损",nameEn:"Decrease",judgement:"有孚，元吉，无咎",fortune:"山下有泽，损益之道。减损以培益，舍小得大，化消极为积极。",fortuneEn:"Sacrifice the lesser to gain the greater."},
  {index:42,symbol:"䷩",nameCn:"益",nameEn:"Increase",judgement:"利有攸往，利涉大川",fortune:"风雷益，增益之象。风雷交加，时机绝佳，大胆进取，增益无穷。",fortuneEn:"The moment is exceptionally favorable; act boldly to multiply your gains."},
  {index:43,symbol:"䷪",nameCn:"夬",nameEn:"Breakthrough",judgement:"扬于王庭，孚号，有厉",fortune:"泽上于天，决断之象。当机立断，公开表明立场，正道直行。",fortuneEn:"Make your position clear and act with decisive integrity."},
  {index:44,symbol:"䷫",nameCn:"姤",nameEn:"Coming to Meet",judgement:"女壮，勿用取女",fortune:"天下有风，相遇之象。意外之缘，随机应变，守正不失。",fortuneEn:"Stay centered and do not be swept away by temptation."},
  {index:45,symbol:"䷬",nameCn:"萃",nameEn:"Gathering",judgement:"亨，王假有庙",fortune:"泽上于地，聚集之象。人心归聚，协力同心，共谋大事。",fortuneEn:"People rally around a common purpose; great things become possible."},
  {index:46,symbol:"䷭",nameCn:"升",nameEn:"Pushing Upward",judgement:"元亨，用见大人",fortune:"地中生木，上升之象。循序渐进，积小成大，终可成就大业。",fortuneEn:"Patient step-by-step progress leads surely to greatness."},
  {index:47,symbol:"䷮",nameCn:"困",nameEn:"Oppression",judgement:"亨，贞，大人吉，无咎",fortune:"泽无水，困蹇之象。处境艰难，守正不屈，困而后通。",fortuneEn:"The noble one endures hardship without bending; the way forward will open."},
  {index:48,symbol:"䷯",nameCn:"井",nameEn:"The Well",judgement:"改邑不改井，无丧无得",fortune:"木上有水，井养之象。取之不尽，用之不竭，宜修德养性。",fortuneEn:"Return to your fundamental nature; nourishment is always available."},
  {index:49,symbol:"䷰",nameCn:"革",nameEn:"Revolution",judgement:"己日乃孚，元亨利贞",fortune:"泽中有火，革新之象。变革时机已到，除旧布新，顺应潮流。",fortuneEn:"The time for transformation has arrived; shed the old and embrace the new."},
  {index:50,symbol:"䷱",nameCn:"鼎",nameEn:"The Cauldron",judgement:"元吉，亨",fortune:"木上有火，鼎革之象。文明之象，养贤育才，文化昌盛。",fortuneEn:"Nurture wisdom and cultivate talent; civilization flourishes."},
  {index:51,symbol:"䷲",nameCn:"震",nameEn:"Thunder",judgement:"亨，震来虩虩，笑言哑哑",fortune:"洊雷震，惊醒之象。雷霆震动，警示前行，保持警觉，临危不惧。",fortuneEn:"A sudden awakening calls you to alertness; face the unexpected without fear."},
  {index:52,symbol:"䷳",nameCn:"艮",nameEn:"Stillness",judgement:"艮其背，不获其身",fortune:"兼山艮，静止之象。知止则安，静守其道，动静有节。",fortuneEn:"Know when to stop and be still; the greatest action is sometimes non-action."},
  {index:53,symbol:"䷴",nameCn:"渐",nameEn:"Gradual Progress",judgement:"女归吉，利贞",fortune:"山上有木，渐进之象。循序渐进，步步为营，水到渠成。",fortuneEn:"Patient progress, step by step, leads surely to the goal."},
  {index:54,symbol:"䷵",nameCn:"归妹",nameEn:"The Marrying Maiden",judgement:"征凶，无攸利",fortune:"泽上有雷，归妹之象。处境微妙，守分安命，顺势而为。",fortuneEn:"Accept your situation with equanimity; work within limits."},
  {index:55,symbol:"䷶",nameCn:"丰",nameEn:"Abundance",judgement:"亨，王假之，勿忧，宜日中",fortune:"雷电皆至，丰盛之象。盛世当珍惜，居安思危，莫负天时。",fortuneEn:"Cherish this moment of fullness; it will not last forever."},
  {index:56,symbol:"䷷",nameCn:"旅",nameEn:"The Wanderer",judgement:"小亨，旅贞吉",fortune:"山上有火，旅行之象。异乡漂泊，谨言慎行，守正则吉。",fortuneEn:"In unfamiliar territory, caution and integrity protect you."},
  {index:57,symbol:"䷸",nameCn:"巽",nameEn:"Gentle Wind",judgement:"小亨，利有攸往",fortune:"随风巽，柔顺之象。以柔克刚，润物无声，持续渗透则无往不利。",fortuneEn:"Persistent gentle effort overcomes all obstacles in time."},
  {index:58,symbol:"䷹",nameCn:"兑",nameEn:"Joy",judgement:"亨利贞",fortune:"兼泽兑，喜悦之象。以诚悦人，和乐融融，广结善缘。",fortuneEn:"Genuine happiness shared with others multiplies without limit."},
  {index:59,symbol:"䷺",nameCn:"涣",nameEn:"Dispersion",judgement:"亨，王假有庙",fortune:"风行水上，涣散之象。消融隔阂，化解紧张，团结人心。",fortuneEn:"Rigid structures dissolve; unite what was divided."},
  {index:60,symbol:"䷻",nameCn:"节",nameEn:"Limitation",judgement:"亨，苦节不可贞",fortune:"泽上有水，节制之象。适度节制，守正有度，节约以积聚资源。",fortuneEn:"Self-restraint and proper boundaries conserve energy for what matters."},
  {index:61,symbol:"䷼",nameCn:"中孚",nameEn:"Inner Truth",judgement:"豚鱼吉，利涉大川",fortune:"泽上有风，中孚之象。以诚信为本，内外一致，孚信于人。",fortuneEn:"Sincerity at the core radiates outward and touches all beings."},
  {index:62,symbol:"䷽",nameCn:"小过",nameEn:"Small Excess",judgement:"亨利贞，可小事，不可大事",fortune:"山上有雷，小有过失。小处着手，不可好高骛远，循序渐进。",fortuneEn:"Stay modest and attend to small details; do not overreach."},
  {index:63,symbol:"䷾",nameCn:"既济",nameEn:"After Completion",judgement:"亨小，利贞，初吉终乱",fortune:"水火既济，大功告成。事成之后，谨防松懈，防微杜渐。",fortuneEn:"After success, guard against complacency; the cycle continues."},
  {index:64,symbol:"䷿",nameCn:"未济",nameEn:"Before Completion",judgement:"亨，小狐汔济，濡其尾",fortune:"火水未济，功业未竟。尚未完成，再接再厉，继续努力，终将成功。",fortuneEn:"The goal is not yet reached, but persistence will bring it to fruition."},
]

export function getHexagram(lines: HexagramLines): Hexagram {
  let bits = 0
  for (let i = 0; i < 6; i++) bits |= ((lines[i]! % 2 === 1 ? 1 : 0) << i)
  return HEX[bits % 64] ?? HEX[0]!
}

export function applyChangingLines(lines: HexagramLines): HexagramLines {
  return lines.map(v => v === 6 ? 7 : v === 9 ? 8 : v) as HexagramLines
}

export function hasChangingLines(lines: HexagramLines): boolean {
  return lines.some(v => v === 6 || v === 9)
}

export function useTianji() {
  const lines = ref<LineValue[]>([])
  const isComplete = computed(() => lines.value.length === 6)
  const currentLines = computed((): HexagramLines | null =>
    isComplete.value ? (lines.value as HexagramLines) : null)
  const primaryHexagram = computed(() =>
    currentLines.value ? getHexagram(currentLines.value) : null)
  const changingHexagram = computed(() =>
    currentLines.value && hasChangingLines(currentLines.value)
      ? getHexagram(applyChangingLines(currentLines.value)) : null)
  const hasChanging = computed(() =>
    currentLines.value ? hasChangingLines(currentLines.value) : false)

  function castLine(): LineValue {
    const s = ([
      Math.random() > 0.5 ? 3 : 2,
      Math.random() > 0.5 ? 3 : 2,
      Math.random() > 0.5 ? 3 : 2,
    ] as number[]).reduce((a, b) => a + b, 0) as LineValue
    return s
  }
  function addLine(): LineValue | null {
    if (isComplete.value) return null
    const v = castLine()
    lines.value.push(v)
    return v
  }
  function reset() { lines.value = [] }
  function lineLabel(v: LineValue): string {
    return ({6:"⚋ 老阴 Old Yin",7:"⚊ 阳 Yang",8:"⚋ 阴 Yin",9:"⚊ 老阳 Old Yang"} as Record<number,string>)[v] ?? ""
  }
  return { lines, isComplete, currentLines, primaryHexagram, changingHexagram, hasChanging, addLine, reset, lineLabel }
}
