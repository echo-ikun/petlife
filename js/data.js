/* 宠物的一生 · 数据层
   世界是虚构的，感情不是。 */

window.PL = window.PL || {};

PL.clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
PL.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
PL.pickMany = (arr, n) => {
  const copy = arr.slice();
  const out = [];
  while (copy.length && out.length < n) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
};
PL.jitter = (n, amount = 4) => Math.round(n + (Math.random() * amount * 2 - amount));
PL.formatAge = (years) => {
  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12));
    return `${months} 个月`;
  }
  const y = Math.floor(years + 0.0001);
  const m = Math.round((years - y) * 12);
  if (m >= 12) return `${y + 1} 岁`;
  return m > 0 ? `${y} 岁 ${m} 个月` : `${y} 岁`;
};
PL.pronounize = (text, he) => {
  const s = String(text == null ? '' : text);
  if (he !== '她') return s;
  return s
    .replace(/其他/g, '\u0000OTHER\u0000')
    .replace(/他人/g, '\u0000OTHERPERSON\u0000')
    .replace(/他(?!们)/g, '她')
    .replace(/\u0000OTHER\u0000/g, '其他')
    .replace(/\u0000OTHERPERSON\u0000/g, '他人');
};
PL.formatDuration = (years) => {
  if (years < 1) return `${Math.max(1, Math.round(years * 12))} 个月`;
  const y = Math.floor(years + 0.0001);
  const m = Math.round((years - y) * 12);
  if (m >= 12) return `${y + 1} 年`;
  return m > 0 ? `${y} 年 ${m} 个月` : `${y} 年`;
};
PL.year = () => new Date().getFullYear();
PL.todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
PL.uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/* ---------------- 九种灵魂 ---------------- */

