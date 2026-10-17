/* ==========================================================
   app.js — 主逻辑:路由 / 首页 / 计时 / 设置 / 统计 / 数据
   ========================================================== */
const App = (function () {
  const $ = id => document.getElementById(id);
  let currentView = 'home';
  let pendingSeconds = 0;
  let lastActivity = Date.now();
  const STUDY_VIEWS = ['vocab', 'listening', 'writing'];

  /* ---------- 路由 ---------- */
  function switchView(name) {
    if (!document.getElementById('view-' + name)) return;
    currentView = name;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = $('view-' + name);
    if (view) view.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.view === name);
    });
    if (name === 'home') refreshHome();
    if (name === 'stats') renderStats();
    if (name === 'settings') fillSettings();
    if (name === 'vocab') Vocab.onShow();
    if (name === 'listening') Listening.onShow();
    if (name === 'writing') Writing.onShow();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindNav() {
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
  }

  /* ---------- 模态框 ---------- */
  function showModal(title, content) {
    $('modalTitle').textContent = title;
    $('modalBody').textContent = content;
    $('modal').classList.remove('hidden');
  }
  function bindModal() {
    $('modal').addEventListener('click', e => {
      if (e.target.dataset.close) $('modal').classList.add('hidden');
    });
  }

  /* ---------- 首页 ---------- */
  let timeOffset = 0;      // 网络时间 - 本地时间(毫秒)

  function now() {
    return new Date(Date.now() + timeOffset);
  }

  async function syncTime() {
    const hint = $('timeSyncHint');
    try {
      const res = await fetch(location.href.split('#')[0], { method: 'HEAD', cache: 'no-store' });
      const dateStr = res.headers.get('date');
      if (dateStr) {
        const serverMs = new Date(dateStr).getTime();
        if (!isNaN(serverMs)) {
          timeOffset = serverMs - Date.now();
          if (hint) {
            const diff = Math.round(timeOffset / 1000);
            hint.textContent = Math.abs(diff) >= 1
              ? `⏱ 倒计时已按网络时间校准(本地偏差 ${diff > 0 ? '+' : ''}${diff} 秒)`
              : '⏱ 倒计时已按网络时间校准';
          }
        }
      }
    } catch (e) {
      if (hint) hint.textContent = '⏱ 无法获取网络时间,暂用设备时间';
    }
    refreshHome();
  }

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr + 'T00:00:00');
    if (isNaN(target)) return null;
    const today = now();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
  }

  function refreshHome() {
    const s = Store.getSettings();
    const st = Store.stats();

    // 倒计时
    const days = daysUntil(s.examDate);
    if (days === null) {
      $('homeDays').textContent = '--';
      $('homeExamDate').textContent = '考试日期未设置,请到设置中填写';
      $('examCountdown').textContent = '未设置考试日期';
    } else {
      $('homeDays').textContent = days >= 0 ? days : 0;
      $('homeExamDate').textContent = s.examDate + (days < 0 ? '(已过)' : '');
      $('examCountdown').textContent = days >= 0 ? `距四级 ${days} 天` : '考试日期已过';
    }

    // 今日新词进度
    const todayNew = Store.daily().newWords.length;
    const goal = Number(s.dailyGoal) || 30;
    $('newDone').textContent = todayNew;
    $('newGoal').textContent = goal;
    $('newWordsHint').textContent = `今日已学 ${todayNew} 个新词`;
    const ring = $('ringFg');
    const ratio = Math.min(1, todayNew / goal);
    const C = 2 * Math.PI * 52; // 326.7
    ring.style.strokeDasharray = C;
    ring.style.strokeDashoffset = C * (1 - ratio);

    // 今日时长
    $('homeMinutes').textContent = st.todayMinutes;
    updateTimerDisplay();

    // 每周复习提醒
    const wi = Store.weeklyInfo();
    const banner = $('weeklyReviewBanner');
    if (Store.shouldRemindReview()) {
      banner.classList.remove('hidden');
      $('reviewBannerText').textContent = `本周已学习 ${wi.words.length} 个词条,今天是复习日。`;
    } else {
      banner.classList.add('hidden');
    }

    // 入口信息
    $('entryVocabMeta').textContent = `已掌握 ${st.mastered} / ${st.total} 词条`;
    $('entryWritingMeta').textContent = `历史作文 ${(Store.state.writings || []).length} 篇`;
    $('entryStatsMeta').textContent = `连续学习 ${st.streakDays} 天`;
    $('dailyTip').textContent = `词库共 ${st.total} 个四级词条。学习内容由你自由选择,不强制顺序,也不强制时长。学习时长仅统计实际练习时间。`;
  }

  /* ---------- 计时器 ---------- */
  function markActivity() { lastActivity = Date.now(); }

  function isStudyView() { return STUDY_VIEWS.includes(currentView); }

  function updateTimerDisplay() {
    const sec = (Store.daily().seconds || 0) + pendingSeconds;
    const m = Math.floor(sec / 60);
    $('studyTimer').textContent = `今日 ${String(m).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  }

  function startTimer() {
    ['mousemove', 'keydown', 'touchstart', 'click', 'scroll'].forEach(ev => {
      document.addEventListener(ev, markActivity, { passive: true });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && pendingSeconds > 0) {
        Store.addStudySeconds(pendingSeconds);
        pendingSeconds = 0;
        updateTimerDisplay();
      }
    });
    window.addEventListener('beforeunload', () => {
      if (pendingSeconds > 0) Store.addStudySeconds(pendingSeconds);
    });

    setInterval(() => {
      if (document.hidden) return;           // 切后台暂停
      if (!isStudyView()) return;            // 只在练习页面计时
      if (Date.now() - lastActivity > 120000) return; // 2 分钟无操作暂停
      pendingSeconds += 5;
      if (pendingSeconds >= 30) {
        Store.addStudySeconds(pendingSeconds);
        pendingSeconds = 0;
      }
      updateTimerDisplay();
    }, 5000);
  }

  /* ---------- 统计 ---------- */
  function renderStats() {
    const st = Store.stats();
    $('statDays').textContent = st.streakDays;
    $('statTodayMin').textContent = st.todayMinutes;
    $('statMastered').textContent = st.mastered;
    $('statUnmastered').textContent = st.unmastered;
    $('statWordAcc').textContent = st.accuracy === null ? '--' : st.accuracy + '%';
    $('statTotalWords').textContent = st.total;

    const box = $('statWrongWords');
    const top = Store.wrongTop(10);
    if (!top.length) {
      box.innerHTML = '<p class="muted">暂无错词记录,继续加油!</p>';
    } else {
      box.innerHTML = '';
      top.forEach(([word, count]) => {
        const div = document.createElement('div');
        div.className = 'wrong-item';
        div.innerHTML = `<span>${word}</span><span class="count">错 ${count} 次</span>`;
        box.appendChild(div);
      });
    }
  }

  /* ---------- 设置 ---------- */
  function fillSettings() {
    const s = Store.getSettings();
    $('setExamDate').value = s.examDate || '';
    $('setDailyGoal').value = s.dailyGoal || 30;
    $('setReviewDay').value = String(s.reviewDay ?? 0);
    $('setTtsRate').value = s.ttsRate || 0.9;
    $('setBgOverlay').value = s.bgOverlay ?? 0.55;
    $('bgOverlayVal').textContent = Math.round((s.bgOverlay ?? 0.55) * 100) + '%';
    $('setAiBase').value = s.ai.baseUrl || '';
    $('setAiKey').value = s.ai.apiKey || '';
    $('setAiModel').value = s.ai.model || '';
    $('setAiStatus').textContent = 'Key 仅保存在本浏览器;个人使用场景下请注意设备安全。未配置时作文模块不会显示评分。';
    $('setAiStatus').style.color = '';
    document.querySelectorAll('.theme-dot').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === s.theme);
    });
    $('ttsSupport').textContent = ('speechSynthesis' in window) ? '支持' : '当前浏览器不支持';
    const meta = window.CET4_DATA ? window.CET4_DATA.meta : null;
    $('aboutVocab').textContent = meta
      ? `${meta.name}:${meta.count} 词。来源:${meta.source}。版本:${meta.version}。说明:${meta.note}`
      : '词库未加载。';
  }

  function bindSettings() {
    $('setExamDate').addEventListener('change', e => {
      Store.setSettings({ examDate: e.target.value });
      refreshHome();
    });
    $('setDailyGoal').addEventListener('change', e => {
      const v = Math.max(1, Math.min(200, Number(e.target.value) || 30));
      e.target.value = v;
      Store.setSettings({ dailyGoal: v });
      refreshHome();
    });
    $('setReviewDay').addEventListener('change', e => {
      Store.setSettings({ reviewDay: Number(e.target.value) });
      refreshHome();
    });
    document.querySelectorAll('.theme-dot').forEach(b => {
      b.addEventListener('click', () => {
        Store.setSettings({ theme: b.dataset.theme });
        applyTheme();
        fillSettings();
      });
    });
    $('setBgImage').addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        // 压缩图片避免超出 localStorage 限制
        const img = new Image();
        img.onload = () => {
          const maxW = 1600;
          const scale = Math.min(1, maxW / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          try {
            Store.setSettings({ bgImage: dataUrl, theme: 'image' });
            applyTheme();
            fillSettings();
          } catch (err) {
            alert('图片过大,保存失败,请换一张更小的图片。');
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
    $('setTtsRate').addEventListener('input', e => {
      Store.setSettings({ ttsRate: Number(e.target.value) });
    });
    $('setBgOverlay').addEventListener('input', e => {
      const v = Number(e.target.value);
      $('bgOverlayVal').textContent = Math.round(v * 100) + '%';
      Store.setSettings({ bgOverlay: v });
      applyTheme();
    });
    // AI 配置:失焦自动保存 + 手动保存 + 连接测试
    function readAiInputs() {
      return {
        baseUrl: $('setAiBase').value.trim(),
        apiKey: $('setAiKey').value.trim(),
        model: $('setAiModel').value.trim()
      };
    }
    function aiStatus(text, ok) {
      const el = $('setAiStatus');
      el.textContent = text;
      el.style.color = ok ? 'var(--ok)' : 'var(--danger)';
    }
    ['setAiBase', 'setAiKey', 'setAiModel'].forEach(id => {
      $(id).addEventListener('change', () => {
        Store.setSettings({ ai: readAiInputs() });
        aiStatus('配置已自动保存。', true);
      });
    });
    $('setAiSave').addEventListener('click', () => {
      const ai = readAiInputs();
      if (!ai.baseUrl || !ai.apiKey || !ai.model) {
        aiStatus('保存失败:请填写接口地址、API Key 和模型名称(三项都必填)。', false);
        return;
      }
      Store.setSettings({ ai });
      aiStatus('✅ AI 配置已保存(仅保存在本浏览器)。', true);
    });
    $('setAiTest').addEventListener('click', async () => {
      const ai = readAiInputs();
      if (!ai.baseUrl || !ai.apiKey || !ai.model) {
        aiStatus('测试失败:请先填写完整的三项配置。', false);
        return;
      }
      const btn = $('setAiTest');
      btn.disabled = true;
      btn.textContent = '测试中…';
      aiStatus('正在测试接口连接…', true);
      try {
        const base = ai.baseUrl.replace(/\/+$/, '');
        const res = await fetch(base + '/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + ai.apiKey
          },
          body: JSON.stringify({
            model: ai.model,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5
          })
        });
        if (!res.ok) {
          let detail = '';
          try { detail = (await res.text()).slice(0, 120); } catch (e) { }
          throw new Error(`HTTP ${res.status}${detail ? ' · ' + detail : ''}`);
        }
        await res.json();
        Store.setSettings({ ai });
        aiStatus('✅ 连接成功,接口可用,配置已保存。', true);
      } catch (e) {
        aiStatus('❌ 连接失败:' + (e.message || '网络错误') + '。如果地址和 Key 正确,可能是接口不允许浏览器跨域(CORS)调用。', false);
      } finally {
        btn.disabled = false;
        btn.textContent = '测试连接';
      }
    });
  }

  function applyTheme() {
    const s = Store.getSettings();
    document.body.dataset.theme = s.theme || 'light';
    if (s.bgImage) {
      document.body.style.setProperty('--bg-image', `url(${s.bgImage})`);
    } else {
      document.body.style.removeProperty('--bg-image');
    }
    document.body.style.setProperty('--bg-overlay', String(s.bgOverlay ?? 0.55));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = s.theme === 'eye' ? '#dfeee0' : '#f5f7fa';
    }
  }

  /* ---------- 数据管理 ---------- */
  function bindData() {
    $('dataExport').addEventListener('click', () => {
      const blob = new Blob([Store.exportData()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `四级学习数据_${Store.today()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $('dataImportBtn').addEventListener('click', () => $('dataImport').click());
    $('dataImport').addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          Store.importData(reader.result);
          alert('导入成功!');
          applyTheme();
          fillSettings();
          refreshHome();
          renderStats();
        } catch (err) {
          alert('导入失败:' + err.message);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
    $('dataClear').addEventListener('click', () => {
      if (confirm('确定清空全部学习数据吗?此操作不可恢复。建议先导出备份。')) {
        Store.clearAll();
        alert('已清空。');
        applyTheme();
        fillSettings();
        refreshHome();
        renderStats();
      }
    });
  }

  /* ---------- 每周复习 ---------- */
  function bindReview() {
    $('startWeeklyReview').addEventListener('click', () => {
      const wi = Store.weeklyInfo();
      if (!wi.words.length) return;
      switchView('vocab');
      // 进入复习模式:把本周词条作为练习队列
      Vocab.startReview(wi.words);
      showModal('每周复习', `已载入本周学过的 ${wi.words.length} 个词条,进入单词练习完成复习。完成后可点击首页提醒中的标记。`);
      Store.markWeeklyDone();
      refreshHome();
    });
  }

  /* ---------- PWA ---------- */
  function registerSW() {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* file:// 下忽略 */ });
    }
  }

  /* ---------- 初始化 ---------- */
  function init() {
    bindNav();
    bindModal();
    bindSettings();
    bindData();
    bindReview();
    Vocab.init();
    Listening.init();
    Writing.init();
    applyTheme();
    refreshHome();
    startTimer();
    registerSW();
    if (window.TTS) TTS.loadVoices();
    syncTime();
    switchView('home');
  }

  return { init, switchView, refreshHome, showModal, applyTheme };
})();

document.addEventListener('DOMContentLoaded', App.init);
