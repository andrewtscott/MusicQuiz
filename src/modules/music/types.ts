export type Clef = "bass" | "tenor" | "treble";

export type NoteName =
  | "C" | "C#" | "D" | "D#" | "E"
  | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";

export interface ParsedNote {
  name: NoteName;
  octave: number;
}

export interface QuizNote {
  note: string;   // e.g. "F4"
  clef: Clef;
}
