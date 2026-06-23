# Romantic Bilingual Micro-Website (RU + EN)

Single-page static invitation site built with plain HTML, CSS, and vanilla JavaScript.

## Project Files

- `index.html` - markup and sections
- `styles.css` - visuals, responsive layout, effects
- `script.js` - behavior and flow logic
- `content.js` - all editable content/settings
- `assets/audio/` - music and typing sounds

## What You Can Edit In `content.js`

### Intro Overlay

- `ru.introTitle`, `en.introTitle`
- `ru.introSubtitle`, `en.introSubtitle`
- `ru.introButtonOptions`, `en.introButtonOptions`
- `ru.introButtonDefaultIndex`, `en.introButtonDefaultIndex`

### Loading Screen

- `ru.loadingPhrases`, `en.loadingPhrases`
- `theme.loadingDuration`
- `theme.loadingPhraseDelay`

### Story / Typewriter

- `ru.storyParagraphs`, `en.storyParagraphs`
- `theme.typingSpeed`
- `theme.paragraphDelay`

### Invitation Labels / Buttons

- `ru.inviteQuestion`, `en.inviteQuestion`
- `ru.inviteSubtext`, `en.inviteSubtext`
- `ru.yesButton`, `en.yesButton`
- `ru.noButton`, `en.noButton`
- `ru.noMessages`, `en.noMessages`

### No-button Trap Attempt

- `interactions.noTrapAttempt` (default 20)
- `interactions.noMinScale`

### Place Options After Yes

- `ru.placeTitle`, `en.placeTitle`
- `ru.placeSubtitle`, `en.placeSubtitle`
- `ru.placeOptions`, `en.placeOptions`
- `ru.placeConfirm`, `en.placeConfirm`

### Telegram Settings

- `telegram.telegramUsername`
- `telegram.telegramPrefilledTextRu`
- `telegram.telegramPrefilledTextEn`

Selected place is automatically appended to message text.

### Optional Notification Endpoint

- `notifications.notifyEndpoint`

If empty, no POST is sent.
If set, `notifySelection(payload)` sends JSON with:
- language
- timestamp
- selectedPlace
- yesClicked

### Music

- `audio.musicPath`
- `audio.playlist`
- `audio.defaultMusicVolume`
- `audio.autoplayMusic`

### Typing Sound Variants

- `audio.typingPath`
- `audio.typingSoundVariants` (randomly alternated)
- `audio.typingSpaceSound`
- `audio.typingEnterSound`
- `audio.typingVolume`
- `audio.typingThrottle`

### Particle Settings

- `theme.showParticles`
- `particles.count`
- `particles.speedMin`, `particles.speedMax`
- `particles.sizeMin`, `particles.sizeMax`
- `particles.popEnabled`

### Cursor Style Toggle

- `theme.customCursor`

## Audio Folder Setup

Put files in `assets/audio/`.

Default placeholders used by code:
- Music: `track1.mp3`, `track2.mp3`, `track3.mp3`
- Typing variants: `typing1.mp3`, `typing2.mp3`, `typing3.mp3`
- Space sound: `typing_space.mp3`
- Enter/punctuation sound: `typing_enter.mp3`

## Flow Summary

1. Intro overlay appears.
2. First click starts music and hides intro.
3. Neon loading runs.
4. Story typewriter screen.
5. Invitation Yes/No screen.
6. After Yes -> place selection screen.
7. Confirm -> opens Telegram deep link with selected place.
8. Optional notify POST if endpoint is configured.

## Deploy

Static hosting only is enough:
- GitHub Pages
- Netlify
- Vercel (static)
