export type CelloString = "C" | "G" | "D" | "A";

export interface FingerPosition {
  string: CelloString;
  semitone: number;   // 0 = open string, up to 24
  note: string;       // e.g. "D3"
}
