import type { LineValue, Hexagram } from '../types'

// ─── 64 Hexagrams (selected 16; full 64 extend the same pattern) ──────────────
// Upper trigram index × 8 + lower = hexagram lookup key
// We provide the 8 canonical hexagrams and derive 64 entries via pairing.

const TRIGRAMS: Record<number, { sym: string; name: string; el: string }> = {
  0: { sym: '☰', name: '乾', el: 'Heaven'   },
  1: { sym: '☷', name: '坤', el: 'Earth'    },
  2: { sym: '☵', name: '坎', el: 'Water'    },
  3: { sym: '☲', name: '离', el: 'Fire'     },
  4: { sym: '☳', name: '震', el: 'Thunder'  },
  5: { sym: '☴', name: '巽', el: 'Wind'     },
  6: { sym: '☶', name: '艮', el: 'Mountain' },
  7: { sym: '☱', name: '兑', el: 'Lake'     },
}

// Full 64 hexagrams — name ZH / name EN / judgment (abbreviated)
const HEX_TABLE: Array<[string, string, string, string]> = [
  ['乾','Creative Force','乾元，万物资始，乃统天','Pure yang — heaven\'s creative power drives all things forward.'],
  ['坤','Receptive Earth','坤元，万物资生，乃顺承天','Pure yin — earth receives and nurtures all that heaven initiates.'],
  ['水雷屯','Difficulty at the Start','元亨利贞，勿用有攸往，利建侯','Clouds and thunder — great effort is needed at the start; do not force progress.'],
  ['山水蒙','Youthful Folly','亨，匪我求童蒙，童蒙求我','The spring bursts from the mountain foot; seek the teacher, not the shortcut.'],
  ['水天需','Waiting','有孚，光亨，贞吉，利涉大川','Clouds rise to heaven — patient waiting with inner truth brings success.'],
  ['天水讼','Conflict','有孚，窒惕，中吉，终凶','Conflict arises — seek mediation; prolonged strife brings misfortune.'],
  ['地水师','The Army','贞，丈人吉，无咎','Discipline and order — a seasoned leader brings the cause to success.'],
  ['水地比','Holding Together','吉，原筮，元永贞，无咎','Unity and mutual support — test sincerity first, then ally with strength.'],
  ['风天小畜','Small Taming','亨，密云不雨，自我西郊','Gentle winds restrain — clouds gather but rain has not yet fallen; patience.'],
  ['天泽履','Treading','履虎尾，不咥人，亨','Treading carefully on the tiger\'s tail — propriety and caution bring safety.'],
  ['地天泰','Peace','小往大来，吉亨','Heaven and earth in harmony — heaven descends, earth ascends; great flow.'],
  ['天地否','Standstill','否之匪人，不利君子贞，大往小来','Heaven and earth separate — communication fails; the noble one waits in silence.'],
  ['天火同人','Fellowship','同人于野，亨，利涉大川，利君子贞','Open fellowship — unite people in the open, not in secret, for lasting bonds.'],
  ['火天大有','Great Possession','元亨','Abundance of fire in the sky — great wealth and power; use virtue to sustain it.'],
  ['地山谦','Modesty','亨，君子有终','The mountain hides beneath the earth — humility endures where pride crumbles.'],
  ['雷地豫','Enthusiasm','利建侯行师','Thunder rumbles over earth — joyful momentum; act while enthusiasm is strong.'],
  ['泽雷随','Following','元亨利贞，无咎','Lake above thunder — adapt to the moment; following the right path is no weakness.'],
  ['山风蛊','Decay','元亨，利涉大川，先甲三日，后甲三日','Decay requires renewal — what has spoiled must be remedied with decisive action.'],
  ['地泽临','Approach','元亨利贞，至于八月有凶','Earth above lake — power approaches; act before the tide turns in the eighth month.'],
  ['风地观','Contemplation','盥而不荐，有孚颙若','Wind moves over earth — observe deeply before acting; be like one who washes hands in reverence.'],
  ['火雷噬嗑','Biting Through','亨，利用狱','Lightning and thunder — obstacles must be removed decisively; justice brings clarity.'],
  ['山火贲','Grace','亨，小利有攸往','Fire at the mountain\'s foot — outward grace has value, but do not neglect inner substance.'],
  ['山地剥','Splitting Apart','不利有攸往','The mountain erodes to bare earth — do not act; rest and await the natural turning.'],
  ['地雷复','Return','亨，出入无疾，朋来无咎','Thunder stirs beneath earth — the turning point arrives; the light returns quietly.'],
  ['天雷无妄','Innocence','元亨利贞，其匪正有眚，不利有攸往','Act without ulterior motive — spontaneous sincerity is the highest virtue here.'],
  ['山天大畜','Great Taming','利贞，不家食吉，利涉大川','Mountain holds heaven — great energy contained and directed; seek the great crossing.'],
  ['山雷颐','Nourishment','贞吉，观颐，自求口实','Thunder at the mountain — attend to what you take in and what you give; nourishment is sacred.'],
  ['泽风大过','Great Excess','栋桡，利有攸往，亨','The ridgepole bends under excess weight — extraordinary measures are needed now.'],
  ['坎','The Abyss','有孚，维心亨，行有尚','Water flows into water — true danger; sincerity and a steady heart find a way through.'],
  ['离','The Clinging','利贞，亨，畜牝牛吉','Fire clings to fire — illuminate without burning; nurture the gentle flame.'],
  ['泽山咸','Influence','亨利贞，取女吉','Lake rests on mountain — mutual attraction; the open, receptive heart draws goodness.'],
  ['雷风恒','Duration','亨，无咎，利贞，利有攸往','Thunder and wind endure together — consistency over time is the source of power.'],
  ['天山遁','Retreat','亨，小利贞','Heaven recedes above the mountain — wise withdrawal is strength, not failure.'],
  ['雷天大壮','Great Power','利贞','Thunder fills the sky — great strength surges; ensure power serves righteousness.'],
  ['火地晋','Progress','康侯用锡马蕃庶，昼日三接','The sun rises over earth — advancement comes through bright virtue and clear purpose.'],
  ['地火明夷','Darkening','利艰贞','Fire sinks beneath the earth — the light is hidden; preserve inner clarity in dark times.'],
  ['风火家人','Family','利女贞','Wind fans the flame — the household in order is the foundation of all order.'],
  ['火泽睽','Opposition','小事吉','Fire above, lake below — opposites generate creative tension; small steps succeed.'],
  ['水山蹇','Obstruction','利西南，不利东北，利见大人，贞吉','Water on the mountain — obstacles ahead; seek the aid of the great and turn westward.'],
  ['雷水解','Release','利西南，无所往，其来复吉，有攸往夙吉','Thunder over water — the obstacles dissolve; spring thaw releases what was frozen.'],
  ['山泽损','Decrease','有孚，元吉，无咎可贞，利有攸往','Mountain above lake — sacrifice the lesser to enrich the greater; sincere offering succeeds.'],
  ['风雷益','Increase','利有攸往，利涉大川','Wind and thunder reinforce — both above and below benefit; act boldly while fortune favors.'],
  ['泽天夬','Breakthrough','扬于王庭，孚号，有厉','Lake floods to heaven — the decisive moment arrives; proclaim the truth openly.'],
  ['天风姤','Coming to Meet','女壮，勿用取女','A single yin meets five yang — the encounter is powerful; one must not cling.'],
  ['泽地萃','Gathering','亨，王假有庙，利见大人，亨，利贞','Lake above earth — people gather; assemble strength through shared rites and purpose.'],
  ['地风升','Pushing Upward','元亨，用见大人，勿恤，南征吉','Wind stirs within earth — steady upward growth like a tree; seek the south.'],
  ['泽水困','Oppression','亨，贞，大人吉，无咎，有言不信','Lake drains into water below — exhaustion; the person of integrity endures without complaint.'],
  ['水风井','The Well','改邑不改井，无丧无得，往来井井','Wood draws from water — the well endures; renew the ropes, never let the source go dry.'],
  ['泽火革','Revolution','已日乃孚，元亨利贞，悔亡','Fire boils the lake — transformation at the proper time; what has ripened must change.'],
  ['火风鼎','The Cauldron','元吉，亨','Wood feeds fire in the cauldron — nourishing the wise and capable brings supreme good.'],
  ['震','Arousing Thunder','亨，震来虩虩，笑言哑哑','Doubled thunder — shock and awe; remain grounded and the laughter returns.'],
  ['艮','Keeping Still','艮其背，不获其身，行其庭，不见其人，无咎','Doubled mountain — stillness at the right moment; the mind rests, the body is free.'],
  ['风山渐','Gradual Progress','女归吉，利贞','Wind above mountain — slow and steady advance like the tree on the cliff; do not rush.'],
  ['雷泽归妹','Marrying Maiden','征凶，无攸利','Thunder over lake — acting out of sequence brings misfortune; honor right timing.'],
  ['雷火丰','Abundance','亨，王假之，勿忧，宜日中','Thunder and lightning together — the zenith of power; guard abundance with vigilance.'],
  ['火山旅','The Wanderer','小亨，旅贞吉','Fire on the mountain — the traveler passes; do not cling to what cannot last.'],
  ['巽','The Gentle Wind','小亨，利有攸往，利见大人','Doubled wind — penetrating and persistent; gentle repetition achieves what force cannot.'],
  ['兑','The Joyous Lake','亨，利贞','Doubled lake — joy and openness; sincerity makes the joy lasting and unforced.'],
  ['风水涣','Dispersion','亨，王假有庙，利涉大川，利贞','Wind over water — dissolution of hardness; let rigidity melt, cross the great water.'],
  ['水泽节','Limitation','亨，苦节不可贞','Water above lake — measure and restraint bring order; harsh restriction defeats itself.'],
  ['风泽中孚','Inner Truth','豚鱼吉，利涉大川，利贞','Wind over lake — sincerity penetrates to the core; even fish and pigs respond to truth.'],
  ['雷山小过','Small Excess','亨，利贞，可小事，不可大事','Thunder over mountain — small deeds now, not great ones; the bird should not fly too high.'],
  ['水火既济','After Completion','亨，小利贞，初吉终乱','Water over fire — completion achieved, but do not relax; the seeds of disorder lie in success.'],
  ['火水未济','Before Completion','亨，小狐汔济，濡其尾，无攸利','Fire over water — the crossing is not yet done; the young fox wets its tail — caution to the end.'],
]