PL.SPECIES = {
  orange: {
    id: 'orange',
    name: '橘猫',
    en: 'Orange Tabby',
    jp: 'オレンジ猫',
    tags: ['乐天', '贪吃', '容易胖'],
    tagline: '把日子过成一场漫长的午饭',
    intro: '你相信世界上所有的碗，最后都会满。',
    quote: '“不是胖，是幸福有重量。”',
    lifespan: 15,
    base: { health: 58, bond: 62, curiosity: 54, freedom: 50 },
    names: ['年糕', '大福', '阿橘', '馒头', '橘子'],
    palette: { primary: '#D98A45', light: '#F3D9B8', dark: '#8A4F24', accent: '#C94F3D' },
    toHuman: (a) => (a < 1 ? a * 15 : a <= 2 ? 15 + (a - 1) * 9 : 24 + (a - 2) * 4),
    illness: '你开始喝很多水，跳不上窗台。他把你抱上去两次，第三次，你在他怀里睡着了。',
    aging: '你不再追激光笔了。他晃两下，你就假装没看见。',
    lastDay: '你闻见厨房里有小鱼干的味道。你想过去，但只是把下巴搁在他的手腕上。',
    companion: [
      '在窗台上看了一下午的鸟，尾巴一下一下地拍着窗台。',
      '找到了一只属于自己的纸箱，谁叫都不出来。',
      '学会了在开门前跑到门口，一次也没错过。',
      '跳不上窗台了，每天在同一个有太阳的角落睡觉。',
    ],
  },
  black: {
    id: 'black',
    name: '黑猫',
    en: 'Black Cat',
    jp: '黒猫',
    tags: ['敏感', '夜行', '温柔'],
    tagline: '只在关灯以后，才把温柔拿出来',
    intro: '你相信黑暗不是空的，里面藏着很多没被说出口的话。',
    quote: '“你看不见我，但我一直在。”',
    lifespan: 15,
    base: { health: 56, bond: 52, curiosity: 66, freedom: 62 },
    names: ['墨墨', '芝麻', '煤球', '夜巡', '乌冬'],
    palette: { primary: '#3E3A3A', light: '#C9C0B5', dark: '#1E1B1B', accent: '#C9A227' },
    toHuman: (a) => (a < 1 ? a * 15 : a <= 2 ? 15 + (a - 1) * 9 : 24 + (a - 2) * 4),
    illness: '你躲在床底，一整天没出来。他趴在地上，用手电筒照你，声音很轻。',
    aging: '你跳上柜顶的动作变慢了。他给你搬来一把椅子，假装那是给他自己用的。',
    lastDay: '你选了他关灯以后才坐的那把椅子。月光落在你的黑毛上，几乎看不见。',
    companion: [
      '在半夜的客厅里跑酷，把全家都吵醒了。',
      '找到一个只有自己知道的角落，睡了整整一天。',
      '在他难过的时候，第一次主动跳上他的膝盖。',
      '不再半夜跑酷，只是安静地趴在门口。',
    ],
  },
  ragdoll: {
    id: 'ragdoll',
    name: '布偶猫',
    en: 'Ragdoll',
    jp: 'ラグドール',
    tags: ['黏人', '漂亮', '体弱'],
    tagline: '生来就是被人抱的，可你只想要一个人',
    intro: '你有一双蓝眼睛，很多人夸过。你只想知道，他什么时候回来。',
    quote: '“抱紧一点，我会散掉的。”',
    lifespan: 14,
    base: { health: 48, bond: 70, curiosity: 48, freedom: 40 },
    names: ['云朵', '雪团', '绵绵', '棉花', '月亮'],
    palette: { primary: '#B9AEA4', light: '#F1E8DE', dark: '#6E6259', accent: '#7C9BAE' },
    toHuman: (a) => (a < 1 ? a * 15 : a <= 2 ? 15 + (a - 1) * 9 : 24 + (a - 2) * 4),
    illness: '你吐了两次，毛打结，连最喜欢的梳子也不让碰。他把你裹进毛巾里。',
    aging: '你不再挣扎着要抱。他把你抱起来时，你像一条柔软的围巾。',
    lastDay: '你在他怀里，像平时一样软。他不敢动，怕吵醒你。',
    companion: [
      '被抱到镜子前，看见自己，愣了很久。',
      '学会了在他回家时，第一个走到门口。',
      '因为毛打结，被剪了一个很难看的发型。',
      '毛没有以前亮了，但还是喜欢被抱着。',
    ],
  },
  shiba: {
    id: 'shiba',
    name: '柴犬',
    en: 'Shiba Inu',
    jp: '柴犬',
    tags: ['固执', '忠诚', '戏精'],
    tagline: '有自己的想法。散步路线也是',
    intro: '你觉得自己不是宠物。你是这个家的另一个主人，只是个子小一点。',
    quote: '“我没有不听话，我只是在思考。”',
    lifespan: 14,
    base: { health: 62, bond: 58, curiosity: 58, freedom: 66 },
    names: ['小柴', '团子', '味噌', '阿柴', '红豆'],
    palette: { primary: '#C9834F', light: '#F0DCC6', dark: '#7A4526', accent: '#5F6E52' },
    toHuman: (a) => (a < 1 ? a * 15 : a <= 2 ? 15 + (a - 1) * 9 : 24 + (a - 2) * 6),
    illness: '你走路开始一瘸一拐，但出门还是要走在前面。',
    aging: '你依然坚持自己上楼梯。他在后面伸着手，没敢扶。',
    lastDay: '你趴在门口，脸朝着门。他坐在旁边，陪你等一个不会来的人。',
    companion: [
      '在公园里和一只大狗吵了一架，赢了气势。',
      '因为不肯回家，在路边坐了二十分钟。',
      '学会了一个新技能：把球叼回来，但不给你。',
      '走路慢了，出门还是要走在前面。',
    ],
  },
  corgi: {
    id: 'corgi',
    name: '柯基',
    en: 'Corgi',
    jp: 'コーギー',
    tags: ['热烈', '短腿', '牧牛魂'],
    tagline: '腿短不影响你觉得自己是一头狮子',
    intro: '你跑起来像一颗小炮弹。世界很大，但你没有在怕。',
    quote: '“再跑一圈，就一圈。”',
    lifespan: 13,
    base: { health: 60, bond: 66, curiosity: 62, freedom: 52 },
    names: ['豆包', '面包', '元宝', '短腿', '土豆'],
    palette: { primary: '#D69A54', light: '#F5E3C9', dark: '#8B5A2B', accent: '#C94F3D' },
    toHuman: (a) => (a < 1 ? a * 15 : a <= 2 ? 15 + (a - 1) * 9 : 24 + (a - 2) * 5),
    illness: '你的后腿使不上力，走路像一艘小船。他还是每天带你下楼。',
    aging: '你跑不动了，但看见球还是会叫两声。',
    lastDay: '你把头搁在他的鞋上。那是你从小就喜欢的位置。',
    companion: [
      '在草地上跑了二十圈，把自己跑成了一个逗号。',
      '学会了握手，但只肯在有好吃的的时候。',
      '追着一只蝴蝶，撞上了玻璃门。',
      '跑不动了，但看见球还是会叫两声。',
    ],
  },
  village: {
    id: 'village',
    name: '田园犬',
    en: 'Village Dog',
    jp: '田舎犬',
    tags: ['自由', '义气', '看家'],
    tagline: '守着一个院子，也守着一整个童年',
    intro: '你认识村里的每一条路、每一只鸡，和每一个不该进门的人。',
    quote: '“院墙以内，归我管。”',
    lifespan: 15,
    base: { health: 66, bond: 60, curiosity: 54, freedom: 70 },
    names: ['大黄', '来福', '旺财', '阿黄', '石头'],
    palette: { primary: '#C9A15E', light: '#F0DFC0', dark: '#7C5B2E', accent: '#8A3B2A' },
    toHuman: (a) => (a < 1 ? a * 15 : a <= 2 ? 15 + (a - 1) * 9 : 24 + (a - 2) * 6),
    illness: '你开始咳嗽，夜里尤其厉害。他把你挪到屋里，灶台旁边。',
    aging: '你不再追鸡了。院子里的事，你交给风。',
    lastDay: '你走到院门口，趴下。你守了一辈子的门，最后一次也是。',
    companion: [
      '跟着主人去了一趟镇上，认识了半条街的人。',
      '在麦垛里睡了一夜，回家挨了一顿骂。',
      '赶走了一个翻墙进来的人，从此觉得自己是英雄。',
      '不再追鸡了，每天在院门口晒太阳。',
    ],
  },
  rabbit: {
    id: 'rabbit',
    name: '垂耳兔',
    en: 'Lop Rabbit',
    jp: 'ロップイヤー',
    tags: ['胆小', '温柔', '爆发'],
    tagline: '害怕很多事，但爱他这件事没怕过',
    intro: '你听见很多声音。你记得的，只有他的脚步。',
    quote: '“别突然抱我……好吧，可以。”',
    lifespan: 10,
    base: { health: 50, bond: 64, curiosity: 44, freedom: 42 },
    names: ['麻薯', '糯米', '小灰', '耳朵', '布丁'],
    palette: { primary: '#A89B94', light: '#F2EAE3', dark: '#6B5F59', accent: '#D99A9A' },
    toHuman: (a) => (a < 1 ? a * 18 : a <= 2 ? 18 + (a - 1) * 8 : 26 + (a - 2) * 6),
    illness: '你不吃东西了。肚子鼓鼓的，趴着不动。他把你放进外带箱，手一直在抖。',
    aging: '你跳不上沙发了。他把坐垫铺在地上，假装那是新的沙发。',
    lastDay: '你缩成很小的一团。他把你放在腿上，你听见他的心跳，像很远很远的雷。',
    companion: [
      '被一声雷吓得钻进沙发底，三个小时没出来。',
      '第一次在客厅里蹦了一圈，像一颗弹起来的毛球。',
      '学会了用鼻子顶他的手，提醒他该喂饭了。',
      '跳不上沙发了，缩在坐垫上度过一天。',
    ],
  },
  cockatiel: {
    id: 'cockatiel',
    name: '玄凤鹦鹉',
    en: 'Cockatiel',
    jp: 'オカメインコ',
    tags: ['话痨', '聪明', '长情'],
    tagline: '学会的第一句话，是他的名字',
    intro: '你会飞，但你选择落在他肩膀上。',
    quote: '“你好呀。你好呀。你好呀。”',
    lifespan: 20,
    base: { health: 54, bond: 62, curiosity: 72, freedom: 58 },
    names: ['啾啾', '小太阳', '豆豆', '阿绿', '口哨'],
    palette: { primary: '#D8B45A', light: '#F5E9C9', dark: '#7D6427', accent: '#C98A4B' },
    toHuman: (a) => (a < 1 ? a * 10 : a <= 2 ? 10 + (a - 1) * 8 : 18 + (a - 2) * 4.5),
    illness: '你开始拔自己的羽毛。胸口露出一小块粉色的皮肤。他换了三种食物，都不管用。',
    aging: '你不再学新词了。以前学会的那几个，也说得越来越少。',
    lastDay: '你最后叫了一声他的名字。很轻，像一根羽毛落在地上。',
    companion: [
      '学会了吹一首不成调的歌，每天清晨准时演奏。',
      '第一次飞出笼子，在吊灯上站了一下午。',
      '对着镜子说了很久的话，把镜子当成了朋友。',
      '不再学新词，只是偶尔叫一声他的名字。',
    ],
  },
  hamster: {
    id: 'hamster',
    name: '仓鼠',
    en: 'Hamster',
    jp: 'ハムスター',
    tags: ['短命', '囤积', '夜跑'],
    tagline: '一生很短，短到只够爱一个人',
    intro: '你的世界只有一个笼子那么大。你的宇宙，比笼子大得多。',
    quote: '“腮帮子里，藏着整个冬天。”',
    lifespan: 2.5,
    base: { health: 52, bond: 58, curiosity: 70, freedom: 64 },
    names: ['团子', '瓜子', '布丁', '小仓', '芝麻'],
    palette: { primary: '#C9A06B', light: '#F4E4CB', dark: '#7D5A34', accent: '#D98A8A' },
    toHuman: (a) => a * 32,
    illness: '你的肚子上长了一个小硬块。他把你捧在手里，看了很久，什么也没说。',
    aging: '你跑轮子的时间变短了。跑两圈，就停下来喘气。',
    lastDay: '你在他的掌心里蜷成一个球。那是一只仓鼠能给出的，最大的拥抱。',
    companion: [
      '在跑轮上跑了十公里，觉得自己环游了世界。',
      '把腮帮子塞满，像偷走了整个粮仓。',
      '第一次越狱，在沙发底下发现了一颗三年前的瓜子。',
      '跑轮子的时间变短了，跑两圈就停下来喘气。',
    ],
  },
};

