export type ReportTypeOption = {
  id: string;
  label: string;
  description: string;
};

export type ReportRangeOption = {
  id: string;
  label: string;
  dateRange: string;
  description: string;
};

export type ReportHistoryItem = {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  period: string;
  audience: string;
  summary: string;
};

export type ReportPreviewKpi = {
  label: string;
  value: string;
  delta: string;
  interpretation: string;
};

export type ReportTrendPoint = {
  label: string;
  ours: number;
  competitorAverage: number;
};

export type ReportCompetitorRow = {
  brand: string;
  visibility: string;
  citationRate: string;
  sentiment: string;
  shareOfVoice: string;
  takeaway: string;
};

export type ReportQuestionInsight = {
  question: string;
  whyItMatters: string;
  nextMove: string;
};

export type ReportOpportunity = {
  title: string;
  opportunity: string;
  action: string;
};

export type ReportPreview = {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  period: string;
  cover: {
    eyebrow: string;
    title: string;
    subtitle: string;
    preparedFor: string;
    preparedAt: string;
    narrative: string;
  };
  executiveSummary: {
    title: string;
    lede: string;
    bullets: string[];
  };
  kpis: ReportPreviewKpi[];
  trend: {
    title: string;
    description: string;
    observation: string;
    points: ReportTrendPoint[];
    signals: string[];
  };
  competitorComparison: {
    title: string;
    description: string;
    rows: ReportCompetitorRow[];
  };
  topQuestions: {
    title: string;
    description: string;
    items: ReportQuestionInsight[];
  };
  opportunities: {
    title: string;
    description: string;
    items: ReportOpportunity[];
  };
};

export const reportTypeOptions: ReportTypeOption[] = [
  {
    id: "weekly",
    label: "周度经营复盘",
    description: "适合管理层快速查看本周可见度、引用率与竞品动态。",
  },
  {
    id: "competitive",
    label: "竞品策略简报",
    description: "强调我方与 Top 竞品在高意图问题中的差异与追赶压力。",
  },
  {
    id: "campaign",
    label: "专项活动快报",
    description: "用于输出节点 campaign 的传播表现与后续机会建议。",
  },
];

export const reportRangeOptions: ReportRangeOption[] = [
  {
    id: "7d",
    label: "近 7 日",
    dateRange: "2026.04.16 - 2026.04.22",
    description: "用于例行周报，覆盖最新一轮策略调整后的表现。",
  },
  {
    id: "30d",
    label: "近 30 日",
    dateRange: "2026.03.24 - 2026.04.22",
    description: "适合观察品牌词和高意图问题的持续变化。",
  },
  {
    id: "campaign-q2",
    label: "Q2 Campaign 周期",
    dateRange: "2026.04.01 - 2026.04.22",
    description: "聚焦春季上新 campaign 期间的内容吸收效果。",
  },
];

export const reportHistoryItems: ReportHistoryItem[] = [
  {
    id: "weekly-2026-04-22",
    name: "小红薯 GEO 周度经营复盘",
    type: "周度经营复盘",
    generatedAt: "2026-04-22 09:40",
    period: "2026.04.16 - 2026.04.22",
    audience: "品牌总监 / 增长负责人",
    summary: "聚焦高意图问题的可见度回升、竞品追赶与内容补位建议。",
  },
  {
    id: "competitive-2026-04-20",
    name: "竞品策略简报：敏感肌赛道",
    type: "竞品策略简报",
    generatedAt: "2026-04-20 18:10",
    period: "2026.04.01 - 2026.04.20",
    audience: "策略团队 / 内容负责人",
    summary: "分析竞品 A 在对比型问答下的增速，并给出我方应对动作。",
  },
  {
    id: "campaign-2026-04-18",
    name: "春季上新专项活动快报",
    type: "专项活动快报",
    generatedAt: "2026-04-18 11:25",
    period: "2026.04.01 - 2026.04.18",
    audience: "市场团队 / 电商负责人",
    summary: "复盘活动声量带来的短期增长，并定位转化前链路的漏损点。",
  },
];

