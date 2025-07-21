// 校园AI助手 - 人生预测功能

// 全局变量
let currentQuestionIndex = 0;
let questionnaireData = [];
let userAnswers = [];
let predictionHistory = [];

// 问卷题目数据（基于提供的调查问卷）
const QUESTIONNAIRE = [
    // 成长基础维度
    {
        id: 1,
        category: "成长基础",
        question: "童年时期，父母（或主要抚养人）如何回应您的负面情绪（如哭泣、愤怒）？",
        options: [
            "耐心询问原因并引导表达",
            "用玩具 / 零食转移注意力",
            "要求 \"不许哭，要坚强\"",
            "因忙碌而简单安抚",
            "其他________（可补充）"
        ]
    },
    {
        id: 2,
        category: "成长基础",
        question: "家庭中遇到重要决策（如搬家、升学）时，父母是否会征求您的意见？",
        options: [
            "详细说明并尊重您的想法",
            "告知结果并简单解释",
            "认为 \"小孩不用管大人的事\"",
            "视情况而定，有时会问"
        ]
    },
    {
        id: 3,
        category: "成长基础",
        question: "回忆小学阶段，父母检查作业时更注重：",
        options: [
            "培养独立思考习惯（如引导自己发现错误）",
            "严格要求正确率与书写规范",
            "较少参与，主要靠自己完成",
            "其他________（可补充）"
        ]
    },
    {
        id: 4,
        category: "成长基础",
        question: "您与父母的肢体互动（如拥抱、牵手）频率如何？",
        options: [
            "每天都有，充满温暖",
            "每周几次，自然表达",
            "较少，更倾向语言交流",
            "几乎没有，习惯保持距离"
        ]
    },
    {
        id: 5,
        category: "成长基础",
        question: "当您在学校遇到矛盾（如与同学争吵），父母通常会：",
        options: [
            "教您如何沟通解决问题",
            "联系老师或对方家长处理",
            "认为 \"别理他们就好\"",
            "其他________（可补充）"
        ]
    },
    {
        id: 6,
        category: "成长基础",
        question: "您小学阶段是否参加过课外兴趣班？（可多选）",
        options: [
            "艺术类（绘画、音乐等）",
            "学科类（奥数、英语等）",
            "体育类（舞蹈、篮球等）",
            "从未参加（跳转至第 8 题）",
            "其他________"
        ]
    },
    {
        id: 7,
        category: "成长基础",
        question: "参加兴趣班的费用来源主要是：",
        options: [
            "家庭主动规划的教育预算",
            "父母通过兼职 / 节省其他开支支持",
            "学校免费课程或公益项目",
            "亲戚资助或奖学金"
        ]
    },
    {
        id: 8,
        category: "成长基础",
        question: "童年时期，家庭购买书籍的频率是：",
        options: [
            "每周至少 1 本，有专属书架",
            "每月 1-2 本，多为学习资料",
            "偶尔购买，主要依赖学校或图书馆",
            "很少购买，书籍资源匮乏"
        ]
    },
    {
        id: 9,
        category: "成长基础",
        question: "您是否拥有独立的学习空间（如书桌、书房）？",
        options: [
            "从小有专属安静空间",
            "与家人共用学习区域",
            "主要在客厅或厨房写作业",
            "没有固定学习地点"
        ]
    },
    {
        id: 10,
        category: "成长基础",
        question: "中学阶段，家庭是否支持过您参加竞赛 / 夏令营等活动？",
        options: [
            "积极鼓励并承担相关费用",
            "支持但需您分担部分开销（如压岁钱）",
            "认为 \"浪费时间\" 而反对",
            "未听说过此类活动"
        ]
    },
    {
        id: 11,
        category: "成长基础",
        question: "您童年居住的社区主要特征是：",
        options: [
            "文化设施丰富（图书馆、科技馆等）",
            "邻里关系紧密，常有集体活动",
            "以工厂 / 农田为主，生活节奏较慢",
            "流动人口较多，环境较复杂"
        ]
    },
    {
        id: 12,
        category: "成长基础",
        question: "当地主流文化更强调：",
        options: [
            "知识改变命运，重视教育",
            "人情往来，社会关系重要",
            "安稳度日，不鼓励冒险",
            "其他________（可补充）"
        ]
    },
    {
        id: 13,
        category: "成长基础",
        question: "您是否感受到地域差异带来的影响（如升学政策、职业选择）？",
        options: [
            "明显感受到资源倾斜（如一线城市教育优势）",
            "有一定影响，但通过努力可弥补",
            "未察觉差异，按常规路径发展",
            "因地域限制错失重要机会（可举例）________"
        ]
    },
    {
        id: 14,
        category: "成长基础",
        question: "家乡的传统习俗对您的价值观影响最深的是：",
        options: [
            "重视家庭责任与孝道",
            "推崇勤劳节俭的生活态度",
            "强调女性 / 男性的特定社会角色",
            "其他________（可补充）"
        ]
    },
    {
        id: 15,
        category: "成长基础",
        question: "您小时候接触外部信息的主要渠道是：",
        options: [
            "互联网（家庭电脑 / 智能手机）",
            "电视 / 广播",
            "书籍 / 报纸",
            "长辈讲述或邻里交流"
        ]
    },
    {
        id: 16,
        category: "成长基础",
        question: "您童年时期的身体状况如何？",
        options: [
            "很少生病，精力充沛",
            "偶尔感冒发烧，恢复较快",
            "长期体弱，需定期就医",
            "曾患重大疾病（如手术 / 长期治疗）"
        ]
    },
    {
        id: 17,
        category: "成长基础",
        question: "父母是否有意识培养您的运动习惯？",
        options: [
            "制定锻炼计划（如晨跑、打球）",
            "鼓励参与学校体育活动",
            "认为 \"学习更重要\"，不重视运动",
            "其他________（可补充）"
        ]
    },
    {
        id: 18,
        category: "成长基础",
        question: "您是否因外貌 / 体型等生理特征在童年遭遇过困扰？",
        options: [
            "有，曾被同学嘲笑或孤立",
            "轻微影响，很快调整心态",
            "未察觉此类问题，自信成长",
            "其他________（可补充）"
        ]
    },
    {
        id: 19,
        category: "成长基础",
        question: "青春期时，家庭是否提供过生理健康相关的引导？",
        options: [
            "主动讲解并提供必要支持（如生理期用品、心理疏导）",
            "回避相关话题，自行探索",
            "仅从学校课程获得知识",
            "其他________（可补充）"
        ]
    },
    {
        id: 20,
        category: "成长基础",
        question: "您认为早期健康状况对现在的影响是：",
        options: [
            "奠定了良好的身体基础",
            "留下一些长期习惯（如注重养生）",
            "导致某些能力受限（如体能不足）",
            "无明显影响"
        ]
    },
    {
        id: 21,
        category: "成长基础",
        question: "幼儿园阶段，您更愿意：",
        options: [
            "主动结交新朋友，成为 \"孩子王\"",
            "跟着熟悉的同伴活动",
            "独自玩耍，观察周围环境",
            "因分离焦虑频繁哭闹"
        ]
    },
    {
        id: 22,
        category: "成长基础",
        question: "小学时期，您在班级中的角色更接近：",
        options: [
            "班干部，负责组织事务",
            "成绩优异的 \"好学生\"",
            "活跃气氛的 \"开心果\"",
            "安静的 \"小透明\""
        ]
    },
    {
        id: 23,
        category: "成长基础",
        question: "当同伴提出不同意见时，您通常会：",
        options: [
            "耐心倾听并讨论可能性",
            "坚持自己的观点据理力争",
            "为避免冲突选择妥协",
            "无所谓，随大流"
        ]
    },
    {
        id: 24,
        category: "成长基础",
        question: "您是否经历过校园欺凌（包括语言、行为上的排挤）？",
        options: [
            "有，对心理造成长期影响",
            "偶尔遇到，通过老师 / 家长解决",
            "未经历，人际关系和谐",
            "不确定，可能被轻微忽视过"
        ]
    },
    {
        id: 25,
        category: "成长基础",
        question: "回顾童年，您认为自己最突出的性格优势是：",
        options: [
            "乐观开朗，总能发现美好",
            "细心体贴，擅长照顾他人",
            "勇敢果断，敢于尝试新事物",
            "坚韧执着，不轻易放弃"
        ]
    },
    // 个人特质维度
    {
        id: 26,
        category: "个人特质",
        question: "学习新知识时，您更习惯：",
        options: [
            "先理解原理，再通过实践应用",
            "直接模仿示例，在操作中总结规律",
            "依赖老师 / 教材讲解，按步骤执行",
            "思维导图 / 笔记辅助梳理逻辑"
        ]
    },
    {
        id: 27,
        category: "个人特质",
        question: "面对多任务处理（如同时备考和参加比赛），您会：",
        options: [
            "制定优先级清单，逐项完成",
            "凭直觉先做紧急任务",
            "感到混乱，需要他人帮助规划",
            "选择重点任务，放弃次要事项"
        ]
    },
    {
        id: 28,
        category: "个人特质",
        question: "您如何评价自己的 \"元认知能力\"（对自身学习过程的认知）？",
        options: [
            "能清晰分析自己的优势与不足",
            "知道需要改进，但缺乏具体方法",
            "按习惯学习，很少反思过程",
            "不确定 \"元认知\" 的含义"
        ]
    },
    {
        id: 29,
        category: "个人特质",
        question: "遇到完全陌生的领域（如编程、陶艺），您的学习动力来自：",
        options: [
            "强烈的好奇心，想深入了解",
            "实际用途（如工作需要、兴趣变现）",
            "他人影响（朋友推荐、课程要求）",
            "缺乏动力，仅浅尝辄止"
        ]
    },
    {
        id: 30,
        category: "个人特质",
        question: "学生时代，您最擅长的学习方法是：",
        options: [
            "反复背诵与刷题强化记忆",
            "联系实际案例理解抽象概念",
            "小组讨论碰撞思维火花",
            "观察模仿优秀同学的技巧"
        ]
    },
    {
        id: 31,
        category: "个人特质",
        question: "您童年时期持续最久的兴趣是（如绘画、阅读、机械拆卸等）：",
        options: [
            "艺术类（音乐 / 绘画 / 手工）",
            "知识类（科普 / 历史 / 文学）",
            "实践类（实验 / 烹饪 / 组装）",
            "运动竞技类（球类 / 棋类 / 跑步）",
            "其他________（可补充，如追星、收集）"
        ]
    },
    {
        id: 32,
        category: "个人特质",
        question: "您的兴趣主要来源于：",
        options: [
            "家庭影响（父母从事相关职业 / 爱好）",
            "学校课程或老师引导",
            "偶然接触后自发沉迷",
            "同伴带动或社交平台影响"
        ]
    },
    {
        id: 33,
        category: "个人特质",
        question: "您是否曾将个人兴趣转化为实质收获？（可多选）",
        options: [
            "获得比赛奖项 / 认证证书",
            "发展为副业或职业方向",
            "结识同频朋友 / 拓展社交圈",
            "仅作为放松方式，无额外收获"
        ]
    },
    {
        id: 34,
        category: "个人特质",
        question: "随着年龄增长，您的核心兴趣发生过哪些变化？",
        options: [
            "从单一兴趣发展为多元爱好",
            "因现实压力放弃曾经的热爱",
            "兴趣深度增加（如从 \"听歌\" 到 \"音乐制作\"）",
            "基本保持童年时期的兴趣"
        ]
    },
    {
        id: 35,
        category: "个人特质",
        question: "当兴趣与学业 / 工作产生冲突时（如备考期间想画画），您通常会：",
        options: [
            "合理分配时间，两者兼顾",
            "暂时搁置兴趣，完成优先事项",
            "难以取舍，导致效率下降",
            "选择跟随兴趣，接受后果"
        ]
    },
    {
        id: 36,
        category: "个人特质",
        question: "您从什么阶段开始有意识规划人生目标？",
        options: [
            "初中（明确 \"想成为什么样的人\"）",
            "高中（结合升学方向初步规划）",
            "大学（通过专业 / 实习探索目标）",
            "工作后（根据现实调整目标）",
            "至今仍在探索，暂无清晰目标"
        ]
    },
    {
        id: 37,
        category: "个人特质",
        question: "您的长期目标（10 年以上）更偏向：",
        options: [
            "职业成就（如成为行业顶尖专家）",
            "生活状态（如在喜欢的城市定居、家庭幸福）",
            "社会价值（如推动某领域变革、帮助弱势群体）",
            "自我实现（如完成环游世界、创作一部作品）"
        ]
    },
    {
        id: 38,
        category: "个人特质",
        question: "当目标因时代变化（如行业消失、政策调整）难以实现时，您会：",
        options: [
            "快速迭代目标，保持核心愿景不变",
            "陷入迷茫，需要较长时间重新定位",
            "坚持原目标，相信 \"事在人为\"",
            "认为 \"计划赶不上变化\"，不再设定长期目标"
        ]
    },
    {
        id: 39,
        category: "个人特质",
        question: "您判断目标是否 \"值得追求\" 的核心标准是：",
        options: [
            "符合个人价值观（如 \"自由\" \"创造 \"）",
            "具备现实可行性（资源 / 能力匹配）",
            "能带来物质回报或社会认可",
            "其他________（可补充，如 \"让自己快乐\"）"
        ]
    },
    {
        id: 40,
        category: "个人特质",
        question: "回顾过去，您是否有过 \"主动调整目标并获得更好结果\" 的经历？",
        options: [
            "有，这次调整让我________（举例说明）",
            "有，但未达到预期效果",
            "没有，始终按最初目标努力",
            "从未认真设定过可调整的目标"
        ]
    },
    {
        id: 41,
        category: "个人特质",
        question: "您目前的职业 / 学业方向是否与童年兴趣相关？",
        options: [
            "高度相关（如喜欢生物，成为医生）",
            "部分相关（如喜欢写作，从事文案工作）",
            "完全无关（兴趣仅作为业余爱好）",
            "曾尝试结合，但因现实放弃"
        ]
    },
    {
        id: 42,
        category: "个人特质",
        question: "当兴趣与目标发生矛盾时（如想当画家但目标是考公务员），您更倾向：",
        options: [
            "坚持兴趣，承担目标延迟的风险",
            "向目标妥协，兴趣作为精神寄托",
            "寻找折中方案（如业余时间发展兴趣）",
            "尚未遇到此类矛盾"
        ]
    },
    {
        id: 43,
        category: "个人特质",
        question: "您认为清晰的目标对兴趣发展的影响是：",
        options: [
            "目标为兴趣提供持久动力",
            "兴趣为目标实现提供独特优势",
            "两者相互独立，无直接关联",
            "目标可能限制兴趣的自由发展"
        ]
    },
    {
        id: 44,
        category: "个人特质",
        question: "如果用一个比喻描述 \"兴趣与目标的关系\"，您会选择：",
        options: [
            "兴趣是罗盘，目标是航线",
            "兴趣是燃料，目标是目的地",
            "兴趣是繁星，目标是追寻的星座",
            "其他________（可补充）"
        ]
    },
    {
        id: 45,
        category: "个人特质",
        question: "您是否观察到：周围长期坚持某项兴趣的人，往往在目标实现上更有韧性？",
        options: [
            "是的，兴趣培养了专注力与热情",
            "不一定，目标实现更依赖现实规划",
            "未留意过两者的关联"
        ]
    },
    // 环境资源维度
    {
        id: 46,
        category: "环境资源",
        question: "您目前的核心社交圈包括哪些人？（可多选）",
        options: [
            "家人",
            "多年好友",
            "职场 / 学界导师",
            "兴趣社群伙伴",
            "其他________"
        ]
    },
    {
        id: 47,
        category: "环境资源",
        question: "当您面临重大决策时，通常会向谁寻求建议？",
        options: [
            "父母 / 配偶（亲密家人）",
            "同龄朋友 / 学长学姐",
            "行业前辈 / 专业导师",
            "独自决策，较少咨询他人"
        ]
    },
    {
        id: 48,
        category: "环境资源",
        question: "您是否曾通过社交网络获得过实质性帮助（如工作机会、资源对接）？",
        options: [
            "多次获得关键帮助",
            "有过 1-2 次有效连接",
            "仅维持表面关系，未获帮助",
            "几乎不使用社交网络拓展人脉"
        ]
    },
    {
        id: 49,
        category: "环境资源",
        question: "回忆一次低谷期，谁的支持让您印象最深刻？",
        options: [
            "家人无条件的接纳与陪伴",
            "朋友的理性分析与建议",
            "陌生人的善意举动（如暖心留言）",
            "自我调节，较少依赖他人"
        ]
    },
    {
        id: 50,
        category: "环境资源",
        question: "您如何维护重要的社会关系？",
        options: [
            "定期主动联系，分享生活细节",
            "在对方需要时及时提供帮助",
            "顺其自然，相信真正的关系无需刻意经营",
            "因忙碌或内向很少主动维系"
        ]
    },
    // 行动模式与未来规划维度
    {
        id: 51,
        category: "行动模式与未来规划",
        question: "面对职业转型这样的重大选择，您会：",
        options: [
            "花费 3-6 个月调研行业数据、人脉咨询",
            "用 1-2 周分析利弊，快速决定",
            "因害怕风险拖延数月，最终放弃",
            "跟随身边人的选择（如同事跳槽则跟风）"
        ]
    },
    {
        id: 52,
        category: "行动模式与未来规划",
        question: "当目标需要跨领域学习（如从会计转编程），您会优先：",
        options: [
            "报名系统课程，按部就班学习",
            "实践中遇到问题再针对性查阅资料",
            "加入学习社群，与同目标者互相监督",
            "因难度大而放弃，调整目标方向"
        ]
    },
    {
        id: 53,
        category: "行动模式与未来规划",
        question: "当计划被突发事件打乱（如项目延期、生病），您会：",
        options: [
            "立即调整计划，制定备选方案",
            "暂停行动，等情绪平复再处理",
            "焦虑但勉强按原计划推进",
            "彻底放弃，认为 \"计划不如变化\""
        ]
    },
    {
        id: 54,
        category: "行动模式与未来规划",
        question: "您如何定义 \"高效行动\"？",
        options: [
            "单位时间内完成任务的数量多",
            "任务完成质量高且符合预期",
            "过程轻松愉悦，不强迫自己",
            "其他________（可补充）"
        ]
    },
    {
        id: 55,
        category: "行动模式与未来规划",
        question: "过去一年，您是否有过 \"明明知道该做，却始终拖延\" 的情况？",
        options: [
            "频繁发生（如减肥、学习新技能）",
            "偶尔发生，通过压力倒逼完成",
            "很少拖延，自律性较强",
            "没有需要坚持的长期目标"
        ]
    },
    {
        id: 56,
        category: "行动模式与未来规划",
        question: "您认为提升执行力的关键是：",
        options: [
            "明确具体目标（如 \"每天背 20 个单词\"）",
            "找到内在动机（如 \"通过英语考试获得晋升\"）",
            "环境倒逼（如加入打卡社群）",
            "其他________（可补充）"
        ]
    },
    // 开放性问题
    {
        id: 57,
        category: "开放性问题",
        question: "如果时光倒流至 18 岁，您会对当时的自己说哪三句话？",
        options: [
            "①________ ②________ ③________"
        ]
    },
    {
        id: 58,
        category: "开放性问题",
        question: "您人生中 \"违背直觉却带来意外收获\" 的一次经历是：",
        options: [
            "________"
        ]
    },
    {
        id: 59,
        category: "开放性问题",
        question: "至今未实现的一个重要目标是________，阻碍因素主要是________",
        options: [
            "________"
        ]
    },
    {
        id: 60,
        category: "开放性问题",
        question: "您人生中 \"目标感最强烈\" 的一段时期是________，当时的核心动力是________",
        options: [
            "________"
        ]
    },
    {
        id: 61,
        category: "开放性问题",
        question: "如果不考虑现实条件（如收入、社会评价），您最想从事的职业 / 生活方式是：",
        options: [
            "________"
        ]
    }
    // 添加更多问题以达到50题...
    // 这里为了演示，只列出前5题，实际应用中需要完整的50题
];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    Utils.log('人生预测页面初始化开始');
    
    // 初始化问卷数据
    initQuestionnaire();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载预测历史
    loadPredictionHistory();
    
    // 检查是否有未完成的问卷
    checkUnfinishedQuestionnaire();
    
    Utils.log('人生预测页面初始化完成');
});

