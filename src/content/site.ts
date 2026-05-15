/**
 * 全站共用的"我俩"基础数据：在一起的起始日 / 重要纪念日
 * 后续若改用 CMS，只需替换这一个文件的导出。
 */

export const RELATIONSHIP_START = "2022-05-20T00:00:00+08:00";

export type Anniversary = {
  /** ISO 日期。年份保留方便排序，每年取月日重复 */
  date: string;
  label: string;
  emoji: string;
};

export const ANNIVERSARIES: Anniversary[] = [
  { date: "2022-05-20", label: "在一起的那一天", emoji: "💞" },
  { date: "2022-12-24", label: "第一个平安夜", emoji: "🎄" },
  { date: "2023-02-14", label: "情人节", emoji: "🌹" },
  { date: "2023-08-08", label: "你的生日", emoji: "🎂" },
  { date: "2023-11-11", label: "我的生日", emoji: "🍰" },
];

export type TimelineNode = {
  date: string;
  title: string;
  body: string;
  emoji: string;
};

export const TIMELINE: TimelineNode[] = [
  {
    date: "2022.05.20",
    title: "走进彼此",
    body: "在那条人来人往的小街上，第一次正经地说出「以后请多指教」。",
    emoji: "🌱",
  },
  {
    date: "2022.07.16",
    title: "第一次旅行",
    body: "海边吹着风，你说我笑起来眼睛会弯成月牙。",
    emoji: "🌊",
  },
  {
    date: "2022.12.24",
    title: "雪夜的小屋",
    body: "暖气、热可可、还有不太合拍的圣诞歌。",
    emoji: "🎄",
  },
  {
    date: "2023.05.20",
    title: "一周年纪念",
    body: "一束没拆封的信和一蛋糕的奶油花。",
    emoji: "💌",
  },
  {
    date: "2023.10.01",
    title: "国庆长假",
    body: "把日程排得满满的，又突然全部推翻，赖在家里看了三部电影。",
    emoji: "🍿",
  },
  {
    date: "2024.02.14",
    title: "第二次情人节",
    body: "一起做了寿喜烧，灶上的蒸汽里有你。",
    emoji: "🍲",
  },
  {
    date: "2024.05.20",
    title: "两周年",
    body: "我们说，把日子过成手帐吧，于是有了这个网站。",
    emoji: "📖",
  },
];

export type Polaroid = {
  id: string;
  caption: string;
  back: string;
  /** SVG fallback 颜色，避免依赖外部图床 */
  gradient: [string, string];
  rotate: number;
};

export const POLAROIDS: Polaroid[] = [
  {
    id: "p1",
    caption: "夏天的傍晚",
    back: "你说云像棉花糖，我说更像蛋花汤。",
    gradient: ["#ffe08a", "#ff9f43"],
    rotate: -6,
  },
  {
    id: "p2",
    caption: "你做的早餐",
    back: "煎蛋边缘焦了一点点，但很好吃。",
    gradient: ["#fbcfe8", "#f9a8d4"],
    rotate: 4,
  },
  {
    id: "p3",
    caption: "雨后的小巷",
    back: "鞋底踩水的声音，被我们俩笑成了 BGM。",
    gradient: ["#bae6fd", "#7dd3fc"],
    rotate: -3,
  },
  {
    id: "p4",
    caption: "深夜的便利店",
    back: "关东煮，热气，霓虹灯，三秒钟的安静。",
    gradient: ["#fde68a", "#fcd34d"],
    rotate: 7,
  },
  {
    id: "p5",
    caption: "周末的猫",
    back: "邻居家的橘猫，看到我们就懒得动。",
    gradient: ["#fed7aa", "#fdba74"],
    rotate: -5,
  },
  {
    id: "p6",
    caption: "山顶上的风",
    back: "差点把帽子吹走，我们的笑声比风还大。",
    gradient: ["#a7f3d0", "#6ee7b7"],
    rotate: 3,
  },
];

export type Track = {
  id: string;
  title: string;
  artist: string;
  /** 一段歌词，跑马灯用 */
  lyric: string;
  /** 唱片颜色 */
  vinyl: [string, string];
};

