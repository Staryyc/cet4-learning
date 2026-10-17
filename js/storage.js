/* ==========================================================
   storage.js — 本地数据层
   所有学习记录保存在 localStorage,不联网同步
   ========================================================== */
const Store = (function () {
  const KEY = 'cet4_app_v1';
  const VERSION = 1;

  const defaultState = () => ({
    version: VERSION,
    settings: {
      examDate: '',          // 用户手动设置,不写死官方日期
      dailyGoal: 30,
      reviewDay: 0,          // 0=周日
      theme: 'light',
      bgImage: '',
      bgOverlay: 0.55,
      ttsRate: 0.9,
      ai: { baseUrl: '', apiKey: '', model: 'gpt-4o-mini' }
    },
    words: {},               // word -> {status, streak, correct, wrong, lastSeen}
    daily: {},               // 'YYYY-MM-DD' -> {newWords:[], seconds, correct, wrong}
    wrongWords: {},          // word -> 错误次数
    examples: {},            // word -> [{en, cn, source}] 例句缓存
    writings: [],
    listening: { correct: 0, wrong: 0, assisted: 0, total: 0 },
    weekly: {},              // 'YYYY-Www' -> {words:[], done:false}
    study: { lastDate: '', streakDays: 0 }
  });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const d = JSON.parse(raw);
      const base = defaultState();
      // 简单合并,保证新增字段存在
      return Object.assign(base, d, {
        settings: Object.assign(base.settings, d.settings || {}),
        listening: Object.assign(base.listening, d.listening || {}),
        study: Object.assign(base.study, d.study || {})
      });
    } catch (e) {
      console.warn('读取本地数据失败,使用默认值', e);
      return defaultState();
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('保存失败(可能是存储空间不足)', e);
    }
  }

  /* ---------- 日期工具 ---------- */
  function todayStr(d) {
    const t = d || new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const day = String(t.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function dateStr(d) { return todayStr(d); }
  function today() { return todayStr(); }

  // 本周一 00:00
  function weekStart(d) {
    const t = new Date(d || new Date());
    const day = t.getDay(); // 0=周日
    const diff = day === 0 ? 6 : day - 1;
    t.setDate(t.getDate() - diff);
    t.setHours(0, 0, 0, 0);
    return t;
  }
  function weekKey(d) {
    return todayStr(weekStart(d));
  }

  /* ---------- 每日记录 ---------- */
  function daily(date) {
    const k = date || today();
    if (!state.daily[k]) {
      state.daily[k] = { newWords: [], seconds: 0, correct: 0, wrong: 0 };
    }
    return state.daily[k];
  }

  function touchStudyDay() {
    const t = today();
    if (state.study.lastDate === t) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (state.study.lastDate === dateStr(yesterday)) {
      state.study.streakDays += 1;
    } else {
      state.study.streakDays = 1;
    }
    state.study.lastDate = t;
    save();
  }

  /* ---------- 词条状态 ---------- */
  function wordState(word) {
    if (!state.words[word]) {
      state.words[word] = { status: 'new', streak: 0, correct: 0, wrong: 0, lastSeen: 0 };
    }
    return state.words[word];
  }

  /**
   * 记录一次作答
   * @param {string} word 词条
   * @param {boolean} correct 是否正确
   * @param {boolean} assisted 是否查看了答案后作答(不计入连续正确)
   */
  function recordAnswer(word, correct, assisted) {
    const st = wordState(word);
    const d = daily();
    st.lastSeen = Date.now();

    if (correct) {
      d.correct += 1;
      st.correct += 1;
      if (!assisted) {
        st.streak += 1;
        if (st.streak >= 3) st.status = 'mastered';
        else st.status = 'learning';
      }
      // 辅助作答只计入正确数,不改变连续正确
    } else {
      d.wrong += 1;
      st.wrong += 1;
      st.streak = 0;
      st.status = 'learning';
      state.wrongWords[word] = (state.wrongWords[word] || 0) + 1;
    }
    touchStudyDay();
    save();
    return st;
  }

  /** 只记录一次练习作答(不关联词条掌握,用于短语/听力) */
  function recordPractice(correct) {
    const d = daily();
    if (correct) d.correct += 1; else d.wrong += 1;
    touchStudyDay();
    save();
  }

  /** 当天首次学过的不同词条 */
  function addNewWord(word) {
    const d = daily();
    if (!d.newWords.includes(word)) {
      d.newWords.push(word);
      // 加入本周复习池
      const wk = weekKey();
      if (!state.weekly[wk]) state.weekly[wk] = { words: [], done: false };
      if (!state.weekly[wk].words.includes(word)) state.weekly[wk].words.push(word);
    }
    touchStudyDay();
    save();
  }

  function addStudySeconds(sec) {
    if (sec <= 0) return;
    const d = daily();
    d.seconds += Math.round(sec);
    touchStudyDay();
    save();
  }

  /* ---------- 统计 ---------- */
  function stats() {
    const total = window.CET4_DATA ? window.CET4_DATA.meta.count : 2607;
    let mastered = 0, learning = 0, seen = 0;
    for (const w in state.words) {
      seen++;
      if (state.words[w].status === 'mastered') mastered++;
      else if (state.words[w].status === 'learning') learning++;
    }
    let correct = 0, wrong = 0;
    // 单词正确率只统计词条作答(短语/听力不计入)
    for (const w in state.words) {
      correct += state.words[w].correct || 0;
      wrong += state.words[w].wrong || 0;
    }
    const totalAns = correct + wrong;
    return {
      total,
      seen,
      mastered,
      unmastered: total - mastered,
      learning,
      accuracy: totalAns ? Math.round(correct / totalAns * 100) : null,
      todayMinutes: Math.round((daily().seconds || 0) / 60),
      streakDays: state.study.streakDays,
      todayNew: daily().newWords.length
    };
  }

  function wrongTop(n) {
    return Object.entries(state.wrongWords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n || 10);
  }

  /* ---------- 每周复习 ---------- */
  function weeklyInfo() {
    const wk = weekKey();
    const info = state.weekly[wk] || { words: [], done: false };
    return info;
  }
  function markWeeklyDone() {
    const wk = weekKey();
    if (!state.weekly[wk]) state.weekly[wk] = { words: [], done: false };
    state.weekly[wk].done = true;
    save();
  }
  function shouldRemindReview() {
    const info = weeklyInfo();
    const todayDow = new Date().getDay();
    return todayDow === Number(state.settings.reviewDay) &&
      info.words.length > 0 && !info.done;
  }

  /* ---------- 数据导入导出 ---------- */
  function exportData() {
    return JSON.stringify(state, null, 2);
  }
  function importData(text) {
    const d = JSON.parse(text);
    if (!d || !d.settings || !d.daily) throw new Error('文件格式不正确');
    state = Object.assign(defaultState(), d);
    save();
  }
  function clearAll() {
    localStorage.removeItem(KEY);
    state = defaultState();
    save();
  }

  /* ---------- 设置 ---------- */
  function getSettings() { return state.settings; }
  function setSettings(patch) {
    Object.assign(state.settings, patch);
    save();
  }

  return {
    get state() { return state; },
    save, today, daily, wordState,
    recordAnswer, addNewWord, addStudySeconds, recordPractice,
    stats, wrongTop, weeklyInfo, markWeeklyDone, shouldRemindReview,
    exportData, importData, clearAll,
    getSettings, setSettings,
    weekKey
  };
})();
