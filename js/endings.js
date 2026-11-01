/* 宠物的一生 · 结局层
   没有评分，只有一句墓志铭。 */

window.PL = window.PL || {};

PL.ENDINGS = {
  beloved: {
    id: 'beloved',
    title: '在爱里老去',
    jp: '愛に包まれて',
    color: '#C98A4B',
    subtitle: '你这一生，没有做过什么大事。你只是把一个人，从年轻陪到了不再年轻。',
    epitaph: () => '它把一生过成了一句很短的话：我在。',
    epilogue: (c) => {
      const map = {
        artist: `你走后的第三年，${c.human.name}画了一本绘本，主角是一只总在窗边打瞌睡的${c.s.name}。出版社说太安静了，${c.he}说：“它本来就很安静。”`,
        store: `你走后的第三年，${c.human.name}上了大学。她的手机里一直存着你趴在收银台下面的照片。每次回家，她还会在楼梯口叫一声你的名字。`,
        grandma: `你走后的第三年，${c.human.name}搬去和女儿住了。她把你留下的一小撮毛装在香囊里，放在床头。冬天供暖时，她还是会说：“今年暖气挺暖的。”`,
        inn: `你走后的第三年，${c.human.name}把民宿的招牌换了。新招牌上有一只很小的${c.s.name}，藏在“岚”字的最后一笔里。`,
        highrise: `你走后的第三年，${c.human.name}升了职，搬了家。新家的书桌旁边，还是留着一个空着的窝。`,
        farm: `你走后的第三年，院子拆了。${c.human.name}在柿子树原来的位置种了一棵新的。${c.he}说，等它结果，就有人回来吃了。`,
      };
      return map[c.h.id] || `你走后的第三年，${c.he}还是会在超市的宠物区停下来。${c.he}没有再养一只。${c.he}说，不是不能，是不想。`;
    },
  },
  caged: {
    id: 'caged',
    title: '被爱圈养的一生',
    jp: '愛のなかで',
    color: '#C9A227',
    subtitle: '你被爱得很好，好到没有机会去看看世界。你并不后悔，只是偶尔会看窗外。',
    epitaph: () => '它被爱了一辈子，也被窗子挡了一辈子。',
    epilogue: (c) => `${c.he}把你的窝洗干净，收进柜子最上层。每年换季，${c.he}都会拿出来晒一晒，再放回去。`,
  },
  wind: {
    id: 'wind',
    title: '风的孩子',
    jp: '風のこ',
    color: '#5F7D5A',
    subtitle: '你终究没有被谁留住。你见过很多屋顶、很多碗、很多双想抱你的手。你选择了风。',
    epitaph: () => '它没有回家，但它去过很多地方。',
    epilogue: (c) => `${c.he}找了你很久。后来有人在码头见过一只很像你的${c.s.name}。${c.he}没有去追。${c.he}知道，你只是选择了更大的世界。`,
  },
  foreverYoung: {
    id: 'foreverYoung',
    title: '永远的少年',
    jp: '永遠の少年',
    color: '#C94F3D',
    subtitle: '你把一生过成了一场很长的好奇。你走的时候，身体很轻，心里很满。',
    epitaph: () => '它把最好看的样子，留在了他记得的地方。',
    epilogue: (c) => `${c.he}把你的项圈和那只旧玩具放在一起。很多年后搬家，${c.he}还是带着那个盒子。`,
  },
  alone: {
    id: 'alone',
    title: '独自长大',
    jp: 'ひとりで',
    color: '#6D8A7A',
    subtitle: '你很健康，很能干，很少麻烦他。你们相处得像两个合租的室友。这也是一种爱，只是温度低一点。',
    epitaph: () => '它学会了自己陪自己，也学会了他不总是会来。',
    epilogue: (c) => `${c.he}后来养了新的宠物。你偶尔会想，这也没什么不好。至少你们都学会了怎么一个人待着。`,
  },
  unseen: {
    id: 'unseen',
    title: '没有被看见的一生',
    jp: '見えないいのち',
    color: '#6C7089',
    subtitle: '你的一生，大部分时间在等。等他回家，等他叫你，等他发现你不舒服。你没有等到。',
    epitaph: () => '它等了很久，最后自己走了。',
    epilogue: (c) => `房东打扫的时候，在沙发底下发现一只旧项圈。${c.he}看了很久，最后把它放进了口袋。`,
  },
  hamster: {
    id: 'hamster',
    title: '两年半的宇宙',
    jp: '二年半の宇宙',
    color: '#D98A8A',
    subtitle: '你的一生只有两年半。你跑过的轮子，足够绕地球一圈。你在他掌心里，过完了一个完整的宇宙。',
    epitaph: () => '两年半，够它爱一个人很久。',
    epilogue: (c) => `${c.he}把你埋在花盆里。那盆薄荷长得很好。每次浇水，${c.he}都会说一句：“你又长高了。”`,
  },
  parrot: {
    id: 'parrot',
    title: '学舌者',
    jp: 'ものまね',
    color: '#D8B45A',
    subtitle: '你学会了很多词，最后只记住了一个名字。你叫他的时候，他总会回头。',
    epitaph: () => '它学会了很多话，最想说的那句没有说出口。',
    epilogue: (c) => `${c.he}教会了新来的鹦鹉说你的名字。新鹦鹉学会的那天，${c.he}在阳台上坐了很久。`,
  },
  guardian: {
    id: 'guardian',
    title: '院墙上的守护神',
    jp: '庭の番人',
    color: '#8A3B2A',
    subtitle: '你守了一个院子一辈子。后来院子没了，路修过来了。但在你心里，那块地还是你的。',
    epitaph: () => '它守住了门，没守住院子。',
    epilogue: (c) => `院墙拆了，修成了马路。${c.he}搬进了楼房。每年清明，${c.he}还会回村口，站一会儿。`,
  },
  moon: {
    id: 'moon',
    title: '橱窗里的月亮',
    jp: 'ショーウィンドウの月',
    color: '#7C9BAE',
    subtitle: '你漂亮了一辈子，被很多人夸过。你只在乎一个人有没有抱你。',
    epitaph: () => '它漂亮了一辈子，只想被一个人抱。',
    epilogue: (c) => `${c.he}后来发过很多你的照片。每一条下面都有人问：“这是哪只小仙女？”${c.he}会认真地回复你的名字。`,
  },
  early: {
    id: 'early',
    title: '短暂但滚烫',
    jp: 'みじかくて、あつい',
    color: '#A53A2C',
    subtitle: '你还没有学会告别。他也没有。你们只是，提前散了。',
    epitaph: () => '它还没来得及长大。',
    epilogue: (c) => `${c.he}把没拆封的那袋粮，送给了楼下新养${c.s.name}的人。回来的时候，${c.he}在楼道里站了很久。`,
  },
  ordinary: {
    id: 'ordinary',
    title: '平凡而完整',
    jp: 'ふつうの、かんぜん',
    color: '#8A7B68',
    subtitle: '你这一生，没有惊天动地。有饭吃，有太阳晒，有一个人叫你的名字。这已经很好。',
    epitaph: () => '它来过，吃过饭，晒过太阳，被一个人叫过名字。',
    epilogue: (c) => `${c.he}后来过着普通的日子。偶尔在某个下午，会想起你趴在窗边的样子。然后继续生活。`,
  },
};

