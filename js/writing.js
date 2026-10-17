/* ==========================================================
   writing.js — 作文模块
   题目/模板/参考句型 + 在线 AI 批改(OpenAI 兼容接口)
   未配置或请求失败时不显示任何虚构评分
   ========================================================== */
const Writing = (function () {
  // 练习话题(自编练习题目,非官方真题)
  const TOPICS = [
    // 校园生活
    { en: 'On the Importance of Reading', cn: '阅读的重要性' },
    { en: 'How to Deal with Stress in College', cn: '大学生如何应对压力' },
    { en: 'The Benefits and Challenges of Online Learning', cn: '在线学习的利与弊' },
    { en: 'My View on Part-time Jobs for College Students', cn: '大学生兼职之我见' },
    { en: 'How to Improve Time Management', cn: '如何提高时间管理能力' },
    { en: 'The Importance of Teamwork', cn: '团队合作的重要性' },
    { en: 'My Ideal University Life', cn: '我理想的大学生活' },
    { en: 'On Campus Safety', cn: '校园安全' },
    { en: 'How to Make Friends in College', cn: '大学里如何交友' },
    { en: 'The Value of Extracurricular Activities', cn: '课外活动的价值' },
    // 社会与文化
    { en: 'On Learning to Be Grateful', cn: '学会感恩' },
    { en: 'The Value of Volunteer Work', cn: '志愿服务的价值' },
    { en: 'On Protecting the Environment', cn: '环境保护' },
    { en: 'The Advantages and Disadvantages of Social Media', cn: '社交媒体的利与弊' },
    { en: 'How to Build a Harmonious Society', cn: '如何构建和谐社会' },
    { en: 'The Importance of Honesty', cn: '诚实的重要性' },
    { en: 'On Traditional Chinese Culture', cn: '中国传统文化' },
    { en: 'The Importance of Public Manners', cn: '公共礼仪的重要性' },
    // 科技与生活
    { en: 'The Impact of Artificial Intelligence on Our Lives', cn: '人工智能对生活的影响' },
    { en: 'The Influence of Smartphones on Our Daily Life', cn: '智能手机对日常生活的影响' },
    { en: 'Should We Rely on the Internet Too Much?', cn: '我们是否过度依赖互联网' },
    { en: 'The Development of E-commerce', cn: '电子商务的发展' },
    { en: 'On Online Communication', cn: '网络交流' },
    { en: 'The Future of Work in the Digital Age', cn: '数字时代的工作未来' },
    // 成长与健康
    { en: 'The Importance of Physical Exercise', cn: '体育锻炼的重要性' },
    { en: 'How to Keep a Healthy Lifestyle', cn: '如何保持健康的生活方式' },
    { en: 'On Failure and Growth', cn: '失败与成长' },
    { en: 'The Power of Persistence', cn: '坚持的力量' }
  ];

  const TEMPLATE = `【四级作文常用结构】
第一段(引出话题):
• Recently, the issue of ______ has aroused wide public concern.
• It is widely acknowledged that ______ plays an important role in our daily life.

第二段(分析原因/利弊):
• There are several reasons accounting for this phenomenon. First, ______. Second, ______.
• On the one hand, ______. On the other hand, ______.

第三段(总结与建议):
• In conclusion, it is high time that we took effective measures to ______.
• Only in this way can we ______.

【常用连接词】
first / second / moreover / furthermore / however / therefore / as a result / in addition

【参考开头句型】
• With the rapid development of society, ______ has become increasingly important.
• As far as I am concerned, ______.

【参考结尾句型】
• Taking all these factors into consideration, we may safely draw the conclusion that ______.
• I firmly believe that ______ will be beneficial to both individuals and society.`;

  let current = null;
  const $ = id => document.getElementById(id);

  function init() {
    const sel = $('writingTopic');
    TOPICS.forEach((t, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = `${t.cn} — ${t.en}`;
      sel.appendChild(o);
    });
    current = TOPICS[0];
    function pickCurrent() {
      const custom = $('writingCustomTopic').value.trim();
      if (custom) {
        current = { en: custom, cn: '自定义题目' };
        $('writingTopicTitle').textContent = current.en + '(自定义)';
      } else {
        current = TOPICS[Number(sel.value) || 0];
        $('writingTopicTitle').textContent = current.en + '(' + current.cn + ')';
      }
    }
    sel.addEventListener('change', pickCurrent);
    $('writingCustomTopic').addEventListener('input', pickCurrent);
    pickCurrent();

    $('writingInput').addEventListener('input', updateCount);
    $('writingTemplate').addEventListener('click', () => {
      App.showModal('作文模板与常用句型', TEMPLATE);
    });
    $('writingSubmit').addEventListener('click', submit);
    renderHistory();
  }

  function updateCount() {
    const text = $('writingInput').value.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    $('writingWordCount').textContent = `${words} 词`;
  }

  function renderHistory() {
    const box = $('writingHistory');
    const list = Store.state.writings || [];
    if (!list.length) {
      box.innerHTML = '<p class="muted">暂无作文记录。</p>';
      return;
    }
    box.innerHTML = '';
    list.slice().reverse().forEach(w => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div>
          <div class="h-title">${escapeHtml(w.topic)}</div>
          <div class="h-meta">${new Date(w.time).toLocaleString('zh-CN')} · 参考分 ${w.score ?? '—'} / 15</div>
        </div>
        <div class="history-actions">
          <button class="btn small" data-act="view" data-id="${w.id}">查看</button>
          <button class="btn small danger" data-act="del" data-id="${w.id}">删除</button>
        </div>`;
      box.appendChild(div);
    });
    box.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const w = list.find(x => x.id === btn.dataset.id);
        if (!w) return;
        if (btn.dataset.act === 'del') {
          if (confirm('确定删除这篇作文记录?')) {
            Store.state.writings = list.filter(x => x.id !== w.id);
            Store.save();
            renderHistory();
            App.refreshHome();
          }
        } else {
          showResult(w, true);
        }
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function submit() {
    const settings = Store.getSettings();
    const text = $('writingInput').value.trim();
    if (!text) { alert('请先输入作文内容。'); return; }
    if (!settings.ai.baseUrl || !settings.ai.apiKey || !settings.ai.model) {
      alert('尚未配置 AI 批改服务。\n请到「设置 → AI 作文批改服务」填写接口地址、API Key 和模型名称。\n未配置时不会生成任何评分。');
      return;
    }

    const words = text.split(/\s+/).filter(Boolean).length;
    if (words < 30) {
      if (!confirm(`当前只有约 ${words} 词,内容过短可能影响批改效果。仍要提交吗?`)) return;
    }

    const btn = $('writingSubmit');
    btn.disabled = true;
    btn.textContent = '批改中…';
    try {
      const result = await callAI(settings, current, text);
      const item = {
        id: 'w' + Date.now(),
        topic: current.en + '(' + current.cn + ')',
        content: text,
        time: Date.now(),
        score: result.score,
        level: result.level,
        summary: result.summary,
        issues: result.issues || []
      };
      Store.state.writings.push(item);
      Store.save();
      showResult(item);
      renderHistory();
      App.refreshHome();
    } catch (e) {
      alert('批改失败:' + (e.message || '网络或接口错误') + '\n本次未生成评分。请检查设置中的接口地址与 Key,或稍后重试。');
    } finally {
      btn.disabled = false;
      btn.textContent = 'AI 批改';
    }
  }

  async function callAI(settings, topic, text) {
    const base = settings.ai.baseUrl.replace(/\/+$/, '');
    const url = base + '/chat/completions';
    const prompt = `你是一名大学英语四级作文阅卷老师。请批改下面这篇作文。

作文题目:${topic.en}(${topic.cn})

要求:
1. 按四级作文标准给出 15 分制参考评分(整数或 0.5 分档)。
2. 给出等级(如:优秀/良好/中等/及格/不及格)。
3. 用中文给出总体评价(2-3 句)。
4. 找出原文中的语法、拼写和用词问题,逐条给出:问题类型、原文片段、修改建议、简短解释。最多 8 条。
5. 只返回一个 JSON 对象,不要输出其他文字。JSON 格式:
{"score": 数字, "level": "等级", "summary": "总体评价", "issues": [{"type": "语法|拼写|用词", "original": "原文片段", "suggestion": "修改建议", "explanation": "解释"}]}

作文原文:
${text}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + settings.ai.apiKey
      },
      body: JSON.stringify({
        model: settings.ai.model,
        messages: [
          { role: 'system', content: '你是一名严谨的大学英语四级作文阅卷老师,只输出 JSON。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    });

    if (!res.ok) {
      let detail = '';
      try { detail = (await res.text()).slice(0, 200); } catch (e) { }
      throw new Error(`接口返回 HTTP ${res.status}${detail ? ':' + detail : ''}`);
    }

    const data = await res.json();
    const content = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content : '';
    if (!content) throw new Error('接口未返回批改内容');

    // 从文本中提取 JSON(兼容被代码块包裹的情况)
    const m = content.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('返回内容不是有效 JSON');
    const parsed = JSON.parse(m[0]);
    if (typeof parsed.score !== 'number') throw new Error('返回结果缺少评分字段');
    parsed.score = Math.max(0, Math.min(15, parsed.score));
    return parsed;
  }

  function showResult(item, fromHistory) {
    $('writingResult').classList.remove('hidden');
    $('writingScore').textContent = item.score ?? '--';
    $('writingLevel').textContent = item.level || '';
    $('writingTime').textContent = new Date(item.time).toLocaleString('zh-CN') + ' · AI 参考评分,不代表官方阅卷结果';
    $('writingSummary').textContent = item.summary || '';
    const box = $('writingIssues');
    box.innerHTML = '';
    (item.issues || []).forEach(issue => {
      const div = document.createElement('div');
      div.className = 'issue';
      div.innerHTML = `<span class="issue-type">[${escapeHtml(issue.type || '问题')}]</span>` +
        `原文:<b>${escapeHtml(issue.original || '')}</b> → <span class="issue-fix">${escapeHtml(issue.suggestion || '')}</span>` +
        `<br><span class="muted">${escapeHtml(issue.explanation || '')}</span>`;
      box.appendChild(div);
    });
    if (fromHistory) {
      $('writingResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function onShow() {
    renderHistory();
    updateCount();
  }

  return { init, onShow };
})();
