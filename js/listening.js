/* ==========================================================
   listening.js — 听力练习
   材料:单词/短语听写、短句理解、场景短文(自编,合成语音)
   规则:查看原文后作答 = 辅助完成,得分折半,单独统计
   说明:本版不包含真题音频;真题需使用可合法获得的材料
   ========================================================== */
const Listening = (function () {
  const data = window.CET4_DATA;
  const words = data ? data.words : [];

  // 短句理解材料(自编)
  const SENTENCES = [
    { en: 'The library will be closed during the summer vacation.', cn: '图书馆在暑假期间将关闭。' },
    { en: 'Students are encouraged to take part in volunteer activities.', cn: '鼓励学生参加志愿活动。' },
    { en: 'The meeting has been put off until next Monday.', cn: '会议已被推迟到下周一。' },
    { en: 'Please turn off your mobile phone during the exam.', cn: '考试期间请关闭手机。' },
    { en: 'The new policy will come into effect at the end of this month.', cn: '新政策将于本月底生效。' },
    { en: 'He decided to apply for a scholarship to study abroad.', cn: '他决定申请奖学金出国留学。' },
    { en: 'The number of online courses has increased rapidly in recent years.', cn: '近年来在线课程的数量迅速增加。' },
    { en: 'We should take measures to protect the environment.', cn: '我们应该采取措施保护环境。' },
    { en: 'The train was delayed because of the heavy rain.', cn: '火车因大雨而延误。' },
    { en: 'She is looking forward to hearing from her pen pal.', cn: '她期待收到笔友的来信。' },
    { en: 'The sports meeting has been canceled because of the bad weather.', cn: '运动会因恶劣天气取消。' },
    { en: 'Please submit your homework before Friday.', cn: '请在周五前提交作业。' },
    { en: 'More and more people choose to shop online.', cn: '越来越多的人选择网上购物。' },
    { en: 'The government plans to build a new hospital in this area.', cn: '政府计划在该地区建一所新医院。' },
    { en: 'He missed the train because he got up late.', cn: '他因起床晚了而错过火车。' },
    { en: 'Reading before bed can help you relax.', cn: '睡前阅读有助于放松。' },
    { en: 'The company provides free lunch for its employees.', cn: '公司为员工提供免费午餐。' },
    { en: 'We need to book a room in advance.', cn: '我们需要提前预订房间。' },
    { en: 'The museum is closed on Mondays.', cn: '博物馆周一闭馆。' },
    { en: 'She apologized for being late.', cn: '她为迟到道歉。' },
    { en: 'The price of the laptop has dropped significantly.', cn: '笔记本电脑的价格大幅下降。' },
    { en: 'Learning a foreign language takes time and patience.', cn: '学习外语需要时间和耐心。' },
    { en: 'The flight was delayed for two hours.', cn: '航班延误了两个小时。' },
    { en: 'You should turn off the lights when you leave.', cn: '离开时你应该关灯。' },
    { en: 'The teacher encouraged us to ask questions.', cn: '老师鼓励我们提问。' }
  ];

  // 短对话理解材料(自编,合成语音)
  const DIALOGS = [
    {
      lines: ['Excuse me, how can I get to the railway station?', 'Go straight and turn left at the second crossing.'],
      question: '对话最可能发生在什么场景?',
      options: ['火车站内', '街上问路', '图书馆里', '餐厅里'],
      answer: 1
    },
    {
      lines: ['What would you like to order, sir?', 'I would like a bowl of beef noodles and a glass of orange juice.'],
      question: '对话发生在哪里?',
      options: ['餐厅', '超市', '医院', '银行'],
      answer: 0
    },
    {
      lines: ['Can I borrow these two books?', 'Sure. Please return them within two weeks.'],
      question: '这位女士需要做什么?',
      options: ['买两本书', '借书并按时归还', '还书并付罚款', '办理借书证'],
      answer: 1
    },
    {
      lines: ['This coat looks nice. How much is it?', 'It is 200 yuan, and today it is on sale for 150.'],
      question: '这件外套现在多少钱?',
      options: ['200 元', '150 元', '50 元', '250 元'],
      answer: 1
    },
    {
      lines: ['Hello, this is Tom speaking. Shall we meet at three tomorrow afternoon?', 'Sorry, I have a class then. How about four o\'clock?'],
      question: '他们约在几点见面?',
      options: ['明天下午三点', '明天下午四点', '今天下午三点', '今天下午四点'],
      answer: 1
    },
    {
      lines: ['You look tired. Did you stay up late last night?', 'Yes, I was preparing for the final exam until midnight.'],
      question: '男士为什么疲劳?',
      options: ['熬夜准备考试', '熬夜看电影', '睡眠不足生病了', '工作太辛苦'],
      answer: 0
    }
  ];

  // 场景短文(自编)
  const SCENES = [
    {
      title: '校园学习',
      en: 'In the university library, students can borrow books, use computers and study in quiet reading rooms. The library opens at eight in the morning and closes at ten at night. During the final exam week, many students stay there all day to review their lessons.',
      cn: '在大学图书馆里,学生可以借书、使用电脑,并在安静的阅览室学习。图书馆早上八点开门,晚上十点关门。期末考试周期间,许多学生整天待在那里复习功课。',
      blanks: ['library', 'opens', 'review']
    },
    {
      title: '日常出行',
      en: 'Taking the subway is a convenient way to travel in big cities. You can buy a ticket at the station or use a mobile app. During rush hours, the trains are usually crowded, so it is wise to leave home earlier.',
      cn: '在大城市,乘地铁是一种便捷的出行方式。你可以在车站买票,也可以使用手机应用。高峰时段车厢通常很拥挤,所以早点出门是明智的。',
      blanks: ['subway', 'ticket', 'crowded']
    },
    {
      title: '健康生活',
      en: 'Doctors suggest that we should exercise for at least thirty minutes every day. Eating more vegetables and getting enough sleep are also important for our health. Small habits can make a big difference over time.',
      cn: '医生建议我们每天至少锻炼三十分钟。多吃蔬菜和保证充足睡眠对健康也很重要。小习惯随着时间的推移能带来很大改变。',
      blanks: ['exercise', 'vegetables', 'habits']
    },
    {
      title: '餐厅点餐',
      en: 'The restaurant serves both Chinese and Western food. Customers can order at the table and pay by phone. If you are not sure what to choose, the waiter will be happy to recommend the most popular dishes.',
      cn: '这家餐厅提供中餐和西餐。顾客可以在餐桌点餐并用手机支付。如果你不确定点什么,服务员会很乐意推荐最受欢迎的菜品。',
      blanks: ['restaurant', 'order', 'recommend']
    },
    {
      title: '图书馆借书',
      en: 'To borrow books, you need a student card. Each reader can borrow up to five books at a time. If you return a book late, you will have to pay a small fine. You can also renew the book online before the due date.',
      cn: '借书需要学生证。每位读者一次最多可借五本书。如果逾期还书,需要支付少量罚款。你也可以在到期前在线续借。',
      blanks: ['student card', 'five', 'online']
    },
    {
      title: '问路与交通',
      en: 'If you get lost in a new city, you can ask a policeman or use a map app. The bus is cheaper than the taxi, but the taxi is faster when you are in a hurry. Remember to check the direction before you get on the bus.',
      cn: '如果你在新城市迷路,可以问警察或使用地图应用。公交车比出租车便宜,但赶时间时出租车更快。上车前记得确认方向。',
      blanks: ['map', 'cheaper', 'direction']
    },
    {
      title: '环境保护',
      en: 'Protecting the environment starts with small actions. We can save water by turning off the tap, and save electricity by switching off unused lights. Recycling paper and plastic also helps reduce waste. Everyone should play a part in building a green city.',
      cn: '保护环境从小事做起。我们可以关掉水龙头来节约用水,关掉不用的灯来节约用电。回收纸张和塑料也有助于减少浪费。每个人都应该为建设绿色城市出一份力。',
      blanks: ['water', 'electricity', 'recycling']
    },
    {
      title: '旅行与假期',
      en: 'During the summer holiday, many students choose to travel with friends. It is important to plan the route and book hotels ahead of time. Traveling can broaden our horizons and help us learn about different cultures, but safety should always come first.',
      cn: '暑假期间,许多学生选择和朋友一起旅行。提前规划路线和预订酒店很重要。旅行可以开阔视野、帮助我们了解不同的文化,但安全始终应该放在第一位。',
      blanks: ['travel', 'hotels', 'safety']
    }
  ];

  let type = 'word';
  let current = null;       // {kind, text, answers, cn, options...}
  let assisted = false;
  let answered = false;
  let sentencePool = [];
  let scenePool = [];

  const $ = id => document.getElementById(id);

  function speak(text, rateOverride) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = rateOverride || Number(Store.getSettings().ttsRate) || 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) { /* 忽略 */ }
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function normalize(s) {
    return (s || '').toLowerCase()
      .replace(/[.,!?;:'"()\[\]{}，。！？；：、“”‘’（）【】]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function strip(s) { return (s || '').replace(/\s+/g, '').toLowerCase(); }

  /* ---------- 出题 ---------- */
  function newQuestion() {
    answered = false;
    assisted = false;
    $('listenFeedback').classList.add('hidden');
    $('listenFeedback').className = 'feedback hidden';
    $('listenShowText').textContent = '显示原文';
    const options = $('listenOptions');
    const spell = $('listenSpellArea');
    options.innerHTML = '';
    options.classList.add('hidden');
    spell.classList.add('hidden');
    $('listenInput').value = '';

    if (type === 'word') {
      const w = pick(words);
      current = { kind: 'word', text: w.word, answers: [w.word], cn: w.trans.join('；'), phone: w.usphone };
      $('listenPrompt').textContent = '听发音,写出对应的英文单词';
      $('listenSub').textContent = '可点「播放」重听;点击「显示原文」会标记为辅助完成';
      spell.classList.remove('hidden');
      $('listenInput').focus();
      speak(w.word);
    } else if (type === 'phrase') {
      // 复用短语库(与单词模块相同的数据概念)
      const p = pick(LISTEN_PHRASES);
      current = { kind: 'phrase', text: p.en, answers: [p.en, ...p.alts], cn: p.cn };
      $('listenPrompt').textContent = '听英文短语,写出英文';
      $('listenSub').textContent = '同义表达也可';
      spell.classList.remove('hidden');
      $('listenInput').focus();
      speak(p.en);
    } else if (type === 'sentence') {
      const s = pick(sentencePool);
      const correct = s.cn;
      const others = shuffle(SENTENCES.filter(x => x.cn !== correct)).slice(0, 3).map(x => x.cn);
      current = { kind: 'sentence', text: s.en, answers: [correct], cn: s.cn };
      $('listenPrompt').textContent = '听句子,选择正确的中文含义';
      $('listenSub').textContent = '合成语音 · 短句理解';
      options.classList.remove('hidden');
      shuffle([correct, ...others]).forEach(cn => {
        const b = document.createElement('button');
        b.className = 'option';
        b.textContent = cn;
        b.dataset.correct = cn === correct ? '1' : '0';
        b.addEventListener('click', () => answerSentence(b));
        options.appendChild(b);
      });
      speak(s.en);
    } else if (type === 'dialog') {
      const d = pick(DIALOGS);
      const correct = d.options[d.answer];
      current = { kind: 'dialog', text: d.lines.join(' '), answers: [correct], cn: correct };
      $('listenPrompt').textContent = d.question;
      $('listenSub').textContent = '合成语音 · 短对话理解(两句话先后播放)';
      options.classList.remove('hidden');
      d.options.forEach((opt, i) => {
        const b = document.createElement('button');
        b.className = 'option';
        b.textContent = opt;
        b.dataset.correct = i === d.answer ? '1' : '0';
        b.addEventListener('click', () => answerSentence(b));
        options.appendChild(b);
      });
      speak(d.lines[0]);
      setTimeout(() => speak(d.lines[1]), 3500);
    } else {
      // 场景短文 + 挖空填词
      const sc = pick(scenePool);
      current = { kind: 'scene', text: sc.en, cn: sc.cn, answers: sc.blanks, title: sc.title };
      $('listenPrompt').textContent = `场景短文:${sc.title} · 听全文并填空`;
      $('listenSub').textContent = '播放后填入缺少的单词(按顺序)';
      const area = $('listenSpellArea');
      area.classList.add('hidden');
      // 用选项区展示多个输入框
      options.classList.remove('hidden');
      const wrap = document.createElement('div');
      wrap.style.cssText = 'grid-column:1/-1;display:flex;flex-direction:column;gap:8px;';
      sc.blanks.forEach((b, i) => {
        const row = document.createElement('div');
        row.className = 'spell-area';
        row.innerHTML = `<input type="text" class="blank-input" data-i="${i}" placeholder="第 ${i + 1} 空" autocomplete="off" spellcheck="false" style="flex:1;font-size:16px">`;
        wrap.appendChild(row);
      });
      const submit = document.createElement('button');
      submit.className = 'btn primary';
      submit.textContent = '提交答案';
      submit.addEventListener('click', answerScene);
      wrap.appendChild(submit);
      options.appendChild(wrap);
      // 朗读两遍
      speak(sc.en);
      setTimeout(() => speak(sc.en), 6000);
    }
    updateBadge();
  }

  // 短语池(听力用,与单词模块独立)
  const LISTEN_PHRASES = [
    { en: 'take part in', cn: '参加', alts: ['participate in', 'join'] },
    { en: 'look forward to', cn: '期待', alts: ['expect'] },
    { en: 'focus on', cn: '专注于', alts: ['concentrate on'] },
    { en: 'deal with', cn: '处理', alts: ['handle', 'cope with'] },
    { en: 'give up', cn: '放弃', alts: ['quit'] },
    { en: 'come up with', cn: '想出', alts: ['think of'] },
    { en: 'depend on', cn: '依赖', alts: ['rely on'] },
    { en: 'make use of', cn: '利用', alts: ['utilize'] },
    { en: 'pay attention to', cn: '注意', alts: ['focus on'] },
    { en: 'put off', cn: '推迟', alts: ['postpone', 'delay'] }
  ];

  /* ---------- 判题 ---------- */
  function answerSentence(btn) {
    if (answered) return;
    answered = true;
    const ok = btn.dataset.correct === '1';
    btn.classList.add(ok ? 'correct' : 'wrong');
    btn.closest('.options').querySelectorAll('.option').forEach(n => {
      n.disabled = true;
      if (!ok && n.dataset.correct === '1') n.classList.add('correct');
    });
    record(ok, current.cn);
  }

  function answerInput() {
    if (answered) return;
    const val = $('listenInput').value;
    if (!val.trim()) return;
    answered = true;
    const ok = current.answers.some(a => strip(a) === strip(val));
    record(ok, current.answers[0] + (current.answers.length > 1 ? `(也可:${current.answers.slice(1).join(' / ')})` : ''));
  }

  function answerScene() {
    if (answered) return;
    const inputs = document.querySelectorAll('#listenOptions .blank-input');
    if (!inputs.length) return;
    answered = true;
    let okCount = 0;
    inputs.forEach((inp, i) => {
      const val = inp.value;
      const ok = strip(val) === strip(current.answers[i]);
      inp.style.borderColor = ok ? 'var(--ok)' : 'var(--danger)';
      if (ok) okCount++;
    });
    const allOk = okCount === inputs.length;
    record(allOk, `答案:${current.answers.join(' / ')}`);
  }

  function record(ok, correctText) {
    const l = Store.state.listening;
    l.total += 1;
    if (assisted) { l.assisted += 1; }   // 辅助完成计数
    if (ok) l.correct += 1; else l.wrong += 1;
    // 听力答题计入当日练习与学习时长,但不混入词条掌握统计
    Store.recordPractice(ok);
    Store.addStudySeconds(30);
    Store.save();

    const fb = $('listenFeedback');
    fb.classList.remove('hidden');
    fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
    let extra = assisted ? '\n(本题查看过原文,记为辅助完成,得分折半)' : '';
    const score = ok ? (assisted ? 0.5 : 1) : 0;
    extra += `\n本题得分:${score} 分(满分 1 分)`;
    fb.textContent = (ok ? '✅ 回答正确' : '❌ 回答错误') + '\n正确答案:' + correctText + extra;
    updateBadge();
    $('listenCount').textContent = `已练 ${l.total} 题`;
  }

  function updateBadge() {
    const l = Store.state.listening;
    const indep = l.total - l.assisted;
    const indepCorrect = l.correct - (l.assisted > 0 ? Math.round(l.assisted / 2) : 0); // 近似:折半计入
    $('listenBadge').textContent = `语音合成 · 独立作答 ${indep} 题`;
    $('listenMetaLine').textContent =
      `独立正确率统计与辅助完成分开:总 ${l.total} 题,辅助 ${l.assisted} 题。查看原文后作答得分折半。`;
  }

  /* ---------- 原文 ---------- */
  function showText() {
    if (!current) return;
    assisted = true;
    $('listenShowText').textContent = '已显示原文(辅助完成)';
    const fb = $('listenFeedback');
    fb.classList.remove('hidden');
    fb.className = 'feedback info';
    const text = current.kind === 'scene'
      ? current.text + '\n\n中文:' + current.cn
      : current.text + '\n' + (current.cn ? '参考:' + current.cn : '');
    fb.textContent = '📖 原文:\n' + text + '\n\n(本题已标记为辅助完成,得分折半)';
  }

  /* ---------- 播放控制 ---------- */
  function play(rate) {
    if (!current) return;
    const btn = rate && rate < 0.8 ? $('listenSlow') : $('listenPlay');
    btn.classList.add('playing');
    speak(current.text, rate);
    setTimeout(() => btn.classList.remove('playing'), 1500);
  }
  function repeat() {
    if (!current) return;
    speak(current.text);
    setTimeout(() => speak(current.text), 2500);
    setTimeout(() => speak(current.text), 5000);
    $('listenRepeat').classList.add('playing');
    setTimeout(() => $('listenRepeat').classList.remove('playing'), 6000);
  }

  /* ---------- 初始化 ---------- */
  function bind() {
    $('listenType').addEventListener('change', e => {
      type = e.target.value;
      newQuestion();
    });
    $('listenPlay').addEventListener('click', () => play());
    $('listenSlow').addEventListener('click', () => play(0.6));
    $('listenRepeat').addEventListener('click', repeat);
    $('listenShowText').addEventListener('click', showText);
    $('listenNew').addEventListener('click', newQuestion);
    $('listenNext').addEventListener('click', newQuestion);
    $('listenSubmit').addEventListener('click', answerInput);
    $('listenInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); answerInput(); }
    });
  }

  function init() {
    bind();
    sentencePool = SENTENCES.slice();
    scenePool = SCENES.slice();
    $('listenCount').textContent = `已练 ${Store.state.listening.total} 题`;
    updateBadge();
  }

  function onShow() {
    if (!current) newQuestion();
  }

  return { init, onShow };
})();