PL.SPECIES_LIST = Object.values(PL.SPECIES);

/* ---------------- 六种相遇 ---------------- */

PL.HOMES = {
  artist: {
    id: 'artist',
    name: '城南旧公寓',
    city: '临海市 · 老城区',
    kind: '出租屋',
    art: 'assets/art/home_apartment.jpg',
    detail: '窗台上堆着没洗的画笔，空气里有松节油和冷掉的咖啡味。',
    scent: '松节油、旧纸、晒过太阳的棉被',
    oneLine: '一个画画的人，和一只还没被画过的猫。',
    human: {
      name: '阿澈',
      age: 26,
      pronoun: '他',
      role: '插画师',
      trait: '昼夜颠倒，心很软',
      quote: '“别怕。我画得慢，但养你这件事，我会认真。”',
    },
    secret: '他的一幅画被退回来了。他把画靠在墙边，坐在地上看了很久。',
    moment: {
      newcomer: '他带回来一个女孩。女孩站在门口，看见你，先笑了。他有点紧张地说：“它可能有点认生。”',
      move: '房东要卖房子。他一边道歉一边收拾画具，把最大的纸箱留给了你。',
    },
  },
  store: {
    id: 'store',
    name: '便利店楼上',
    city: '临海市 · 南巷口',
    kind: '一家人',
    art: 'assets/art/home_store.jpg',
    detail: '楼下收银台的提示音每隔一会儿响一次，像一只不会累的鸟。',
    scent: '关东煮、洗衣粉、小孩子的橡皮泥',
    oneLine: '一间永远亮着灯的小店，和一个总在柜台下面写作业的人。',
    human: {
      name: '小满',
      age: 7,
      pronoun: '她',
      role: '小学生',
      trait: '话很多，秘密也很多',
      quote: '“它以后归我管！妈妈你不要偷偷喂它。”',
    },
    secret: '小满的爸妈在楼下吵架。她躲在柜台下面，把书包抱在怀里，一声不吭。',
    moment: {
      newcomer: '小满的妈妈生了一个弟弟。家里突然多了奶粉味、哭声和很多来不及收的玩具。',
      move: '便利店要关门了。卷帘门拉下来的那天，小满在门口哭了很久。',
    },
  },
  grandma: {
    id: 'grandma',
    name: '北方小镇',
    city: '北川镇 · 河边',
    kind: '独居',
    art: 'assets/art/home_grandma.jpg',
    detail: '屋里有樟脑丸和晒过太阳的棉被味道。暖气片偶尔咕噜一声。',
    scent: '樟脑、面粉、窗台上的雪',
    oneLine: '一栋会下雪的房子，和一个每天和你说话的人。',
    human: {
      name: '林秀兰',
      age: 68,
      pronoun: '她',
      role: '退休教师',
      trait: '慢，但什么都记得',
      quote: '“你来了，这屋子就不空了。”',
    },
    secret: '她接到一个电话，听完以后在椅子上坐了很久。电视一直开着，她没看。',
    moment: {
      newcomer: '奶奶的孙女放暑假，从城里来住。她身上有火车和防晒霜的味道。',
      move: '奶奶的女儿来接她去城里。她收拾得很慢，把每件衣服都叠了三遍。',
    },
  },
  inn: {
    id: 'inn',
    name: '海边民宿',
    city: '南屿 · 环岛路',
    kind: '海边',
    art: 'assets/art/home_inn.jpg',
    detail: '海风从纱门钻进来，把日历吹得翻页。风铃一直响，像有人在很远的地方笑。',
    scent: '海盐、木头、陌生人留下的香水',
    oneLine: '一栋留不住人的房子，和一个决定留下的人。',
    human: {
      name: '阿岚',
      age: 32,
      pronoun: '她',
      role: '民宿老板',
      trait: '怕安静，也怕太热闹',
      quote: '“海边的房子留不住人，但能留住你。”',
    },
    secret: '民宿的淡季太长了。阿岚对着账本算到半夜，把计算器按得很响。',
    moment: {
      newcomer: '阿岚带回来一个男人。他会在清晨帮你添水，也会在阿岚忙的时候带你去看海。',
      move: '民宿要转手了。阿岚把钥匙交给新老板，抱着你在空荡荡的客厅里坐了很久。',
    },
  },
  highrise: {
    id: 'highrise',
    name: '高层公寓',
    city: '临海市 · 江湾',
    kind: '双职工',
    art: 'assets/art/home_highrise.jpg',
    detail: '落地窗外是整座城市的灯，屋里安静得能听见冰箱运转。',
    scent: '洗衣液、外卖纸盒、很淡的香薰',
    oneLine: '一扇看得见全城的窗，和两个总是很晚回家的人。',
    human: {
      name: '周予安',
      age: 35,
      pronoun: '他',
      role: '产品经理',
      trait: '什么都能安排，除了自己',
      quote: '“我们可能不常在家，但会给你最好的。”',
    },
    secret: '周予安的项目黄了。他回来时领带歪着，在玄关站了很久。',
    moment: {
      newcomer: '周予安的妻子怀孕了。家里多了一张婴儿床，和一个总是亮着的夜灯。',
      move: '周予安被调去另一座城市。搬家那天，他请了假，亲自把你放进航空箱。',
    },
  },
  farm: {
    id: 'farm',
    name: '城郊院子',
    city: '临海市 · 云脚村',
    kind: '院子',
    art: 'assets/art/home_farm.jpg',
    detail: '院子里有鸡叫、机油味，还有一棵结了很多果子的柿子树。',
    scent: '机油、泥土、熟透的柿子',
    oneLine: '一个什么都修得好的人，和一只什么都不用修的小狗。',
    human: {
      name: '老陈',
      age: 56,
      pronoun: '他',
      role: '修车师傅',
      trait: '话少，手很稳',
      quote: '“院子里随便跑，别追鸡就行。”',
    },
    secret: '老陈的修车铺一天没有一辆车。他把工具擦了一遍又一遍。',
    moment: {
      newcomer: '老陈抱回来一只小奶狗。它比你小，比你吵，还抢你的碗。',
      move: '院子要拆了，要修路。老陈蹲在门槛上抽了半包烟，最后说：“走吧。”',
    },
  },
};

