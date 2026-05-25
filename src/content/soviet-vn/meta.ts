import type { EndingDef, PersonalityDef } from "@/lib/soviet-vn/types";

export const PROTAGONIST = {
  fullName: "伊万·谢尔盖耶维奇·科尔恰金",
  shortName: "科尔恰金",
  title: "经济改革特派员",
} as const;

export const SITE = {
  title: "挽救苏联｜文字冒险 Demo",
  description:
    "扮演伊万·科尔恰金，在索契案与渔业案的岔路口做选择——多数结局无法挽回，只有一个梦幻结局。",
  eyebrow: "What If · 1985",
  heading: "你想做挽救苏联的英雄吗？",
  subheading: "根据真实案件演义 · 文本选择 · 六维人格",
  start: "开始故事",
  continue: "继续旅程",
  gallery: "结局档案馆",
  personality: "人格档案",
  mute: "静音",
  unmute: "开声",
  tapContinue: "点击继续",
  homeEntry: {
    eyebrow: "Side Quest",
    title: "挽救苏联",
    subtitle: "文字冒险 Demo · 索契案 · 渔业案 · 六维结局",
    cta: "进入故事",
  },
} as const;

export const ENDINGS: Record<string, EndingDef> = {
  ending_a: {
    id: "ending_a",
    title: "硬着陆",
    subtitle: "1991 · 联盟解体",
    tone: "failure",
    body: [
      "你尽力收紧财政、清查挪用，却错过了改革窗口。",
      "货架更空，信任更薄。别洛韦日森林的笔，比你的报告写得更快。",
      "科尔恰金站在空荡的部长会议厅里，听见锤子从旗帜上滑落。",
    ],
  },
  ending_b: {
    id: "ending_b",
    title: "寡头时代",
    subtitle: "1992 · 休克疗法",
    tone: "failure",
    body: [
      "你把企业推下深水，以为市场会托住他们。",
      "先浮上来的是掮客与影子银行。国有渔业变成了私人游艇。",
      "人民得到了「选择」，只是没有选择吃什么。",
    ],
  },
  ending_c: {
    id: "ending_c",
    title: "铁腕黄昏",
    subtitle: "1990 · 紧急状态",
    tone: "failure",
    body: [
      "你以稳定之名收紧螺丝。坦克上了街，电话被掐断。",
      "政变没有带来秩序，只带来了迟到的分裂。",
      "科尔恰金明白：机器还能转，但已经不在同一条轨道上了。",
    ],
  },
  ending_d: {
    id: "ending_d",
    title: "勋宗之冬",
    subtitle: "1989 · 改革停滞",
    tone: "bittersweet",
    body: [
      "你维持了表面上的平衡——勋章、队列、口号。",
      "索契的工地依旧喧嚣，渔业的账本依旧模糊。",
      "苏联没有立刻倒下，但每个人都闻到了1989年的风。",
    ],
  },
  ending_dream: {
    id: "ending_dream",
    title: "红色乌托邦",
    subtitle: "？ · 共产主义",
    tone: "dream",
    body: [
      "有一瞬间，你看见队列里没有短缺，只有合唱。",
      "然后你想起自己是谁——不是安德罗波夫，不是戈尔巴乔夫。",
      "你可以是任何人。但你只是科尔恰金。",
    ],
  },
};

export const PERSONALITIES: PersonalityDef[] = [
  {
    id: "andropov",
    name: "安德罗波夫型",
    epithet: "铁腕清道夫",
    description: "你倾向于用纪律与整肃换取时间，相信制度可以靠强力修复。",
  },
  {
    id: "gorbachev",
    name: "戈尔巴乔夫型",
    epithet: "开放派",
    description: "你相信透明与改革是出路，哪怕这意味着让旧机器暴露裂缝。",
  },
  {
    id: "brezhnev",
    name: "勃列日涅夫型",
    epithet: "停滞守护者",
    description: "你更熟悉维持现状的艺术——稳定、勋章、缓慢腐烂的平衡。",
  },
  {
    id: "yeltsin",
    name: "叶利钦型",
    epithet: "破局者",
    description: "你敢于砸碎旧结构，却可能把人民留在碎片里。",
  },
];

export const DISSOLVE_HEADLINES = [
  "1991.12.25 · 戈尔巴乔夫宣布辞职",
  "1991.12.26 · 最高苏维埃解散苏联",
  "红旗降下 · 十五加盟共和国各奔东西",
  "喀琅施塔得 · 最后一艘巡逻舰鸣笛",
];

export const DREAM_FIGURES = [
  "卡列尼琴科",
  "安德罗波夫",
  "雷日科夫",
  "戈尔巴乔夫",
  "勃列日涅夫",
];
