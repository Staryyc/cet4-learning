/* ==========================================================
   vocab.js — 单词与短语练习
   模式:en2cn / cn2en / phrase2cn / phrase2en
   掌握标准:同一词条在三次独立练习中连续答对
   ========================================================== */
const Vocab = (function () {
  const data = window.CET4_DATA;
  const words = data ? data.words : [];

  // 常用四级短语(自编整理,非完整词表;允许同义表达)
  const PHRASES = [
    { en: 'account for', cn: '解释;占……比例', alts: ['explain', 'make up'] },
    { en: 'adapt to', cn: '适应', alts: ['adjust to'] },
    { en: 'apply for', cn: '申请', alts: ['ask for'] },
    { en: 'be aware of', cn: '意识到;知道', alts: ['realize', 'be conscious of'] },
    { en: 'be capable of', cn: '能够', alts: ['can', 'be able to'] },
    { en: 'break down', cn: '出故障;分解', alts: ['fail', 'stop working'] },
    { en: 'bring about', cn: '引起;带来', alts: ['cause', 'lead to'] },
    { en: 'carry out', cn: '执行;实施', alts: ['conduct', 'implement'] },
    { en: 'come up with', cn: '想出;提出', alts: ['think of', 'propose'] },
    { en: 'contribute to', cn: '促成;有助于', alts: ['lead to', 'help'] },
    { en: 'deal with', cn: '处理;应对', alts: ['handle', 'cope with'] },
    { en: 'depend on', cn: '依赖;取决于', alts: ['rely on'] },
    { en: 'due to', cn: '由于', alts: ['because of', 'owing to'] },
    { en: 'focus on', cn: '专注于', alts: ['concentrate on', 'pay attention to'] },
    { en: 'get rid of', cn: '摆脱;去除', alts: ['remove', 'eliminate'] },
    { en: 'give rise to', cn: '导致;引起', alts: ['cause', 'lead to'] },
    { en: 'in addition', cn: '此外', alts: ['besides', 'moreover'] },
    { en: 'in terms of', cn: '就……而言', alts: ['regarding', 'as for'] },
    { en: 'keep up with', cn: '跟上', alts: ['catch up with'] },
    { en: 'look forward to', cn: '期待', alts: ['expect'] },
    { en: 'make up for', cn: '弥补', alts: ['compensate for'] },
    { en: 'make use of', cn: '利用', alts: ['utilize', 'take advantage of'] },
    { en: 'pay attention to', cn: '注意', alts: ['focus on', 'notice'] },
    { en: 'play a role in', cn: '在……中起作用', alts: ['play a part in'] },
    { en: 'put up with', cn: '忍受', alts: ['tolerate', 'bear'] },
    { en: 'refer to', cn: '提到;指的是', alts: ['mention', 'mean'] },
    { en: 'result in', cn: '导致', alts: ['cause', 'lead to'] },
    { en: 'result from', cn: '由……引起', alts: ['be caused by', 'stem from'] },
    { en: 'set up', cn: '建立;设立', alts: ['establish', 'found'] },
    { en: 'take advantage of', cn: '利用', alts: ['make use of', 'utilize'] },
    { en: 'take measures', cn: '采取措施', alts: ['take actions', 'take steps'] },
    { en: 'take part in', cn: '参加', alts: ['participate in', 'join'] },
    { en: 'take place', cn: '发生;举行', alts: ['happen', 'occur'] },
    { en: 'turn out', cn: '结果是;证明是', alts: ['prove to be', 'end up'] },
    { en: 'work out', cn: '解决;算出;锻炼', alts: ['solve', 'figure out'] },
    { en: 'as a result', cn: '结果;因此', alts: ['therefore', 'consequently'] },
    { en: 'at present', cn: '目前', alts: ['currently', 'nowadays'] },
    { en: 'by means of', cn: '通过;借助', alts: ['through', 'with the help of'] },
    { en: 'for the sake of', cn: '为了', alts: ['for the purpose of', 'in order to'] },
    { en: 'in charge of', cn: '负责', alts: ['responsible for'] },
    { en: 'in spite of', cn: '尽管', alts: ['despite'] },
    { en: 'on behalf of', cn: '代表', alts: ['representing'] },
    { en: 'thanks to', cn: '多亏;由于', alts: ['because of', 'owing to'] },
    { en: 'with regard to', cn: '关于', alts: ['regarding', 'concerning'] },
    { en: 'as far as', cn: '就……而言;远至', alts: [] },
    { en: 'at the expense of', cn: '以……为代价', alts: ['at the cost of'] },
    { en: 'in favor of', cn: '支持;赞成', alts: ['supporting'] },
    { en: 'in the long run', cn: '从长远来看', alts: ['in the long term'] },
    { en: 'on the contrary', cn: '相反', alts: ['instead', 'conversely'] },
    { en: 'regardless of', cn: '不管;不顾', alts: ['no matter'] },
    { en: 'according to', cn: '根据', alts: ['based on'] },
    { en: 'ahead of', cn: '在……之前;领先', alts: ['before'] },
    { en: 'along with', cn: '连同;与……一起', alts: ['together with'] },
    { en: 'apart from', cn: '除……之外', alts: ['besides', 'except for'] },
    { en: 'as a whole', cn: '作为整体', alts: ['overall'] },
    { en: 'as soon as', cn: '一……就', alts: ['once'] },
    { en: 'at least', cn: '至少', alts: ['no less than'] },
    { en: 'at most', cn: '最多', alts: ['no more than'] },
    { en: 'at times', cn: '有时', alts: ['sometimes'] },
    { en: 'be based on', cn: '基于', alts: ['be founded on'] },
    { en: 'be engaged in', cn: '从事;忙于', alts: ['be busy with'] },
    { en: 'be familiar with', cn: '熟悉', alts: ['know well'] },
    { en: 'be involved in', cn: '参与;卷入', alts: ['participate in'] },
    { en: 'be responsible for', cn: '对……负责', alts: ['be in charge of'] },
    { en: 'be short of', cn: '缺乏', alts: ['lack'] },
    { en: 'benefit from', cn: '从……获益', alts: ['profit from'] },
    { en: 'by accident', cn: '偶然', alts: ['by chance'] },
    { en: 'by contrast', cn: '相比之下', alts: ['in comparison'] },
    { en: 'by no means', cn: '绝不', alts: ['not at all', 'in no way'] },
    { en: 'come across', cn: '偶遇;发现', alts: ['meet by chance', 'encounter'] },
    { en: 'compete with', cn: '与……竞争', alts: ['compete against'] },
    { en: 'complain about', cn: '抱怨', alts: ['grumble about'] },
    { en: 'concentrate on', cn: '专注于', alts: ['focus on'] },
    { en: 'consist of', cn: '由……组成', alts: ['be made up of', 'comprise'] },
    { en: 'cope with', cn: '应对;处理', alts: ['deal with', 'handle'] },
    { en: 'count on', cn: '依靠', alts: ['rely on', 'depend on'] },
    { en: 'cut down', cn: '削减;砍倒', alts: ['reduce', 'cut back'] },
    { en: 'draw attention to', cn: '引起对……的注意', alts: ['attract attention to'] },
    { en: 'figure out', cn: '弄明白;算出', alts: ['work out', 'understand'] },
    { en: 'find out', cn: '查明;发现', alts: ['discover', 'learn'] },
    { en: 'get along with', cn: '与……相处', alts: ['get on with'] },
    { en: 'get in touch with', cn: '与……联系', alts: ['contact'] },
    { en: 'give in', cn: '让步;屈服', alts: ['yield', 'surrender'] },
    { en: 'give up', cn: '放弃', alts: ['quit', 'abandon'] },
    { en: 'go over', cn: '复习;检查', alts: ['review', 'check'] },
    { en: 'have access to', cn: '能够使用;可以接触', alts: ['be able to use'] },
    { en: 'hold back', cn: '阻止;抑制', alts: ['prevent', 'restrain'] },
    { en: 'in advance', cn: '提前', alts: ['ahead of time'] },
    { en: 'in conclusion', cn: '总之', alts: ['to sum up', 'in a word'] },
    { en: 'in contrast', cn: '相比之下', alts: ['by contrast'] },
    { en: 'in detail', cn: '详细地', alts: ['in depth'] },
    { en: 'in general', cn: '通常;总的来说', alts: ['generally', 'on the whole'] },
    { en: 'in particular', cn: '尤其', alts: ['especially'] },
    { en: 'in person', cn: '亲自', alts: ['personally'] },
    { en: 'in place of', cn: '代替', alts: ['instead of'] },
    { en: 'in response to', cn: '回应;作为对……的答复', alts: ['as a reply to'] },
    { en: 'in the meantime', cn: '同时;在此期间', alts: ['meanwhile'] },
    { en: 'keep in mind', cn: '记住', alts: ['remember', 'bear in mind'] },
    { en: 'lead to', cn: '导致', alts: ['cause', 'result in'] },
    { en: 'look into', cn: '调查;研究', alts: ['investigate'] },
    { en: 'look up', cn: '查阅;抬头看', alts: ['check', 'search'] },
    { en: 'lose touch with', cn: '与……失去联系', alts: ['be out of contact with'] },
    { en: 'make a difference', cn: '有影响;起作用', alts: ['matter'] },
    { en: 'make progress', cn: '取得进步', alts: ['improve'] },
    { en: 'make sense', cn: '有道理;讲得通', alts: ['be reasonable'] },
    { en: 'make sure', cn: '确保', alts: ['ensure', 'make certain'] },
    { en: 'meet the needs of', cn: '满足……的需要', alts: ['satisfy the needs of'] },
    { en: 'on average', cn: '平均', alts: ['on the average'] },
    { en: 'on purpose', cn: '故意', alts: ['deliberately', 'intentionally'] },
    { en: 'on time', cn: '准时', alts: ['punctually'] },
    { en: 'pass on', cn: '传递;转达', alts: ['pass along'] },
    { en: 'point out', cn: '指出', alts: ['indicate'] },
    { en: 'put forward', cn: '提出', alts: ['propose', 'come up with'] },
    { en: 'put into practice', cn: '付诸实践', alts: ['apply'] },
    { en: 'relate to', cn: '与……有关', alts: ['be related to'] },
    { en: 'run out of', cn: '用完;耗尽', alts: ['use up', 'be short of'] },
    { en: 'set aside', cn: '留出;搁置', alts: ['reserve', 'save'] },
    { en: 'set off', cn: '出发;引发', alts: ['start', 'depart'] },
    { en: 'set out', cn: '着手;出发', alts: ['begin', 'start'] },
    { en: 'show up', cn: '出现;露面', alts: ['appear', 'turn up'] },
    { en: 'sign up for', cn: '报名参加', alts: ['register for'] },
    { en: 'stand for', cn: '代表;象征', alts: ['represent'] },
    { en: 'stick to', cn: '坚持', alts: ['insist on', 'keep to'] },
    { en: 'take account of', cn: '考虑到', alts: ['take into account', 'consider'] },
    { en: 'take on', cn: '承担;呈现', alts: ['undertake'] },
    { en: 'take over', cn: '接管', alts: ['take control of'] },
    { en: 'take up', cn: '占据;开始从事', alts: ['occupy', 'begin'] },
    { en: 'tend to', cn: '倾向于', alts: ['be likely to'] },
    { en: 'throw away', cn: '扔掉', alts: ['discard'] },
    { en: 'turn down', cn: '拒绝;调低', alts: ['refuse', 'reject'] },
    { en: 'turn into', cn: '变成', alts: ['become'] },
    { en: 'turn to', cn: '求助于;转向', alts: ['ask for help'] },
    { en: 'watch out for', cn: '当心', alts: ['be careful of'] },
    { en: 'work on', cn: '从事;致力于', alts: ['focus on'] },
    { en: 'would rather', cn: '宁愿', alts: ['prefer to'] },
    { en: 'put off', cn: '推迟', alts: ['postpone', 'delay'] },
    { en: 'pay off', cn: '得到回报;还清', alts: ['yield results'] },
    { en: 'hold on', cn: '坚持;稍等', alts: ['wait', 'hang on'] },
    { en: 'carry on', cn: '继续', alts: ['continue', 'go on'] },
    { en: 'break up', cn: '分手;解散', alts: ['split up'] },
    { en: 'bring up', cn: '抚养;提出', alts: ['raise'] }
  ];

  let mode = 'en2cn';
  let order = 'seq';
  let scope = 'all';      // all | unmastered | wrong
  let limit = 20;         // 0 = 全部
  let queue = [];       // {type:'word'|'phrase', item, index}
  let pos = 0;
  let current = null;
  let answered = false;   // 本题是否已作答
  let assisted = false;   // 本题是否查看过答案
  let optionNodes = [];

  const $ = id => document.getElementById(id);

  /* ---------- 工具 ---------- */
  function norm(s) {
    return (s || '').toLowerCase()
      .replace(/[.,!?;:'"()\[\]{}，。！？；：、“”‘’（）【】]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function stripSpaces(s) { return (s || '').replace(/\s+/g, ''); }

  function speak(text, lang) {
    TTS.speak(text, {
      lang: lang === 'uk' ? 'en-GB' : 'en-US',
      rate: Number(Store.getSettings().ttsRate) || 0.9
    });
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---------- 队列 ---------- */
  function filterWords() {
    if (scope === 'unmastered') {
      return words.filter(w => Store.wordState(w.word).status !== 'mastered');
    }
    if (scope === 'wrong') {
      return words.filter(w => (Store.state.wrongWords[w.word] || 0) > 0);
    }
    return words.slice();
  }

  function buildQueue() {
    let list;
    if (mode === 'phrase2cn' || mode === 'phrase2en') {
      list = PHRASES.map((p, i) => ({ type: 'phrase', item: p, index: i }));
    } else {
      list = filterWords().map(w => ({ type: 'word', item: w, index: w.id }));
    }
    if (order === 'random') list = shuffle(list);
    if (Number(limit) > 0) list = list.slice(0, Number(limit));
    queue = list;
    pos = 0;
  }

  /* ---------- 渲染 ---------- */
  function renderProgress() {
    $('vocabProgress').textContent = `${Math.min(pos + 1, queue.length)} / ${queue.length}`;
  }

  function renderQuestion() {
    answered = false;
    assisted = false;
    const q = queue[pos];
    if (!q) { finish(); return; }
    current = q;
    renderProgress();

    const qEl = $('vocabQuestion');
    const detail = $('vocabPromptDetail');
    const options = $('vocabOptions');
    const spell = $('vocabSpellArea');
    const fb = $('vocabFeedback');
    const meta = $('vocabMetaLine');
    fb.classList.add('hidden');
    fb.className = 'feedback hidden';
    $('vocabExamples').classList.add('hidden');
    options.innerHTML = '';
    options.classList.add('hidden');
    spell.classList.add('hidden');
    $('vocabInput').value = '';
    optionNodes = [];

    const isWord = q.type === 'word';
    const item = q.item;

    if (q.type === 'word') {
      const st = Store.wordState(item.word);
      meta.textContent = `连续正确 ${st.streak} / 3 次 · 本题状态:${{ new: '新词', learning: '学习中', mastered: '已掌握' }[st.status] || '新词'}`;
      if (mode === 'en2cn') {
        qEl.innerHTML = `<span class="big-word">${item.word}</span><br><span class="phone">美 ${item.usphone || '-'} · 英 ${item.ukphone || '-'}</span>`;
        detail.textContent = '选择正确的中文释义';
        // 4 个选项
        const correctTrans = item.trans.join('；');
        const pool = shuffle(words.filter(w => w.word !== item.word)).slice(0, 3);
        const optionsData = shuffle([
          { text: correctTrans, ok: true },
          ...pool.map(w => ({ text: w.trans.join('；'), ok: false }))
        ]);
        options.classList.remove('hidden');
        optionsData.forEach((o, i) => {
          const b = document.createElement('button');
          b.className = 'option';
          b.textContent = o.text;
          b.dataset.ok = o.ok ? '1' : '0';
          b.addEventListener('click', () => chooseOption(b, o.ok));
          options.appendChild(b);
          optionNodes.push(b);
        });
      } else {
        qEl.innerHTML = `<span class="big-word" style="font-size:22px">${item.trans.join('；')}</span>`;
        detail.textContent = '拼写对应的英文单词(忽略首尾空格与大小写)';
        spell.classList.remove('hidden');
        $('vocabInput').focus();
      }
    } else {
      // 短语
      const p = item;
      if (mode === 'phrase2cn') {
        qEl.innerHTML = `<span class="big-word" style="font-size:24px">${p.en}</span>`;
        detail.textContent = '翻译成中文(意思对即可)';
      } else {
        qEl.innerHTML = `<span class="big-word" style="font-size:22px">${p.cn}</span>`;
        detail.textContent = '翻译成英文短语(同义表达也可)';
      }
      spell.classList.remove('hidden');
      $('vocabInput').focus();
      meta.textContent = '短语为自编常用搭配,允许合理同义表达';
    }
  }

  /* ---------- 判题 ---------- */
  function chooseOption(btn, ok) {
    if (answered) return;
    answered = true;
    optionNodes.forEach(n => { n.disabled = true; });
    btn.classList.add(ok ? 'correct' : 'wrong');
    if (!ok) {
      optionNodes.forEach(n => { if (n.dataset.ok === '1') n.classList.add('correct'); });
    }
    const word = current.item.word;
    const st = Store.recordAnswer(word, ok, assisted);
    if (ok) Store.addNewWord(word);
    showFeedback(ok, st, `正确答案:${current.item.trans.join('；')}`);
    showExamples(current.item);
  }

  function submitInput() {
    if (answered) return;
    const input = $('vocabInput').value;
    if (!input.trim()) return;
    answered = true;

    const q = current;
    let ok = false;
    let correctText = '';

    if (q.type === 'word') {
      // 拼写:忽略首尾空格与大小写
      ok = norm(input) === norm(q.item.word);
      correctText = q.item.word;
      if (ok) Store.addNewWord(q.item.word);
      const st = Store.recordAnswer(q.item.word, ok, assisted);
      showFeedback(ok, st, `正确答案:${correctText}`);
      showExamples(q.item);
    } else {
      const p = q.item;
      if (mode === 'phrase2cn') {
        ok = checkChinese(input, p.cn);
        correctText = p.cn;
      } else {
        ok = checkEnglish(input, p.en, p.alts);
        correctText = p.en + (p.alts.length ? `(也可:${p.alts.join(' / ')})` : '');
      }
      // 短语不参与词条掌握统计,只记录到当日练习
      Store.recordPractice(ok);
      showFeedback(ok, null, `参考答案:${correctText}`, true);
    }
  }

  // 中文语义匹配:包含标准答案中的主要词即可(容忍措辞差异)
  function checkChinese(input, answer) {
    const a = norm(input).replace(/[的了是在]+/g, '');
    const target = norm(answer).replace(/[的了是在]+/g, '');
    if (!a) return false;
    if (a === target || a.includes(target) || target.includes(a)) return true;
    const parts = target.split(/[;；,，、\/]/).map(s => s.trim()).filter(Boolean);
    return parts.some(p => p && a.includes(p));
  }

  // 英文短语匹配:标准答案或可接受同义表达
  function checkEnglish(input, answer, alts) {
    const a = norm(input);
    const candidates = [answer, ...(alts || [])].map(norm);
    return candidates.some(c => a === c || a.replace(/\s+/g, '') === c.replace(/\s+/g, ''));
  }

  function showFeedback(ok, st, answerText, isPhrase) {
    const fb = $('vocabFeedback');
    fb.classList.remove('hidden');
    fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
    let extra = '';
    if (assisted) extra = '\n(本题查看过答案,不计入连续正确次数)';
    if (st && !isPhrase) {
      extra += `\n当前连续正确:${st.streak} / 3${st.status === 'mastered' ? ' · ✅ 已掌握' : ''}`;
    }
    fb.textContent = (ok ? '✅ 回答正确' : '❌ 回答错误') + '\n' + answerText + extra;
    if (!isPhrase) renderProgress();
    // 更新 meta
    if (st && !isPhrase) {
      $('vocabMetaLine').textContent = `连续正确 ${st.streak} / 3 次 · 本题状态:${{ new: '新词', learning: '学习中', mastered: '已掌握' }[st.status] || '学习中'}`;
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------- 例句 ---------- */
  function showExamples(item) {
    if (!item || !item.word) { $('vocabExamples').classList.add('hidden'); return; }
    const box = $('vocabExamples');
    const list = $('vocabExampleList');
    const note = $('vocabExampleNote');
    const saved = (Store.state.examples && Store.state.examples[item.word]) || [];
    box.classList.remove('hidden');
    list.innerHTML = '';
    if (saved.length) {
      saved.forEach(ex => {
        const div = document.createElement('div');
        div.className = 'example-item';
        div.innerHTML =
          `<div class="ex-en">${escapeHtml(ex.en)}</div>` +
          `<div class="ex-cn">${escapeHtml(ex.cn || '')}` +
          `<span class="ex-src">${escapeHtml(ex.source || 'AI 生成')}</span></div>`;
        list.appendChild(div);
      });
      note.textContent = '例句由 AI 生成,仅供参考。';
    } else {
      list.innerHTML = '<div class="muted small">暂无例句。点击右上角「AI 生成例句」按需生成(需先在设置中配置 AI 服务)。</div>';
      note.textContent = '词库本身不含例句,未强行编造。';
    }
  }

  async function generateExample() {
    if (!current || current.type !== 'word') return;
    const s = Store.getSettings();
    if (!s.ai.baseUrl || !s.ai.apiKey || !s.ai.model) {
      alert('请先在「设置 → AI 作文批改服务」配置接口地址、API Key 和模型,才能生成例句。');
      return;
    }
    const item = current.item;
    const btn = $('vocabGenExample');
    btn.disabled = true;
    btn.textContent = '生成中…';
    try {
      const base = s.ai.baseUrl.replace(/\/+$/, '');
      const res = await fetch(base + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + s.ai.apiKey
        },
        body: JSON.stringify({
          model: s.ai.model,
          messages: [
            { role: 'system', content: '你是英语词汇教学助手,只输出 JSON。' },
            {
              role: 'user',
              content: `请为英语单词 "${item.word}"(释义:${item.trans.join('；')})生成 2 条适合大学英语四级水平的英文例句,每条附中文翻译。只返回 JSON:{"examples":[{"en":"...","cn":"..."}]}`
            }
          ],
          temperature: 0.7
        })
      });
      if (!res.ok) throw new Error('接口返回 HTTP ' + res.status);
      const data = await res.json();
      const content = data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content : '';
      const m = content.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('返回内容不是有效 JSON');
      const parsed = JSON.parse(m[0]);
      if (!parsed.examples || !parsed.examples.length) throw new Error('未返回例句');
      const list = parsed.examples.slice(0, 2)
        .map(ex => ({
          en: String(ex.en || '').trim(),
          cn: String(ex.cn || '').trim(),
          source: 'AI 生成'
        }))
        .filter(ex => ex.en);
      if (!list.length) throw new Error('例句为空');
      if (!Store.state.examples) Store.state.examples = {};
      Store.state.examples[item.word] = list;
      Store.save();
      showExamples(item);
    } catch (e) {
      alert('生成例句失败:' + (e.message || '网络错误') + '\n请检查 AI 配置或稍后重试。');
    } finally {
      btn.disabled = false;
      btn.textContent = '✨ AI 生成例句';
    }
  }

  /* ---------- 查看答案 ---------- */
  function showAnswer() {
    if (!current || answered) return;
    assisted = true;
    const q = current;
    let text = '';
    if (q.type === 'word') {
      text = `${q.item.word}\n${q.item.trans.join('；')}\n美 ${q.item.usphone || '-'} · 英 ${q.item.ukphone || '-'}`;
      speak(q.item.word, 'us');
    } else {
      text = mode === 'phrase2cn' ? q.item.cn : `${q.item.en}\n${q.item.cn}`;
    }
    const fb = $('vocabFeedback');
    fb.classList.remove('hidden');
    fb.className = 'feedback info';
    fb.textContent = '👀 已查看答案(本题标记为辅助完成,作答不计入连续正确)\n' + text;
    if (q.type === 'word') showExamples(q.item);
  }

  /* ---------- 下一题 ---------- */
  function next() {
    if (!queue.length) return;
    if (pos < queue.length - 1) {
      pos++;
      renderQuestion();
    } else {
      finish();
    }
  }

  function finish() {
    $('vocabQuestion').textContent = '本轮练习完成!可以再次点击「开始 / 重置」继续。';
    $('vocabPromptDetail').textContent = '';
    $('vocabOptions').classList.add('hidden');
    $('vocabSpellArea').classList.add('hidden');
    $('vocabFeedback').classList.add('hidden');
    $('vocabProgress').textContent = `${queue.length} / ${queue.length}`;
  }

  /* ---------- 初始化 ---------- */
  function bind() {
    $('vocabMode').addEventListener('change', e => { mode = e.target.value; });
    $('vocabOrder').addEventListener('change', e => { order = e.target.value; });
    $('vocabScope').addEventListener('change', e => { scope = e.target.value; });
    $('vocabLimit').addEventListener('change', e => { limit = Number(e.target.value); });
    $('vocabRestart').addEventListener('click', () => {
      buildQueue();
      renderQuestion();
    });
    $('vocabReplay').addEventListener('click', () => {
      if (!current) return;
      if (current.type === 'word') speak(current.item.word, 'us');
      else speak(current.item.en, 'us');
    });
    $('vocabShowAnswer').addEventListener('click', showAnswer);
    $('vocabGenExample').addEventListener('click', generateExample);
    $('vocabNext').addEventListener('click', next);
    $('vocabSubmit').addEventListener('click', submitInput);
    $('vocabInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); submitInput(); }
    });
  }

  function init() {
    bind();
    const meta = data ? data.meta : null;
    if (meta) {
      $('vocabSource').textContent = `词库:${meta.name} · ${meta.count} 词 · 来源 ${meta.source}`;
    }
    buildQueue();
  }

  /* ---------- 每周复习 ---------- */
  function startReview(wordList) {
    const map = new Map(words.map(w => [w.word, w]));
    queue = wordList
      .map(w => map.get(w))
      .filter(Boolean)
      .map(w => ({ type: 'word', item: w }));
    if (order === 'random') queue = shuffle(queue);
    pos = 0;
    renderQuestion();
  }

  function onShow() {
    renderQuestion();
  }

  return { init, onShow, speak, startReview };
})();
