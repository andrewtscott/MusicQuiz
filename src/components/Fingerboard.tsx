import type { CelloString, FingerPosition } from "../modules/fingerboard";
import { STRINGS, MAX_SEMITONE, STRING_OPEN, positionsForNote } from "../modules/fingerboard";
import { midiToNote, parseNote } from "../modules/music";

interface FingerboardProps {
  targetNote: string;
  onPositionClick?: (pos: FingerPosition) => void;
}

const STRING_X: Record<CelloString, number> = { C: 60, G: 120, D: 180, A: 240 };
const TOP_Y = 40;
const WIDTH = 320;
const DOT_R = 10;
const POS_LABEL_X = 272; // x position for position labels

/**
 * Standard cello positions defined by where the 1st finger sits.
 * Semitone value = half steps above the open string.
 */
const CELLO_POSITIONS: { label: string; semitone: number }[] = [
  { label: "1st",  semitone: 1 },
  { label: "2nd",  semitone: 3 },
  { label: "3rd",  semitone: 4 },
  { label: "4th",  semitone: 5 },
  { label: "5th",  semitone: 7 },
  { label: "6th",  semitone: 8 },
  { label: "7th",  semitone: 9 },
];

/**
 * On a real cello each semitone is shorter by a factor of 2^(1/12).
 * We compute cumulative Y positions so spacing shrinks as you go higher.
 * FIRST_SEMI_H controls the height of the first (largest) semitone gap.
 */
const RATIO = Math.pow(2, -1 / 12); // ≈ 0.9439
const FIRST_SEMI_H = 38;

/** Pre-compute the Y offset for each semitone position (0 … MAX_SEMITONE). */
const SEMI_Y: number[] = (() => {
  const ys = [0]; // semitone 0 = nut = 0 offset
  let gap = FIRST_SEMI_H;
  for (let i = 1; i <= MAX_SEMITONE; i++) {
    ys.push(ys[i - 1] + gap);
    gap *= RATIO;
  }
  return ys;
})();

const HEIGHT = TOP_Y + SEMI_Y[MAX_SEMITONE] + 30;

/** Y coordinate for a given semitone position. */
function semiY(semi: number): number {
  return TOP_Y + SEMI_Y[semi];
}

/** Get just the letter name (no octave) for a string + semitone. */
function noteLetter(s: CelloString, semi: number): string {
  return parseNote(midiToNote(STRING_OPEN[s] + semi)).name;
}

export default function Fingerboard({ targetNote, onPositionClick }: FingerboardProps) {
  // Build set of highlighted positions by pitch class (letter only)
  const targetLetter = targetNote ? parseNote(targetNote).name : "";
  const highlights = new Set(
    targetLetter
      ? positionsForNote(targetNote).map((p) => `${p.string}-${p.semitone}`)
      : []
  );

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      className="fingerboard"
    >
      {/* String labels */}
      {STRINGS.map((s) => (
        <text
          key={`label-${s}`}
          x={STRING_X[s]}
          y={20}
          textAnchor="middle"
          fontSize={14}
          fontWeight="bold"
          fill="#333"
        >
          {s}
        </text>
      ))}

      {/* Strings (vertical lines) */}
      {STRINGS.map((s) => (
        <line
          key={`string-${s}`}
          x1={STRING_X[s]}
          y1={TOP_Y}
          x2={STRING_X[s]}
          y2={semiY(MAX_SEMITONE)}
          stroke="#888"
          strokeWidth={2}
        />
      ))}

      {/* Fret / semitone markers (horizontal lines) */}
      {Array.from({ length: MAX_SEMITONE + 1 }, (_, i) => (
        <line
          key={`fret-${i}`}
          x1={40}
          y1={semiY(i)}
          x2={260}
          y2={semiY(i)}
          stroke={i === 0 ? "#333" : "#ddd"}
          strokeWidth={i === 0 ? 3 : 1}
        />
      ))}

      {/* Open string markers (semitone 0) — rendered as "O" above the nut */}
      {STRINGS.map((s) => {
        const key = `${s}-0`;
        const isHighlight = highlights.has(key);
        const cx = STRING_X[s];
        const cy = semiY(0);
        const letter = noteLetter(s, 0);
        const pos: FingerPosition = {
          string: s,
          semitone: 0,
          note: letter,
        };
        return (
          <g
            key={key}
            style={{ cursor: "pointer" }}
            onClick={() => onPositionClick?.(pos)}
          >
            <circle
              cx={cx}
              cy={cy - 16}
              r={DOT_R}
              fill={isHighlight ? "#4caf50" : "none"}
              stroke={isHighlight ? "#388e3c" : "#999"}
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy - 12}
              textAnchor="middle"
              fontSize={8}
              fontWeight={isHighlight ? "bold" : "normal"}
              fill={isHighlight ? "#fff" : "#999"}
              pointerEvents="none"
            >
              {letter}
            </text>
            <title>{`${s} open string — ${letter}`}</title>
          </g>
        );
      })}

      {/* Fingered note circles (semitones 1+) */}
      {STRINGS.map((s) =>
        Array.from({ length: MAX_SEMITONE }, (_, i) => {
          const semi = i + 1;
          const key = `${s}-${semi}`;
          const isHighlight = highlights.has(key);
          const cx = STRING_X[s];
          const cy = semiY(semi);
          const letter = noteLetter(s, semi);
          const pos: FingerPosition = {
            string: s,
            semitone: semi,
            note: letter,
          };
          return (
            <g
              key={key}
              style={{ cursor: "pointer" }}
              onClick={() => onPositionClick?.(pos)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={DOT_R}
                fill={isHighlight ? "#4caf50" : "#f5f5f5"}
                stroke={isHighlight ? "#388e3c" : "#bbb"}
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fontSize={9}
                fontWeight={isHighlight ? "bold" : "normal"}
                fill={isHighlight ? "#fff" : "#666"}
                pointerEvents="none"
              >
                {letter}
              </text>
              <title>{`${s} string, position ${semi} — ${letter}`}</title>
            </g>
          );
        })
      )}

      {/* Position markers on the right */}
      {CELLO_POSITIONS.map(({ label, semitone }) => {
        const y = semiY(semitone);
        return (
          <g key={`pos-mark-${label}`}>
            <line
              x1={260}
              y1={y}
              x2={POS_LABEL_X - 2}
              y2={y}
              stroke="#bbb"
              strokeWidth={1}
              strokeDasharray="3,2"
            />
            <text
              x={POS_LABEL_X}
              y={y + 4}
              fontSize={9}
              fill="#888"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
