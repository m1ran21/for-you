// Central editable content/theme config for the whole micro-site.
window.SITE_CONFIG = {
  theme: {
    // Light, cute anime palette
    primaryColor: '#ff6fae',
    secondaryColor: '#fef6ff',
    glowColor: '#7cc8ff',
    accentSoft: '#ffd2ea',
    textColor: '#46324f',
    typingSpeed: 46,
    paragraphDelay: 240,
    loadingDuration: 3200,
    loadingPhraseDelay: 1100,
    showParticles: true,
    customCursor: true
  },
  particles: {
    count: 18,
    speedMin: 11,
    speedMax: 20,
    sizeMin: 14,
    sizeMax: 30,
    popEnabled: true
  },
  audio: {
    musicPath: './Music/',
    typingPath: './assets/audio/',
    playlist: [
      { file: 'numb.mp3', title: 'Numb — Linkin Park' },
      { file: 'oscar-winning-tears.mp3', title: 'Raye — Oscar Winning Tears' },
      { file: 'golden-hour.mp3', title: 'JVKE — golden hour' },
      { file: 'shut-up-my-moms-calling.mp3', title: "Hotel Ugly — Shut up My Mom's Calling" }
    ],
    defaultMusicVolume: 0.42,
    autoplayMusic: true,
    typingVolume: 0.26,
    typingThrottle: 55,
    typingSoundVariants: ['typing1.mp3', 'typing2.mp3', 'typing3.mp3'],
    typingSpaceSound: 'typing_space.mp3',
    typingEnterSound: 'typing_enter.mp3'
  },
  interactions: {
    noTrapAttempt: 10,
    noMinScale: 0.7
  },
  telegram: {
    telegramUsername: 'm1ran21',
    telegramPrefilledTextRu: 'Привет! Я выбрала:',
    telegramPrefilledTextEn: 'Hi! I picked:'
  },
  notifications: {
    notifyEndpoint: ''
  },
  ru: {
    introTitle: 'Маленькая миссия для тебя ✨',
    introSubtitle: 'эй... сюда 👀',
    introChecklist: [
      'Надень наушники 🎧',
      'Нажми F11 для полного экрана ⛶',
      'Включи музыку кнопкой в правом нижнем углу 🎵'
    ],
    introButtonOptions: [
      'Поехали! 🚀',
      'Запускай ✨',
      'Открыть',
      'Жми сюда 👉',
      'Начнём'
    ],
    introButtonDefaultIndex: 0,
    loadingPhrases: [
      'Заряжаем смелость... 🥹',
      'Рисуем что-то милое... 🎨',
      'Включаем энергию главного героя... ⚡',
      'Почти готово! ✨'
    ],
    storyTitle: 'Короткая записка 📝',
    storyParagraphs: [
      'Создатель этого сайта очень переживает, что вы забыли про своё обещание и, судя по всему, никак не хотите его вспоминать.',
      'Поэтому он создал целый сайт, чтобы ещё раз официально кое-что у вас спросить:'
    ],
    continueButton: 'Так, дальше →',
    typingSoundToggleOn: 'Звук печати: Вкл',
    typingSoundToggleOff: 'Звук печати: Выкл',
    inviteQuestion: 'Погуляешь со мной? 🌸',
    inviteSubtext: 'Выбери приключение. Шоколад и чипсы от меня)',
    yesButton: 'Да! 💖',
    noButton: 'Нет',
    noMessages: [
      'Не-а, меня не поймать~ 🏃‍♀️💨',
      'Неплохая попытка! 😜',
      'Сюрприз: кнопка стесняется 🙈',
      'Error 404: «Нет» не найдено',
      'Поверьте, сказать «да» легче, чем вы думаете ✨',
      'Эй, всё же хорошо начиналось 🥺',
      'Слишком медленно~ 😝',
      'Кнопка не согласна с вами 🙅',
      'Буп! Мимо! 😋',
      'Может... всё-таки «Да»? 👉👈'
    ],
    trapMessage: 'Всё-всё, я устала убегать 😮‍💨',
    yesNowMessage: 'ну давай, жми 😌',
    noButtonLabels: ['Нет', 'Нет?', 'Нет!!', 'Нееет', 'не-а', 'стоп', 'хватит', 'плиз', 'ну всё', '...'],
    placeTitle: 'Куда пойдём? 🗺️',
    placeSubtitle: 'Листай стрелками и выбери, что нравится ✨',
    placeOptions: [
      { title: 'Бургеры в парке 🍔', caption: 'пикник, ноль усилий', image: './photos/Hamburger in the park.png' },
      { title: 'Книжное убежище 📚', caption: 'типа читаем, а сами болтаем', image: './photos/Bookstore.png' },
      { title: 'Битва в аркадах 🕹️', caption: 'плюшка точно будет моей', image: './photos/Arcade.png' },
      { title: 'Аквапарк 🌊', caption: 'горки и милый хаос', image: './photos/aquapark.png' },
      { title: 'Пляжный волейбол 🏐', caption: 'проигравший покупает мороженое', image: './photos/volleyball.png' },
      { title: 'Стрельба из лука 🏹', caption: 'энергия главного героя', image: './photos/archery.png' },
      { title: 'Верховая езда 🐴', caption: 'кони уже ждут', image: './photos/Horsemenship.png' }
    ],
    whenTitle: 'Когда удобно? 🗓️',
    timeOptions: ['Утро ☀️', 'День 🌤️', 'Вечер 🌙'],
    placeConfirm: 'Вот это! Погнали → Telegram',
    successTitle: 'ДААА 🎉',
    successPlanLabel: 'Ты выбрала:',
    successText: 'Сообщение откроется в новой вкладке. Если не открылось — жми кнопку ещё раз 💌',
    successContact: 'Telegram: @m1ran21',
    successButton: 'Заново 🔁',
    surpriseTabLabel: 'подарок? 🎁',
    surpriseTitle: 'Чтобы музыка не заканчивалась 🎧',
    surpriseSub: 'Заметил, что твоя Яндекс.Музыка закончилась 🥲 Лови приглашение в мою семейную подписку — и ты снова с музыкой 🎵 Наведи камеру на код 👇',
    surpriseLink: 'или открой ссылку с телефона 👉',
    musicPanelTitle: 'Музыка 🎵',
    play: 'Пауза',
    pause: 'Плей',
    trackError: 'Трек недоступен, переключаем...',
    footerNote: 'tg @m1ran21'
  },
  en: {
    introTitle: 'A tiny mission for you ✨',
    introSubtitle: 'psst... over here 👀',
    introChecklist: [
      'Grab your headphones 🎧',
      'Press F11 for fullscreen ⛶',
      'Turn on the music with the button in the bottom-right corner 🎵'
    ],
    introButtonOptions: [
      "Let's gooo! 🚀",
      'Start it ✨',
      'Open it up',
      'Tap here 👉',
      'Begin'
    ],
    introButtonDefaultIndex: 0,
    loadingPhrases: [
      'Charging up courage... 🥹',
      'Drawing something cute... 🎨',
      'Loading main character energy... ⚡',
      'Almost there! ✨'
    ],
    storyTitle: 'A short note 📝',
    storyParagraphs: [
      'The creator of this site is genuinely worried that you forgot about your promise and, by all appearances, have no intention of remembering it.',
      'So he built an entire website just to officially ask you something, one more time:'
    ],
    continueButton: 'Okay, go on →',
    typingSoundToggleOn: 'Typing Sound: On',
    typingSoundToggleOff: 'Typing Sound: Off',
    inviteQuestion: 'Wanna hang out with me? 🌸',
    inviteSubtext: 'Pick an adventure — snacks are on me 🍙',
    yesButton: 'Yes! 💖',
    noButton: 'No',
    noMessages: [
      "Nope, can't catch me~ 🏃‍♀️💨",
      'Nice try! 😜',
      'Plot twist: this button is shy 🙈',
      'Error 404: No not found',
      'Trust me, saying yes is easier than you think ✨',
      'Hey, it was all going so well 🥺',
      'Too slow~ 😝',
      'This button disagrees with you 🙅',
      'Boop! Missed me!',
      'Maybe... Yes instead? 👉👈'
    ],
    trapMessage: 'Okay okay, I give up running 😮‍💨',
    yesNowMessage: 'go on, press it 😌',
    noButtonLabels: ['No', 'No?', 'No!!', 'Nooo', 'nope', 'stop', 'enough', 'please', 'okay ok', '...'],
    placeTitle: 'Where should we go? 🗺️',
    placeSubtitle: 'Flip through with the arrows and pick your favorite ✨',
    placeOptions: [
      { title: 'Burgers in the park 🍔', caption: 'picnic vibes, zero effort', image: './photos/Hamburger in the park.png' },
      { title: 'Bookstore hideout 📚', caption: 'pretend to read, actually talk', image: './photos/Bookstore.png' },
      { title: 'Arcade showdown 🕹️', caption: "I'm winning that plushie", image: './photos/Arcade.png' },
      { title: 'Aquapark splash 🌊', caption: 'slides and cute chaos', image: './photos/aquapark.png' },
      { title: 'Beach volleyball 🏐', caption: 'loser buys ice cream', image: './photos/volleyball.png' },
      { title: 'Archery range 🏹', caption: 'main character energy', image: './photos/archery.png' },
      { title: 'Horse riding 🐴', caption: 'noble steeds await', image: './photos/Horsemenship.png' }
    ],
    whenTitle: 'When works for you? 🗓️',
    timeOptions: ['Morning ☀️', 'Afternoon 🌤️', 'Evening 🌙'],
    placeConfirm: "This one! Let's go → Telegram",
    successTitle: 'YESSS 🎉',
    successPlanLabel: 'You picked:',
    successText: 'A message opens in a new tab. If it got blocked, press the button again 💌',
    successContact: 'Telegram: @m1ran21',
    successButton: 'Play again 🔁',
    surpriseTabLabel: 'a gift? 🎁',
    surpriseTitle: 'So the music never stops 🎧',
    surpriseSub: "Noticed your Yandex Music ran out 🥲 Here's an invite to my family plan — back to your music 🎵 Point your camera at the code 👇",
    surpriseLink: 'or open the link on your phone 👉',
    musicPanelTitle: 'Music 🎵',
    play: 'Pause',
    pause: 'Play',
    trackError: 'Track unavailable, switching...',
    footerNote: 'tg @m1ran21'
  }
};
