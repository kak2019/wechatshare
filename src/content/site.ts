/**
 * ═══════════════════════════════════════════════════════════════
 *  全站文案与内容 — 只改这个文件即可更新页面文字和数据
 * ═══════════════════════════════════════════════════════════════
 *
 *  人物昵称、导航、各区块标题/说明、时间轴/照片/歌单/地图/心愿/信件等
 *  均在此配置。组件只负责布局与动效，不再写死中文文案。
 */

/** 人物昵称（全站复用） */
export const COUPLE = {
  me: "一二",
  you: "布布",
  petName: "宝子",
} as const;

/** 页面 SEO（layout 与各子页 metadata） */
export const SITE_META = {
  default: {
    title: "我俩的时光｜恋爱手帐",
    description: "记录我和宝子的恋爱时光 — 私人手帐站点",
  },
  letters: {
    title: "悄悄话信箱｜我俩的时光",
    description: "翻一封信，听一段心里的话。",
  },
  library: {
    title: "放映厅｜我俩的时光",
    description: "和喜欢的人一起打开 Emby 私人影视库。",
  },
  fish: {
    title: "灵渊钓奇｜我俩的时光",
    description: "钓鱼、集图鉴、养神兽、闯通天塔 — 本地存档小游戏。",
  },
  yanglegeyang: {
    title: "羊了个羊｜我俩的时光",
    description: "叠牌三消小游戏 — 登录云存档，挑战排行榜。",
  },
} as const;

/** PWA（添加到主屏幕 / 离线）— 改这里即可更新应用名与主题色 */
export const PWA = {
  name: "我俩的时光",
  shortName: "我俩的时光",
  description: "记录我和宝子的恋爱时光 — 私人手帐站点",
  startUrl: "/",
  scope: "/",
  themeColor: "#fafafa",
  backgroundColor: "#fafafa",
  installDismissKey: "pwa:install-dismissed:v1",
  installTitle: "装到主屏幕，像 App 一样打开",
  installAndroidHint: "安装后可以全屏打开，常用页面会缓存在本地。",
  installIosHint: "点 Safari 底部分享按钮，再选「添加到主屏幕」。",
  installButton: "安装到主屏幕",
  installDismiss: "稍后再说",
  offlineTitle: "暂时没有网络",
  offlineBody: "已缓存的页面仍可浏览；连上网后刷新即可继续。",
  offlineAction: "返回首页",
} as const;


/** 顶部导航 */
export const NAV = {
  brand: "我俩的时光",
  timeMenuLabel: "时光",
  links: [
    { href: "/#story", label: "故事" },
    { href: "/#moments", label: "瞬间" },
    { href: "/#playlist", label: "歌单" },
    { href: "/letters", label: "信箱" },
    { href: "/library", label: "影视库" },
    { href: "/fish", label: "钓鱼" },
    { href: "/game/yanglegeyang", label: "羊羊" },
  ],
  timeMenu: [
    { href: "/#counter", label: "倒数日" },
    { href: "/#timeline", label: "时间轴" },
    { href: "/#polaroids", label: "照片墙" },
    { href: "/#map", label: "足迹地图" },
    { href: "/#wishlist", label: "心愿清单" },
  ],
} as const;

/** 页脚 */
export const FOOTER = {
  tagline: "记录与你有关的温柔日常",
  copyright: "我们的小宇宙",
  links: [
    { href: "/letters", label: "信箱" },
    { href: "/library", label: "影视库" },
    { href: "/fish", label: "钓鱼" },
    { href: "/game/yanglegeyang", label: "羊羊" },
  ],
  icp: "津ICP备2021004849号-2",
  icpUrl: "https://beian.miit.gov.cn/",
} as const;

/** 通用 UI 小字 */
export const UI = {
  close: "关闭",
  listEyebrow: "list",
  polaroidNote: "note",
  nowPlaying: "now playing",
  playing: "在放",
} as const;