const reportPreviews: ReportPreview[] = [
  {
    id: "weekly-2026-04-22",
    name: "小红薯 GEO 周度经营复盘",
    type: "周度经营复盘",
    generatedAt: "2026-04-22 09:40",
    period: "2026.04.16 - 2026.04.22",
    cover: {
      eyebrow: "Report Center / Weekly Review",
      title: "高意图问题仍然领先，但竞品追赶速度明显加快。",
      subtitle:
        "本周品牌在“敏感肌水乳推荐”和“品牌词问答”中保持领先，可见度与引用率双升；风险在于对比型问题的标准答案结构仍不够完整。",
      preparedFor: "品牌总监 Linda / 增长负责人团队",
      preparedAt: "生成时间：2026-04-22 09:40",
      narrative:
        "这是一份用于管理层快速浏览的周度复盘。重点不在罗列数据，而在于说明领先优势来自哪里、下周应该优先补哪类内容、以及哪些问题若不处理会被竞品继续吃掉。",
    },
    executiveSummary: {
      title: "核心摘要",
      lede:
        "过去 7 天，品牌在高意图问答中的首屏出现率继续提升，尤其是敏感肌场景和品牌认知场景。但竞品 A 在“哪个好”“怎么选”类问题中的引用增速更快，正在侵蚀我方的选择型心智入口。",
      bullets: [
        "可见度提升至 8.5%，主要由敏感肌与品牌词问答驱动，说明现有专业背书内容继续被平台吸收。",
        "引用率提升至 3.2%，新增达人测评素材开始起效，但结构化对比素材仍然偏少。",
        "对比型问题的领先差值已收窄至 0.8pp，竞品 A 在近 48 小时的提升速度超过我方。",
      ],
    },
    kpis: [
      {
        label: "ROI 转化指数",
        value: "78",
        delta: "+5 分",
        interpretation: "高意图问题带来的站内转化效率继续回升。",
      },
      {
        label: "情感健康度",
        value: "85",
        delta: "+2 分",
        interpretation: "负面声量可控，风险集中在个别测评类引用。",
      },
      {
        label: "可见度",
        value: "8.5%",
        delta: "+0.8pp",
        interpretation: "首屏命中率提升，品牌仍在行业领先区间。",
      },
      {
        label: "引用率",
        value: "3.2%",
        delta: "+0.3pp",
        interpretation: "新增素材被采纳，但对比结构仍需强化。",
      },
    ],
    trend: {
      title: "趋势分析",
      description:
        "我方在连续 7 个采样点中均高于竞品均值，但近两次采样差距收窄。领先尚在，却已不再安全。",
      observation:
        "趋势图反映出一个清晰事实：我方的增长依赖既有优势词，而竞品的追赶来自新近增强的对比型问答覆盖。",
      points: [
        { label: "04.16", ours: 7.5, competitorAverage: 6.2 },
        { label: "04.17", ours: 8.0, competitorAverage: 6.5 },
        { label: "04.18", ours: 8.3, competitorAverage: 6.8 },
        { label: "04.19", ours: 8.6, competitorAverage: 7.0 },
        { label: "04.20", ours: 8.8, competitorAverage: 7.3 },
        { label: "04.21", ours: 8.7, competitorAverage: 7.6 },
        { label: "04.22", ours: 8.5, competitorAverage: 7.7 },
      ],
      signals: [
        "敏感肌相关问题仍是我方最稳定的流量入口，说明专业解释型内容有效。",
        "竞品 A 的追赶发生在“哪个好”“值不值得买”类问题，属于决策阶段入口。",
        "若下周不补齐标准化对比内容，领先差值预计继续收窄。",
      ],
    },
    competitorComparison: {
      title: "竞品对比",
      description:
        "从整体数据看，我方仍在可见度与情感健康度上领先，但竞品 A 的引用效率最值得警惕。",
      rows: [
        {
          brand: "小红薯 GEO",
          visibility: "8.5%",
          citationRate: "3.2%",
          sentiment: "85",
          shareOfVoice: "26%",
          takeaway: "我方整体领先，但对比型问题解释深度不足。",
        },
        {
          brand: "竞品 A",
          visibility: "7.9%",
          citationRate: "3.5%",
          sentiment: "79",
          shareOfVoice: "24%",
          takeaway: "引用效率更高，说明其结构化对比内容更容易被收录。",
        },
        {
          brand: "竞品 B",
          visibility: "6.8%",
          citationRate: "2.7%",
          sentiment: "81",
          shareOfVoice: "20%",
          takeaway: "整体稳定，但未在高意图问题形成强穿透。",
        },
        {
          brand: "竞品 C",
          visibility: "6.1%",
          citationRate: "2.2%",
          sentiment: "76",
          shareOfVoice: "18%",
          takeaway: "以价格型问答为主，对我方高端定位威胁有限。",
        },
      ],
    },
    topQuestions: {
      title: "Top 问答",
      description: "以下问题继续决定本周的流量质量，也是下周内容分发的优先顺序。",
      items: [
        {
          question: "敏感肌水乳推荐",
          whyItMatters: "高转化问题，当前品牌露出与被引效率都处于领先位置。",
          nextMove: "继续补充专业背书版回答，维持优势词的稳定命中。",
        },
        {
          question: "XX 品牌怎么样",
          whyItMatters: "典型品牌认知问题，决定新用户第一印象。",
          nextMove: "把口碑、适用肤质与代表产品梳成统一答法，减少表述分散。",
        },
        {
          question: "竞品 A 和 XX 品牌哪个好",
          whyItMatters: "已成为竞品 A 的主要追赶入口，影响决策阶段转化。",
          nextMove: "补齐 3 组对比模板，明确肤质、功效和价格带差异。",
        },
      ],
    },
    opportunities: {
      title: "机会建议",
      description: "建议优先执行能最快放大领先优势、同时堵住竞品追赶的动作。",
      items: [
        {
          title: "机会 01: 强化敏感肌专业背书",
          opportunity:
            "当前高意图流量仍集中在敏感肌场景，但现有被引内容偏泛，缺少权威说明。",
          action:
            "补 2 组皮肤科语境答法，并统一为“适用人群 -> 使用频率 -> 风险提示 -> 推荐搭配”结构。",
        },
        {
          title: "机会 02: 快速追击对比型问答",
          opportunity:
            "竞品 A 在“哪个好”“怎么选”类问题上增速更快，说明平台偏好其对比模板。",
          action:
            "优先产出 3 组标准化对比内容，覆盖功效节奏、肤质适配与价格带。",
        },
        {
          title: "机会 03: 处理负面测评外溢风险",
          opportunity:
            "个别高互动测评中的“刺痛”“烂脸”描述已被多个回答引用，影响情感健康度。",
          action:
            "补充成分澄清与使用边界说明，并在相关问答中同步统一口径。",
        },
      ],
    },
  },
  {
    id: "competitive-2026-04-20",
    name: "竞品策略简报：敏感肌赛道",
    type: "竞品策略简报",
    generatedAt: "2026-04-20 18:10",
    period: "2026.04.01 - 2026.04.20",
    cover: {
      eyebrow: "Report Center / Competitive Brief",
      title: "竞品 A 正在抢占“如何选择”阶段的回答结构优势。",
      subtitle:
        "敏感肌赛道的核心竞争不再是简单露出，而是谁更先给出可被平台复用的标准答案模板。",
      preparedFor: "策略团队 / 内容负责人",
      preparedAt: "生成时间：2026-04-20 18:10",
      narrative:
        "本简报聚焦竞品视角，目的是帮助团队理解对手为什么增长，以及我方需要用什么方式回应，而不是单纯比较谁的绝对值更高。",
    },
    executiveSummary: {
      title: "核心摘要",
      lede:
        "竞品 A 的增长不是全面压制，而是集中发生在选择型问题中。其内容优势来自结构化对比模板、功效解释顺序更稳定，以及更强的价格带定位表达。",
      bullets: [
        "竞品 A 在对比型问题中的引用率高于我方 0.4pp，说明平台更容易抓取其内容结构。",
        "我方仍在品牌认知与敏感肌基础问答中领先，但这一优势无法自动转移到选择型问题。",
        "若要防止份额被持续侵蚀，关键不是增加篇数，而是统一答案结构。",
      ],
    },
    kpis: [
      {
        label: "竞品 A 引用效率",
        value: "3.5%",
        delta: "+0.6pp",
        interpretation: "增速主要来自对比型问答。",
      },
      {
        label: "我方领先差值",
        value: "0.8pp",
        delta: "-0.2pp",
        interpretation: "领先还在，但收窄趋势明确。",
      },
      {
        label: "品牌词可见度",
        value: "10.2%",
        delta: "+0.1pp",
        interpretation: "品牌认知盘面稳定，暂未出现异常。",
      },
      {
        label: "对比类问题份额",
        value: "6.8%",
        delta: "+0.4pp",
        interpretation: "对比问题仍有增长空间，但需要内容升级。",
      },
    ],
    trend: {
      title: "趋势分析",
      description:
        "近三周内，竞品 A 的增长斜率主要体现在后半段，说明其近期新内容正在被平台快速吸收。",
      observation:
        "我方需要把已有优势转译成更清晰的购买建议，否则即使保持露出，也会在决策阶段被截流。",
      points: [
        { label: "04.01", ours: 7.1, competitorAverage: 6.1 },
        { label: "04.05", ours: 7.3, competitorAverage: 6.3 },
        { label: "04.09", ours: 7.7, competitorAverage: 6.6 },
        { label: "04.13", ours: 7.9, competitorAverage: 7.0 },
        { label: "04.16", ours: 8.1, competitorAverage: 7.4 },
        { label: "04.18", ours: 8.2, competitorAverage: 7.6 },
        { label: "04.20", ours: 8.3, competitorAverage: 7.8 },
      ],
      signals: [
        "竞品 A 的增长比竞品 B、C 更集中，说明其策略执行一致性更强。",
        "我方优势仍可维持，但继续依赖泛介绍型内容将难以守住选择型问题。",
        "未来一周应优先改写对比模板，而非单纯扩量。",
      ],
    },
    competitorComparison: {
      title: "竞品对比",
      description: "敏感肌赛道下，真正需要重点防守的是竞品 A 的结构化答法。",
      rows: [
        {
          brand: "小红薯 GEO",
          visibility: "8.3%",
          citationRate: "3.1%",
          sentiment: "84",
          shareOfVoice: "25%",
          takeaway: "优势在专业感，但购买建议链路不够清晰。",
        },
        {
          brand: "竞品 A",
          visibility: "7.8%",
          citationRate: "3.5%",
          sentiment: "79",
          shareOfVoice: "24%",
          takeaway: "强在结构化对比，尤其适合被平台复用。",
        },
        {
          brand: "竞品 B",
          visibility: "6.5%",
          citationRate: "2.9%",
          sentiment: "80",
          shareOfVoice: "19%",
          takeaway: "偏向功效种草，对核心决策问题威胁较小。",
        },
        {
          brand: "竞品 C",
          visibility: "5.9%",
          citationRate: "2.1%",
          sentiment: "75",
          shareOfVoice: "17%",
          takeaway: "价格心智明显，但难进入高意图推荐语境。",
        },
      ],
    },
    topQuestions: {
      title: "Top 问答",
      description: "这些问题决定用户是否会在比较阶段把我方保留在候选集内。",
      items: [
        {
          question: "竞品 A 和 XX 品牌哪个好",
          whyItMatters: "直接影响用户在选择阶段的偏好形成。",
          nextMove: "建立标准化对比模板，避免回答逻辑分散。",
        },
        {
          question: "敏感肌能不能用早 C 晚 A",
          whyItMatters: "高热度问题，容易带动护肤流程相关词扩散。",
          nextMove: "增加风险提示和替代方案，提升专业可信度。",
        },
        {
          question: "XX 品牌适合什么肤质",
          whyItMatters: "决定平台是否把我方内容归为“可直接推荐”的答案。",
          nextMove: "把肤质适配、功效边界与使用频率写成固定结构。",
        },
      ],
    },
    opportunities: {
      title: "机会建议",
      description: "优先抢回用户在决策阶段最容易被竞品截流的三个入口。",
      items: [
        {
          title: "机会 01: 统一选择型问答结构",
          opportunity: "当前内容对比逻辑不够统一，平台难形成稳定抽取。",
          action: "输出统一模板，保证每篇内容都覆盖肤质、功效、价格带和使用体验。",
        },
        {
          title: "机会 02: 放大价格带解释",
          opportunity: "竞品 A 在性价比表达上更直接，我方价值感表达偏弱。",
          action: "增加“适合谁买、为什么值得买”的简洁结论型语句。",
        },
        {
          title: "机会 03: 以专业提示降低负面试错",
          opportunity: "对敏感肌风险提示不足，容易让用户转向更保守的竞品答案。",
          action: "补充成分、使用频率与避雷搭配说明，降低决策犹豫。",
        },
      ],
    },
  },
  {
    id: "campaign-2026-04-18",
    name: "春季上新专项活动快报",
    type: "专项活动快报",
    generatedAt: "2026-04-18 11:25",
    period: "2026.04.01 - 2026.04.18",
    cover: {
      eyebrow: "Report Center / Campaign Snapshot",
      title: "活动带来了声量抬升，但转化前链路仍存在解释断层。",
      subtitle:
        "春季上新 campaign 已显著提升品牌声量与搜索热度，但“为什么适合我”与“怎么搭配用”两类问题仍是转化前的主要损耗点。",
      preparedFor: "市场团队 / 电商负责人",
      preparedAt: "生成时间：2026-04-18 11:25",
      narrative:
        "活动快报强调短周期观察，关注新素材是否真正帮助平台理解品牌价值，而不只是在社媒层面制造更高声量。",
    },
    executiveSummary: {
      title: "核心摘要",
      lede:
        "活动期间品牌热度明显上涨，但热度并没有完整传导到高意图问答的转化环节。主要原因是 campaign 素材更偏情绪表达，缺少可被复用的功能解释与搭配建议。",
      bullets: [
        "活动相关搜索词增长明显，品牌整体声量提升，但问答端被引效率增长有限。",
        "用户对“适合什么肤质”“和现有护肤步骤怎么搭配”仍存在疑问。",
        "需要把活动素材二次加工为功能解释型内容，才能让平台更好复用。",
      ],
    },
    kpis: [
      {
        label: "活动声量指数",
        value: "126",
        delta: "+18",
        interpretation: "活动曝光带动明显的站内讨论与搜索提升。",
      },
      {
        label: "高意图可见度",
        value: "7.4%",
        delta: "+0.5pp",
        interpretation: "声量向问答端传导，但幅度仍有限。",
      },
      {
        label: "内容被引率",
        value: "2.8%",
        delta: "+0.1pp",
        interpretation: "说明素材尚未完全转化为标准答案结构。",
      },
      {
        label: "活动相关转化线索",
        value: "312",
        delta: "+34",
        interpretation: "已有增量线索，但前链路解释仍可优化。",
      },
    ],
    trend: {
      title: "趋势分析",
      description:
        "活动开始后数据整体上升，但问答端的增长斜率明显落后于声量端，说明内容转译仍需补位。",
      observation:
        "campaign 素材更适合拉高认知，而要推动成交，还需要把卖点拆解成平台可复用的明确回答。",
      points: [
        { label: "04.01", ours: 6.2, competitorAverage: 5.8 },
        { label: "04.04", ours: 6.5, competitorAverage: 5.9 },
        { label: "04.08", ours: 6.9, competitorAverage: 6.1 },
        { label: "04.11", ours: 7.0, competitorAverage: 6.2 },
        { label: "04.14", ours: 7.2, competitorAverage: 6.4 },
        { label: "04.16", ours: 7.5, competitorAverage: 6.7 },
        { label: "04.18", ours: 7.4, competitorAverage: 6.8 },
      ],
      signals: [
        "活动对品牌声量的拉升已兑现，但问答端吃到的增量仍偏少。",
        "“适合什么肤质”“怎么搭配”是活动素材最需要补解释的两类问题。",
        "后续若能把活动卖点改写成标准问答，可提升转化前链路效率。",
      ],
    },
    competitorComparison: {
      title: "竞品对比",
      description: "活动期间我方声量领先，但竞品在功能解释型内容上更扎实。",
      rows: [
        {
          brand: "小红薯 GEO",
          visibility: "7.4%",
          citationRate: "2.8%",
          sentiment: "83",
          shareOfVoice: "27%",
          takeaway: "活动传播强，但问答转译不足。",
        },
        {
          brand: "竞品 A",
          visibility: "6.8%",
          citationRate: "3.2%",
          sentiment: "80",
          shareOfVoice: "22%",
          takeaway: "功能解释更清晰，问答被引效率更高。",
        },
        {
          brand: "竞品 B",
          visibility: "6.2%",
          citationRate: "2.6%",
          sentiment: "78",
          shareOfVoice: "18%",
          takeaway: "在活动期保持稳定，没有明显进攻动作。",
        },
        {
          brand: "竞品 C",
          visibility: "5.6%",
          citationRate: "2.1%",
          sentiment: "74",
          shareOfVoice: "16%",
          takeaway: "更多承接价格敏感用户，对我方活动影响有限。",
        },
      ],
    },
    topQuestions: {
      title: "Top 问答",
      description: "活动之后，用户最关心的是产品适配和使用方式，而不是活动本身。",
      items: [
        {
          question: "XX 品牌新系列适合敏感肌吗",
          whyItMatters: "决定活动流量能否转为真实购买意向。",
          nextMove: "增加人群适配说明，并明确哪些情况需要谨慎尝试。",
        },
        {
          question: "新系列和原系列怎么选",
          whyItMatters: "决定老客是否升级、新客是否入门。",
          nextMove: "建立新旧系列的差异化说明模板，降低选择成本。",
        },
        {
          question: "春季上新搭配什么用更好",
          whyItMatters: "直接影响客单提升和组合购机会。",
          nextMove: "补充使用顺序与搭配建议，提高平台复用概率。",
        },
      ],
    },
    opportunities: {
      title: "机会建议",
      description: "活动后的关键不是继续放大声量，而是把热度转成更高质量的解释内容。",
      items: [
        {
          title: "机会 01: 二次改写活动素材",
          opportunity: "现有素材更偏传播语言，问答平台难以直接复用。",
          action: "把活动文案拆成“适合谁、解决什么、怎么用”的问答版本。",
        },
        {
          title: "机会 02: 增加搭配建议内容",
          opportunity: "使用顺序和搭配问题是活动后最明显的转化障碍。",
          action: "补齐护肤流程搭配模板，并明确早晚场景差异。",
        },
        {
          title: "机会 03: 接住老客升级问题",
          opportunity: "新旧系列如何选择仍无统一回答，影响复购效率。",
          action: "输出升级指南，帮助老客快速判断是否需要换线。",
        },
      ],
    },
  },
];

export const reportCenterMockData = {
  defaultPreviewReportId: "weekly-2026-04-22",
  generatorDefaults: {
    typeId: "weekly",
    rangeId: "7d",
  },
  reportTypes: reportTypeOptions,
  reportRanges: reportRangeOptions,
  history: reportHistoryItems,
  previews: reportPreviews,
} as const;

export function getReportPreviewById(reportId: string) {
  return reportPreviews.find((report) => report.id === reportId) ?? null;
}
