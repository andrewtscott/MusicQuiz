# CelloQuiz

A personal web app for practicing reading bass, tenor, and treble clefs, with an interactive cello fingerboard visualization.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How it works

1. A random note is displayed in a random clef (bass, tenor, or treble) using VexFlow.
2. You can answer by:
   - **Typing** the note name (e.g. `C#4`) and clicking **Check**, or
   - **Clicking** the correct position on the SVG fingerboard.
3. After answering, feedback is shown along with all playable positions on the cello.
4. Click **Next →** to continue.

Use the **Show positions** button to reveal where the note can be played before answering (hint mode).

## Project structure

```
src/
  modules/
    music/         – Note naming, clef ranges, random generation
    fingerboard/   – Cello string/position data and lookups
    quiz/          – Quiz state machine (pure functions)
  components/
    Notation.tsx   – VexFlow staff renderer
    Fingerboard.tsx – Interactive SVG fingerboard
  App.tsx          – Main quiz UI
  main.tsx         – Entry point
  index.css        – Styles
```

## Build for production

```bash
npm run build
npm run preview
```

## Tech stack

- React 19 + TypeScript
- Vite 6
- VexFlow 4 (music notation)
- SVG (fingerboard)

## Future enhancements

- Difficulty modes (limit clef range, sharps/flats frequency)
- Timer / speed challenge mode
- Statistics tracking (per-clef accuracy, weakest notes)
- Flat notation support (D♭ alongside C#)
- Multiple instrument support (viola, violin)
- Audio playback of the correct note
- Interval / chord quizzes
- PWA support for offline use