// ─── Coin casting → line value ────────────────────────────────────────────────
export function castLine(): LineValue {
  // Simulate 3 coins: heads=3, tails=2
  const coins = [
    Math.random() > 0.5 ? 3 : 2,
    Math.random() > 0.5 ? 3 : 2,
    Math.random() > 0.5 ? 3 : 2,
  ] as const
  return (coins[0] + coins[1] + coins[2]) as LineValue
}

export function lineIsYang(v: LineValue): boolean {
  return v === 7 || v === 9
}

export function lineIsChanging(v: LineValue): boolean {
  return v === 6 || v === 9
}

// ─── Lines → trigram index (0-7) ─────────────────────────────────────────────
function linesToTrigram(lines: [LineValue, LineValue, LineValue]): number {
  const b = lines.map(v => (lineIsYang(v) ? 1 : 0))
  return (b[2]! << 2) | (b[1]! << 1) | b[0]!
}

// Traditional King Wen sequence mapping (upper×8 + lower → KW number 0-63)
const KW_MAP: number[] = [
  // lower: 0=☰ 1=☷ 2=☵ 3=☲ 4=☳ 5=☴ 6=☶ 7=☱
  // upper 0 (☰):
   0,11, 5, 13,34, 9,26,43,
  // upper 1 (☷):
  12, 1,24,36,16,20,15,45,
  // upper 2 (☵):
   6, 7,28,63,40,59, 4,47,
  // upper 3 (☲):
  14,35,64,29,55,37,22,49,
  // upper 4 (☳):
  25,24,40,55,50,42,27,17,
  // upper 5 (☴):
  44,46,48,50,32,57,18,28,
  // upper 6 (☶):
  33,15,39,56,62,53,52,31,
  // upper 7 (☱):
  10,19,60,38,54,61,41,58,
]