PL.HOMES_LIST = Object.values(PL.HOMES);

/* ---------------- 今日主题 ---------------- */

PL.THEMES = [
  {
    id: 'wait',
    char: '等',
    title: '等待',
    line: '它这一生，有多少时间在门口？',
    essay: '你出门以后，它的一天就只剩下两件事：听楼道里的脚步声，和分辨哪一个是你。它不会看表，但它知道天什么时候黑。',
    color: '#C98A4B',
  },
  {
    id: 'name',
    char: '名',
    title: '名字',
    line: '被叫到名字的那一刻，它才真正有了家。',
    essay: '在遇见你之前，它可能叫“那一窝里的老三”。后来它有了一个只有你能叫的名字。这个名字，它用一辈子来认领。',
    color: '#C94F3D',
  },
  {
    id: 'window',
    char: '窗',
    title: '窗',
    line: '窗外是世界，窗内是它选的人。',
    essay: '猫看窗，狗看门，鸟看天。它们都在看一个去不了的地方。可你回家的时候，它们还是会先看你。',
    color: '#6D8A7A',
  },
  {
    id: 'age',
    char: '慢',
    title: '变慢',
    line: '它不是突然老的，是一点一点慢下来的。',
    essay: '先是跳不上沙发，然后是散步走不到巷口，最后是叫你的时候不再跑过来。你以为是它懒了。其实它在很努力地，多陪你一会儿。',
    color: '#8A7B68',
  },
  {
    id: 'goodbye',
    char: '别',
    title: '告别',
    line: '它这一生，只学会了怎么爱你，没学会怎么告别。',
    essay: '宠物医院里最常见的一句话是“它走的时候，我陪着”。可它真正想说的，也许是“你别难过，我只是先回家等你”。',
    color: '#6C7089',
  },
  {
    id: 'free',
    char: '野',
    title: '自由',
    line: '有些动物，天生就该属于风。',
    essay: '你给它最好的罐头、最软的窝，它还是会在门口坐很久。爱不是把门关好，有时候是明知道它会走，还是把门打开。',
    color: '#5F7D5A',
  },
  {
    id: 'home',
    char: '家',
    title: '家',
    line: '家不是房子，是那个会叫它名字的人。',
    essay: '搬家的时候，它不懂什么叫“换城市”。它只认识纸箱、车、和你的味道。只要你在，哪里都是家。',
    color: '#B9834E',
  },
];

