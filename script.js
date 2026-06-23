(() => {
  const config = window.SITE_CONFIG;
  if (!config) {
    return;
  }

  const state = {
    lang: localStorage.getItem('rom_lang') || 'ru',
    typewriterDone: false,
    typingSoundEnabled: localStorage.getItem('typing_sound') !== 'off',
    currentTrackIndex: 0,
    isPlaying: localStorage.getItem('music_playing') === 'true',
    phraseIndex: 0,
    typingSoundTime: 0,
    typewriterRunId: 0,
    noAttempts: 0,
    noActivated: false,
    trapDone: false,
    noBtnActsAsYes: false,
    yesTriggered: false,
    noEventLockUntil: 0,
    scareLockUntil: 0,
    lastPuffAt: 0,
    lastNoPointerDownAt: 0,
    selectedPlace: '',
    carouselIndex: 0,
    selectedDate: '',
    selectedTime: '',
    userEntered: false,
    introAnimationRunId: 0
  };

  // Live pointer position, used so the No button can flee away from the cursor.
  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  // Physics state for the No button's smooth "repulsion field" escape.
  // ox/oy = current translate offset from its resting spot; vx/vy = velocity.
  const flee = { raf: 0, vx: 0, vy: 0, ox: 0, oy: 0, scale: 1 };

  const dom = {
    introOverlay: document.getElementById('introOverlay'),
    introTitle: document.getElementById('introTitle'),
    introSubtitle: document.getElementById('introSubtitle'),
    introChecklist: document.getElementById('introChecklist'),
    introButton: document.getElementById('introButton'),
    loadingScreen: document.getElementById('loadingScreen'),
    loadingProgress: document.getElementById('loadingProgress'),
    loadingPhrase: document.getElementById('loadingPhrase'),
    particles: document.getElementById('particles'),
    fancyCursor: document.getElementById('fancyCursor'),
    topControls: document.getElementById('topControls'),
    langRu: document.getElementById('langRu'),
    langEn: document.getElementById('langEn'),
    storySection: document.getElementById('storySection'),
    inviteSection: document.getElementById('inviteSection'),
    placeSection: document.getElementById('placeSection'),
    successSection: document.getElementById('successSection'),
    storyTitle: document.getElementById('storyTitle'),
    storyText: document.getElementById('storyText'),
    typeCursor: document.getElementById('typeCursor'),
    storyProgressFill: document.getElementById('storyProgressFill'),
    continueBtn: document.getElementById('continueBtn'),
    inviteCopy: document.getElementById('inviteCopy'),
    inviteActions: document.getElementById('inviteActions'),
    inviteQuestion: document.getElementById('inviteQuestion'),
    inviteSubtext: document.getElementById('inviteSubtext'),
    noMessage: document.getElementById('noMessage'),
    yesBtn: document.getElementById('yesBtn'),
    noBtn: document.getElementById('noBtn'),
    placeTitle: document.getElementById('placeTitle'),
    placeSubtitle: document.getElementById('placeSubtitle'),
    confirmPlaceBtn: document.getElementById('confirmPlaceBtn'),
    carouselImage: document.getElementById('carouselImage'),
    carouselTitle: document.getElementById('carouselTitle'),
    carouselCaption: document.getElementById('carouselCaption'),
    carouselCounter: document.getElementById('carouselCounter'),
    carouselFrame: document.querySelector('.carousel-frame'),
    carouselDots: document.getElementById('carouselDots'),
    carouselPrev: document.getElementById('carouselPrev'),
    carouselNext: document.getElementById('carouselNext'),
    whenTitle: document.getElementById('whenTitle'),
    dateInput: document.getElementById('dateInput'),
    timeChips: document.getElementById('timeChips'),
    successPlan: document.getElementById('successPlan'),
    surpriseCorner: document.getElementById('surpriseCorner'),
    surpriseTab: document.getElementById('surpriseTab'),
    surpriseTabLabel: document.getElementById('surpriseTabLabel'),
    surpriseTitle: document.getElementById('surpriseTitle'),
    surpriseSub: document.getElementById('surpriseSub'),
    surpriseLink: document.getElementById('surpriseLink'),
    successTitle: document.getElementById('successTitle'),
    successText: document.getElementById('successText'),
    successContact: document.getElementById('successContact'),
    restartBtn: document.getElementById('restartBtn'),
    successBurst: document.getElementById('successBurst'),
    musicPanel: document.getElementById('musicPanel'),
    musicPanelTitle: document.getElementById('musicPanelTitle'),
    trackName: document.getElementById('trackName'),
    musicStatus: document.getElementById('musicStatus'),
    prevTrackBtn: document.getElementById('prevTrackBtn'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    nextTrackBtn: document.getElementById('nextTrackBtn'),
    bgMusic: document.getElementById('bgMusic')
  };

  let typingAudioContext = null;

  function t() {
    return config[state.lang] || config.ru;
  }

  function applyTheme() {
    const root = document.documentElement;
    const theme = config.theme;
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--secondary', theme.secondaryColor);
    root.style.setProperty('--glow', theme.glowColor);
    if (theme.accentSoft) {
      root.style.setProperty('--accent-soft', theme.accentSoft);
    }
    if (theme.textColor) {
      root.style.setProperty('--text', theme.textColor);
    }
  }

  function setLanguage(lang) {
    state.lang = lang === 'en' ? 'en' : 'ru';
    localStorage.setItem('rom_lang', state.lang);
    renderText();
    if (!state.userEntered && !dom.introOverlay.classList.contains('hidden')) {
      runIntroAnimation();
    }
    if (state.typewriterDone) {
      renderStoryInstant();
    } else if (!dom.storySection.hidden) {
      runTypewriter();
    }
  }

  function introButtonLabel(text) {
    const options = text.introButtonOptions || [];
    const index = Math.max(0, Math.min(options.length - 1, Number(text.introButtonDefaultIndex || 0)));
    return options[index] || 'Start';
  }

  function placeOptionsList() {
    return (t().placeOptions || []).map((option) =>
      typeof option === 'string' ? { title: option, image: '', caption: '' } : option
    );
  }

  function renderCarouselDots() {
    const options = placeOptionsList();
    dom.carouselDots.innerHTML = '';
    options.forEach((option, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', option.title || `Option ${index + 1}`);
      dot.addEventListener('click', () => showCarouselItem(index));
      dom.carouselDots.appendChild(dot);
    });
  }

  function showCarouselItem(index, animate = true) {
    const options = placeOptionsList();
    if (!options.length) {
      return;
    }

    const count = options.length;
    state.carouselIndex = ((index % count) + count) % count;
    const item = options[state.carouselIndex];

    state.selectedPlace = item.title || '';

    if (item.image) {
      dom.carouselImage.src = encodeURI(item.image);
      dom.carouselImage.alt = item.title || '';
    }
    dom.carouselTitle.textContent = item.title || '';
    dom.carouselCaption.textContent = item.caption || '';
    dom.carouselCounter.textContent = `${state.carouselIndex + 1} / ${count}`;

    [...dom.carouselDots.children].forEach((dot, i) => {
      dot.classList.toggle('active', i === state.carouselIndex);
      dot.setAttribute('aria-selected', i === state.carouselIndex ? 'true' : 'false');
    });

    if (animate && dom.carouselFrame) {
      dom.carouselFrame.classList.remove('anim');
      void dom.carouselFrame.offsetWidth;
      dom.carouselFrame.classList.add('anim');
    }
  }

  function renderCarousel() {
    renderCarouselDots();
    showCarouselItem(state.carouselIndex, false);
  }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function renderWhenPicker() {
    const text = t();
    dom.whenTitle.textContent = text.whenTitle || '';

    const today = todayISO();
    dom.dateInput.min = today;
    if (!state.selectedDate) {
      state.selectedDate = today;
    }
    dom.dateInput.value = state.selectedDate;

    const options = text.timeOptions || [];
    dom.timeChips.innerHTML = '';
    options.forEach((label) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'time-chip';
      chip.textContent = label;
      chip.setAttribute('aria-pressed', state.selectedTime === label ? 'true' : 'false');
      chip.classList.toggle('active', state.selectedTime === label);
      chip.addEventListener('click', () => {
        // Toggle: clicking the active chip clears it.
        state.selectedTime = state.selectedTime === label ? '' : label;
        [...dom.timeChips.children].forEach((el) => {
          const on = el.textContent === state.selectedTime;
          el.classList.toggle('active', on);
          el.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      });
      dom.timeChips.appendChild(chip);
    });
  }

  function formatSelectedDate() {
    if (!state.selectedDate) {
      return '';
    }
    const [y, m, d] = state.selectedDate.split('-').map(Number);
    if (!y || !m || !d) {
      return '';
    }
    const date = new Date(y, m - 1, d);
    const locale = state.lang === 'ru' ? 'ru-RU' : 'en-US';
    return date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function buildWhenText() {
    return [formatSelectedDate(), state.selectedTime].filter(Boolean).join(' · ');
  }

  function renderText() {
    const text = t();
    document.documentElement.lang = state.lang;
    dom.langRu.classList.toggle('active', state.lang === 'ru');
    dom.langEn.classList.toggle('active', state.lang === 'en');

    if (state.userEntered) {
      dom.introTitle.textContent = text.introTitle;
      dom.introSubtitle.textContent = text.introSubtitle;
      dom.introChecklist.innerHTML = (text.introChecklist || [])
        .map((item) => `<p>${escapeHtml(item)}</p>`)
        .join('');
    } else {
      dom.introTitle.textContent = '';
      dom.introSubtitle.textContent = '';
      dom.introChecklist.innerHTML = '';
    }
    dom.introButton.textContent = introButtonLabel(text);

    dom.storyTitle.textContent = text.storyTitle;
    dom.continueBtn.textContent = text.continueButton;

    dom.inviteQuestion.textContent = text.inviteQuestion;
    dom.inviteSubtext.textContent = text.inviteSubtext;
    dom.yesBtn.textContent = text.yesButton;
    dom.noBtn.textContent = text.noButton;

    dom.placeTitle.textContent = text.placeTitle;
    dom.placeSubtitle.textContent = text.placeSubtitle;
    dom.confirmPlaceBtn.textContent = text.placeConfirm;

    dom.successTitle.textContent = text.successTitle;
    dom.successText.textContent = text.successText;
    dom.successContact.textContent = text.successContact || '';
    dom.restartBtn.textContent = text.successButton;

    dom.musicPanelTitle.textContent = text.musicPanelTitle;

    if (dom.surpriseTabLabel) {
      dom.surpriseTabLabel.textContent = text.surpriseTabLabel || '🎁';
      dom.surpriseTitle.textContent = text.surpriseTitle || '';
      dom.surpriseSub.textContent = text.surpriseSub || '';
      dom.surpriseLink.textContent = text.surpriseLink || '';
    }

    updatePlayPauseLabel();
    renderCarousel();
    renderWhenPicker();
  }

  function updatePlayPauseLabel() {
    const text = t();
    // Show the action the button performs: pause icon while playing, play icon while paused.
    const label = state.isPlaying ? text.play : text.pause;
    dom.playPauseBtn.textContent = state.isPlaying ? '⏸' : '⏵';
    dom.playPauseBtn.title = label;
    dom.playPauseBtn.setAttribute('aria-label', label);
  }

  function rotateLoadingPhrases() {
    const phrases = t().loadingPhrases;
    dom.loadingPhrase.textContent = phrases[state.phraseIndex % phrases.length];
    state.phraseIndex += 1;
  }

  function runLoading() {
    dom.loadingScreen.classList.remove('hidden');
    const duration = Math.max(1200, Number(config.theme.loadingDuration) || 3200);
    const phraseDelay = Math.max(700, Number(config.theme.loadingPhraseDelay) || 900);
    const start = performance.now();

    rotateLoadingPhrases();
    const phraseTicker = setInterval(rotateLoadingPhrases, phraseDelay);

    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      dom.loadingProgress.style.width = `${Math.round(p * 100)}%`;
      if (p < 1) {
        requestAnimationFrame(tick);
        return;
      }

      clearInterval(phraseTicker);
      dom.loadingScreen.classList.add('hidden');
      setTimeout(() => {
        dom.loadingScreen.setAttribute('aria-hidden', 'true');
        runTypewriter();
      }, 820);
    }

    requestAnimationFrame(tick);
  }

  function animateIntroText(element, text, runId, speed, onDone) {
    element.textContent = '';
    let index = 0;

    function step() {
      if (state.introAnimationRunId !== runId || state.userEntered) {
        return;
      }

      if (index >= text.length) {
        if (typeof onDone === 'function') {
          onDone();
        }
        return;
      }

      const char = text[index];
      element.textContent += char;
      maybeTypeSound(char);
      index += 1;
      setTimeout(step, char === ' ' ? Math.max(16, speed * 0.45) : speed);
    }

    step();
  }

  function revealIntroItem(node) {
    node.style.opacity = '0';
    node.style.transform = 'translateY(10px)';
    requestAnimationFrame(() => {
      node.style.opacity = '1';
      node.style.transform = 'translateY(0)';
    });
  }

  function runIntroAnimation() {
    const text = t();
    const runId = Date.now();
    state.introAnimationRunId = runId;

    dom.introSubtitle.textContent = '';
    dom.introTitle.textContent = '';
    dom.introChecklist.innerHTML = '';
    dom.introButton.textContent = introButtonLabel(text);
    dom.introButton.style.opacity = '0';
    dom.introButton.style.transform = 'translateY(10px)';

    animateIntroText(dom.introSubtitle, text.introSubtitle || '', runId, 18, () => {
      setTimeout(() => {
        animateIntroText(dom.introTitle, text.introTitle || '', runId, 24, () => {
          const checklist = text.introChecklist || [];

          function revealChecklist(index) {
            if (state.introAnimationRunId !== runId || state.userEntered) {
              return;
            }

            if (index >= checklist.length) {
              revealIntroItem(dom.introButton);
              return;
            }

            const line = document.createElement('p');
            line.textContent = checklist[index];
            dom.introChecklist.appendChild(line);
            maybeTypeSound(' ');
            revealIntroItem(line);
            setTimeout(() => revealChecklist(index + 1), 130);
          }

          revealChecklist(0);
        });
      }, 70);
    });
  }

  function renderStoryInstant() {
    const html = t().storyParagraphs
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join('');
    dom.storyText.innerHTML = html;
    dom.storyProgressFill.style.width = '100%';
    dom.typeCursor.style.display = 'none';
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function getTypingAudioContext() {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }

    if (!typingAudioContext) {
      typingAudioContext = new AudioContextCtor();
    }

    return typingAudioContext;
  }

  function unlockTypingAudio() {
    const ctx = getTypingAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        // Silent fallback if the browser still blocks audio.
      });
    }
  }

  function typingTone(char) {
    if (char === ' ' || char === '\n') {
      return { frequency: 410, duration: 0.018, gain: 0.011, type: 'triangle' };
    }
    if (/[,.;:!?()"'\-…]/.test(char)) {
      return { frequency: 520, duration: 0.022, gain: 0.014, type: 'square' };
    }
    if (/[aeiouyаеёиоуыэюя]/i.test(char)) {
      return { frequency: 710, duration: 0.018, gain: 0.012, type: 'triangle' };
    }
    return { frequency: 620, duration: 0.016, gain: 0.01, type: 'square' };
  }

  function playTypingSynth(char) {
    const ctx = getTypingAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    const volume = Math.min(0.035, Math.max(0.004, (Number(config.audio.typingVolume) || 0.2) * 0.08));
    const tone = typingTone(char);
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(110, tone.frequency * 0.94), now + tone.duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(tone.frequency * 1.8, now);
    filter.Q.setValueAtTime(0.7, now);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(tone.gain * volume, now + 0.003);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + tone.duration + 0.01);
  }

  function maybeTypeSound(char) {
    if (!state.typingSoundEnabled) {
      return;
    }
    const throttle = Math.max(38, Number(config.audio.typingThrottle) || 100);
    const now = performance.now();
    if (now - state.typingSoundTime < throttle) {
      return;
    }
    state.typingSoundTime = now;
    playTypingSynth(char);
  }

  function runTypewriter() {
    const runId = Date.now();
    state.typewriterRunId = runId;
    state.typewriterDone = false;
    dom.typeCursor.style.display = 'inline';
    dom.storyText.innerHTML = '';
    dom.storyProgressFill.style.width = '0%';

    const paragraphs = t().storyParagraphs;
    const full = paragraphs.join('\n');
    const total = full.length || 1;
    let done = 0;
    let pIndex = 0;
    let cIndex = 0;
    let currentP = document.createElement('p');
    dom.storyText.appendChild(currentP);

    function step() {
      if (state.typewriterRunId !== runId) {
        return;
      }

      if (pIndex >= paragraphs.length) {
        state.typewriterDone = true;
        dom.typeCursor.style.display = 'none';
        return;
      }

      const paragraph = paragraphs[pIndex];
      if (cIndex < paragraph.length) {
        const char = paragraph[cIndex];
        currentP.textContent += char;
        cIndex += 1;
        done += 1;
        dom.storyProgressFill.style.width = `${Math.min(100, Math.round((done / total) * 100))}%`;
        maybeTypeSound(char);
        setTimeout(step, Math.max(32, Number(config.theme.typingSpeed) || 60));
        return;
      }

      pIndex += 1;
      cIndex = 0;
      done += 1;
      dom.storyProgressFill.style.width = `${Math.min(100, Math.round((done / total) * 100))}%`;
      if (pIndex < paragraphs.length) {
        currentP = document.createElement('p');
        dom.storyText.appendChild(currentP);
      } else {
        state.typewriterDone = true;
        dom.typeCursor.style.display = 'none';
      }
      setTimeout(step, Math.max(140, Number(config.theme.paragraphDelay) || 260));
    }

    step();
  }

  function activateScreen(target) {
    [dom.storySection, dom.inviteSection, dom.placeSection, dom.successSection].forEach((section) => {
      const active = section === target;
      section.hidden = !active;
      section.classList.toggle('active', active);
    });

    // The bottom-left surprise only lives on the success screen.
    if (dom.surpriseCorner) {
      const onSuccess = target === dom.successSection;
      dom.surpriseCorner.hidden = !onSuccess;
      if (!onSuccess) {
        dom.surpriseCorner.classList.remove('open');
      }
    }
  }

  function showTaunt(message) {
    dom.noMessage.textContent = message;
    dom.noMessage.classList.remove('show');
    void dom.noMessage.offsetWidth;
    dom.noMessage.classList.add('show');
  }

  function randomTaunt() {
    const list = t().noMessages || [];
    return list[Math.floor(Math.random() * list.length)] || '';
  }

  // ── No-button "frightened goat" escape helpers ─────────

  function updateNoBtnLabel() {
    const labels = t().noButtonLabels;
    if (!labels || !labels.length) {
      return;
    }
    const idx = Math.max(0, Math.min(state.noAttempts - 1, labels.length - 1));
    dom.noBtn.textContent = labels[idx];
  }

  function pressureYes() {
    const scale = Math.min(1.14, 1 + state.noAttempts * 0.014);
    const glow = Math.min(0.88, 0.28 + state.noAttempts * 0.06);
    dom.yesBtn.style.transform = `scale(${scale.toFixed(3)})`;
    dom.yesBtn.style.boxShadow = `0 0 ${Math.round(14 + state.noAttempts * 4)}px rgba(255, 80, 154, ${glow.toFixed(2)})`;
  }

  function spawnEscapePuff(cx, cy) {
    const count = 6;
    for (let i = 0; i < count; i += 1) {
      const el = document.createElement('span');
      el.className = 'escape-puff';
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const spread = 18 + Math.random() * 16;
      el.style.left = `${Math.round(cx)}px`;
      el.style.top = `${Math.round(cy)}px`;
      el.style.setProperty('--dx', `${Math.round(Math.cos(angle) * spread)}px`);
      el.style.setProperty('--dy', `${Math.round(Math.sin(angle) * spread)}px`);
      el.style.animationDelay = `${(Math.random() * 0.06).toFixed(2)}s`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 620);
    }
  }

  function executeTrap() {
    showTaunt(t().trapMessage);
    stopFleeLoop();
    flee.scale = 1;

    // Slide the button smoothly on top of Yes via a one-off transform tween.
    const rect = dom.noBtn.getBoundingClientRect();
    const yesRect = dom.yesBtn.getBoundingClientRect();
    const homeLeft = rect.left - flee.ox;
    const homeTop = rect.top - flee.oy;
    flee.ox = yesRect.left - homeLeft;
    flee.oy = yesRect.top - homeTop;

    dom.noBtn.style.transition = 'transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)';
    applyNoTransform();
    dom.noBtn.classList.add('armed');

    setTimeout(() => {
      dom.noBtn.classList.add('trap-armed');
      dom.yesBtn.classList.add('armed');
      state.noBtnActsAsYes = true;
      showTaunt(t().yesNowMessage || '');
    }, 1200);
  }

  // The payoff: the trapped "No" (sitting on top of Yes) is clicked — so "No"
  // pops out of existence and "Yes" plays its pressed animation, as if you
  // pressed Yes all along. Then we continue into the place picker.
  function triggerYesFromTrap() {
    if (state.yesTriggered) {
      return;
    }
    state.yesTriggered = true;

    // "No" shrinks into the Yes button and fades away.
    dom.noBtn.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    dom.noBtn.style.transform = `translate3d(${flee.ox.toFixed(2)}px, ${flee.oy.toFixed(2)}px, 0) scale(0.2)`;
    dom.noBtn.style.opacity = '0';
    dom.noBtn.style.pointerEvents = 'none';
    dom.noBtn.classList.remove('trap-armed');

    // "Yes" gets its satisfying click/press animation.
    dom.yesBtn.classList.remove('armed');
    dom.yesBtn.style.transform = '';
    dom.yesBtn.style.boxShadow = '';
    void dom.yesBtn.offsetWidth;
    dom.yesBtn.classList.add('yes-pressed');

    dom.noMessage.classList.remove('show');

    setTimeout(() => openPlaceFlow(), 470);
  }

  function getViewportSize() {
    const docEl = document.documentElement;
    let width = Math.max(window.innerWidth || 0, docEl.clientWidth || 0);
    let height = Math.max(window.innerHeight || 0, docEl.clientHeight || 0);
    // Guard against broken/embedded contexts that report an absurd size, so the
    // playable bounds are always sane and the button never lands off-screen.
    if (width < 240) {
      width = 360;
    }
    if (height < 240) {
      height = 640;
    }
    return { width: Math.round(width), height: Math.round(height) };
  }

  function getVisibleRect(el) {
    if (!el || el.hidden) {
      return null;
    }

    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return null;
    }

    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    return rect;
  }

  function getSafeRects() {
    const fixedBlocks = [dom.topControls, dom.musicPanel, dom.inviteCopy]
      .map(getVisibleRect)
      .filter(Boolean);

    const otherButtons = [...document.querySelectorAll('button')]
      .filter((btn) => btn !== dom.noBtn)
      .map(getVisibleRect)
      .filter(Boolean);

    return [...fixedBlocks, ...otherButtons];
  }

  function pxFromCm(cm) {
    return (96 / 2.54) * cm;
  }

  function getNoMovementBounds(width, height) {
    const { width: viewportWidth, height: viewportHeight } = getViewportSize();
    const edgePadding = Math.max(18, Math.round(pxFromCm(1.2)));
    const topControlsRect = getVisibleRect(dom.topControls);
    const musicRect = getVisibleRect(dom.musicPanel);
    const left = edgePadding;
    const right = Math.max(left, viewportWidth - width - edgePadding);
    const top = Math.max(edgePadding, Math.round((topControlsRect ? topControlsRect.bottom : 0) + 18));
    const maxBottom = viewportHeight - height - edgePadding;
    const bottom = Math.max(top, Math.min(maxBottom, musicRect ? musicRect.top - height - 16 : maxBottom));

    return { left, right, top, bottom };
  }

  function rectOverlapArea(x, y, width, height, rect) {
    const overlapWidth = Math.max(0, Math.min(x + width, rect.right) - Math.max(x, rect.left));
    const overlapHeight = Math.max(0, Math.min(y + height, rect.bottom) - Math.max(y, rect.top));
    return overlapWidth * overlapHeight;
  }

  function syncNoButtonScale() {
    const minScale = Math.max(0.7, Number(config.interactions.noMinScale) || 0.78);
    flee.scale = Math.max(minScale, 1 - state.noAttempts * 0.012);
    applyNoTransform();
  }

  function applyNoTransform() {
    dom.noBtn.style.transform =
      `translate3d(${flee.ox.toFixed(2)}px, ${flee.oy.toFixed(2)}px, 0) scale(${flee.scale.toFixed(3)})`;
  }

  // Throttled "scare": advance the taunt + attempt counter while being chased,
  // and spring the trap once the threshold is reached. `force` bypasses the
  // cooldown for a deliberate tap/click.
  function maybeScare(force) {
    const now = performance.now();
    if (!force && now < state.scareLockUntil) {
      return;
    }
    state.scareLockUntil = now + 750;

    state.noAttempts += 1;
    syncNoButtonScale();

    if (!state.trapDone && state.noAttempts >= (Number(config.interactions.noTrapAttempt) || 6)) {
      state.trapDone = true;
      executeTrap();
      return;
    }

    updateNoBtnLabel();
    pressureYes();
    showTaunt(randomTaunt());
  }

  // One frame of the repulsion field: glide smoothly *away* from the cursor
  // (cursor below ⇒ button drifts up, cursor on the left ⇒ it slides right,
  // etc.), easing gently back to its resting spot when the cursor leaves, and
  // always clamped so the whole button stays on-screen.
  function updateFlee() {
    if (state.trapDone || state.noBtnActsAsYes || dom.inviteSection.hidden) {
      return;
    }

    const rect = dom.noBtn.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const homeLeft = rect.left - flee.ox;
    const homeTop = rect.top - flee.oy;
    const cx = rect.left + w / 2;
    const cy = rect.top + h / 2;

    let dx = cx - pointer.x;
    let dy = cy - pointer.y;
    let dist = Math.hypot(dx, dy);
    if (dist < 0.001) {
      dx = Math.random() - 0.5;
      dy = Math.random() - 0.5;
      dist = Math.hypot(dx, dy) || 1;
    }

    const radius = 175;
    if (dist < radius) {
      // The closer the cursor, the stronger the shove — straight away from it.
      const force = 1.9 * Math.pow(1 - dist / radius, 1.3);
      flee.vx += (dx / dist) * force;
      flee.vy += (dy / dist) * force;
      maybeScare(false);
    } else {
      // Cursor is far: drift gently back toward the resting spot.
      flee.vx += -flee.ox * 0.012;
      flee.vy += -flee.oy * 0.012;
    }

    flee.vx *= 0.86;
    flee.vy *= 0.86;
    flee.ox += flee.vx;
    flee.oy += flee.vy;

    // Hard clamp so the whole button can never leave the screen.
    const bounds = getNoMovementBounds(Math.round(w), Math.round(h));
    let absLeft = homeLeft + flee.ox;
    let absTop = homeTop + flee.oy;
    if (absLeft < bounds.left) { absLeft = bounds.left; flee.vx = 0; }
    else if (absLeft > bounds.right) { absLeft = bounds.right; flee.vx = 0; }
    if (absTop < bounds.top) { absTop = bounds.top; flee.vy = 0; }
    else if (absTop > bounds.bottom) { absTop = bounds.bottom; flee.vy = 0; }
    flee.ox = absLeft - homeLeft;
    flee.oy = absTop - homeTop;

    applyNoTransform();
  }

  function startFleeLoop() {
    if (flee.raf) {
      return;
    }
    flee.vx = 0;
    flee.vy = 0;
    flee.ox = 0;
    flee.oy = 0;
    flee.scale = 1;
    dom.noBtn.classList.add('no-fleeing');
    dom.noBtn.style.transition = 'none';
    applyNoTransform();
    const tick = () => {
      flee.raf = requestAnimationFrame(tick);
      updateFlee();
    };
    flee.raf = requestAnimationFrame(tick);
  }

  function stopFleeLoop() {
    if (flee.raf) {
      cancelAnimationFrame(flee.raf);
      flee.raf = 0;
    }
  }

  // A direct shove for touch taps / a lucky catch: push away from the touch
  // point so it still darts on touchscreens (which fire no mousemove).
  function impulseAway(px, py) {
    const rect = dom.noBtn.getBoundingClientRect();
    let dx = (rect.left + rect.width / 2) - px;
    let dy = (rect.top + rect.height / 2) - py;
    let dist = Math.hypot(dx, dy);
    if (dist < 0.001) {
      dx = Math.random() - 0.5;
      dy = Math.random() - 0.5;
      dist = Math.hypot(dx, dy) || 1;
    }
    flee.vx += (dx / dist) * 17;
    flee.vy += (dy / dist) * 17;
  }

  function spawnBurst() {
    dom.successBurst.innerHTML = '';
    const symbols = ['❤', '♡', '✦', '✧'];
    for (let i = 0; i < 22; i += 1) {
      const node = document.createElement('span');
      node.className = 'spark';
      node.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      node.style.left = `${50 + (Math.random() * 16 - 8)}%`;
      node.style.top = '52%';
      node.style.setProperty('--x', `${Math.round(Math.random() * 260 - 130)}px`);
      node.style.setProperty('--y', `${Math.round(Math.random() * 220 - 170)}px`);
      dom.successBurst.appendChild(node);
    }
  }

  function openPlaceFlow() {
    stopFleeLoop();
    activateScreen(dom.placeSection);
    state.carouselIndex = 0;
    showCarouselItem(0, false);
    dom.confirmPlaceBtn.disabled = false;
  }

  function resetInviteState() {
    stopFleeLoop();
    flee.vx = 0;
    flee.vy = 0;
    flee.ox = 0;
    flee.oy = 0;
    flee.scale = 1;
    state.noAttempts = 0;
    state.noActivated = false;
    state.trapDone = false;
    state.noBtnActsAsYes = false;
    state.yesTriggered = false;
    state.noEventLockUntil = 0;
    state.scareLockUntil = 0;
    state.lastPuffAt = 0;
    dom.noMessage.textContent = '';
    dom.noMessage.classList.remove('show');
    dom.noBtn.classList.remove('no-fleeing', 'armed', 'trap-armed');
    dom.noBtn.removeAttribute('style');
    dom.noBtn.textContent = t().noButton;
    dom.yesBtn.classList.remove('armed', 'yes-pressed');
    dom.yesBtn.style.transform = '';
    dom.yesBtn.style.boxShadow = '';
    dom.inviteActions.appendChild(dom.noBtn);
  }

  function createParticleNode() {
    const p = document.createElement('span');
    p.className = 'particle';
    const sizeMin = Number(config.particles.sizeMin) || 10;
    const sizeMax = Number(config.particles.sizeMax) || 24;
    const speedMin = Number(config.particles.speedMin) || 10;
    const speedMax = Number(config.particles.speedMax) || 18;

    const size = sizeMin + Math.random() * Math.max(1, sizeMax - sizeMin);
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${70 + Math.random() * 32}%`;
    p.style.animationDuration = `${speedMin + Math.random() * Math.max(1, speedMax - speedMin)}s`;
    p.style.animationDelay = `${Math.random() * 8}s`;
    p.style.filter = `hue-rotate(${Math.round(Math.random() * 26 - 8)}deg) saturate(${(0.9 + Math.random() * 0.35).toFixed(2)}) drop-shadow(0 0 12px rgba(255, 120, 182, 0.26))`;

    if (config.particles.popEnabled) {
      p.addEventListener('pointerdown', () => {
        spawnParticleBurst(p);
        p.classList.add('pop');
        setTimeout(() => {
          if (p.parentNode) {
            p.remove();
            dom.particles.appendChild(createParticleNode());
          }
        }, 260);
      });
    }

    return p;
  }

  function spawnParticleBurst(particle) {
    const burst = document.createElement('span');
    burst.className = 'particle-burst';
    for (let i = 0; i < 8; i += 1) {
      const splash = document.createElement('span');
      splash.className = 'particle-splash';
      splash.style.setProperty('--x', `${Math.round(Math.random() * 72 - 36)}px`);
      splash.style.setProperty('--y', `${Math.round(Math.random() * 72 - 36)}px`);
      splash.style.animationDelay = `${(Math.random() * 0.08).toFixed(2)}s`;
      burst.appendChild(splash);
    }
    particle.appendChild(burst);
  }

  function initParticles() {
    dom.particles.innerHTML = '';
    if (!config.theme.showParticles) {
      return;
    }

    const total = Math.max(8, Number(config.particles.count) || 20);
    for (let i = 0; i < total; i += 1) {
      dom.particles.appendChild(createParticleNode());
    }
  }

  function setupCursor() {
    const enabled = config.theme.customCursor && !window.matchMedia('(pointer: coarse)').matches;
    if (!enabled) {
      dom.fancyCursor.classList.remove('active', 'hovering');
      document.body.classList.remove('cursor-enabled');
      document.documentElement.classList.remove('cursor-enabled');
      return;
    }

    document.body.classList.add('cursor-enabled');
    document.documentElement.classList.add('cursor-enabled');

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let cursorRAF = 0;

    const hideCursor = () => {
      dom.fancyCursor.classList.remove('active', 'hovering');
    };

    const renderCursor = () => {
      dom.fancyCursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      cursorRAF = 0;
    };

    document.addEventListener('pointermove', (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      dom.fancyCursor.classList.add('active');
      if (!cursorRAF) {
        cursorRAF = requestAnimationFrame(renderCursor);
      }
    }, { passive: true });

    document.addEventListener('pointerdown', () => {
      unlockTypingAudio();
    }, { passive: true });

    document.addEventListener('pointerover', (event) => {
      const hoverable = event.target instanceof Element
        ? event.target.closest('button, .place-option, .lang-btn, .chip-btn, .icon-btn')
        : null;
      dom.fancyCursor.classList.toggle('hovering', Boolean(hoverable));
    });

    document.addEventListener('pointerleave', hideCursor);
    window.addEventListener('blur', hideCursor);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hideCursor();
      }
    });
  }

  function normalizeTrack(entry) {
    if (typeof entry === 'string') {
      return { file: entry, title: entry.replace(/\.[^.]+$/, '') };
    }
    return { file: entry.file || '', title: entry.title || entry.file || '' };
  }

  function getTrackEntry(index) {
    const list = config.audio.playlist;
    const safeIndex = ((index % list.length) + list.length) % list.length;
    state.currentTrackIndex = safeIndex;
    localStorage.setItem('music_index', String(safeIndex));
    return normalizeTrack(list[safeIndex]);
  }

  function setTrack(index) {
    if (!config.audio.playlist.length) {
      dom.trackName.textContent = '-';
      return;
    }
    const entry = getTrackEntry(index);
    // encodeURI keeps the path readable but safely escapes spaces/specials.
    dom.bgMusic.src = encodeURI(`${config.audio.musicPath}${entry.file}`);
    dom.trackName.textContent = entry.title;
  }

  function playMusic() {
    if (!config.audio.playlist.length) {
      return Promise.resolve();
    }

    updatePlayPauseLabel();
    return dom.bgMusic.play().then(() => {
      state.isPlaying = true;
      localStorage.setItem('music_playing', 'true');
      updatePlayPauseLabel();
    }).catch(() => {
      state.isPlaying = false;
      localStorage.setItem('music_playing', 'false');
      updatePlayPauseLabel();
    });
  }

  function pauseMusic() {
    dom.bgMusic.pause();
    state.isPlaying = false;
    localStorage.setItem('music_playing', 'false');
    updatePlayPauseLabel();
  }

  function nextTrack() {
    setTrack(state.currentTrackIndex + 1);
    if (state.isPlaying) {
      playMusic();
    }
  }

  function prevTrack() {
    setTrack(state.currentTrackIndex - 1);
    if (state.isPlaying) {
      playMusic();
    }
  }

  function setupAudio() {
    dom.bgMusic.volume = Math.min(1, Math.max(0, Number(config.audio.defaultMusicVolume) || 0.42));
    dom.bgMusic.loop = false;

    if (!config.audio.playlist.length) {
      dom.trackName.textContent = '-';
      return;
    }

    setTrack(state.currentTrackIndex);

    dom.bgMusic.addEventListener('ended', nextTrack);
    dom.bgMusic.addEventListener('error', () => {
      dom.musicStatus.textContent = t().trackError;
      nextTrack();
    });

    // Keep the play/pause icon in sync if playback changes from anywhere else.
    dom.bgMusic.addEventListener('play', () => {
      state.isPlaying = true;
      updatePlayPauseLabel();
    });
    dom.bgMusic.addEventListener('pause', () => {
      state.isPlaying = false;
      updatePlayPauseLabel();
    });
  }

  function tryAutoplayMusic() {
    if (!config.audio.autoplayMusic) {
      return;
    }

    playMusic();
  }

  function notifySelection(payload) {
    const endpoint = (config.notifications && config.notifications.notifyEndpoint) || '';
    if (!endpoint) {
      return Promise.resolve();
    }

    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
      // Silent by design for static mode.
    });
  }

  function openTelegramWithSelection() {
    const tele = config.telegram || {};
    const username = String(tele.telegramUsername || '').replace('@', '').trim();
    if (!username) {
      return;
    }

    const baseText = state.lang === 'ru' ? (tele.telegramPrefilledTextRu || '') : (tele.telegramPrefilledTextEn || '');
    const placeLabel = state.selectedPlace ? `\n${state.selectedPlace}` : '';
    const whenText = buildWhenText();
    const whenLabel = whenText ? `\n${whenText}` : '';
    const text = `${baseText}${placeLabel}${whenLabel}`.trim();
    const url = `https://t.me/${username}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handlePlaceConfirm() {
    const whenText = buildWhenText();
    const planParts = [state.selectedPlace, whenText].filter(Boolean).join(' · ');
    dom.successPlan.textContent = planParts ? `${t().successPlanLabel || ''} ${planParts}`.trim() : '';

    const payload = {
      language: state.lang,
      timestamp: new Date().toISOString(),
      selectedPlace: state.selectedPlace,
      selectedDate: state.selectedDate,
      selectedTime: state.selectedTime,
      yesClicked: true
    };

    notifySelection(payload).finally(() => {
      openTelegramWithSelection();
      activateScreen(dom.successSection);
      spawnBurst();
    });
  }

  function handleIntroEnter() {
    if (state.userEntered) {
      return;
    }
    state.userEntered = true;
    unlockTypingAudio();

    dom.introOverlay.classList.add('hidden');
    playMusic().finally(() => {
      setTimeout(() => runLoading(), 380);
    });
  }

  function bindEvents() {
    dom.introButton.addEventListener('click', handleIntroEnter);

    dom.langRu.addEventListener('click', () => setLanguage('ru'));
    dom.langEn.addEventListener('click', () => setLanguage('en'));

    dom.continueBtn.addEventListener('click', () => {
      activateScreen(dom.inviteSection);
      resetInviteState();
      startFleeLoop();
    });

    dom.yesBtn.addEventListener('click', () => {
      openPlaceFlow();
    });

    // Touch tap / a lucky catch: shove it away from the touch point and count it.
    dom.noBtn.addEventListener('pointerdown', (event) => {
      if (state.noBtnActsAsYes) {
        return;
      }
      state.lastNoPointerDownAt = performance.now();
      event.preventDefault();
      event.stopPropagation();
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      impulseAway(event.clientX, event.clientY);
      maybeScare(true);
    }, { passive: false });

    dom.noBtn.addEventListener('click', (event) => {
      if (state.noBtnActsAsYes) {
        // The trap is set: "No" vanishes and "Yes" gets pressed.
        triggerYesFromTrap();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      // Ignore the synthetic click that follows a pointerdown we already handled.
      if (event.detail > 0 && performance.now() - state.lastNoPointerDownAt < 420) {
        return;
      }
      impulseAway(event.clientX || pointer.x, event.clientY || pointer.y);
      maybeScare(true);
    }, { passive: false });

    // Cursor tracking — the smooth repulsion loop (updateFlee) reads this every
    // frame and glides the button away from wherever the cursor is.
    document.addEventListener('mousemove', (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }, { passive: true });

    // Surprise gift: hover already reveals it (CSS); a click locks it open so
    // she can scan the QR without holding the cursor in place.
    if (dom.surpriseTab) {
      dom.surpriseTab.addEventListener('click', () => {
        dom.surpriseCorner.classList.toggle('open');
      });
    }

    dom.carouselPrev.addEventListener('click', () => showCarouselItem(state.carouselIndex - 1));
    dom.carouselNext.addEventListener('click', () => showCarouselItem(state.carouselIndex + 1));

    dom.dateInput.addEventListener('change', () => {
      state.selectedDate = dom.dateInput.value;
    });

    dom.confirmPlaceBtn.addEventListener('click', handlePlaceConfirm);

    dom.restartBtn.addEventListener('click', () => {
      activateScreen(dom.storySection);
      runTypewriter();
      resetInviteState();
    });

    dom.prevTrackBtn.addEventListener('click', prevTrack);
    dom.nextTrackBtn.addEventListener('click', nextTrack);

    dom.playPauseBtn.addEventListener('click', () => {
      if (state.isPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    });

    window.addEventListener('resize', () => {
      initParticles();
      // The flee loop re-clamps the No button to the new viewport every frame.
    });
  }

  function init() {
    applyTheme();
    renderText();
    runIntroAnimation();
    setupAudio();
    initParticles();
    setupCursor();
    bindEvents();
    activateScreen(dom.storySection);
    dom.loadingScreen.classList.remove('hidden');
    dom.loadingScreen.setAttribute('aria-hidden', 'false');
  }

  init();
})();