PL.endingSubtitle = (record) => {
  const e = PL.ENDINGS[record.endingId] || PL.ENDINGS.ordinary;
  if (record.endingId === 'beloved') {
    const age = record.humanAgeStart || 30;
    const he = (PL.HOMES[record.homeId] || {}).human?.pronoun || '他';
    if (age < 18) return `你陪一个孩子长大，也把自己的一生交给了${he}。`;
    if (age >= 62) return `你陪一个人走完了最后一段，也把自己的一生交给了${he}。`;
    if (age >= 50) return `你陪一个人慢慢变老，也把自己的一生交给了${he}。`;
  }
  return e.subtitle;
};

PL.ENDING_ORDER = ['beloved', 'caged', 'wind', 'foreverYoung', 'alone', 'unseen', 'hamster', 'parrot', 'guardian', 'moon', 'early', 'ordinary'];

PL.computeEnding = (run) => {
  const s = PL.SPECIES[run.speciesId];
  const st = run.stats || {};
  const f = run.flags || {};
  const E = PL.ENDINGS;

  if (run.earlyDeath) return E.early;

  if (s.id === 'hamster' && (st.bond || 0) >= 55) return E.hamster;
  if (s.id === 'cockatiel' && (st.bond || 0) >= 68) return E.parrot;
  if (s.id === 'village' && (st.freedom || 0) >= 70 && (st.bond || 0) >= 52) return E.guardian;
  if (s.id === 'ragdoll' && (st.bond || 0) >= 78 && (st.freedom || 0) < 48) return E.moon;

  if ((st.bond || 0) >= 80 && (st.freedom || 0) >= 55) return E.beloved;
  if ((st.bond || 0) >= 80 && (st.freedom || 0) < 50) return E.caged;
  if ((st.freedom || 0) >= 78 && (st.bond || 0) < 60) return E.wind;
  if ((st.curiosity || 0) >= 80 && (st.health || 0) < 48 && (st.bond || 0) < 80) return E.foreverYoung;
  if ((st.health || 0) >= 75 && (st.bond || 0) < 55) return E.alone;
  if ((st.bond || 0) < 40) return E.unseen;

  return E.ordinary;
};

