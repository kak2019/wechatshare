import type { GalNode } from "@/lib/soviet-vn/types";

export const START_NODE = "prologue";

export const GAL_NODES: Record<string, GalNode> = {
  prologue: {
    id: "prologue",
    steps: [
      { type: "bg", scene: "kremlin" },
      { type: "bgm", track: "ambient" },
      {
        type: "narrate",
        text: "1985年3月。莫斯科仍在倒春寒里呼吸。你——伊万·谢尔盖耶维奇·科尔恰金——被从国家计划委员会叫到克里姆林宫侧翼的一间办公室。",
      },
      {
        type: "say",
        speaker: "雷日科夫",
        text: "索契要办奥运，远东要出鱼，账本上却全是洞。你是我们选出来填洞的人。",
      },
      {
        type: "say",
        speaker: "科尔恰金",
        text: "如果我填的不是洞，是裂缝呢？",
      },
      {
        type: "say",
        speaker: "雷日科夫",
        text: "那就证明裂缝不是你能填的。但总得有人试。",
      },
      { type: "jump", node: "sochi_intro" },
    ],
  },

  sochi_intro: {
    id: "sochi_intro",
    steps: [
      { type: "bg", scene: "sochi" },
      { type: "bgm", track: "sochi" },
      {
        type: "narrate",
        text: "黑海之滨，索契奥运工程像一条被强行缝进苏联腹地的金色拉链。你第一次看见账本：钢筋、水泥、进口设备——数字在多个账户之间游泳。",
      },
      {
        type: "say",
        speaker: "地方负责人",
        text: "科尔恰金同志，工程是国家的脸面。有些……弹性，是为了按时完工。",
      },
      {
        type: "choice",
        prompt: "索契工地，挪用传闻已经传到莫斯科。你怎么处理？",
        options: [
          {
            label: "严查挪用，冻结三条生产线",
            next: "sochi_after_strict",
            effects: {
              authority: 12,
              integrity: 15,
              diplomacy: -10,
              idealism: 5,
            },
            flag: "sochi_strict",
          },
          {
            label: "为奥运保面子，暂缓追究",
            next: "sochi_after_face",
            effects: {
              diplomacy: 12,
              integrity: -15,
              authority: -5,
              idealism: -8,
            },
            flag: "sochi_face",
          },
          {
            label: "改道部分资金到南部民生项目",
            next: "sochi_after_welfare",
            effects: {
              welfare: 15,
              reform: 8,
              authority: -8,
              idealism: 10,
            },
            flag: "sochi_welfare",
          },
        ],
      },
    ],
  },

  sochi_after_strict: {
    id: "sochi_after_strict",
    steps: [
      {
        type: "narrate",
        text: "调查组进驻工地。三名负责人被带走，媒体却拿到「奥运威胁论」的素材。国际上开始讨论：苏联还能不能办好这场盛会。",
      },
      {
        type: "say",
        speaker: "科尔恰金",
        text: "脸面和底线，原来不能同时擦太亮。",
      },
      { type: "jump", node: "fish_intro" },
    ],
  },

  sochi_after_face: {
    id: "sochi_after_face",
    steps: [
      {
        type: "narrate",
        text: "工程进度奇迹般赶上。剪彩照片里人人微笑。只有你知道：那些微笑的一部分，是用远东渔业的饲料配额换来的。",
      },
      { type: "jump", node: "fish_intro" },
    ],
  },

  sochi_after_welfare: {
    id: "sochi_after_welfare",
    steps: [
      {
        type: "narrate",
        text: "南部几个集体农庄第一次领到了冬季水泥。奥运主看台却慢了一截。莫斯科的批评与基层的感谢同时寄到你的桌上。",
      },
      { type: "jump", node: "fish_intro" },
    ],
  },

  fish_intro: {
    id: "fish_intro",
    steps: [
      { type: "bg", scene: "fishing_port" },
      { type: "bgm", track: "fishing" },
      {
        type: "narrate",
        text: "1987年。远东某港。渔业联合企业的冷库堆满出口级鲑鱼，而内陆商店的长队仍在等罐头。这就是「渔业案」——你手里最烫手的一页。",
      },
      {
        type: "say",
        speaker: "企业厂长",
        text: "给我们自主权，我们能自己换外汇、买设备。计划经济的网，鱼会闷死在里面。",
      },
      {
        type: "say",
        speaker: "老计划员",
        text: "放开一次，就再也收不回来。你看见的是鱼，我看见的是联盟。",
      },
      {
        type: "choice",
        prompt: "渔业联合企业要求改革。联盟的外汇正在流失。",
        options: [
          {
            label: "扩大企业自主权，允许部分自销",
            next: "fish_after_autonomy",
            effects: {
              reform: 18,
              integrity: -12,
              diplomacy: 6,
              authority: -6,
            },
            flag: "fish_autonomy",
          },
          {
            label: "维持中央计划，统一调拨",
            next: "fish_after_plan",
            effects: {
              authority: 15,
              welfare: -10,
              reform: -12,
              idealism: 4,
            },
            flag: "fish_plan",
          },
          {
            label: "设立有限特区，试点市场定价",
            next: "fish_after_pilot",
            effects: {
              reform: 12,
              diplomacy: 10,
              integrity: -5,
              idealism: 8,
            },
            flag: "fish_pilot",
          },
        ],
      },
    ],
  },

  fish_after_autonomy: {
    id: "fish_after_autonomy",
    steps: [
      {
        type: "narrate",
        text: "渔网撒开了。外汇账户活络起来，影子合同也在活络。你收到第一封匿名信：厂长的新别墅，比冷库还大。",
      },
      { type: "jump", node: "final_moment" },
    ],
  },

  fish_after_plan: {
    id: "fish_after_plan",
    steps: [
      {
        type: "narrate",
        text: "计划恢复了秩序，也恢复了抱怨。渔船在港口排队等指令，而黑市上的日本罐头价格翻了一倍。",
      },
      { type: "jump", node: "final_moment" },
    ],
  },

  fish_after_pilot: {
    id: "fish_after_pilot",
    steps: [
      {
        type: "narrate",
        text: "特区像一块试验田。报纸称你为「谨慎的革新者」。你知道：田埂之外，整个国家仍是单一种植。",
      },
      { type: "jump", node: "final_moment" },
    ],
  },

  final_moment: {
    id: "final_moment",
    steps: [
      { type: "bg", scene: "office" },
      { type: "bgm", track: "ambient" },
      {
        type: "narrate",
        text: "1989年冬。你把所有报告摞在桌上。索契、渔业、财政、民族——每一页都在说同一件事：时间不够了。",
      },
      {
        type: "say",
        speaker: "科尔恰金",
        text: "如果每一次正确选择，都只是把崩溃推迟一点——那我还算英雄吗？",
      },
      { type: "resolve_ending" },
    ],
  },

  dream_sequence: {
    id: "dream_sequence",
    steps: [
      { type: "bg", scene: "dream" },
      { type: "bgm", track: "katyusha" },
      {
        type: "narrate",
        text: "你梦见红色没有褪色。队列里是面包、是牛奶、是——合唱。有人叫你安德罗波夫，有人叫你戈尔巴乔夫。",
      },
      {
        type: "narrate",
        text: "你可以是卡列尼琴科。你可以是任何一个被历史记住的名字。",
      },
      {
        type: "narrate",
        text: "但你只是伊万·谢尔盖耶维奇·科尔恰金。",
      },
      { type: "bg", scene: "dissolve" },
      {
        type: "narrate",
        text: "梦醒了。1991年12月。红旗从克里姆林宫杆顶滑落。风把它吹皱，像一张被揉皱的地图。",
      },
      { type: "ending", id: "ending_dream" },
    ],
  },
};

export function getChoiceOptions(nodeId: string): { label: string }[] | null {
  const node = GAL_NODES[nodeId];
  if (!node) return null;
  for (const step of node.steps) {
    if (step.type === "choice") return step.options;
  }
  return null;
}