PL.getTodayTheme = () => {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const day = Math.floor((new Date() - start) / 86400000);
  return PL.THEMES[day % PL.THEMES.length];
};

/* ---------------- 同时出生的它们 ---------------- */

PL.makeCompanions = (playerSpeciesId, n = 3) => {
  const pool = PL.SPECIES_LIST.filter((s) => s.id !== playerSpeciesId);
  const chosen = PL.pickMany(pool, n);
  return chosen.map((s) => {
    const home = PL.pick(PL.HOMES_LIST);
    return {
      id: PL.uid(),
      speciesId: s.id,
      name: PL.pick(s.names),
      homeId: home.id,
      homeName: home.name,
      humanName: home.human.name,
      lifespan: s.lifespan,
    };
  });
};

PL.companionStatus = (companion, playerAge) => {
  const s = PL.SPECIES[companion.speciesId];
  if (!s) return { text: '……', dead: false, age: 0 };
  const dead = playerAge >= companion.lifespan;
  if (dead) {
    return {
      text: `在 ${PL.formatAge(companion.lifespan)} 时去了星星那边。`,
      dead: true,
      age: companion.lifespan,
      beat: s.companion[3],
    };
  }
  if (playerAge < Math.min(0.12, companion.lifespan * 0.02)) {
    const newborn = {
      orange: '还在吃奶，眼睛刚刚睁开。',
      black: '缩在兄弟姐妹中间，世界只有奶味。',
      ragdoll: '还不会走路，只会往暖和的地方爬。',
      shiba: '在窝里挤着，耳朵还没立起来。',
      corgi: '比一颗土豆大不了多少，整天在睡。',
      village: '刚睁开眼睛，还不知道院子有多大。',
      rabbit: '缩在窝里，耳朵还没立起来。',
      cockatiel: '刚破壳，身上只有一层绒羽。',
      hamster: '比一颗花生大不了多少。',
    };
    return {
      text: newborn[companion.speciesId] || '刚刚出生，还很小。',
      dead: false,
      age: playerAge,
      beat: newborn[companion.speciesId] || '',
      baby: true,
    };
  }
  if (playerAge < Math.min(0.35, companion.lifespan * 0.06)) {
    const young = {
      orange: '正在换牙，什么都想咬。',
      black: '开始到处探险，但还跳不上柜子。',
      ragdoll: '毛长了一半，走路还有点晃。',
      shiba: '正在飞快长大，爪子大得不像自己的。',
      corgi: '短腿已经很有力，整天追着自己的尾巴。',
      village: '已经会跟着人跑了，但还不敢出院门。',
      rabbit: '耳朵慢慢立起来，开始学着跳。',
      cockatiel: '身上还是灰色的绒毛，正在换第一次羽。',
      hamster: '已经会跑轮子了，但还很小。',
    };
    return {
      text: young[companion.speciesId] || '正在长大，每天都不一样。',
      dead: false,
      age: playerAge,
      beat: young[companion.speciesId] || '',
      baby: true,
    };
  }
  const ratio = Math.min(0.999, playerAge / companion.lifespan);
  const idx = Math.min(3, Math.floor(ratio * 4));
  const beat = s.companion[idx];
  return {
    text: beat,
    dead: false,
    age: playerAge,
    beat,
  };
};
