import type { NoteName, ParsedNote } from "./types";

export const NOTE_NAMES: NoteName[] = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B",
];

/** Parse "F#4" → { name: "F#", octave: 4 } */
export function parseNote(note: string): ParsedNote {
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);
  return { name: match[1] as NoteName, octave: Number(match[2]) };
}

/** Format { name: "F#", octave: 4 } → "F#4" */
export function formatNote(name: NoteName, octave: number): string {
  return `${name}${octave}`;
}

/** Convert note string to MIDI number. C4 = 60. */
export function noteToMidi(note: string): number {
  const { name, octave } = parseNote(note);
  const semitone = NOTE_NAMES.indexOf(name);
  return (octave + 1) * 12 + semitone;
}

/** Convert MIDI number to note string. 60 = "C4". */
export function midiToNote(midi: number): string {
  const semitone = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return formatNote(NOTE_NAMES[semitone], octave);
}

/** Check if two note strings are enharmonically equal. */
export function enharmonicEquals(a: string, b: string): boolean {
  return noteToMidi(a) === noteToMidi(b);
}

/** Check if two notes have the same pitch class (letter), ignoring octave. */
export function noteLetterEquals(answer: string, target: string): boolean {
  const normalize = (s: string) => s.trim().toUpperCase().replace(/♯/g, "#");
  const a = normalize(answer);
  const { name } = parseNote(target);
  return a === name.toUpperCase();
}
