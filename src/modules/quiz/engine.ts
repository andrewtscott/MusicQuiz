import type { QuizNote, Clef } from "../music";
import { generateQuizQuestion, noteLetterEquals, midiToNote, parseNote } from "../music";
import { STRING_OPEN } from "../fingerboard";
import type { FingerPosition } from "../fingerboard";

export interface QuizState {
  current: QuizNote;
  answered: boolean;
  correct: boolean | null;
  userAnswer: string;
  score: number;
  total: number;
  allowedClefs: Clef[];
}

export function newQuizState(allowedClefs: Clef[] = ["bass", "tenor", "treble"]): QuizState {
  return {
    current: generateQuizQuestion(allowedClefs),
    answered: false,
    correct: null,
    userAnswer: "",
    score: 0,
    total: 0,
    allowedClefs,
  };
}

export function nextQuestion(prev: QuizState): QuizState {
  return {
    ...prev,
    current: generateQuizQuestion(prev.allowedClefs),
    answered: false,
    correct: null,
    userAnswer: "",
  };
}

export function checkTypedAnswer(state: QuizState, answer: string): QuizState {
  const trimmed = answer.trim();
  const isCorrect = noteLetterEquals(trimmed, state.current.note);
  return {
    ...state,
    answered: true,
    correct: isCorrect,
    userAnswer: trimmed,
    score: state.score + (isCorrect ? 1 : 0),
    total: state.total + 1,
  };
}

export function checkFingerboardAnswer(
  state: QuizState,
  pos: FingerPosition,
): QuizState {
  const clickedMidi = STRING_OPEN[pos.string] + pos.semitone;
  const clickedNote = midiToNote(clickedMidi);
  const clickedLetter = parseNote(clickedNote).name;
  const targetLetter = parseNote(state.current.note).name;
  const isCorrect = clickedLetter === targetLetter;
  return {
    ...state,
    answered: true,
    correct: isCorrect,
    userAnswer: `${pos.string} string, semitone ${pos.semitone} (${clickedNote})`,
    score: state.score + (isCorrect ? 1 : 0),
    total: state.total + 1,
  };
}