export function linesToHexagram(lines: LineValue[]): Hexagram {
  if (lines.length !== 6) throw new Error('Need exactly 6 lines')

  const lower = linesToTrigram([lines[0], lines[1], lines[2]] as [LineValue,LineValue,LineValue])
  const upper = linesToTrigram([lines[3], lines[4], lines[5]] as [LineValue,LineValue,LineValue])

  const kwIdx = KW_MAP[upper * 8 + lower] ?? 1
  const clampedIdx = Math.max(0, Math.min(kwIdx - 1, HEX_TABLE.length - 1))
  const [nameZh, nameEn, judgment, judgmentEn] = HEX_TABLE[clampedIdx]!

  const upperT = TRIGRAMS[upper]!
  const lowerT = TRIGRAMS[lower]!
  const sym = upperT.sym + lowerT.sym

  return {
    index: clampedIdx + 1,
    symbol: sym,
    nameZh,
    nameEn,
    judgment,
    judgmentEn,
    image: `${upperT.el} above ${lowerT.el}`,
  }
}

// ─── Verified hash ─────────────────────────────────────────────────────────────
// Matches the Edge Function's algorithm: sha256( createdAt + question + lines.join(',') )
export async function computeHash(createdAt: string, question: string, lines: LineValue[]): Promise<string> {
  const data = `${createdAt}|${question}|${lines.join(',')}`
  const encoded = new TextEncoder().encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
}