PL.keywordsFor = (run) => {
  const st = run.stats || {};
  const f = run.flags || {};
  const s = PL.SPECIES[run.speciesId];
  const tags = [];

  if (f.waitedAtDoor || f.byDoor || f.guardedDoor) tags.push('等待');
  if (f.hitWindow || f.watchedBird || f.windowHandle || f.chandelier) tags.push('窗');
  if (f.moved || f.refusedToLeave || f.exploredNew) tags.push('搬家');
  if (f.comforted || f.gaveToy || f.blockedPhone) tags.push('陪伴');
  if (f.lastWalk || f.field || f.escape || f.windowHandle) tags.push('远行');
  if (f.acceptedNewcomer || f.jealous || f.hid) tags.push('家人');
  if ((st.freedom || 0) >= 70) tags.push('自由');
  if ((st.curiosity || 0) >= 70) tags.push('好奇');
  if ((st.bond || 0) >= 80) tags.push('被爱');
  if ((st.health || 0) <= 35) tags.push('旧伤');
  tags.push(s.name);

  const seen = new Set();
  return tags.filter((t) => (seen.has(t) ? false : (seen.add(t), true))).slice(0, 3);
};

PL.contextFor = (run) => {
  const s = PL.SPECIES[run.speciesId];
  const h = PL.HOMES[run.homeId];
  const human = h.human;
  const age = run.age || 0;
  return {
    s,
    h,
    human,
    he: human.pronoun,
    name: run.name || '它',
    age,
    humanAge: human.age + Math.round(age),
    stats: run.stats,
    flags: run.flags,
    memories: run.memories,
    theme: PL.THEMES.find((t) => t.id === run.themeId),
    run,
  };
};

PL.buildRecord = (run) => {
  const s = PL.SPECIES[run.speciesId];
  const h = PL.HOMES[run.homeId];
  const ending = PL.computeEnding(run);
  const c = PL.contextFor(run);
  const age = run.age || s.lifespan;
  const humanAgeStart = h.human.age;
  const humanAgeEnd = humanAgeStart + Math.round(age);
  const birthYear = PL.year() - Math.round(age);
  return {
    id: run.id || PL.uid(),
    createdAt: Date.now(),
    name: run.name || s.names[0],
    speciesId: s.id,
    speciesName: s.name,
    speciesEn: s.en,
    homeId: h.id,
    homeName: h.name,
    city: h.city,
    humanName: h.human.name,
    humanRole: h.human.role,
    humanAgeStart,
    humanAgeEnd,
    age,
    ageLabel: PL.formatAge(age),
    lifespanLabel: PL.formatAge(age),
    humanAge: Math.min(100, Math.round(s.toHuman(age))),
    birthYear,
    endYear: PL.year(),
    stats: { ...run.stats },
    memories: run.memories.slice(),
    flags: { ...run.flags },
    endingId: ending.id,
    endingTitle: ending.title,
    endingSubtitle: ending.subtitle,
    epitaph: ending.epitaph(c),
    epilogue: ending.epilogue(c),
    keywords: PL.keywordsFor(run),
    themeId: run.themeId,
    companions: (run.companions || []).map((comp) => ({
      ...comp,
      status: PL.companionStatus(comp, age),
    })),
    earlyDeath: !!run.earlyDeath,
    lastWords: run.lastWords || '',
    shareLine: `它用 ${PL.formatDuration(age)}，陪${h.human.name}走过了 ${humanAgeStart} 岁到 ${humanAgeEnd} 岁。`,
  };
};

PL.epilogueFor = (record) => record.epilogue;

PL.memoryLetters = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一'];