// 初始化问卷数据
function initQuestionnaire() {
    // 扩展问卷到50题（这里为演示目的，实际应用中需要完整的问卷）
    questionnaireData = [...QUESTIONNAIRE];
    
    // 如果题目不足50题，复制并修改现有题目
    while (questionnaireData.length < 50) {
        const baseQuestion = QUESTIONNAIRE[questionnaireData.length % QUESTIONNAIRE.length];
        questionnaireData.push({
            ...baseQuestion,
            id: questionnaireData.length + 1,
            question: `${baseQuestion.question}（扩展题目 ${questionnaireData.length + 1}）`
        });
    }
    
    Utils.log(`问卷初始化完成，共 ${questionnaireData.length} 题`);
}

// 绑定事件监听器
function bindEventListeners() {
    Utils.log('绑定事件监听器');
    
    // 开始问卷按钮
    const startBtn = document.getElementById('startQuestionnaireBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startQuestionnaire);
    }
    
    // 继续问卷按钮
    const continueBtn = document.getElementById('continueQuestionnaireBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', continueQuestionnaire);
    }
    
    // 重新开始按钮
    const resetBtn = document.getElementById('resetQuestionnaireBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetQuestionnaire);
    }
    
    // 问卷导航按钮
    const prevBtn = document.getElementById('prevQuestionBtn');
    const nextBtn = document.getElementById('nextQuestionBtn');
    const submitBtn = document.getElementById('submitQuestionnaireBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', previousQuestion);
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    if (submitBtn) submitBtn.addEventListener('click', submitQuestionnaire);
    
    // 导出报告按钮
    const exportBtn = document.getElementById('exportReportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportReport);
    }
    
    // 重新测试按钮
    const retakeBtn = document.getElementById('retakeQuestionnaireBtn');
    if (retakeBtn) {
        retakeBtn.addEventListener('click', retakeQuestionnaire);
    }
    
    // 历史管理按钮
    const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    if (refreshHistoryBtn) refreshHistoryBtn.addEventListener('click', loadPredictionHistory);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearPredictionHistory);
}

