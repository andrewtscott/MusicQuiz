import type { Clef, QuizNote } from "./types";
import { noteToMidi, midiToNote } from "./naming";

/** Readable note range per clef. */
export const CLEF_RANGES: Record<Clef, { low: string; high: string }> = {
  bass:   { low: "C2", high: "G4" },
  tenor:  { low: "C3", high: "A5" },
  treble: { low: "G3", high: "A6" },
};

/** Return all chromatic notes from low to high (inclusive). */
export function getNotesInRange(low: string, high: string): string[] {
  const lo = noteToMidi(low);
  const hi = noteToMidi(high);
  const notes: string[] = [];
  for (let m = lo; m <= hi; m++) {
    notes.push(midiToNote(m));
  }
  return notes;
}

export const ALL_CLEFS: Clef[] = ["bass", "tenor", "treble"];

/** Pick a random clef from the allowed list. */
export function randomClef(allowed: Clef[] = ALL_CLEFS): Clef {
  const pool = allowed.length > 0 ? allowed : ALL_CLEFS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Pick a random note within a clef's range. */
export function randomNote(clef: Clef): QuizNote {
  const range = CLEF_RANGES[clef];
  const notes = getNotesInRange(range.low, range.high);
  const note = notes[Math.floor(Math.random() * notes.length)];
  return { note, clef };
}

/** Generate a quiz question: random clef (from allowed list) + random note. */
export function generateQuizQuestion(allowedClefs?: Clef[]): QuizNote {
  const clef = randomClef(allowedClefs);
  return randomNote(clef);
}
