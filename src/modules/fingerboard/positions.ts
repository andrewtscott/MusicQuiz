import type { CelloString, FingerPosition } from "./types";
import { noteToMidi, midiToNote } from "../music/naming";

/** Open‑string pitches (MIDI numbers). */
export const STRING_OPEN: Record<CelloString, number> = {
  C: noteToMidi("C2"),  // 36
  G: noteToMidi("G2"),  // 43
  D: noteToMidi("D3"),  // 50
  A: noteToMidi("A3"),  // 57
};

export const STRINGS: CelloString[] = ["C", "G", "D", "A"];
export const MAX_SEMITONE = 13; // through 7th position

/** Build every reachable position on the fingerboard. */
export function buildAllPositions(): FingerPosition[] {
  const positions: FingerPosition[] = [];
  for (const s of STRINGS) {
    const openMidi = STRING_OPEN[s];
    for (let semi = 0; semi <= MAX_SEMITONE; semi++) {
      positions.push({
        string: s,
        semitone: semi,
        note: midiToNote(openMidi + semi),
      });
    }
  }
  return positions;
}

/** Pre‑built map: note name (e.g. "C4") → list of fingerboard positions. */
const _allPositions = buildAllPositions();

const _lookup = new Map<string, FingerPosition[]>();
for (const pos of _allPositions) {
  const list = _lookup.get(pos.note) ?? [];
  list.push(pos);
  _lookup.set(pos.note, list);
}

/** Get all fingerboard positions where a given note can be played. */
export function positionsForNote(note: string): FingerPosition[] {
  return _lookup.get(note) ?? [];
}

/** Check if a position matches a target note (by MIDI value). */
export function positionMatchesNote(
  pos: FingerPosition,
  targetNote: string,
): boolean {
  const posMidi = STRING_OPEN[pos.string] + pos.semitone;
  return posMidi === noteToMidi(targetNote);
}