/** 首页各区块文案 */
export const HOME = {
  hero: {
    eyebrow: "Our Little Universe",
    noVideo: "我们的影片，慢慢补齐",
    openBookAria: "翻开书页播放视频",
    left: {
      volume: "Vol. 01",
      title: ["恋爱", "手帐"] as const,
      subtitle: "点开这一页，让时光自己说话。",
      hint: "轻触翻开 →",
    },
    right: {
      eyebrow: "With You",
      subtitle: "线条小狗在页脚跑步，把我们连成一条温柔的线。",
      hint: "← 一起翻开",
    },
    cta: "翻开这一章",
  },
  counter: {
    eyebrow: "Day by day, with you",
    heading: "我们已经在一起",
    units: { day: "天", hour: "时", minute: "分", second: "秒" },
    anniversaryTip: "距离「{label}」还有 {days} 天 {emoji}",
    nextPrefix: "next · ",
  },
  story: {
    eyebrow: "A story for us",
    heading: "每一页，",
    headingAccent: "都是日常里的光",
    body: "这是属于我和宝子的恋爱手帐：用更慢的节奏、更柔的对比度，把平凡的日子装帧成一本可以反复翻阅的私人出版物。",
  },
  moments: [
    {
      date: "第一章",
      title: "相遇像慢镜头",
      body: "人潮里有你的侧脸，世界忽然安静半秒，然后又热烈起来。",
    },
    {
      date: "第二章",
      title: "把日常过成节日",
      body: "一杯奶茶、一场晚风、一个互相懂得的笑话，就是最好的纪念。",
    },
    {
      date: "第三章",
      title: "写给未来的信",
      body: "以后的路那么长，我们一页一页慢慢写，不着急，也不缺席。",
    },
  ],
  closing: {
    eyebrow: "今天也想对你说",
    quote: "谢谢你愿意和我共享这辈子最普通的天气。",
  },
  timeline: {
    eyebrow: "Our Timeline",
    heading: "把光阴系成一条",
    headingAccent: "金色的丝带",
  },
  polaroids: {
    eyebrow: "Polaroid Wall",
    heading: "摸一摸，翻一翻",
    subtitle: "每一张照片背后都偷偷写了字，点一下就能看见 ✿",
  },
  playlist: {
    eyebrow: "Our Playlist",
    heading: "我们之间，一直循环的几首歌",
    footnote:
      "* 出于版权考虑，这里只展示歌词氛围；想真的听就一起打开你们的歌单吧 🎧",
  },
  map: {
    eyebrow: "Our Footprints",
    heading: "我们一起走过的城",
    footer: "点亮的每一座城，都是一段被认真记住的天气。",
  },
  wishlist: {
    eyebrow: "Wishlist for us",
    heading: "想和你一起做的事",
    progress: "已完成 {done} / {total} · 你的勾选会被悄悄记住 💾",
    mineColumn: `${COUPLE.me}的小心愿`,
    yoursColumn: `${COUPLE.you}的小心愿`,
  },
  /** 暗室小金毛 — 首页隐藏板块（不在导航栏），克隆声线 MP3 放 public/audio/iloveyou-voice.mp3 或设 NEXT_PUBLIC_DARK_ROOM_AUDIO_URL */
  darkRoom: {
    title: "小金毛的秘密房间 ✨",
    subtitle: "有时候，陪伴就是最温暖的光",
    description:
      "在这个只属于我们的小房间里，有一只默默流泪的小金毛，和一个会发光的小白玩偶。",
    features: [
      {
        title: "轻轻触碰",
        body: "点击或拖动小白玩偶",
      },
      {
        title: "听见爱意",
        body: "它会用你的声音说出「I love you」",
      },
    ],
    enterRoom: "进入房间",
    learnMore: "了解更多",
    dragHint: "点击或拖动我 ❤️",
    soundOn: "声音：开启",
    soundOff: "声音：关闭",
    tip: "小提示：试着多点击几次哦",
    plushAria: "触摸或拖动小白玩偶，播放 I love you",
    loveLine: "I love you",
    noAudioHint: "把克隆声线的 MP3 放到 public/audio/iloveyou-voice.mp3",
    learnMoreBody:
      "把你们的声音克隆成 MP3，放进 public/audio/iloveyou-voice.mp3，小白就会替你说出那句 I love you。",
  },
} as const;

/** 悄悄话信箱页 */
export const LETTERS_PAGE = {
  eyebrow: "Letters between us",
  heading: "悄悄话信箱",
  subtitle: "点开任意一封信，可以用 ← → 键翻看下一封 ✉️",
  fromMe: `from ${COUPLE.me}`,
  fromYou: `from ${COUPLE.you}`,
  prev: "← 上一封",
  close: "收起来",
  next: "下一封 →",
} as const;

/** 影视库页 */
export const LIBRARY_PAGE = {
  eyebrow: "Emby · Private Theater",
  heading: "只属于我俩的",
  headingAccent: "放映厅",
  body: "把 Emby 影视库嵌在这个小站里：像手帐里夹一张电影票根——点开就能继续上次没看完的那集。",
  iframeTitle: "Emby 私人影视库",
  openExternal: "新窗口打开 Emby",
} as const;

/** 彩蛋与无障碍文案 */
export const EASTER_EGGS = {
  themeDay: "切换到日间模式",
  themeNight: "切换到夜间模式",
  lineDogAria: "敲敲线条小狗",
  lineDogBubble: "汪～你被发现啦 🐾",
} as const;

/** 在一起周年倒计时标签，`{years}` 为年数 */
export const ANNIVERSARY_YEAR_LABEL = "在一起 {years} 周年";

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