export const PLAYLIST: Track[] = [
  {
    id: "t1",
    title: "小情歌",
    artist: "苏打绿",
    lyric: "这是一首简单的小情歌，唱着人们心肠的曲折…",
    vinyl: ["#1d1d1f", "#3a2f2a"],
  },
  {
    id: "t2",
    title: "晴天",
    artist: "周杰伦",
    lyric: "从前从前有个人爱你很久，但偏偏风渐渐把距离吹得好远…",
    vinyl: ["#3a2f2a", "#8a6a2f"],
  },
  {
    id: "t3",
    title: "玫瑰少年",
    artist: "蔡依林",
    lyric: "永志不忘记念著那温柔，绽放着鲜艳的传说…",
    vinyl: ["#7c2d12", "#f43f5e"],
  },
  {
    id: "t4",
    title: "夜空中最亮的星",
    artist: "逃跑计划",
    lyric: "夜空中最亮的星，能否听清，那仰望的人，心底的孤独和叹息…",
    vinyl: ["#1e1b4b", "#312e81"],
  },
];

export type Place = {
  id: string;
  city: string;
  /** 在 SVG 视图框 viewBox=\"0 0 600 360\" 中的位置 */
  x: number;
  y: number;
  date: string;
  memo: string;
};

export const PLACES: Place[] = [
  {
    id: "bj",
    city: "北京",
    x: 388,
    y: 130,
    date: "2022.05",
    memo: "我们认识的城市，胡同里走过无数次。",
  },
  {
    id: "tj",
    city: "天津",
    x: 402,
    y: 138,
    date: "2022.08",
    memo: "海河边的夜风和很咸的炸糕。",
  },
  {
    id: "sh",
    city: "上海",
    x: 470,
    y: 200,
    date: "2023.04",
    memo: "外滩的灯光把你的侧脸照得很好看。",
  },
  {
    id: "hz",
    city: "杭州",
    x: 458,
    y: 218,
    date: "2023.05",
    memo: "西湖一整圈，鞋底磨平了一点点。",
  },
  {
    id: "cd",
    city: "成都",
    x: 280,
    y: 218,
    date: "2023.10",
    memo: "辣到泪流满面，又互相递纸巾。",
  },
  {
    id: "xm",
    city: "厦门",
    x: 420,
    y: 270,
    date: "2024.03",
    memo: "鼓浪屿的午后，咖啡馆里你睡了十分钟。",
  },
  {
    id: "kr",
    city: "首尔",
    x: 520,
    y: 132,
    date: "2024.06",
    memo: "便利店泡面 + 凌晨的弘大街头。",
  },
  {
    id: "jp",
    city: "京都",
    x: 552,
    y: 188,
    date: "2024.11",
    memo: "红叶下我们走得很慢很慢。",
  },
];

export type WishItem = {
  id: string;
  text: string;
  /** 哪一方提的 */
  from: "me" | "you";
};

export const WISHES: WishItem[] = [
  { id: "w1", text: "一起看一次海上日出", from: "me" },
  { id: "w2", text: "学会做对方家乡的一道菜", from: "you" },
  { id: "w3", text: "拍一组胶片合影", from: "me" },
  { id: "w4", text: "去一次北海道滑雪", from: "you" },
  { id: "w5", text: "在阳台上养一盆小番茄", from: "me" },
  { id: "w6", text: "深夜两点的便利店关东煮约会", from: "you" },
  { id: "w7", text: "写满一整本手帐", from: "me" },
  { id: "w8", text: "一起完成一次马拉松（5km 也算）", from: "you" },
];

export type Letter = {
  id: string;
  from: "me" | "you";
  title: string;
  date: string;
  body: string[];
};

export const LETTERS: Letter[] = [
  {
    id: "l1",
    from: "me",
    title: "写给爱睡懒觉的你",
    date: "2024.05.20",
    body: [
      "宝子：",
      "今天又是一个想让你多睡五分钟的早上。",
      "窗帘里漏进来的光刚好落在你脸上，像一段没说完的歌。",
      "我想，如果以后每个清晨都长这样，那也挺好的。",
      "—— 一二",
    ],
  },
  {
    id: "l2",
    from: "you",
    title: "其实我一直都知道",
    date: "2024.07.07",
    body: [
      "一二：",
      "你以为自己藏得很好，其实那些悄悄给我留的灯、悄悄绕远路去买我喜欢吃的店，",
      "我都看见了。",
      "也都记在心里，写在这里，慢慢回你。",
      "—— 布布",
    ],
  },
  {
    id: "l3",
    from: "me",
    title: "关于以后",
    date: "2024.10.01",
    body: [
      "我没那么会规划未来，但有一件事我很确定：",
      "无论那是什么样的未来，都希望它有你。",
      "可以吗？",
    ],
  },
  {
    id: "l4",
    from: "you",
    title: "可以呀",
    date: "2024.10.02",
    body: [
      "可以呀。",
      "—— 布布（认真）",
    ],
  },
];