// 开始问卷
function startQuestionnaire() {
    Utils.log('开始新问卷');
    
    currentQuestionIndex = 0;
    userAnswers = [];
    
    showQuestionnaireContainer();
    displayQuestion(currentQuestionIndex);
    updateProgress();
}

// 继续问卷
function continueQuestionnaire() {
    Utils.log('继续未完成的问卷');
    
    showQuestionnaireContainer();
    displayQuestion(currentQuestionIndex);
    updateProgress();
}

// 重新开始问卷
function resetQuestionnaire() {
    if (!confirm('确定要重新开始问卷吗？当前进度将丢失。')) return;
    
    Utils.log('重新开始问卷');
    
    currentQuestionIndex = 0;
    userAnswers = [];
    
    // 清除本地存储的进度
    StorageManager.remove('questionnaire_progress');
    
    startQuestionnaire();
}

// 显示问卷容器
function showQuestionnaireContainer() {
    const container = document.getElementById('questionnaireContainer');
    container.style.display = 'block';
    
    // 隐藏开始按钮
    document.getElementById('startQuestionnaireBtn').style.display = 'none';
    document.getElementById('continueQuestionnaireBtn').style.display = 'none';
    document.getElementById('resetQuestionnaireBtn').style.display = 'inline-block';
}

// 显示问题
function displayQuestion(index) {
    const question = questionnaireData[index];
    const contentDiv = document.getElementById('questionContent');
    
    // 检查是否为开放性问题
    const isOpenEndedQuestion = question.category === "开放性问题" || question.options.length === 1;
    
    let html;
    
    if (isOpenEndedQuestion) {
        // 开放性问题的特殊处理
        const currentAnswer = userAnswers[index] || '';
        const placeholderText = getOpenEndedPlaceholder(question.question);
        
        // 检查是否为多填空题目
        const hasMultipleBlanks = (question.question.includes('①') && question.question.includes('②') && question.question.includes('③')) || 
                                  (question.options[0] && question.options[0].includes('①') && question.options[0].includes('②') && question.options[0].includes('③'));
        const hasInlineBlanks = (question.question.match(/________/g) || []).length > 1;
        
        if (hasMultipleBlanks) {
            // 处理①②③这种多选填空
            const answers = typeof currentAnswer === 'object' ? currentAnswer : { first: '', second: '', third: '' };
            
            html = `
                <div class="question-item open-ended-question multi-blank-question">
                    <div class="question-header">
                        <span class="question-category">${question.category}</span>
                        <span class="question-number">第 ${index + 1} 题 / 共 ${questionnaireData.length} 题</span>
                    </div>
                    <h3 class="question-text">${question.question}</h3>
                    <div class="multi-blank-container">
                        <div class="blank-item">
                            <label for="blank1_${index}">① 第一句话：</label>
                            <textarea 
                                id="blank1_${index}"
                                class="multi-blank-textarea" 
                                placeholder="请写出您想对18岁的自己说的第一句话..."
                                rows="2"
                                maxlength="200"
                            >${answers.first || ''}</textarea>
                            <div class="character-count">
                                <span id="charCount1_${index}">0</span>/200 字符
                            </div>
                        </div>
                        <div class="blank-item">
                            <label for="blank2_${index}">② 第二句话：</label>
                            <textarea 
                                id="blank2_${index}"
                                class="multi-blank-textarea" 
                                placeholder="请写出您想对18岁的自己说的第二句话..."
                                rows="2"
                                maxlength="200"
                            >${answers.second || ''}</textarea>
                            <div class="character-count">
                                <span id="charCount2_${index}">0</span>/200 字符
                            </div>
                        </div>
                        <div class="blank-item">
                            <label for="blank3_${index}">③ 第三句话：</label>
                            <textarea 
                                id="blank3_${index}"
                                class="multi-blank-textarea" 
                                placeholder="请写出您想对18岁的自己说的第三句话..."
                                rows="2"
                                maxlength="200"
                            >${answers.third || ''}</textarea>
                            <div class="character-count">
                                <span id="charCount3_${index}">0</span>/200 字符
                            </div>
                        </div>
                    </div>
                    <div class="open-ended-tips">
                        <p>💡 填写提示：</p>
                        <ul>
                            <li>请分别填写三句话，每句话表达不同的方面</li>
                            <li>可以是建议、鼓励、提醒或者感悟</li>
                            <li>每句话建议10-50字，表达清晰即可</li>
                        </ul>
                    </div>
                </div>
            `;
        } else if (hasInlineBlanks) {
            // 处理在问题中有多个________的情况
            const questionParts = question.question.split('________');
            const answers = typeof currentAnswer === 'object' ? currentAnswer : { blanks: Array(questionParts.length - 1).fill('') };
            const blankCount = questionParts.length - 1;
            
            html = `
                <div class="question-item open-ended-question inline-blank-question">
                    <div class="question-header">
                        <span class="question-category">${question.category}</span>
                        <span class="question-number">第 ${index + 1} 题 / 共 ${questionnaireData.length} 题</span>
                    </div>
                    <h3 class="question-text">请完成以下填空：</h3>
                    <div class="inline-blank-container">
                        ${questionParts.map((part, partIndex) => {
                            if (partIndex < blankCount) {
                                return `
                                    <span class="question-part">${part}</span>
                                    <input 
                                        type="text" 
                                        id="inlineBlank${partIndex}_${index}"
                                        class="inline-blank-input" 
                                        placeholder="填空${partIndex + 1}"
                                        maxlength="100"
                                        value="${(answers.blanks && answers.blanks[partIndex]) || ''}"
                                    >
                                `;
                            } else {
                                return `<span class="question-part">${part}</span>`;
                            }
                        }).join('')}
                    </div>
                    <div class="open-ended-tips">
                        <p>💡 填写提示：</p>
                        <ul>
                            <li>请在每个空白处填入合适的内容</li>
                            <li>填空内容要与前后文语境相符</li>
                            <li>建议每个空填入5-20字的内容</li>
                        </ul>
                    </div>
                </div>
            `;
        } else {
            // 普通的开放性问题
            html = `
                <div class="question-item open-ended-question">
                    <div class="question-header">
                        <span class="question-category">${question.category}</span>
                        <span class="question-number">第 ${index + 1} 题 / 共 ${questionnaireData.length} 题</span>
                    </div>
                    <h3 class="question-text">${question.question}</h3>
                    <div class="open-ended-container">
                        <div class="textarea-container">
                            <textarea 
                                id="openEndedAnswer_${index}"
                                class="open-ended-textarea" 
                                placeholder="${placeholderText}"
                                rows="6"
                                maxlength="500"
                            >${currentAnswer}</textarea>
                            <div class="character-count">
                                <span id="charCount_${index}">0</span>/500 字符
                            </div>
                        </div>
                        <div class="open-ended-tips">
                            <p>💡 填写提示：</p>
                            <ul>
                                <li>请用自己的话详细回答，字数建议在10-300字之间</li>
                                <li>可以结合具体的经历或感受来回答</li>
                                <li>真实的回答有助于获得更准确的预测结果</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }
    } else {
        // 普通选择题的处理
        html = `
            <div class="question-item">
                <div class="question-header">
                    <span class="question-category">${question.category}</span>
                    <span class="question-number">第 ${index + 1} 题 / 共 ${questionnaireData.length} 题</span>
                </div>
                <h3 class="question-text">${question.question}</h3>
                <div class="question-options">
                    ${question.options.map((option, optionIndex) => {
                        const isOtherOption = option.includes('其他') && option.includes('________');
                        const currentAnswer = userAnswers[index];
                        const isChecked = currentAnswer === optionIndex || (typeof currentAnswer === 'object' && currentAnswer?.optionIndex === optionIndex);
                        const customValue = (typeof currentAnswer === 'object' && currentAnswer?.optionIndex === optionIndex) ? currentAnswer.customValue : '';
                        
                        return `
                            <label class="option-item ${isOtherOption ? 'option-with-input' : ''}">
                                <input type="radio" name="question_${question.id}" value="${optionIndex}" 
                                       ${isChecked ? 'checked' : ''}>
                                <span class="option-text">${option.replace('________', '')}</span>
                                ${isOtherOption ? `
                                    <input type="text" 
                                           class="custom-input" 
                                           placeholder="请输入您的补充内容"
                                           value="${customValue}"
                                           ${isChecked ? '' : 'disabled'}
                                           data-option-index="${optionIndex}">
                                ` : ''}
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    contentDiv.innerHTML = html;
    
    if (isOpenEndedQuestion) {
        // 绑定开放性问题的事件
        const hasMultipleBlanks = (question.question.includes('①') && question.question.includes('②') && question.question.includes('③')) || 
                                  (question.options[0] && question.options[0].includes('①') && question.options[0].includes('②') && question.options[0].includes('③'));
        const hasInlineBlanks = (question.question.match(/________/g) || []).length > 1;
        
        if (hasMultipleBlanks) {
            // 绑定多选填空事件
            bindMultiBlankEvents(contentDiv, index);
        } else if (hasInlineBlanks) {
            // 绑定行内填空事件
            bindInlineBlankEvents(contentDiv, index, (question.question.match(/________/g) || []).length);
        } else {
            // 绑定普通开放性问题事件
            bindSingleTextareaEvents(contentDiv, index);
        }
        
    } else {
        // 绑定选择题的事件
        bindChoiceQuestionEvents(contentDiv, index);
    }
    
    updateNavigationButtons();
}

// 绑定多选填空事件
function bindMultiBlankEvents(contentDiv, index) {
    const textarea1 = document.getElementById(`blank1_${index}`);
    const textarea2 = document.getElementById(`blank2_${index}`);
    const textarea3 = document.getElementById(`blank3_${index}`);
    const charCount1 = document.getElementById(`charCount1_${index}`);
    const charCount2 = document.getElementById(`charCount2_${index}`);
    const charCount3 = document.getElementById(`charCount3_${index}`);
    
    function updateCharCount(textarea, countElement) {
        const currentLength = textarea.value.length;
        countElement.textContent = currentLength;
        countElement.style.color = currentLength > 180 ? '#ff4444' : '#666';
    }
    
    function updateAnswer() {
        userAnswers[index] = {
            first: textarea1.value,
            second: textarea2.value,
            third: textarea3.value
        };
        saveProgress();
        updateNavigationButtons();
    }
    
    // 初始化字符计数
    updateCharCount(textarea1, charCount1);
    updateCharCount(textarea2, charCount2);
    updateCharCount(textarea3, charCount3);
    
    // 绑定事件
    [textarea1, textarea2, textarea3].forEach((textarea, idx) => {
        const countElement = [charCount1, charCount2, charCount3][idx];
        
        textarea.addEventListener('input', function() {
            updateCharCount(this, countElement);
            updateAnswer();
        });
        
        textarea.addEventListener('paste', function(e) {
            setTimeout(() => {
                if (this.value.length > 200) {
                    this.value = this.value.substring(0, 200);
                    updateCharCount(this, countElement);
                }
                updateAnswer();
            }, 0);
        });
    });
}

// 绑定行内填空事件
function bindInlineBlankEvents(contentDiv, index, blankCount) {
    const inputs = [];
    for (let i = 0; i < blankCount; i++) {
        inputs.push(document.getElementById(`inlineBlank${i}_${index}`));
    }
    
    function updateAnswer() {
        userAnswers[index] = {
            blanks: inputs.map(input => input.value)
        };
        saveProgress();
        updateNavigationButtons();
    }
    
    inputs.forEach(input => {
        input.addEventListener('input', updateAnswer);
        input.addEventListener('paste', function(e) {
            setTimeout(() => {
                if (this.value.length > 100) {
                    this.value = this.value.substring(0, 100);
                }
                updateAnswer();
            }, 0);
        });
    });
}

// 绑定普通文本框事件
function bindSingleTextareaEvents(contentDiv, index) {
    const textarea = document.getElementById(`openEndedAnswer_${index}`);
    const charCountSpan = document.getElementById(`charCount_${index}`);
    
    // 更新字符计数
    function updateCharCount() {
        const currentLength = textarea.value.length;
        charCountSpan.textContent = currentLength;
        charCountSpan.style.color = currentLength > 450 ? '#ff4444' : '#666';
    }
    
    // 初始化字符计数
    updateCharCount();
    
    // 绑定输入事件
    textarea.addEventListener('input', function() {
        userAnswers[index] = this.value;
        updateCharCount();
        saveProgress();
        updateNavigationButtons();
    });
    
    // 绑定粘贴事件
    textarea.addEventListener('paste', function(e) {
        setTimeout(() => {
            if (this.value.length > 500) {
                this.value = this.value.substring(0, 500);
                updateCharCount();
            }
        }, 0);
    });
}

// 绑定选择题事件
function bindChoiceQuestionEvents(contentDiv, index) {
    const radioInputs = contentDiv.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => {
        input.addEventListener('change', function() {
            const optionIndex = parseInt(this.value);
            const customInput = contentDiv.querySelector(`input[data-option-index="${optionIndex}"]`);
            
            // 启用/禁用自定义输入框
            const allCustomInputs = contentDiv.querySelectorAll('.custom-input');
            allCustomInputs.forEach(ci => {
                ci.disabled = true;
                ci.style.opacity = '0.5';
            });
            
            if (customInput) {
                customInput.disabled = false;
                customInput.style.opacity = '1';
                customInput.focus();
                
                // 如果是其他选项，保存为对象格式
                userAnswers[index] = {
                    optionIndex: optionIndex,
                    customValue: customInput.value
                };
            } else {
                // 普通选项，保存为数字
                userAnswers[index] = optionIndex;
            }
            
            saveProgress();
            updateNavigationButtons();
        });
    });
    
    // 绑定自定义输入框变化事件
    const customInputs = contentDiv.querySelectorAll('.custom-input');
    customInputs.forEach(input => {
        input.addEventListener('input', function() {
            const optionIndex = parseInt(this.dataset.optionIndex);
            const radio = contentDiv.querySelector(`input[value="${optionIndex}"]`);
            
            if (radio.checked) {
                userAnswers[index] = {
                    optionIndex: optionIndex,
                    customValue: this.value
                };
                saveProgress();
                updateNavigationButtons();
            }
        });
    });
}

// 获取开放性问题的占位符文本
function getOpenEndedPlaceholder(question) {
    if (question.includes('时光倒流')) {
        return '请分别写出您想对18岁的自己说的三句话，每句话请写在新的一行...';
    } else if (question.includes('违背直觉')) {
        return '请详细描述这次经历，包括具体的情况、决策过程和最终的收获...';
    } else if (question.includes('未实现的')) {
        return '请描述您未实现的目标和主要阻碍因素...';
    } else if (question.includes('目标感最强烈')) {
        return '请描述那段时期的具体情况和当时的动力来源...';
    } else if (question.includes('不考虑现实条件')) {
        return '请详细描述您理想中的职业或生活方式...';
    } else {
        return '请详细回答这个问题，字数建议在10-300字之间...';
    }
}

// 更新导航按钮状态
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevQuestionBtn');
    const nextBtn = document.getElementById('nextQuestionBtn');
    const submitBtn = document.getElementById('submitQuestionnaireBtn');
    
    // 上一题按钮
    prevBtn.disabled = currentQuestionIndex === 0;
    
    // 检查当前题目是否已回答
    const currentAnswer = userAnswers[currentQuestionIndex];
    const question = questionnaireData[currentQuestionIndex];
    const isOpenEndedQuestion = question.category === "开放性问题" || question.options.length === 1;
    
    let hasAnswer = false;
    
    if (isOpenEndedQuestion) {
        // 开放性问题：检查是否有文本且不为空（至少1个字符）
        if (typeof currentAnswer === 'object' && currentAnswer !== null) {
            if (currentAnswer.first !== undefined) {
                // 多选填空题
                hasAnswer = currentAnswer.first.trim().length >= 1 && 
                           currentAnswer.second.trim().length >= 1 && 
                           currentAnswer.third.trim().length >= 1;
            } else if (currentAnswer.blanks !== undefined) {
                // 行内填空题
                hasAnswer = currentAnswer.blanks.every(blank => blank.trim().length >= 1);
            }
        } else {
            // 普通开放性问题
            hasAnswer = currentAnswer && typeof currentAnswer === 'string' && currentAnswer.trim().length >= 1;
        }
    } else if (typeof currentAnswer === 'object' && currentAnswer !== null) {
        // 如果是自定义输入，检查是否有自定义值
        hasAnswer = currentAnswer.customValue && currentAnswer.customValue.trim() !== '';
    } else {
        // 普通选项，检查是否有选择
        hasAnswer = currentAnswer !== undefined;
    }
    
    // 下一题按钮
    nextBtn.disabled = !hasAnswer;
    
    // 提交按钮
    if (currentQuestionIndex === questionnaireData.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = hasAnswer ? 'inline-block' : 'none';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

// 上一题
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
        updateProgress();
    }
}

// 下一题
function nextQuestion() {
    if (currentQuestionIndex < questionnaireData.length - 1 && userAnswers[currentQuestionIndex] !== undefined) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
        updateProgress();
    }
}

// 更新进度
function updateProgress() {
    const answeredCount = userAnswers.filter(answer => answer !== undefined).length;
    const totalCount = questionnaireData.length;
    const percentage = Math.round((answeredCount / totalCount) * 100);
    
    document.getElementById('progressFill').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `${answeredCount}/${totalCount} 题`;
    document.getElementById('progressPercent').textContent = `${percentage}%`;
}

// 保存进度
function saveProgress() {
    const progress = {
        currentQuestionIndex,
        userAnswers,
        timestamp: new Date().toISOString()
    };
    
    StorageManager.save('questionnaire_progress', progress);
    Utils.log('问卷进度已保存');
}

// 检查未完成的问卷
function checkUnfinishedQuestionnaire() {
    const progress = StorageManager.load('questionnaire_progress');
    
    if (progress && progress.userAnswers.length > 0) {
        currentQuestionIndex = progress.currentQuestionIndex || 0;
        userAnswers = progress.userAnswers || [];
        
        document.getElementById('continueQuestionnaireBtn').style.display = 'inline-block';
        document.getElementById('resetQuestionnaireBtn').style.display = 'inline-block';
        
        updateProgress();
        
        Utils.log('发现未完成的问卷', progress);
    }
}

// 提交问卷
async function submitQuestionnaire() {
    if (userAnswers.length !== questionnaireData.length) {
        Utils.showError(document.getElementById('questionContent'), '请完成所有题目后再提交');
        return;
    }
    
    // 检查所有答案是否完整
    for (let i = 0; i < userAnswers.length; i++) {
        const answer = userAnswers[i];
        const question = questionnaireData[i];
        const isOpenEndedQuestion = question.category === "开放性问题" || question.options.length === 1;
        
        if (isOpenEndedQuestion) {
            // 开放性问题验证 - 提交时要求更详细的回答
            if (typeof answer === 'object' && answer !== null) {
                if (answer.first !== undefined) {
                    // 多选填空题验证
                    if (!answer.first || answer.first.trim().length < 3 ||
                        !answer.second || answer.second.trim().length < 3 ||
                        !answer.third || answer.third.trim().length < 3) {
                        Utils.showError(document.getElementById('questionContent'), `第 ${i + 1} 题（多填空题）每个空都需要至少输入3个字符`);
                        return;
                    }
                } else if (answer.blanks !== undefined) {
                    // 行内填空题验证
                    if (!answer.blanks || answer.blanks.some(blank => !blank || blank.trim().length < 2)) {
                        Utils.showError(document.getElementById('questionContent'), `第 ${i + 1} 题（填空题）每个空都需要至少输入2个字符`);
                        return;
                    }
                }
            } else {
                // 普通开放性问题验证
                if (!answer || typeof answer !== 'string' || answer.trim().length < 5) {
                    Utils.showError(document.getElementById('questionContent'), `第 ${i + 1} 题（开放性问题）需要至少输入5个字符`);
                    return;
                }
            }
        } else if (typeof answer === 'object' && answer !== null) {
            // 自定义输入答案，检查自定义值是否为空
            if (!answer.customValue || answer.customValue.trim() === '') {
                Utils.showError(document.getElementById('questionContent'), `第 ${i + 1} 题的自定义输入不能为空`);
                return;
            }
        } else if (answer === undefined) {
            // 普通答案未选择
            Utils.showError(document.getElementById('questionContent'), `第 ${i + 1} 题未作答`);
            return;
        }
    }
    
    Utils.log('提交问卷', userAnswers);
    
    // 显示提交状态
    const submitBtn = document.getElementById('submitQuestionnaireBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '🔄 分析中...';
    submitBtn.disabled = true;
    
    try {
        // 构建问答对
        const questionAnswers = questionnaireData.map((question, index) => {
            const answer = userAnswers[index];
            const isOpenEndedQuestion = question.category === "开放性问题" || question.options.length === 1;
            let answerText;
            
            if (isOpenEndedQuestion) {
                // 开放性问题直接使用文本答案
                if (typeof answer === 'object' && answer !== null) {
                    if (answer.first !== undefined) {
                        // 多选填空题
                        answerText = `①${answer.first} ②${answer.second} ③${answer.third}`;
                    } else if (answer.blanks !== undefined) {
                        // 行内填空题
                        const questionParts = question.question.split('________');
                        answerText = '';
                        for (let j = 0; j < questionParts.length; j++) {
                            answerText += questionParts[j];
                            if (j < answer.blanks.length) {
                                answerText += answer.blanks[j];
                            }
                        }
                    }
                } else {
                    // 普通开放性问题
                    answerText = answer;
                }
            } else if (typeof answer === 'object' && answer !== null) {
                // 自定义输入答案
                const baseOption = question.options[answer.optionIndex];
                answerText = baseOption.replace('________', answer.customValue);
            } else {
                // 普通答案
                answerText = question.options[answer];
            }
            
            return {
                question: question.question,
                answer: answerText,
                category: question.category
            };
        });
        
        // 发送预测请求
        await sendPredictionRequest(questionAnswers);
        
        // 清除进度
        StorageManager.remove('questionnaire_progress');
        
        // 隐藏问卷容器
        document.getElementById('questionnaireContainer').style.display = 'none';
        
    } catch (error) {
        Utils.log('预测生成失败', error);
        Utils.showError(document.getElementById('questionContent'), '预测生成失败：' + error.message);
    } finally {
        // 恢复按钮状态
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 发送预测请求
async function sendPredictionRequest(questionAnswers) {
    Utils.log('发送预测API请求');
    
    // 检查API配置
    if (!API_CONFIG.BASE_URL || !API_CONFIG.WORKFLOW_IDS.PREDICTION) {
        // 演示模式
        Utils.log('API未配置，使用演示模式');
        await simulatePredictionResponse(questionAnswers);
        return;
    }
    
    try {
        // 构建预测输入
        const qaString = questionAnswers.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
        const predictionInput = `请基于以下问卷回答进行人生发展预测分析：\n\n${qaString}`;
        
        // 发送API请求
        const response = await APIManager.sendPredictionRequest(predictionInput, []);
        
        // 处理流式响应
        await APIManager.handleStreamResponse(
            response,
            (chunk, fullContent) => {
                displayPredictionResult(fullContent, false);
            },
            (fullContent) => {
                displayPredictionResult(fullContent, true);
                savePredictionResult(questionAnswers, fullContent);
            },
            (error) => {
                throw error;
            }
        );
        
    } catch (error) {
        Utils.log('API请求失败，使用演示模式', error);
        await simulatePredictionResponse(questionAnswers);
    }
}

// 模拟预测响应
async function simulatePredictionResponse(questionAnswers) {
    Utils.log('使用演示模式生成预测');
    
    const demoResponse = `# 🔮 人生发展预测报告

## 📊 综合评估概况

基于您的问卷回答，我们对您的人生发展进行了多维度分析：

### 🌟 核心优势
- **学习能力**：您展现出良好的学习适应能力
- **成长环境**：拥有相对稳定的成长基础
- **发展潜力**：在多个领域都有不错的发展空间

### ⚠️ 关注领域
- **目标规划**：建议加强长期目标的制定和执行
- **资源整合**：可以更好地利用现有的社会支持资源
- **技能发展**：在某些专业技能方面还有提升空间

## 🎯 发展预测分析

### 📈 短期发展（1-3年）
**学业/职业发展**：
- 预计在当前领域会有稳步提升
- 建议重点关注核心技能的深化
- 可能会遇到1-2次重要的选择机会

**个人成长**：
- 自我认知会逐步清晰
- 人际关系网络会有所扩展
- 抗压能力和适应能力会增强

### 🚀 中期发展（3-7年）
**事业发展**：
- 有望在专业领域建立一定的影响力
- 可能会承担更多的责任和挑战
- 收入水平预计会有显著提升

**生活品质**：
- 生活稳定性会明显改善
- 可能会面临重要的人生选择（如婚姻、置业等）
- 社会地位和认可度会提升

### 🌈 长期展望（7年以上）
**人生成就**：
- 有潜力在某个领域达到较高水平
- 可能会成为他人的导师或榜样
- 社会贡献和个人价值会得到体现

**幸福指数**：
- 整体生活满意度预计会保持在较高水平
- 家庭和事业有望达到良好平衡
- 精神层面的追求会更加丰富

## 💡 发展建议

### 🎓 能力提升建议
1. **持续学习**：保持终身学习的习惯，跟上时代发展
2. **技能深化**：在核心专业领域深入发展，建立竞争优势
3. **跨界融合**：适当涉猎其他领域，培养综合能力

### 🤝 关系建设建议
1. **人脉拓展**：主动参与行业活动，建立专业人脉
2. **导师寻找**：寻找合适的导师或榜样，加速成长
3. **团队合作**：提升团队协作能力，学会与他人共赢

### 🎯 目标规划建议
1. **阶段目标**：设定清晰的短期、中期、长期目标
2. **执行计划**：制定具体的行动计划和时间表
3. **定期回顾**：定期评估进展，及时调整策略

### ⚖️ 平衡发展建议
1. **工作生活平衡**：避免过度工作，保持身心健康
2. **兴趣培养**：发展个人兴趣爱好，丰富精神生活
3. **社会责任**：适当承担社会责任，实现个人价值

## 📋 行动计划

### 近期行动（3个月内）
- [ ] 制定详细的个人发展计划
- [ ] 识别并开始提升1-2项核心技能
- [ ] 建立定期学习和反思的习惯

### 中期行动（1年内）
- [ ] 完成一个重要的学习或项目目标
- [ ] 扩展专业人脉网络
- [ ] 寻找导师或加入专业社群

### 长期行动（3年内）
- [ ] 在专业领域建立一定影响力
- [ ] 实现重要的职业或学业里程碑
- [ ] 建立稳定的生活和事业基础

## ⚠️ 风险提醒

### 潜在挑战
1. **环境变化**：外部环境的快速变化可能带来挑战
2. **竞争加剧**：行业竞争可能会更加激烈
3. **选择困难**：面临重要选择时可能会犹豫不决

### 应对策略
1. **保持敏感**：关注行业和社会发展趋势
2. **提升适应性**：培养快速学习和适应的能力
3. **寻求支持**：在关键时刻寻求专业建议和支持

---

**免责声明**：本预测报告基于问卷分析生成，仅供参考。人生发展受多种因素影响，最终结果取决于个人努力和环境变化。

*注意：这是演示模式生成的预测报告，实际使用时将调用真实的AI工作流API生成更个性化的内容。*`;

    // 模拟流式输出
    const chunks = demoResponse.split('');
    const resultDiv = document.getElementById('predictionResult');
    resultDiv.style.display = 'block';
    
    let currentContent = '';
    for (let i = 0; i < chunks.length; i++) {
        currentContent += chunks[i];
        displayPredictionResult(currentContent, false);
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    displayPredictionResult(demoResponse, true);
    savePredictionResult(questionAnswers, demoResponse);
}

// 显示预测结果
function displayPredictionResult(content, isComplete) {
    const resultDiv = document.getElementById('predictionResult');
    const contentDiv = document.getElementById('reportContent');
    
    resultDiv.style.display = 'block';
    
    // 将Markdown转换为HTML显示
    const htmlContent = Utils.markdownToHtml(content);
    contentDiv.innerHTML = htmlContent;
    
    if (isComplete) {
        Utils.log('预测报告生成完成');
        // 不再调用 showSuccess，因为它会覆盖 AI 生成的内容
        // 可以在其他地方显示成功消息，比如临时提示
        console.log('预测报告生成完成！');
    }
    
    // 滚动到结果区域
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// 保存预测结果
function savePredictionResult(questionAnswers, report) {
    const predictionData = {
        id: Utils.generateId(),
        questionAnswers: questionAnswers,
        report: report,
        timestamp: new Date().toISOString(),
        createdTime: Utils.formatDateTime(new Date())
    };
    
    // 保存到历史记录
    predictionHistory.unshift(predictionData);
    StorageManager.save('prediction_history', predictionHistory);
    
    // 更新历史显示
    loadPredictionHistory();
    
    Utils.log('预测结果已保存', predictionData);
}

// 导出报告
function exportReport() {
    const reportContentElement = document.getElementById('reportContent');
    if (!reportContentElement || !reportContentElement.innerHTML.trim()) {
        Utils.showError(reportContentElement || document.body, '没有可导出的报告');
        return;
    }
    
    // 获取报告的HTML内容
    const reportHTML = reportContentElement.innerHTML;
    
    // 简单的HTML转文本转换，保留格式
    let reportText = reportHTML
        .replace(/<h1[^>]*>/gi, '\n# ')
        .replace(/<h2[^>]*>/gi, '\n## ')
        .replace(/<h3[^>]*>/gi, '\n### ')
        .replace(/<h4[^>]*>/gi, '\n#### ')
        .replace(/<\/h[1-6]>/gi, '\n')
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<li[^>]*>/gi, '\n- ')
        .replace(/<\/li>/gi, '')
        .replace(/<ul[^>]*>|<\/ul>|<ol[^>]*>|<\/ol>/gi, '\n')
        .replace(/<strong[^>]*>|<b[^>]*>/gi, '**')
        .replace(/<\/strong>|<\/b>/gi, '**')
        .replace(/<em[^>]*>|<i[^>]*>/gi, '*')
        .replace(/<\/em>|<\/i>/gi, '*')
        .replace(/<[^>]*>/g, '')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
    
    const exportData = {
        title: '人生发展预测报告',
        createdTime: Utils.formatDateTime(new Date()),
        content: reportText
    };
    
    // 创建格式化的文本内容
    const exportContent = `${exportData.title}

生成时间：${exportData.createdTime}

================================================================

${reportText}

================================================================

本报告由校园AI助手生成，仅供参考。`;
    
    const dataBlob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `人生预测报告_${Utils.formatDateTime(new Date(), 'file')}.txt`;
    link.click();
    
    Utils.log('预测报告已导出');
    Utils.showSuccess(reportContentElement, '报告已导出到下载文件夹');
}

// 重新测试
function retakeQuestionnaire() {
    if (!confirm('确定要重新进行测试吗？')) return;
    
    // 隐藏结果
    document.getElementById('predictionResult').style.display = 'none';
    
    // 重新开始问卷
    resetQuestionnaire();
}

// 加载预测历史
function loadPredictionHistory() {
    Utils.log('加载预测历史');
    
    predictionHistory = StorageManager.load('prediction_history', []);
    const historyDiv = document.getElementById('predictionHistory');
    
    if (predictionHistory.length === 0) {
        historyDiv.innerHTML = `
            <div class="empty-state">
                <p>📝 暂无测试历史</p>
                <p>完成第一次测试后，这里将显示历史记录</p>
            </div>
        `;
        return;
    }
    
    const historyHtml = predictionHistory.map(prediction => `
        <div class="prediction-history-item" data-prediction-id="${prediction.id}">
            <div class="history-header">
                <span class="history-title">人生发展预测</span>
                <span class="history-time">${prediction.createdTime}</span>
            </div>
            <div class="history-summary">
                测试时间：${prediction.createdTime}，共回答${prediction.questionAnswers.length}题
            </div>
            <div class="history-actions">
                <button class="btn btn-sm btn-primary" onclick="viewPrediction('${prediction.id}')">
                    👁️ 查看
                </button>
                <button class="btn btn-sm btn-secondary" onclick="copyPrediction('${prediction.id}')">
                    📋 复制
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePrediction('${prediction.id}')">
                    🗑️ 删除
                </button>
            </div>
        </div>
    `).join('');
    
    historyDiv.innerHTML = historyHtml;
    
    Utils.log(`加载了 ${predictionHistory.length} 条预测历史`);
}

// 查看预测
function viewPrediction(predictionId) {
    const prediction = predictionHistory.find(p => p.id === predictionId);
    if (!prediction) return;
    
    displayPredictionResult(prediction.report, true);
    
    Utils.log('查看历史预测', predictionId);
}

// 复制预测
function copyPrediction(predictionId) {
    const prediction = predictionHistory.find(p => p.id === predictionId);
    if (!prediction) return;
    
    navigator.clipboard.writeText(prediction.report).then(() => {
        Utils.showSuccess(document.getElementById('predictionHistory'), '预测报告已复制到剪贴板');
    }).catch(() => {
        Utils.showError(document.getElementById('predictionHistory'), '复制失败，请手动复制');
    });
    
    Utils.log('复制预测', predictionId);
}

// 删除预测
function deletePrediction(predictionId) {
    if (!confirm('确定要删除这个预测记录吗？')) return;
    
    predictionHistory = predictionHistory.filter(p => p.id !== predictionId);
    StorageManager.save('prediction_history', predictionHistory);
    loadPredictionHistory();
    
    Utils.log('删除预测', predictionId);
    Utils.showSuccess(document.getElementById('predictionHistory'), '预测记录已删除');
}

// 清空预测历史
function clearPredictionHistory() {
    if (!confirm('确定要清空所有预测历史吗？此操作不可恢复。')) return;
    
    predictionHistory = [];
    StorageManager.save('prediction_history', []);
    loadPredictionHistory();
    
    Utils.log('清空预测历史');
    Utils.showSuccess(document.getElementById('predictionHistory'), '预测历史已清空');
}

