/* ==========================================================
   tts.js — 语音合成工具
   解决 speechSynthesis 播放不稳定:指定英文语音、取消后延迟播放、
   长文本按句链式播放(前一句结束再播下一句)
   ========================================================== */
const TTS = (function () {
  let voices = [];
  let loaded = false;

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length && !loaded) {
      loaded = true;
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices() || [];
      };
    }
  }

  function pickVoice(lang) {
    if (!voices.length) voices = window.speechSynthesis.getVoices() || [];
    const want = (lang || 'en-US').toLowerCase();
    const en = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    return en.find(v => v.lang.toLowerCase() === want) || en[0] || null;
  }

  function speak(text, opts) {
    opts = opts || {};
    const done = () => { if (opts.onend) opts.onend(); };
    if (!('speechSynthesis' in window) || !text) { done(); return; }
    try {
      window.speechSynthesis.cancel();
      // 取消后立即 speak 在部分浏览器会丢失,延迟一小段时间再播
      setTimeout(() => {
        try {
          const u = new SpeechSynthesisUtterance(String(text));
          u.lang = opts.lang || 'en-US';
          const v = pickVoice(u.lang);
          if (v) u.voice = v;
          u.rate = opts.rate || 0.9;
          u.pitch = 1;
          u.onend = done;
          u.onerror = done;
          window.speechSynthesis.speak(u);
        } catch (e) { done(); }
      }, 60);
    } catch (e) { done(); }
  }

  function splitSentences(text) {
    const parts = String(text).match(/[^.!?]+[.!?]+/g);
    return parts && parts.length ? parts : [String(text)];
  }

  /**
   * 链式播放:数组或长文本(自动按句切分)
   * 前一段结束后才播下一段,避免重叠/打断
   */
  function speakSequence(lines, opts) {
    opts = opts || {};
    const list = Array.isArray(lines) ? lines.slice() : splitSentences(lines);
    let i = 0;
    function next() {
      if (i >= list.length) { if (opts.onend) opts.onend(); return; }
      const line = String(list[i++] || '').trim();
      if (!line) { next(); return; }
      speak(line, {
        rate: opts.rate,
        lang: opts.lang,
        onend: next
      });
    }
    next();
  }

  return { loadVoices, speak, speakSequence, splitSentences };
})();
